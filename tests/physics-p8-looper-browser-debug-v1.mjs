import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createCanonicalLooperGravityScenario} from '../physics/canonical-looper-gravity-v1.mjs';
import {createLooperGravityDebugSession,looperGravityFrame,sampleLooperGravityAt,scrubLooperGravityNormalized} from '../physics/looper-gravity-debug-v1.mjs';

const html=await readFile(new URL('../p8-looper-debug.html',import.meta.url),'utf8');
for(const id of ['playPause','stepBack','stepForward','speed','scrub','telemetry','qaRows','qaTableWrap','certLock','projectionLock','geometryLock','strategyLock','methodLock'])assert.match(html,new RegExp(`id=["']${id}["']`),`missing P8B browser control ${id}`);
for(const required of [
  'ENGINEERING PROOF · NOT REALISTIC CLAY CERTIFICATION · NOT INSTRUCTIONAL',
  'NORMALISED PINHOLE DEBUG PROJECTION · AUTO-FIT · NOT CAMERA CALIBRATION',
  'TOY_GRAVITY_ONLY · PHYSICALLY GENERATED PARABOLIC PATH · NOT REALISTIC CLAY FLIGHT',
  'ENGINEERING_INTERCEPT_REFERENCE · NOT_A_COACHING_METHOD',
  'NONE SELECTED · HOLD_NO_AUTHORISED_APPLICABILITY_MAPPING',
  'targetPhase','targetVerticalVelocity_mps','apexTime_s','createLooperGravityDebugSession','looperGravityFrame','scrubLooperGravityNormalized','pinholeNormalised','recomputeProjectionScale','overflow-x:auto','arrivalFrame=Math.ceil','apexFrame'
])assert.ok(html.includes(required),`missing P8B browser invariant: ${required}`);
assert.ok(!html.includes('REALISTIC CLAY CERTIFIED'),'looper surface must not claim realistic clay certification');
assert.ok(!html.includes('Math.max(-.95'),'looper renderer must not hard-clip projected geometry');
assert.ok(!html.includes('const scale=1.2'),'looper renderer must not use arbitrary linear angle scale');

const scenario=createCanonicalLooperGravityScenario();
const session=createLooperGravityDebugSession({scenario,duration_s:2.5,frameRate_hz:60,playbackRate:1});
const f0=looperGravityFrame(session,0);
assert.equal(f0.state.masterClock.allSubsystemsReadSameTime,true);
assert.equal(f0.telemetry.realisticClay,false);
assert.equal(f0.telemetry.instructionalMotion,false);
assert.equal(f0.telemetry.providerStatus,'TEST_ONLY');
assert.equal(f0.telemetry.modelBoundary,'TOY_GRAVITY_ONLY');
assert.equal(f0.telemetry.gunStrategyId,'ENGINEERING_INTERCEPT_REFERENCE');
assert.equal(f0.telemetry.gunStrategyStatus,'NOT_A_COACHING_METHOD');
assert.equal(f0.telemetry.methodId,null);
assert.equal(f0.telemetry.methodKinematicsStatus,'HOLD_NO_AUTHORISED_APPLICABILITY_MAPPING');

const exactApex=sampleLooperGravityAt(session,scenario.apexTime_s);
assert.equal(exactApex.telemetry.targetPhase,'APEX');
assert.ok(Math.abs(exactApex.telemetry.targetVerticalVelocity_mps)<=1e-12);
const beforeApex=sampleLooperGravityAt(session,scenario.apexTime_s-1e-5);
const afterApex=sampleLooperGravityAt(session,scenario.apexTime_s+1e-5);
assert.equal(beforeApex.telemetry.targetPhase,'RISE');
assert.equal(afterApex.telemetry.targetPhase,'DESCENT');
assert.ok(beforeApex.telemetry.targetVerticalVelocity_mps>0);
assert.ok(afterApex.telemetry.targetVerticalVelocity_mps<0);

const shotFrame=Math.round(scenario.shotTime_s*session.frameRate_hz);
const fShot=looperGravityFrame(session,shotFrame);
const arrivalFrame=Math.ceil(fShot.telemetry.pelletArrival_s*session.frameRate_hz);
const fBeforeArrival=looperGravityFrame(session,arrivalFrame-1),fArrival=looperGravityFrame(session,arrivalFrame);
assert.ok(fBeforeArrival.t_s<fShot.telemetry.pelletArrival_s);
assert.ok(fArrival.t_s>=fShot.telemetry.pelletArrival_s);
assert.ok(!fBeforeArrival.telemetry.activeNarrativeEvents.includes('PELLET_ARRIVAL'));
assert.ok(fArrival.telemetry.activeNarrativeEvents.includes('PELLET_ARRIVAL'));

const scrub=scrubLooperGravityNormalized(session,0.4);
assert.equal(scrub.t_s,1);
assert.equal(scrub.state.t_s,1);
assert.notEqual(looperGravityFrame(session,0).telemetry.targetRange_m,looperGravityFrame(session,120).telemetry.targetRange_m);
assert.notEqual(looperGravityFrame(session,0).telemetry.targetLosAngularSpeed_radps,looperGravityFrame(session,120).telemetry.targetLosAngularSpeed_radps);

console.log(JSON.stringify({suite:'ShotSight P8B looper browser debug contract',status:'PASS',tests:{controlsPresent:true,certificationLocks:true,gravityOnlyBoundary:true,normalisedPinholeProjection:true,noHardClip:true,mobileTableOverflowContained:true,phaseTelemetry:true,exactApex:true,riseDescentTransition:true,changingRangeTelemetry:true,changingLosRateTelemetry:true,engineeringStrategyLabel:true,methodHoldRendering:true,sharedClock:true,testOnlyProvider:true,pelletArrivalQaSample:true,scrubDirect:true}},null,2));
