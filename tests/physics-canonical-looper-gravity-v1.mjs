import assert from 'node:assert/strict';
import {createCanonicalLooperGravityScenario,looperTargetStateAt,simulateCanonicalLooperGravity,mirrorLooperAcrossWorldYZ,P8B_STANDARD_GRAVITY_MPS2} from '../physics/canonical-looper-gravity-v1.mjs';

const near=(a,b,tol=1e-10,msg='near')=>assert.ok(Math.abs(a-b)<=tol,`${msg}: ${a} vs ${b}`);
const vecNear=(a,b,tol=1e-10,msg='vecNear')=>{assert.equal(a.length,b.length);a.forEach((v,i)=>near(v,b[i],tol,`${msg}[${i}]`));};

const scenario=createCanonicalLooperGravityScenario();
assert.equal(scenario.modelBoundary,'TOY_GRAVITY_ONLY');
assert.equal(scenario.status,'ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION');
assert.equal(scenario.gravity_mps2,P8B_STANDARD_GRAVITY_MPS2);
assert.equal(scenario.inputProvenance.launchState,'ENGINEERING_TEST_INPUT_NOT_REAL_CLAY_MEASUREMENT');
assert.equal(scenario.provider.status,'TEST_ONLY');
assert.equal(scenario.sourceMethodReference.id,null);

// Closed-form constant-gravity checks at a non-special time.
const t=0.73,g=scenario.gravity_mps2,p0=scenario.targetInitial_W,v0=scenario.targetInitialVelocity_W;
const state=looperTargetStateAt(scenario,t);
vecNear(state.position_W,[p0[0]+v0[0]*t,p0[1]+v0[1]*t,p0[2]+v0[2]*t-0.5*g*t*t],1e-12,'closed-form position');
vecNear(state.velocity_W,[v0[0],v0[1],v0[2]-g*t],1e-12,'closed-form velocity');
assert.equal(state.phase,'RISE');

// Analytic apex: t=vz0/g and vz=0. Floating tolerance is tied only to machine arithmetic.
const apex=looperTargetStateAt(scenario,scenario.apexTime_s);
near(apex.verticalVelocity_mps,0,64*Number.EPSILON*Math.max(1,Math.abs(v0[2])),'apex vertical velocity');
assert.equal(apex.phase,'APEX');
const before=looperTargetStateAt(scenario,scenario.apexTime_s-1e-6);
const after=looperTargetStateAt(scenario,scenario.apexTime_s+1e-6);
assert.equal(before.phase,'RISE');assert.equal(after.phase,'DESCENT');
assert.ok(before.verticalVelocity_mps>0&&after.verticalVelocity_mps<0);

// Integrated state must expose changing LOS/range and trajectory-aware interception.
const s0=simulateCanonicalLooperGravity(scenario,0.2);
const s1=simulateCanonicalLooperGravity(scenario,0.9);
assert.notEqual(s0.target.range_m,s1.target.range_m);
assert.notEqual(s0.target.losAngularSpeed_radps,s1.target.losAngularSpeed_radps);
assert.equal(s1.ballistic.currentIntercept.valid,true);
assert.equal(s1.ballistic.currentIntercept.solver,'TOF_PROVIDER_BISECTION_EXPLICIT_TARGET_TRAJECTORY_STRAIGHT_PELLET_PATH');
assert.ok(s1.ballistic.currentIntercept.pelletTOF_s>0);
assert.equal(s1.masterClock.t_s,s1.t_s);assert.equal(s1.masterClock.allSubsystemsReadSameTime,true);
assert.equal(s1.certification.realisticClay,false);assert.equal(s1.certification.instructionalMotion,false);
assert.equal(s1.gunStrategy.id,'ENGINEERING_INTERCEPT_REFERENCE');assert.equal(s1.gunStrategy.status,'NOT_A_COACHING_METHOD');
assert.equal(s1.method.kinematicsStatus,'HOLD_NO_AUTHORISED_APPLICABILITY_MAPPING');
assert.equal(s1.method.thresholdEventsStatus,'HOLD_UNLESS_AUTHORISED_PREDICATE');

// Mirror across world YZ: x quantities reverse, y/z and scalar geometry remain coherent.
const mirror=mirrorLooperAcrossWorldYZ(scenario);
for(const tm of [0,0.5,scenario.apexTime_s,1.7]){
  const a=looperTargetStateAt(scenario,tm),b=looperTargetStateAt(mirror,tm);
  near(a.position_W[0],-b.position_W[0],1e-11,'mirror x position');
  near(a.position_W[1],b.position_W[1],1e-11,'mirror y position');
  near(a.position_W[2],b.position_W[2],1e-11,'mirror z position');
  near(a.velocity_W[0],-b.velocity_W[0],1e-11,'mirror x velocity');
  near(a.velocity_W[1],b.velocity_W[1],1e-11,'mirror y velocity');
  near(a.velocity_W[2],b.velocity_W[2],1e-11,'mirror z velocity');
}
const ma=simulateCanonicalLooperGravity(scenario,0.8),mb=simulateCanonicalLooperGravity(mirror,0.8);
near(ma.target.range_m,mb.target.range_m,1e-10,'mirror range');
near(ma.target.losAngularSpeed_radps,mb.target.losAngularSpeed_radps,1e-10,'mirror LOS speed');
near(ma.relationship.physicalLead_m,mb.relationship.physicalLead_m,1e-9,'mirror physical lead');
near(ma.relationship.apparentLeadAngle_rad,mb.relationship.apparentLeadAngle_rad,1e-9,'mirror apparent lead');

// Deterministic replay at identical master time.
assert.deepEqual(simulateCanonicalLooperGravity(scenario,0.6),simulateCanonicalLooperGravity(scenario,0.6));

console.log(JSON.stringify({suite:'ShotSight P8B gravity-only looper engineering proof',status:'PASS',tests:{modelBoundary:true,closedFormPosition:true,closedFormVelocity:true,analyticApex:true,phaseTransitions:true,changingRangeAndLOS:true,trajectoryAwareIntercept:true,mirrorGeometry:true,sharedClock:true,deterministicReplay:true,methodHold:true,certificationLock:true}},null,2));
