import assert from 'node:assert/strict';
import {METHOD_REGISTRY_V1,getMethodRegistryEntry,validateMethodRegistryFailClosed} from '../physics/method-registry-v1.mjs';
import {evaluateAuthorisedEvent,relativeMotionFacts} from '../physics/method-narrative-v1.mjs';

assert.equal(validateMethodRegistryFailClosed(),true);
assert.deepEqual(Object.keys(METHOD_REGISTRY_V1).sort(),[
  'CPSA_MAINTAINED_LEAD_RECOGNISED','CPSA_PULL_AWAY_RECOGNISED','CPSA_SWING_THROUGH_RECOGNISED',
  'NSCA_DRIVEN_PASS_THROUGH','NSCA_LONG_CROSSER_PULL_AWAY','NSCA_TEAL_POWERED_PASS_THROUGH'
].sort());

const longCrosser=getMethodRegistryEntry('NSCA_LONG_CROSSER_PULL_AWAY');
assert.equal(longCrosser.contract.evidenceClass,'DIRECT');
assert.deepEqual(longCrosser.contract.sources,['NSCA_LONG_CROSSER']);
assert.equal(longCrosser.contract.applicability.flight_family,'crossing');
assert.equal(Object.keys(longCrosser.contract.authorisedPredicates).length,0);

const heldMatch=evaluateAuthorisedEvent({method:longCrosser.contract,eventName:'SPEED_MATCH',state:{relativeAngularVelocity_radps:0}});
assert.equal(heldMatch.asserted,false);
assert.equal(heldMatch.status,'HOLD_MISSING_AUTHORISED_PREDICATE');

const teal=getMethodRegistryEntry('NSCA_TEAL_POWERED_PASS_THROUGH');
assert.equal(teal.contract.applicability.phase,'powered');
assert.ok(teal.sourceNarrative.some(x=>x.includes('not a universal teal prescription')));
assert.equal(teal.executableThresholdEvents.length,0);

const driven=getMethodRegistryEntry('NSCA_DRIVEN_PASS_THROUGH');
assert.equal(driven.contract.applicability.direction,'overhead_toward');
assert.ok(driven.sourceNarrative.some(x=>x.includes('visual connection')));

// A sign crossing is a mathematical candidate only; registry membership must not convert it into a coaching assertion.
const facts=relativeMotionFacts({signedSeparationPrev_rad:-0.02,signedSeparationNow_rad:0.01,dt_s:0.05});
assert.equal(facts.passThroughCandidate,true);
const heldPass=evaluateAuthorisedEvent({method:driven.contract,eventName:'PASS_THROUGH',state:facts});
assert.equal(heldPass.asserted,false);
assert.equal(heldPass.status,'HOLD_MISSING_AUTHORISED_PREDICATE');

assert.throws(()=>getMethodRegistryEntry('UNSUPPORTED_METHOD'),/unknown method registry id/);

console.log(JSON.stringify({suite:'ShotSight P6 method registry v1',status:'PASS',tests:{registryFailClosed:true,sourceAttribution:true,applicabilityPreserved:true,matchStillHeld:true,tealContextPreserved:true,drivenContextPreserved:true,passThroughNotAutoPromoted:true,unknownMethodRejected:true}},null,2));
