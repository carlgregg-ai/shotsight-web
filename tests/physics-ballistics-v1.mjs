import assert from 'node:assert/strict';
import {norm3,sub3} from '../physics/target-engine-v1.mjs';
import {
  BALLISTIC_PROVIDER_STATUS,assertInstructionalBallisticProvider,constantSpeedTestProvider,
  analyticConstantVelocityIntercept,testOnlyLeadGeometry,angularSeparationRad,
  allenDragCoefficientFromMach,allenFreeSphereVelocityAtRange,allenFreeSphereTimeToRange,
  integrateAllenMachNumerically,freeSphereAllenResearchProvider
} from '../physics/ballistics-v1.mjs';

const near=(a,b,tol=1e-10,msg='')=>assert.ok(Math.abs(a-b)<=tol,`${msg} expected ${b}, got ${a}, tol ${tol}`);
const nearRel=(a,b,rel=1e-6,msg='')=>assert.ok(Math.abs(a-b)<=rel*Math.max(1,Math.abs(b)),`${msg} expected ${b}, got ${a}, rel ${rel}`);
const nearVec=(a,b,tol=1e-10,msg='')=>a.forEach((v,i)=>near(v,b[i],tol,`${msg}[${i}]`));

const provider=constantSpeedTestProvider(400);
assert.equal(provider.status,BALLISTIC_PROVIDER_STATUS.ANALYTIC_CONSTANT_SPEED_TEST_ONLY);
assert.throws(()=>assertInstructionalBallisticProvider(provider),/not authorised for instructional simulation/);
near(provider.timeToRange(40),0.1,1e-15,'constant-speed TOF');
nearVec(provider.stateAtTime({origin_W:[0,0,0],bore_W:[0,1,0]},0.1).position_W,[0,40,0],1e-12,'provider state');

const stationary=analyticConstantVelocityIntercept({shotOrigin_W:[0,0,0],targetPosition_W:[0,40,0],targetVelocity_W:[0,0,0],pelletSpeed_mps:400});
assert.equal(stationary.valid,true);near(stationary.pelletTOF_s,0.1,1e-14);nearVec(stationary.bore_W,[0,1,0],1e-14);near(stationary.residual_m,0,1e-11);

const R=40,vt=20,s=400;
const transverse=testOnlyLeadGeometry({shotOrigin_W:[0,0,0],targetPosition_W:[0,R,0],targetVelocity_W:[vt,0,0],pelletSpeed_mps:s});
const tauExact=R/Math.sqrt(s*s-vt*vt);
near(transverse.pelletTOF_s,tauExact,1e-13,'transverse TOF');
near(transverse.physicalLead_m,vt*tauExact,1e-12,'transverse physical lead');
near(transverse.apparentLeadAngle_rad,Math.atan((vt*tauExact)/R),1e-13,'transverse apparent lead');
near(transverse.residual_m,0,1e-10,'transverse intercept residual');

const vr=30;
const receding=testOnlyLeadGeometry({shotOrigin_W:[0,0,0],targetPosition_W:[0,R,0],targetVelocity_W:[0,vr,0],pelletSpeed_mps:s});
near(receding.pelletTOF_s,R/(s-vr),1e-13,'receding TOF');near(receding.apparentLeadAngle_rad,0,1e-14,'receding angular lead');
const approaching=testOnlyLeadGeometry({shotOrigin_W:[0,0,0],targetPosition_W:[0,R,0],targetVelocity_W:[0,-vr,0],pelletSpeed_mps:s});
near(approaching.pelletTOF_s,R/(s+vr),1e-13,'approaching TOF');
const noHit=analyticConstantVelocityIntercept({shotOrigin_W:[0,0,0],targetPosition_W:[0,10,0],targetVelocity_W:[0,500,0],pelletSpeed_mps:400});
assert.equal(noHit.valid,false);assert.equal(noHit.reason,'NO_POSITIVE_INTERCEPT');

const lr=testOnlyLeadGeometry({shotOrigin_W:[0,0,0],targetPosition_W:[0,35,1],targetVelocity_W:[15,0,0],pelletSpeed_mps:380});
const rl=testOnlyLeadGeometry({shotOrigin_W:[0,0,0],targetPosition_W:[0,35,1],targetVelocity_W:[-15,0,0],pelletSpeed_mps:380});
near(lr.pelletTOF_s,rl.pelletTOF_s,1e-14,'mirror TOF');near(lr.apparentLeadAngle_rad,rl.apparentLeadAngle_rad,1e-14,'mirror apparent lead');near(lr.bore_W[0],-rl.bore_W[0],1e-14,'mirror bore x');near(lr.bore_W[1],rl.bore_W[1],1e-14,'mirror bore y');near(lr.bore_W[2],rl.bore_W[2],1e-14,'mirror bore z');
near(angularSeparationRad([0,1,0],[1,0,0]),Math.PI/2,1e-15,'90 degree separation');near(angularSeparationRad([0,1,0],[0,1,0]),0,1e-15,'zero separation');
near(norm3(sub3(lr.pelletAtArrival_W,lr.targetAtArrival_W)),lr.residual_m,1e-15,'residual recompute');

// --- Allen free-sphere research validation ---------------------------------
near(allenDragCoefficientFromMach(0.7-1e-12),0.495,2e-12,'C below M=.7');
near(allenDragCoefficientFromMach(0.7),0.495,2e-12,'C at M=.7');
near(allenDragCoefficientFromMach(1.2-1e-12),0.965,2e-12,'C below M=1.2');
near(allenDragCoefficientFromMach(1.2),0.965,2e-12,'C at M=1.2');
assert.throws(()=>allenDragCoefficientFromMach(0.19),/validated domain/);assert.throws(()=>allenDragCoefficientFromMach(2.01),/validated domain/);

const musket={muzzleVelocity_mps:457,speedOfSound_mps:457/1.3,pelletDiameter_m:0.0185,pelletDensity_kgm3:10900,airDensity_kgm3:1.20};
const allen=freeSphereAllenResearchProvider(musket);
assert.equal(allen.status,BALLISTIC_PROVIDER_STATUS.FREE_SPHERE_ALLEN);
assert.throws(()=>assertInstructionalBallisticProvider(allen),/not authorised for instructional simulation/);
nearRel(allen.kz_m,168.04166666666666,2e-10,'Allen kz scale');nearRel(allen.velocityAtRange(0),457,1e-12,'Allen muzzle velocity');

const M0=1.3;
const x1=1.44298*allen.kz_m*Math.log((0.80417*M0)/(0.92+0.0375*M0));
const x2=x1+1.05173*allen.kz_m;
nearRel(allen.velocityAtRange(x1)/musket.speedOfSound_mps,1.2,5e-4,'Allen high/middle transition Mach');
nearRel(allen.velocityAtRange(x2)/musket.speedOfSound_mps,0.7,5e-6,'Allen middle/low transition Mach');
nearRel(allen.velocityAtRange(607),102.5,2e-2,'published rounded long-range worked value');

// The primary formulas publish rounded decimal coefficients. The independent ODE and
// exact piecewise expressions therefore agree to the coefficient-precision scale rather
// than machine epsilon; the observed discrepancy is <3e-4 in Mach over this sweep.
for(const x of [10,50,100,175,250,400]){
  const vExact=allen.velocityAtRange(x),z=x/allen.kz_m;
  const mNumeric=integrateAllenMachNumerically(1.3,z,{steps:30000});
  nearRel(vExact/musket.speedOfSound_mps,mNumeric,4e-4,`Allen exact-vs-ODE at ${x}m`);
}

for(const startM of [1.6,1.2,1.0,0.7,0.5,0.21]){
  const p={...musket,muzzleVelocity_mps:startM*musket.speedOfSound_mps};
  nearRel(allenFreeSphereVelocityAtRange(p,0),p.muzzleVelocity_mps,2e-12,`segment initial M=${startM}`);
}

const t1024=allenFreeSphereTimeToRange(musket,40,{intervals:1024});
const t2048=allenFreeSphereTimeToRange(musket,40,{intervals:2048});
const t4096=allenFreeSphereTimeToRange(musket,40,{intervals:4096});
assert.ok(t4096>40/457,'dragged pellet TOF must exceed constant muzzle-speed TOF');near(t2048,t4096,2e-10,'Simpson TOF convergence 2048->4096');near(t1024,t4096,2e-9,'Simpson TOF convergence 1024->4096');
assert.throws(()=>allen.velocityAtRange(2000),/below Allen validated Mach 0.2 domain/);

console.log(JSON.stringify({suite:'ShotSight P4 ballistics/intercept v1',status:'PASS',tests:{providerFailClosed:true,stationaryAnalytic:true,transverseAnalytic:true,recedingAnalytic:true,approachingAnalytic:true,noIntercept:true,mirrorSymmetry:true,angularGeometry:true,residualCheck:true,allenDragContinuity:true,allenTransitionFormula:true,allenRoundedWorkedCase:true,allenIndependentOdeCrossCheck:true,allenSegmentStarts:true,allenTofConvergence:true,allenDomainGuard:true,allenInstructionalFailClosed:true}},null,2));
