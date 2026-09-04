import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createCanonicalQuartererScenario} from '../physics/canonical-quarterer-v1.mjs';
import {createQuartererDebugSession,quartererFrame,scrubQuartererNormalized} from '../physics/quarterer-debug-v1.mjs';

const html=await readFile(new URL('../p8-quarterer-debug.html',import.meta.url),'utf8');
for(const id of ['playPause','stepBack','stepForward','speed','scrub','telemetry','qaRows','qaTableWrap','certLock','projectionLock','geometryLock','strategyLock','methodLock'])assert.match(html,new RegExp(`id=["']${id}["']`),`missing P8A browser control ${id}`);
for(const required of [
  'ENGINEERING PROOF · NOT REALISTIC CLAY CERTIFICATION · NOT INSTRUCTIONAL',
  'NORMALISED PINHOLE DEBUG PROJECTION · AUTO-FIT · NOT CAMERA CALIBRATION',
  'CONSTANT-VELOCITY QUARTERING GEOMETRY · CHANGING RANGE/LOS · NOT REALISTIC CLAY FLIGHT',
  'ENGINEERING_INTERCEPT_REFERENCE · ENGINEERING_REFERENCE · NOT_A_COACHING_METHOD',
  'NONE SELECTED · HOLD_NO_AUTHORISED_APPLICABILITY_MAPPING',
  'targetRangeRate_mps','targetLosAngularSpeed_radps','createQuartererDebugSession','quartererFrame','scrubQuartererNormalized','pinholeNormalised','recomputeProjectionScale','overflow-x:auto','arrivalFrame=Math.ceil'
])assert.ok(html.includes(required),`missing P8A browser invariant: ${required}`);
assert.ok(!html.includes('REALISTIC CLAY CERTIFIED'),'quarterer surface must not claim realistic clay certification');
assert.ok(!html.includes('Math.max(-.95'),'quarterer renderer must not hard-clip projected geometry');
assert.ok(!html.includes('const scale=1.2'),'quarterer renderer must not use arbitrary linear angle scale');

const scenario=createCanonicalQuartererScenario();
const session=createQuartererDebugSession({scenario,duration_s:2,frameRate_hz:60,playbackRate:1});
const f0=quartererFrame(session,0);
const shotFrame=Math.round(scenario.shotTime_s*session.frameRate_hz);
const fShot=quartererFrame(session,shotFrame);
const arrivalFrame=Math.ceil(fShot.telemetry.pelletArrival_s*session.frameRate_hz);
const fBefore=quartererFrame(session,arrivalFrame-1),fArrival=quartererFrame(session,arrivalFrame);
assert.equal(f0.state.masterClock.allSubsystemsReadSameTime,true);
assert.equal(f0.telemetry.realisticClay,false);
assert.equal(f0.telemetry.instructionalMotion,false);
assert.equal(f0.telemetry.providerStatus,'TEST_ONLY');
assert.equal(f0.telemetry.gunStrategyId,'ENGINEERING_INTERCEPT_REFERENCE');
assert.equal(f0.telemetry.gunStrategyStatus,'NOT_A_COACHING_METHOD');
assert.equal(f0.telemetry.methodId,null);
assert.equal(f0.telemetry.methodKinematicsStatus,'HOLD_NO_AUTHORISED_APPLICABILITY_MAPPING');
assert.ok(f0.telemetry.targetRangeRate_mps>0);
assert.ok(f0.telemetry.targetLosAngularSpeed_radps>0);
assert.ok(fBefore.t_s<fShot.telemetry.pelletArrival_s);
assert.ok(fArrival.t_s>=fShot.telemetry.pelletArrival_s);
assert.ok(!fBefore.telemetry.activeNarrativeEvents.includes('PELLET_ARRIVAL'));
assert.ok(fArrival.telemetry.activeNarrativeEvents.includes('PELLET_ARRIVAL'));
const scrub=scrubQuartererNormalized(session,0.5);
assert.equal(scrub.t_s,1);
assert.equal(scrub.state.t_s,1);
assert.notEqual(quartererFrame(session,0).telemetry.targetRange_m,quartererFrame(session,120).telemetry.targetRange_m);
assert.notEqual(quartererFrame(session,0).telemetry.targetLosAngularSpeed_radps,quartererFrame(session,120).telemetry.targetLosAngularSpeed_radps);

console.log(JSON.stringify({suite:'ShotSight P8A quarterer browser debug contract',status:'PASS',tests:{controlsPresent:true,certificationLocks:true,normalisedPinholeProjection:true,noHardClip:true,mobileTableOverflowContained:true,changingRangeTelemetry:true,changingLosRateTelemetry:true,engineeringStrategyLabel:true,methodHoldRendering:true,sharedClock:true,testOnlyProvider:true,pelletArrivalQaSample:true,scrubDirect:true}},null,2));
