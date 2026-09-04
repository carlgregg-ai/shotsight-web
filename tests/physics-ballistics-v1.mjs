import assert from 'node:assert/strict';
import {norm3,sub3} from '../physics/target-engine-v1.mjs';
import {
  BALLISTIC_PROVIDER_STATUS,assertInstructionalBallisticProvider,constantSpeedTestProvider,
  analyticConstantVelocityIntercept,testOnlyLeadGeometry,angularSeparationRad
} from '../physics/ballistics-v1.mjs';

const near=(a,b,tol=1e-10,msg='')=>assert.ok(Math.abs(a-b)<=tol,`${msg} expected ${b}, got ${a}, tol ${tol}`);
const nearVec=(a,b,tol=1e-10,msg='')=>a.forEach((v,i)=>near(v,b[i],tol,`${msg}[${i}]`));

const provider=constantSpeedTestProvider(400);
assert.equal(provider.status,BALLISTIC_PROVIDER_STATUS.ANALYTIC_CONSTANT_SPEED_TEST_ONLY);
assert.throws(()=>assertInstructionalBallisticProvider(provider),/not authorised for instructional simulation/);
near(provider.timeToRange(40),0.1,1e-15,'constant-speed TOF');
nearVec(provider.stateAtTime({origin_W:[0,0,0],bore_W:[0,1,0]},0.1).position_W,[0,40,0],1e-12,'provider state');

// Stationary target: exact TOF is range/speed and bore points directly at target.
const stationary=analyticConstantVelocityIntercept({shotOrigin_W:[0,0,0],targetPosition_W:[0,40,0],targetVelocity_W:[0,0,0],pelletSpeed_mps:400});
assert.equal(stationary.valid,true);near(stationary.pelletTOF_s,0.1,1e-14);nearVec(stationary.bore_W,[0,1,0],1e-14);near(stationary.residual_m,0,1e-11);

// Pure transverse target: closed-form tau = R/sqrt(s^2-vt^2).
const R=40,vt=20,s=400;
const transverse=testOnlyLeadGeometry({shotOrigin_W:[0,0,0],targetPosition_W:[0,R,0],targetVelocity_W:[vt,0,0],pelletSpeed_mps:s});
const tauExact=R/Math.sqrt(s*s-vt*vt);
near(transverse.pelletTOF_s,tauExact,1e-13,'transverse TOF');
near(transverse.physicalLead_m,vt*tauExact,1e-12,'transverse physical lead');
near(transverse.apparentLeadAngle_rad,Math.atan((vt*tauExact)/R),1e-13,'transverse apparent lead');
near(transverse.residual_m,0,1e-10,'transverse intercept residual');

// Receding target along LOS: s*tau = R + vr*tau => tau = R/(s-vr).
const vr=30;
const receding=testOnlyLeadGeometry({shotOrigin_W:[0,0,0],targetPosition_W:[0,R,0],targetVelocity_W:[0,vr,0],pelletSpeed_mps:s});
near(receding.pelletTOF_s,R/(s-vr),1e-13,'receding TOF');
near(receding.apparentLeadAngle_rad,0,1e-14,'receding angular lead');

// Approaching target along LOS: s*tau = R-v*tau.
const approaching=testOnlyLeadGeometry({shotOrigin_W:[0,0,0],targetPosition_W:[0,R,0],targetVelocity_W:[0,-vr,0],pelletSpeed_mps:s});
near(approaching.pelletTOF_s,R/(s+vr),1e-13,'approaching TOF');

// Target faster than pellet and moving directly away cannot be intercepted.
const noHit=analyticConstantVelocityIntercept({shotOrigin_W:[0,0,0],targetPosition_W:[0,10,0],targetVelocity_W:[0,500,0],pelletSpeed_mps:400});
assert.equal(noHit.valid,false);assert.equal(noHit.reason,'NO_POSITIVE_INTERCEPT');

// Mirror symmetry: L->R and R->L transverse cases have equal TOF/lead magnitude and mirrored bore X.
const lr=testOnlyLeadGeometry({shotOrigin_W:[0,0,0],targetPosition_W:[0,35,1],targetVelocity_W:[15,0,0],pelletSpeed_mps:380});
const rl=testOnlyLeadGeometry({shotOrigin_W:[0,0,0],targetPosition_W:[0,35,1],targetVelocity_W:[-15,0,0],pelletSpeed_mps:380});
near(lr.pelletTOF_s,rl.pelletTOF_s,1e-14,'mirror TOF');near(lr.apparentLeadAngle_rad,rl.apparentLeadAngle_rad,1e-14,'mirror apparent lead');near(lr.bore_W[0],-rl.bore_W[0],1e-14,'mirror bore x');near(lr.bore_W[1],rl.bore_W[1],1e-14,'mirror bore y');near(lr.bore_W[2],rl.bore_W[2],1e-14,'mirror bore z');

// Angular separation vector formula sanity.
near(angularSeparationRad([0,1,0],[1,0,0]),Math.PI/2,1e-15,'90 degree separation');
near(angularSeparationRad([0,1,0],[0,1,0]),0,1e-15,'zero separation');

// Residual agreement is independently recomputed from returned positions.
near(norm3(sub3(lr.pelletAtArrival_W,lr.targetAtArrival_W)),lr.residual_m,1e-15,'residual recompute');

console.log(JSON.stringify({suite:'ShotSight P4 ballistics/intercept v1',status:'PASS',tests:{providerFailClosed:true,stationaryAnalytic:true,transverseAnalytic:true,recedingAnalytic:true,approachingAnalytic:true,noIntercept:true,mirrorSymmetry:true,angularGeometry:true,residualCheck:true}},null,2));
