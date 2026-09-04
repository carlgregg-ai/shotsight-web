import assert from 'node:assert/strict';
import {
  EVIDENCE_CLASS,createMethodEvidenceContract,relativeMotionFacts,evaluateAuthorisedEvent,
  createNarrativeTimeline,validateNarrativeOrdering,P6_UNRESOLVED_PREDICATES
} from '../physics/method-narrative-v1.mjs';

const near=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: expected ${b}, got ${a}`);

const pullAway=createMethodEvidenceContract({
  id:'NSCA_LONG_CROSSER_PULL_AWAY',name:'Long crosser pull-away',sources:['NSCA_LONG_CROSSER'],
  evidenceClass:EVIDENCE_CLASS.DIRECT,applicability:{flight_family:'crossing',phase:'stable'}
});
assert.equal(pullAway.evidenceClass,'DIRECT');
assert.deepEqual(pullAway.sources,['NSCA_LONG_CROSSER']);

// Mathematical separation facts are allowed without pretending they certify a coaching label.
const separating=relativeMotionFacts({signedSeparationPrev_rad:0.01,signedSeparationNow_rad:0.02,dt_s:0.1});
assert.equal(separating.magnitudeIncreasing,true);near(separating.signedSeparationRate_radps,0.1,1e-14,'separation rate');
assert.equal(separating.classification,'MATHEMATICAL_INVARIANT_NOT_COACHING_METHOD');
const crossing=relativeMotionFacts({signedSeparationPrev_rad:-0.01,signedSeparationNow_rad:0.005,dt_s:0.03});
assert.equal(crossing.passThroughCandidate,true);

// No numerical MATCH/CONNECTION threshold may appear merely because the method is DIRECT.
const match=evaluateAuthorisedEvent({method:pullAway,eventName:'SPEED_MATCH',state:{relativeAngularVelocity_radps:0.001}});
assert.equal(match.asserted,false);assert.equal(match.status,'HOLD_MISSING_AUTHORISED_PREDICATE');
const connection=evaluateAuthorisedEvent({method:pullAway,eventName:'CONNECTION',state:{separation_rad:0.00001}});
assert.equal(connection.asserted,false);assert.equal(connection.status,'HOLD_MISSING_AUTHORISED_PREDICATE');

// Predicate evaluation is possible only when explicitly supplied by a higher evidence/calibration layer.
const testFixture=createMethodEvidenceContract({
  id:'TEST_METHOD',name:'Test method',sources:['TEST_FIXTURE'],evidenceClass:EVIDENCE_CLASS.TEST_ONLY,
  applicability:{test:true},authorisedPredicates:{TEST_EVENT:s=>s.x>0}
});
assert.equal(evaluateAuthorisedEvent({method:testFixture,eventName:'TEST_EVENT',state:{x:1},mode:'TEST_ONLY'}).asserted,true);

// Narrative ordering: shot -> pellet arrival; break remains held without an authorised hit predicate.
const held=createNarrativeTimeline({shotTime_s:1,pelletTOF_s:0.12,hit:true,hitPredicateAuthorised:false});
assert.equal(held.find(e=>e.type==='PELLET_ARRIVAL').t_s,1.12);
assert.equal(held.find(e=>e.type==='BREAK').status,'HOLD_NO_AUTHORISED_HIT_PREDICATE');
assert.equal(validateNarrativeOrdering(held),true);

const authorised=createNarrativeTimeline({shotTime_s:1,pelletTOF_s:0.12,hit:true,hitPredicateAuthorised:true});
near(authorised.find(e=>e.type==='BREAK').t_s,1.12,1e-15,'break at pellet arrival');
assert.equal(validateNarrativeOrdering(authorised),true);
assert.throws(()=>validateNarrativeOrdering([{type:'SHOT',t_s:1},{type:'PELLET_ARRIVAL',t_s:0.9}]),/cannot precede SHOT/);
assert.throws(()=>validateNarrativeOrdering([{type:'PELLET_ARRIVAL',t_s:1.2},{type:'BREAK',t_s:1.1}]),/cannot precede PELLET_ARRIVAL/);

assert.ok(P6_UNRESOLVED_PREDICATES.includes('SPEED_MATCH_TOLERANCE'));
assert.ok(P6_UNRESOLVED_PREDICATES.includes('CONNECTION_DEFINITION'));

console.log(JSON.stringify({suite:'ShotSight P6 method/narrative v1',status:'PASS',tests:{sourceAttributedContract:true,relativeMotionInvariant:true,passThroughCandidate:true,matchFailsClosed:true,connectionFailsClosed:true,explicitPredicateInjection:true,shotArrivalOrdering:true,breakFailsClosed:true,authorisedBreakOrdering:true,holdsEnumerated:true}},null,2));
