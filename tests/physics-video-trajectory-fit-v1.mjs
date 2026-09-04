import assert from 'node:assert/strict';
import {createCanonicalQuartererScenario,simulateCanonicalQuarterer} from '../physics/canonical-quarterer-v1.mjs';
import {createCanonicalLooperGravityScenario,simulateCanonicalLooperGravity} from '../physics/canonical-looper-gravity-v1.mjs';
import {worldPointToCamera} from '../physics/projection-gun-v1.mjs';
import {observedImagePoint,pinholePixelsFromCameraVector,deriveAngularObservation,syntheticObservationProvenance,VIDEO_EVIDENCE_CLASS} from '../physics/video-observation-v1.mjs';
import {fitConstantVelocityBearingTrack} from '../physics/video-trajectory-fit-v1.mjs';

const near=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: ${a} vs ${b}, tol=${tol}`);
const intrinsics=Object.freeze({fx_px:900,fy_px:910,cx_px:640,cy_px:360,provenance:'ENGINEERING_SYNTHETIC_PINHOLE_TEST_INPUT'});
const matVec=(M,v)=>M.map(r=>r[0]*v[0]+r[1]*v[1]+r[2]*v[2]);
const norm=v=>Math.hypot(...v);

function derivedTrackFromScenario({scenario,times,simulate,targetPositionOf,sourceId}){
  const provenance=syntheticObservationProvenance({generatorId:scenario.id,generatorStatus:scenario.status,realisticClay:false,scenarioId:scenario.id});
  const observations=[];
  for(let i=0;i<times.length;i++){
    const t=times[i],state=simulate(scenario,t),point_W=targetPositionOf(state),vector_C=worldPointToCamera({point_W,cameraOrigin_W:scenario.cameraOrigin_W,R_CW:scenario.R_CW}),px=pinholePixelsFromCameraVector({vector_C,intrinsics}),obs=observedImagePoint({frameIndex:i,t_s:t,u_px:px.u_px,v_px:px.v_px,sourceId,trackId:'target'});
    observations.push(deriveAngularObservation({observation:obs,intrinsics}));
  }
  return {observations,provenance};
}

const quarterer=createCanonicalQuartererScenario();
const times=[0,.2,.4,.6,.8,1.0,1.2,1.4];
const qTrack=derivedTrackFromScenario({scenario:quarterer,times,simulate:simulateCanonicalQuarterer,targetPositionOf:s=>s.target.position_W,sourceId:'synthetic:P8A-quarterer'});
assert.equal(qTrack.provenance.realisticClay,false);
const anchorState=simulateCanonicalQuarterer(quarterer,times[0]);
const anchorVector_C=worldPointToCamera({point_W:anchorState.target.position_W,cameraOrigin_W:quarterer.cameraOrigin_W,R_CW:quarterer.R_CW});
const trueAnchorRange=norm(anchorVector_C);

const ambiguous=fitConstantVelocityBearingTrack({observations:qTrack.observations});
assert.equal(ambiguous.status,'AMBIGUOUS');
assert.equal(ambiguous.evidenceClass,VIDEO_EVIDENCE_CLASS.UNOBSERVABLE_AMBIGUOUS);
assert.equal(ambiguous.reason,'MONOCULAR_SCALE_UNRESOLVED_CONSTANT_VELOCITY_FIT');

const fit=fitConstantVelocityBearingTrack({observations:qTrack.observations,metricAnchor:{observationIndex:0,range_m:trueAnchorRange,provenance:'SYNTHETIC_GENERATOR_METRIC_RANGE_FOR_RECOVERY_TEST'}});
assert.equal(fit.status,'FIT_COMPLETE');assert.equal(fit.evidenceClass,VIDEO_EVIDENCE_CLASS.INFERRED);assert.equal(fit.confidence,null);assert.ok(fit.assumptions.length>=4);
const expectedVelocity_C=matVec(quarterer.R_CW,quarterer.targetVelocity_W);
for(let i=0;i<3;i++)near(fit.velocity_C[i],expectedVelocity_C[i],1e-9,`exact synthetic velocity_C[${i}]`);
assert.ok(fit.rmsAngularResidual_rad<2e-8,'exact constant-velocity synthetic angular residual should be floating-point limited');
assert.ok(fit.maxAngularResidual_rad<3e-8,'exact constant-velocity synthetic maximum residual should be floating-point limited');

// Projective scale ambiguity demonstrated quantitatively: doubling only the valid metric anchor
// doubles recovered metric position/velocity but preserves the same bearing fit. This is why the anchor provenance matters.
const fit2x=fitConstantVelocityBearingTrack({observations:qTrack.observations,metricAnchor:{observationIndex:0,range_m:2*trueAnchorRange,provenance:'SYNTHETIC_INTENTIONALLY_SCALED_RANGE_FOR_AMBIGUITY_TEST'}});
for(let i=0;i<3;i++)near(fit2x.velocity_C[i],2*fit.velocity_C[i],2e-9,`scale ambiguity velocity[${i}]`);
for(let i=0;i<3;i++)near(fit2x.anchorPosition_C[i],2*fit.anchorPosition_C[i],2e-9,`scale ambiguity anchor[${i}]`);
near(fit2x.rmsAngularResidual_rad,fit.rmsAngularResidual_rad,3e-8,'bearing residual invariant to global metric scale');

// Wrong physics family: a gravity-curved looper track is deliberately fitted with the constant-velocity model.
// We do not invent a universal classification threshold; we require only that this synthetic mismatch produces
// materially larger residual than the exact in-family synthetic track, and we expose that residual to later policy.
const looper=createCanonicalLooperGravityScenario();
const lTrack=derivedTrackFromScenario({scenario:looper,times,simulate:simulateCanonicalLooperGravity,targetPositionOf:s=>s.target.position_W,sourceId:'synthetic:P8B-looper'});
const l0=simulateCanonicalLooperGravity(looper,0),l0C=worldPointToCamera({point_W:l0.target.position_W,cameraOrigin_W:looper.cameraOrigin_W,R_CW:looper.R_CW});
const mismatch=fitConstantVelocityBearingTrack({observations:lTrack.observations,metricAnchor:{observationIndex:0,range_m:norm(l0C),provenance:'SYNTHETIC_LOOPER_METRIC_RANGE_FOR_MODEL_MISMATCH_TEST'}});
assert.equal(mismatch.status,'FIT_COMPLETE');
assert.ok(mismatch.rmsAngularResidual_rad>fit.rmsAngularResidual_rad*1000,'curved gravity track should fit constant velocity materially worse than in-family exact synthetic track');
assert.ok(mismatch.maxAngularResidual_rad>fit.maxAngularResidual_rad*1000,'curved gravity max residual should expose model mismatch');
assert.equal(mismatch.note.includes('not an automatic real-clay'),true);

assert.throws(()=>fitConstantVelocityBearingTrack({observations:qTrack.observations,metricAnchor:{observationIndex:0,range_m:trueAnchorRange}}),/provenance required/);
assert.throws(()=>fitConstantVelocityBearingTrack({observations:qTrack.observations.slice(0,2),metricAnchor:null}),/at least 3/);

console.log(JSON.stringify({suite:'ShotSight P9B physics-constrained bearing-track fit',status:'PASS',metrics:{exactRmsAngularResidual_rad:fit.rmsAngularResidual_rad,exactMaxAngularResidual_rad:fit.maxAngularResidual_rad,mismatchRmsAngularResidual_rad:mismatch.rmsAngularResidual_rad,mismatchMaxAngularResidual_rad:mismatch.maxAngularResidual_rad},tests:{noAnchorFailsClosed:true,metricAnchorRequired:true,exactSyntheticVelocityRecovery:true,inferredClass:true,assumptionsExplicit:true,scaleAmbiguityDemonstrated:true,residualScaleInvariance:true,curvedModelMismatchExposed:true,noUniversalThresholdInvented:true,anchorProvenanceRequired:true}},null,2));