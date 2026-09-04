import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createCanonicalFlatCrosserScenario} from '../physics/canonical-flat-crosser-v1.mjs';
import {createFlatCrosserDebugSession,debugFrame,scrubNormalized} from '../physics/flat-crosser-debug-v1.mjs';

const html=await readFile(new URL('../p7-debug.html',import.meta.url),'utf8');
for(const id of ['playPause','stepBack','stepForward','speed','scrub','telemetry','qaRows','certLock','holds','strategyLock','methodReference'])assert.match(html,new RegExp(`id=["']${id}["']`),`missing browser control ${id}`);
for(const required of ['ENGINEERING PROOF · NOT REALISTIC CLAY CERTIFICATION · NOT INSTRUCTIONAL','ENGINEERING_INTERCEPT_REFERENCE · ENGINEERING_REFERENCE · NOT_A_COACHING_METHOD','NSCA_LONG_CROSSER_PULL_AWAY · SOURCE_REFERENCE_ONLY · kinematics HOLD_NOT_IMPLEMENTED','ACQUISITION · CONNECTION · SPEED_MATCH = HOLD','active coaching method','createFlatCrosserDebugSession','debugFrame','scrubNormalized'])assert.ok(html.includes(required),`missing P7 browser invariant: ${required}`);
assert.ok(!html.includes('REALISTIC CLAY CERTIFIED'),'debug surface must not claim realistic clay certification');

const scenario=createCanonicalFlatCrosserScenario();
const session=createFlatCrosserDebugSession({scenario,duration_s:2,frameRate_hz:60,playbackRate:1});
const f0=debugFrame(session,0),fShot=debugFrame(session,Math.round(scenario.shotTime_s*session.frameRate_hz));
assert.equal(f0.state.masterClock.allSubsystemsReadSameTime,true);
assert.equal(fShot.telemetry.realisticClay,false);
assert.equal(fShot.telemetry.instructionalMotion,false);
assert.equal(fShot.telemetry.providerStatus,'TEST_ONLY_NOT_INSTRUCTIONAL');
assert.equal(fShot.telemetry.gunStrategyId,'ENGINEERING_INTERCEPT_REFERENCE');
assert.equal(fShot.telemetry.gunStrategyProvenanceClass,'ENGINEERING_REFERENCE');
assert.equal(fShot.telemetry.gunStrategyStatus,'NOT_A_COACHING_METHOD');
assert.equal(fShot.telemetry.methodReferenceId,'NSCA_LONG_CROSSER_PULL_AWAY');
assert.equal(fShot.telemetry.methodReferenceRole,'SOURCE_REFERENCE_ONLY');
assert.equal(fShot.telemetry.methodKinematicsStatus,'HOLD_NOT_IMPLEMENTED');
assert.equal(fShot.telemetry.methodId,null);
assert.equal(fShot.telemetry.thresholdEventsStatus,'HOLD_UNLESS_AUTHORISED_PREDICATE');
const scrub=scrubNormalized(session,0.5);
assert.equal(scrub.t_s,1);
assert.equal(scrub.state.t_s,1);
console.log(JSON.stringify({suite:'ShotSight P7 browser debug contract v1',status:'PASS',tests:{controlsPresent:true,certificationLock:true,engineeringStrategyLabel:true,methodReferenceOnly:true,holdRendering:true,sharedClock:true,testOnlyProvider:true,scrubDirect:true}},null,2));
