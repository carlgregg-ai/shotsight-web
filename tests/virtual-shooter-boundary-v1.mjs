import assert from 'node:assert/strict';
import {createCanonicalFlatCrosserScenario,simulateCanonicalFlatCrosser} from '../physics/canonical-flat-crosser-v1.mjs';
import {createShooterObservation,validateShooterObservation,assertNoPrivilegedShooterData,naiveAngularBelief,auditShooterBoundary,SHOOTER_OBSERVATION_SCHEMA} from '../learning/virtual-shooter-boundary-v1.mjs';

const scenario=createCanonicalFlatCrosserScenario();
const frames=[];for(let i=0;i<=60;i++)frames.push(simulateCanonicalFlatCrosser(scenario,i/60));

// A 100 ms perception delay at world t=0.8 may inspect oracle history only up to t=0.7.
const obs=createShooterObservation({oracleFrames:frames,now_s:0.8,latency_s:0.1,angleNoiseSd_rad:0.001,rateNoiseSd_radps:0.01,seed:42,context:{expectedDirection:'LEFT_TO_RIGHT',trapRegionKnown:true}});
assert.equal(validateShooterObservation(obs),true);
assert(obs.observationTime_s<=0.700000000001);
assert.equal(Object.isFrozen(obs),true);assert.equal(Object.isFrozen(obs.targetFamilyBelief),true);
for(const k of SHOOTER_OBSERVATION_SCHEMA.forbidden)assert.equal(Object.hasOwn(obs,k),false,`forbidden key leaked: ${k}`);

// Same hidden world + same seed gives reproducible perception; changing seed changes sensory noise, not oracle truth.
const obs2=createShooterObservation({oracleFrames:frames,now_s:0.8,latency_s:0.1,angleNoiseSd_rad:0.001,rateNoiseSd_radps:0.01,seed:42,context:{expectedDirection:'LEFT_TO_RIGHT',trapRegionKnown:true}});
assert.deepEqual(obs,obs2);
const obs3=createShooterObservation({oracleFrames:frames,now_s:0.8,latency_s:0.1,angleNoiseSd_rad:0.001,rateNoiseSd_radps:0.01,seed:43,context:{expectedDirection:'LEFT_TO_RIGHT',trapRegionKnown:true}});
assert.notEqual(obs.az_rad,obs3.az_rad);

const belief=naiveAngularBelief([obs]);
assert.equal(belief.status,'NAIVE_PERCEPTION_BASELINE');
assert.equal(assertNoPrivilegedShooterData(belief),true);
assert(['LEFT','RIGHT','STATIONARY','UNKNOWN'].includes(belief.direction));
assert(['SLOW','MEDIUM','FAST','UNKNOWN'].includes(belief.apparentSpeedBand));

const audit=auditShooterBoundary({observations:[obs,obs2,obs3],beliefs:[belief]});
assert.equal(audit.status,'PASS');assert.equal(audit.privilegedFieldAccess,0);

// Adversarial probes: nested privileged oracle/intercept fields must fail closed.
for(const bad of [
  {...obs,physicalLead_m:1.2},
  {schema:'X',nested:{shotIntercept:{pelletTOF_s:0.08}}},
  {memory:{episode:{position_W:[1,2,3]}}}
])assert.throws(()=>assertNoPrivilegedShooterData(bad),/PRIVILEGED_STATE_LEAK/);

// An observation field not in the allow-list fails even if it is not on the known privileged list.
assert.throws(()=>validateShooterObservation({...obs,helpfulHint:'move ahead'}),/UNAUTHORISED_SHOOTER_FIELD/);

console.log(JSON.stringify({suite:'ShotSight virtual shooter L0 boundary v1',status:'PASS',tests:{oracleShooterStructuralSeparation:true,delayedObservation:true,reproducibleNoise:true,naiveBeliefUsesShooterDataOnly:true,nestedLeakProbeFailsClosed:true,allowListFailsClosed:true}},null,2));
