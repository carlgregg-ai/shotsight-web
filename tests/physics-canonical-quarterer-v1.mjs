import assert from 'node:assert/strict';
import {norm3,sub3,dot3,scale3} from '../physics/target-engine-v1.mjs';
import {createCanonicalQuartererScenario,simulateCanonicalQuarterer,mirrorQuartererAcrossWorldYZ} from '../physics/canonical-quarterer-v1.mjs';

const near=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: expected ${b}, got ${a}, tol ${tol}`);
const nearVec=(a,b,tol,msg)=>{assert.equal(a.length,b.length,msg);for(let i=0;i<a.length;i++)near(a[i],b[i],tol,`${msg}[${i}]`);};
const finiteDeep=value=>{
  if(typeof value==='number')return Number.isFinite(value);
  if(Array.isArray(value))return value.every(finiteDeep);
  if(value&&typeof value==='object')return Object.values(value).every(finiteDeep);
  return true;
};

const scenario=createCanonicalQuartererScenario();
const s0=simulateCanonicalQuarterer(scenario,0);
const s05=simulateCanonicalQuarterer(scenario,0.5);
const s1=simulateCanonicalQuarterer(scenario,1);
const s2=simulateCanonicalQuarterer(scenario,2);

assert.equal(scenario.status,'ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION');
assert.equal(s0.certification.realisticClay,false);
assert.equal(s0.certification.instructionalMotion,false);
assert.equal(s0.ballistic.providerStatus,'TEST_ONLY');
assert.equal(s0.gunStrategy.id,'ENGINEERING_INTERCEPT_REFERENCE');
assert.equal(s0.gunStrategy.status,'NOT_A_COACHING_METHOD');
assert.equal(s0.method.id,null);
assert.equal(s0.method.kinematicsStatus,'HOLD_NO_AUTHORISED_APPLICABILITY_MAPPING');
assert.equal(s0.masterClock.allSubsystemsReadSameTime,true);

// Deterministic replay from one master time coordinate.
assert.deepEqual(simulateCanonicalQuarterer(scenario,0.731),simulateCanonicalQuarterer(scenario,0.731));

// Constant-velocity world position remains analytically exact while range changes with geometry.
for(const state of [s0,s05,s1,s2]){
  const expectedPosition=scenario.targetInitial_W.map((v,i)=>v+scenario.targetVelocity_W[i]*state.t_s);
  nearVec(state.target.position_W,expectedPosition,1e-12,'analytic target position');
  const rel=sub3(expectedPosition,scenario.cameraOrigin_W);
  near(state.target.range_m,norm3(rel),1e-12,'analytic camera-origin range');
  near(state.target.rangeRate_mps,dot3(rel,scenario.targetVelocity_W)/norm3(rel),1e-12,'analytic range rate');
  assert.ok(state.target.losAngularSpeed_radps>0,'quarterer must have non-zero LOS angular speed');
  assert.ok(state.ballistic.currentIntercept.valid,'current intercept must remain valid');
  const tau=state.ballistic.currentIntercept.pelletTOF_s;
  nearVec(state.relationship.physicalLeadVector_W,scale3(scenario.targetVelocity_W,tau),1e-8,'constant-velocity physical lead vector');
  assert.ok(finiteDeep(state),'state must contain no NaN/Infinity');
}
assert.notEqual(s0.target.range_m,s2.target.range_m,'quartering proof must not preserve constant range');
assert.notEqual(s0.target.losAngularSpeed_radps,s2.target.losAngularSpeed_radps,'LOS angular speed must evolve with quartering geometry');
assert.ok(s0.target.rangeRate_mps>0&&s1.target.rangeRate_mps>0,'baseline quarterer is explicitly receding at tested times');

// Range-rate finite-difference cross-check independent of the analytic dot-product expression.
for(const t of [0.2,0.8,1.4]){
  const h=1e-5;
  const a=simulateCanonicalQuarterer(scenario,t-h).target.range_m;
  const b=simulateCanonicalQuarterer(scenario,t+h).target.range_m;
  const fd=(b-a)/(2*h);
  near(simulateCanonicalQuarterer(scenario,t).target.rangeRate_mps,fd,2e-8,'range-rate finite difference');
}

// LOS angular speed finite-difference cross-check from apparent target direction.
for(const t of [0.2,0.8,1.4]){
  const h=1e-5;
  const a=simulateCanonicalQuarterer(scenario,t-h).target;
  const b=simulateCanonicalQuarterer(scenario,t+h).target;
  const da=(b.az_rad-a.az_rad)/(2*h),de=(b.el_rad-a.el_rad)/(2*h);
  const angularRateApprox=Math.hypot(da*Math.cos(simulateCanonicalQuarterer(scenario,t).target.el_rad),de);
  near(simulateCanonicalQuarterer(scenario,t).target.losAngularSpeed_radps,angularRateApprox,2e-7,'LOS angular-speed finite difference');
}

// Left/right world mirror must preserve scalar geometry while reversing lateral angles/separation.
const mirror=mirrorQuartererAcrossWorldYZ(scenario);
for(const t of [0,0.5,0.8,1.5,2]){
  const a=simulateCanonicalQuarterer(scenario,t),b=simulateCanonicalQuarterer(mirror,t);
  near(a.target.range_m,b.target.range_m,1e-12,'mirror range');
  near(a.target.rangeRate_mps,b.target.rangeRate_mps,1e-12,'mirror range rate');
  near(a.target.losAngularSpeed_radps,b.target.losAngularSpeed_radps,1e-12,'mirror LOS angular speed');
  near(a.relationship.physicalLead_m,b.relationship.physicalLead_m,1e-10,'mirror physical lead');
  near(a.relationship.apparentLeadAngle_rad,b.relationship.apparentLeadAngle_rad,1e-10,'mirror apparent lead');
  near(a.target.az_rad,-b.target.az_rad,1e-12,'mirror target azimuth sign');
  near(a.gun.az_rad,-b.gun.az_rad,1e-10,'mirror bore azimuth sign');
  near(a.relationship.signedApparentAzSeparation_rad,-b.relationship.signedApparentAzSeparation_rad,1e-10,'mirror signed separation');
}

// Explicit approaching quarterer proves range-rate sign is derived, not hard-coded.
const approaching=createCanonicalQuartererScenario({targetInitial_W:[-8,35,1.5],targetVelocity_W:[12,-5,0]});
assert.ok(simulateCanonicalQuarterer(approaching,0).target.rangeRate_mps<0,'approaching quarterer must have negative initial range rate');
assert.ok(simulateCanonicalQuarterer(approaching,0.5).target.range_m<simulateCanonicalQuarterer(approaching,0).target.range_m,'approaching quarterer range should initially reduce');

// Shot/pellet event ordering remains one-clock derived and no decorative BREAK exists.
const shot=simulateCanonicalQuarterer(scenario,scenario.shotTime_s);
const arrival=shot.ballistic.pelletArrival_s;
const beforeArrival=simulateCanonicalQuarterer(scenario,arrival-1e-6);
const atArrival=simulateCanonicalQuarterer(scenario,arrival);
assert.deepEqual(shot.activeNarrativeEvents.map(e=>e.type),['SHOT']);
assert.ok(!beforeArrival.activeNarrativeEvents.some(e=>e.type==='PELLET_ARRIVAL'));
assert.ok(atArrival.activeNarrativeEvents.some(e=>e.type==='PELLET_ARRIVAL'));
assert.ok(!atArrival.narrative.some(e=>e.type==='BREAK'),'no decorative BREAK without authorised hit predicate');

console.log(JSON.stringify({
  suite:'ShotSight P8A canonical quarterer engineering proof v1',
  status:'PASS',
  tests:{
    certificationBoundary:true,
    deterministicReplay:true,
    analyticPositionAndRange:true,
    changingRange:true,
    analyticRangeRate:true,
    rangeRateFiniteDifference:true,
    changingLosAngularSpeed:true,
    losAngularSpeedFiniteDifference:true,
    interceptDerivedPhysicalLead:true,
    mirrorGeometry:true,
    approachRecedeSign:true,
    sharedClockNarrativeOrdering:true,
    noDecorativeBreak:true,
    methodFailClosed:true,
    finiteState:true
  }
},null,2));
