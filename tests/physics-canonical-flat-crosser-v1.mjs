import assert from 'node:assert/strict';
import {createCanonicalFlatCrosserScenario,simulateCanonicalFlatCrosser,createTestOnlyConstantSpeedProvider} from '../physics/canonical-flat-crosser-v1.mjs';

const near=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: expected ${b}, got ${a}`);
const scenario=createCanonicalFlatCrosserScenario();
assert.equal(scenario.status,'ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION');
assert.equal(scenario.provider.status,'TEST_ONLY_NOT_INSTRUCTIONAL');

const a=simulateCanonicalFlatCrosser(scenario,0.4);
const b=simulateCanonicalFlatCrosser(scenario,0.4);
assert.deepEqual(a,b);
assert.equal(a.masterClock.allSubsystemsReadSameTime,true);
assert.equal(a.t_s,a.masterClock.t_s);
assert.equal(a.certification.realisticClay,false);
assert.equal(a.certification.instructionalMotion,false);
assert.equal(a.certification.engineeringIntegrationProof,true);
assert.equal(a.method.id,'NSCA_LONG_CROSSER_PULL_AWAY');
assert.equal(a.method.evidenceClass,'DIRECT');
assert.equal(a.method.thresholdEventsStatus,'HOLD_UNLESS_AUTHORISED_PREDICATE');

// Constant-velocity target must advance exactly from the one shared time value.
near(a.target.position_W[0],scenario.targetInitial_W[0]+scenario.targetVelocity_W[0]*0.4,1e-12,'target x');
near(a.target.position_W[1],scenario.targetInitial_W[1],1e-12,'target y');
assert.ok(a.target.speed_mps>0);
assert.ok(a.target.range_m>0);
assert.ok(a.gun.angularSpeed_radps>=0);

// Lead must be an intercept output and visible as a non-zero shooter-view relationship.
assert.ok(a.relationship.physicalLead_m>0);
assert.ok(a.relationship.apparentLeadAngle_rad>0);
assert.ok(Math.abs(a.relationship.signedApparentAzSeparation_rad)>0);
assert.equal(a.ballistic.currentIntercept.valid,true);
assert.ok(Math.abs(a.ballistic.currentIntercept.rootResidual_s)<=1e-8);

// Shot-time narrative is derived from the shot-time intercept, not the current display frame.
const shotState=simulateCanonicalFlatCrosser(scenario,scenario.shotTime_s);
const shotEvent=shotState.narrative.find(e=>e.type==='SHOT');
const arrivalEvent=shotState.narrative.find(e=>e.type==='PELLET_ARRIVAL');
assert.equal(shotEvent.t_s,scenario.shotTime_s);
near(arrivalEvent.t_s,shotState.ballistic.pelletArrival_s,1e-14,'pellet arrival');
assert.ok(arrivalEvent.t_s>shotEvent.t_s);
assert.equal(shotState.narrative.some(e=>e.type==='BREAK'),false);

const afterArrival=simulateCanonicalFlatCrosser(scenario,arrivalEvent.t_s+0.01);
assert.ok(afterArrival.activeNarrativeEvents.some(e=>e.type==='SHOT'));
assert.ok(afterArrival.activeNarrativeEvents.some(e=>e.type==='PELLET_ARRIVAL'));

// Provider safety: P7 v1 refuses any provider not explicitly marked TEST_ONLY.
assert.throws(()=>createCanonicalFlatCrosserScenario({provider:{id:'BAD',status:'INSTRUCTIONAL',timeToRange:r=>r/400}}),/explicit TEST_ONLY provider/);
assert.throws(()=>createTestOnlyConstantSpeedProvider(0),/> 0/);

console.log(JSON.stringify({suite:'ShotSight P7 flat-crosser integrated engineering proof v1',status:'PASS',tests:{deterministicReplay:true,sharedClock:true,certificationBoundary:true,methodProvenance:true,targetTimeConsistency:true,interceptDerivedLead:true,projectionRelationship:true,shotArrivalOrdering:true,noDecorativeBreak:true,providerFailClosed:true}},null,2));
