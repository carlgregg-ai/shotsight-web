import assert from 'node:assert/strict';
import {createCanonicalQuartererScenario,simulateCanonicalQuarterer} from '../physics/canonical-quarterer-v1.mjs';
import {worldPointToCamera} from '../physics/projection-gun-v1.mjs';
import {VIDEO_EVIDENCE_CLASS,observedImagePoint,pinholePixelsFromCameraVector,deriveAngularObservation,monocularAbsoluteRangeResult,inferredCandidate,syntheticObservationProvenance} from '../physics/video-observation-v1.mjs';
const near=(a,b,tol=1e-12,msg='near')=>assert.ok(Math.abs(a-b)<=tol,`${msg}: ${a} vs ${b}`);
const intrinsics=Object.freeze({fx_px:800,fy_px:820,cx_px:640,cy_px:360,provenance:'ENGINEERING_SYNTHETIC_PINHOLE_TEST_INPUT'});
const scenario=createCanonicalQuartererScenario();
const provenance=syntheticObservationProvenance({generatorId:'P8A_QUARTERER_ENGINEERING_PROOF_V1',generatorStatus:scenario.status,realisticClay:false,scenarioId:scenario.id});
assert.equal(provenance.kind,'SYNTHETIC_TEST_DATA');assert.equal(provenance.realisticClay,false);assert.equal(provenance.warning,'DO_NOT_TREAT_AS_REAL_CLAY_VIDEO');
for(const [i,t] of [0,.25,.8,1.4].entries()){
  const state=simulateCanonicalQuarterer(scenario,t),vector_C=worldPointToCamera({point_W:state.target.position_W,cameraOrigin_W:scenario.cameraOrigin_W,R_CW:scenario.R_CW}),px=pinholePixelsFromCameraVector({vector_C,intrinsics}),obs=observedImagePoint({frameIndex:i,t_s:t,u_px:px.u_px,v_px:px.v_px,sourceId:'synthetic:P8A',trackId:'target'}),derived=deriveAngularObservation({observation:obs,intrinsics});
  assert.equal(obs.evidenceClass,VIDEO_EVIDENCE_CLASS.OBSERVED);assert.equal(obs.absoluteRange_m,null);assert.equal(derived.evidenceClass,VIDEO_EVIDENCE_CLASS.CALIBRATED_DERIVED);near(derived.az_rad,state.target.az_rad,2e-15,'az recovery');near(derived.el_rad,state.target.el_rad,2e-15,'el recovery');assert.equal(derived.absoluteRangeStatus,VIDEO_EVIDENCE_CLASS.UNOBSERVABLE_AMBIGUOUS);
}
// Scale ambiguity: camera vectors on the same ray produce identical pixels.
const p1=pinholePixelsFromCameraVector({vector_C:[.15,-.12,1],intrinsics}),p2=pinholePixelsFromCameraVector({vector_C:[1.5,-1.2,10],intrinsics});near(p1.u_px,p2.u_px,1e-12,'collinear u');near(p1.v_px,p2.v_px,1e-12,'collinear v');
const uncal=monocularAbsoluteRangeResult({observationOrRay:{u_px:p1.u_px,v_px:p1.v_px}});assert.equal(uncal.evidenceClass,VIDEO_EVIDENCE_CLASS.UNOBSERVABLE_AMBIGUOUS);assert.equal(uncal.value,null);assert.equal(uncal.reason,'UNCALIBRATED_MONOCULAR_DEPTH_NOT_IDENTIFIABLE');
const calibrated=monocularAbsoluteRangeResult({observationOrRay:{u_px:p1.u_px,v_px:p1.v_px},hasMetricSceneCalibration:true,rangeMeasurement_m:25,rangeProvenance:'ENGINEERING_TEST_METRIC_MARKER'});assert.equal(calibrated.evidenceClass,VIDEO_EVIDENCE_CLASS.CALIBRATED_DERIVED);assert.equal(calibrated.value,25);
const inference=inferredCandidate({quantity:'TRAJECTORY_FAMILY',value:'CONSTANT_VELOCITY_QUARTERING_CANDIDATE',modelId:'P8A_TEST_MODEL',assumptions:['known calibrated camera','candidate model family supplied for test'],confidence:.8,derivedFrom:['synthetic:P8A']});assert.equal(inference.evidenceClass,VIDEO_EVIDENCE_CLASS.INFERRED);assert.equal(inference.assumptions.length,2);assert.throws(()=>inferredCandidate({quantity:'RANGE',value:30,modelId:'x',assumptions:[]}),/requires explicit assumptions/);
assert.throws(()=>pinholePixelsFromCameraVector({vector_C:[1,2,-1],intrinsics}),/front of camera/);
console.log(JSON.stringify({suite:'ShotSight P9A video observation/provenance contract',status:'PASS',tests:{observedVsDerivedClasses:true,syntheticProvenance:true,quantitativeAngularRecovery:true,monocularScaleAmbiguity:true,absoluteDepthFailClosed:true,metricCalibrationExplicit:true,inferenceAssumptionsRequired:true,frontPlaneGuard:true}},null,2));