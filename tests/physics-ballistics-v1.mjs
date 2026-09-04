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

// --- Allen free-sphere research validation ---------------------------------
// Derived piecewise C(M) must be continuous at Allen segment boundaries.
near(allenDragCoefficientFromMach(0.7-1e-12),0.495,2e-12,'C below M=.7');
near(allenDragCoefficientFromMach(0.7),0.495,2e-12,'C at M=.7');
near(allenDragCoefficientFromMach(1.2-1e-12),0.965,2e-12,'C below M=1.2');
near(allenDragCoefficientFromMach(1.2),0.965,2e-12,'C at M=1.2');
assert.throws(()=>allenDragCoefficientFromMach(0.19),/validated domain/);
assert.throws(()=>allenDragCoefficientFromMach(2.01),/validated domain/);

// Published worked musket-ball example reproduced from a peer-reviewed application
// of Allen: D=18.5 mm, rho_p=10.9 g/cm^3, rho_a=1.20e-3 g/cm^3,
// muzzle velocity 457 m/s (about M=1.3). Paper/application values are rounded,
// so use tolerance appropriate to their published precision.
const musket={
  muzzleVelocity_mps:457,
  speedOfSound_mps:457/1.3,
  pelletDiameter_m:0.0185,
  pelletDensity_kgm3:10900,
  airDensity_kgm3:1.20
};
const allen=freeSphereAllenResearchProvider(musket);
assert.equal(allen.status,BALLISTIC_PROVIDER_STATUS.FREE_SPHERE_ALLEN);
assert.throws(()=>assertInstructionalBallisticProvider(allen),/not authorised for instructional simulation/);
nearRel(allen.kz_m,168.04166666666666,2e-10,'Allen kz scale');
nearRel(allen.velocityAtRange(0),457,1e-12,'Allen muzzle velocity');
nearRel(allen.velocityAtRange(23.1),412.8,4e-3,'published M=1.2 transition speed');
nearRel(allen.velocityAtRange(199.9),0.7*musket.speedOfSound_mps,5e-3,'published M=.7 transition speed');
nearRel(allen.velocityAtRange(607),102.5,8e-3,'published long-range worked value');

// Exact piecewise relation must independently agree with direct RK4 integration of
// Allen's governing dimensionless ODE, not merely with itself.
for(const x of [10,50,100,175,250,400]){
  const vExact=allen.velocityAtRange(x);
  const z=x/allen.kz_m;
  const mNumeric=integrateAllenMachNumerically(1.3,z,{steps:30000});
  nearRel(vExact/musket.speedOfSound_mps,mNumeric,4e-6,`Allen exact-vs-ODE at ${x}m`);
}

// Exercise starts in each Allen Mach segment; M(x=0) must reproduce M0 exactly.
for(const M0 of [1.6,1.2,1.0,0.7,0.5,0.21]){
  const p={...musket,muzzleVelocity_mps:M0*musket.speedOfSound_mps};
  nearRel(allenFreeSphereVelocityAtRange(p,0),p.muzzleVelocity_mps,2e-12,`segment initial M=${M0}`);
}

// Simpson TOF is numerical and must demonstrate convergence before it is trusted as
// a validation utility. It is intentionally not labelled Allen's closed-form time formula.
const t1024=allenFreeSphereTimeToRange(musket,40,{intervals:1024});
const t2048=allenFreeSphereTimeToRange(musket,40,{intervals:2048});
const t4096=allenFreeSphereTimeToRange(musket,40,{intervals:4096});
assert.ok(t4096>40/457,'dragged pellet TOF must exceed constant muzzle-speed TOF');
near(t2048,t4096,2e-10,'Simpson TOF convergence 2048->4096');
near(t1024,t4096,2e-9,'Simpson TOF convergence 1024->4096');

// Valid-domain fail-closed behaviour: sufficiently long range eventually leaves M>=0.2.
assert.throws(()=>allen.velocityAtRange(2000),/below Allen validated Mach 0.2 domain/);

console.log(JSON.stringify({suite:'ShotSight P4 ballistics/intercept v1',status:'PASS',tests:{providerFailClosed:true,stationaryAnalytic:true,transverseAnalytic:true,recedingAnalytic:true,approachingAnalytic:true,noIntercept:true,mirrorSymmetry:true,angularGeometry:true,residualCheck:true,allenDragContinuity:true,allenWorkedCase:true,allenIndependentOdeCrossCheck:true,allenSegmentStarts:true,allenTofConvergence:true,allenDomainGuard:true,allenInstructionalFailClosed:true}},null,2));
