import assert from 'node:assert/strict';
import {dot3,unit3} from '../physics/target-engine-v1.mjs';
import {createMethodComparisonScenario,methodLeadScale,methodComparisonFrame,methodAngularKinematics,validateMethodTopology,METHOD_COMPARISON_STATUS,METHOD_KINEMATICS_STATUS} from '../physics/reviewer-method-comparison-v1.mjs';
const scenario=createMethodComparisonScenario();
const ids=['SWING_THROUGH','PULL_AWAY','MAINTAINED_LEAD'];
for(const id of ids){
  assert.equal(validateMethodTopology(scenario,id),true);
  for(const t of [0,0.32,0.50,0.55,0.70,0.8,1.2]){
    const f=methodComparisonFrame(scenario,id,t),k=methodAngularKinematics(scenario,id,t);
    assert.equal(f.status,METHOD_COMPARISON_STATUS);
    assert.equal(f.method.kinematicsStatus,METHOD_KINEMATICS_STATUS);
    assert.equal(f.labels.instructionalMotion,'NOT_AUTHORISED');
    assert.equal(f.labels.realisticClay,'HOLD_NOT_CERTIFIED');
    assert.deepEqual(f.target.position_W,f.baseState.target.position_W);
    assert.equal(k.status,METHOD_KINEMATICS_STATUS);
    for(const value of [k.separation.signedMagnitude_rad,k.targetAngularVelocity.magnitude_rad_s,k.gunAngularVelocity.magnitude_rad_s,k.gunAngularAcceleration.magnitude_rad_s2])assert.ok(Number.isFinite(value),`${id} ${t}: finite angular kinematics required`);
    assert.ok(Math.abs(f.observerAngles.gunAz_rad-f.observerAngles.targetAz_rad-k.separation.az_rad)<1e-12);
    assert.ok(Math.abs(f.observerAngles.gunEl_rad-f.observerAngles.targetEl_rad-k.separation.el_rad)<1e-12);
  }
}
assert.ok(methodLeadScale('SWING_THROUGH',0).g<0);
assert.ok(Math.abs(methodLeadScale('SWING_THROUGH',0.55).g)<1e-12);
assert.ok(methodLeadScale('SWING_THROUGH',0.70).g>0);
assert.ok(methodLeadScale('PULL_AWAY',0).g<0);
assert.equal(methodLeadScale('PULL_AWAY',0.40).phase,'MATCH_TARGET_SPEED');
assert.equal(methodLeadScale('PULL_AWAY',0.40).g,0);
assert.ok(methodLeadScale('PULL_AWAY',0.70).g>0);
assert.equal(methodLeadScale('MAINTAINED_LEAD',0).g,1);
assert.equal(methodLeadScale('MAINTAINED_LEAD',0.7).g,1);
const swingBefore=methodAngularKinematics(scenario,'SWING_THROUGH',0.40),swingAfter=methodAngularKinematics(scenario,'SWING_THROUGH',0.70);
assert.ok(swingBefore.separation.signedMagnitude_rad<0&&swingAfter.separation.signedMagnitude_rad>0,'swing-through signed separation must cross through target');
const pullMatch=methodAngularKinematics(scenario,'PULL_AWAY',0.40),pullSeparate=methodAngularKinematics(scenario,'PULL_AWAY',0.70);
assert.ok(Math.abs(pullMatch.separation.signedMagnitude_rad)<1e-10&&pullSeparate.separation.signedMagnitude_rad>0,'pull-away must match then separate');
const maintained=[0.1,0.3,0.5,0.7].map(t=>methodAngularKinematics(scenario,'MAINTAINED_LEAD',t).separation.magnitude_rad);
assert.ok(Math.max(...maintained)-Math.min(...maintained)<1e-10,'maintained lead must retain constant angular separation in provisional model');
const shotRef=methodComparisonFrame(scenario,'MAINTAINED_LEAD',scenario.shotTime_s).baseState.gun.bore_W;
for(const id of ids){const b=methodComparisonFrame(scenario,id,scenario.shotTime_s).gun.bore_W;assert.ok(dot3(unit3(b),unit3(shotRef))>1-1e-12,`${id} must converge to the same canonical shot intercept`);}
for(const t of [0,0.2,0.5,0.8,1.2]){const p=ids.map(id=>methodComparisonFrame(scenario,id,t).target.position_W);assert.deepEqual(p[0],p[1]);assert.deepEqual(p[1],p[2]);}
console.log('PASS physics-reviewer-method-comparison-v1');
