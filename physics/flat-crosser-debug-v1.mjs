// ShotSight P7 — deterministic engineering debug/scrub control surface.
// This module controls observation of the canonical proof; it never mutates physics state.

import {assertFiniteNumber} from './target-engine-v1.mjs';
import {simulateCanonicalFlatCrosser} from './canonical-flat-crosser-v1.mjs';

function assertPositive(v,label){assertFiniteNumber(v,label);if(!(v>0))throw new Error(`${label} must be > 0`);return v;}
function clamp(v,lo,hi){return Math.min(hi,Math.max(lo,v));}

export function createFlatCrosserDebugSession({scenario,duration_s=2,frameRate_hz=60,playbackRate=1}={}){
  if(!scenario||scenario.status!=='ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION')throw new Error('P7 engineering-proof scenario required');
  assertPositive(duration_s,'duration_s');assertPositive(frameRate_hz,'frameRate_hz');assertPositive(playbackRate,'playbackRate');
  const frameDt_s=1/frameRate_hz;
  const frameCount=Math.floor(duration_s*frameRate_hz)+1;
  return Object.freeze({scenario,duration_s,frameRate_hz,frameDt_s,frameCount,playbackRate,status:'ENGINEERING_DEBUG_NOT_INSTRUCTIONAL'});
}

export function timeForFrame(session,frameIndex){
  if(!session||session.status!=='ENGINEERING_DEBUG_NOT_INSTRUCTIONAL')throw new Error('debug session required');
  assertFiniteNumber(frameIndex,'frameIndex');if(!Number.isInteger(frameIndex))throw new Error('frameIndex must be integer');
  const i=clamp(frameIndex,0,session.frameCount-1);
  return Math.min(session.duration_s,i/session.frameRate_hz);
}

export function sampleFrame(session,frameIndex){
  const t_s=timeForFrame(session,frameIndex);
  return Object.freeze({frameIndex:clamp(frameIndex,0,session.frameCount-1),t_s,state:simulateCanonicalFlatCrosser(session.scenario,t_s)});
}

export function scrubToTime(session,t_s){
  assertFiniteNumber(t_s,'t_s');
  const t=clamp(t_s,0,session.duration_s);
  return Object.freeze({t_s:t,state:simulateCanonicalFlatCrosser(session.scenario,t)});
}

export function scrubNormalized(session,u){
  assertFiniteNumber(u,'u');
  return scrubToTime(session,clamp(u,0,1)*session.duration_s);
}

// Playback mapping is direct from screen elapsed time; no subsystem owns an incremental loop.
export function playbackTime(session,{anchorSimulationTime_s=0,screenElapsed_s=0}={}){
  assertFiniteNumber(anchorSimulationTime_s,'anchorSimulationTime_s');assertFiniteNumber(screenElapsed_s,'screenElapsed_s');
  if(screenElapsed_s<0)throw new Error('screenElapsed_s must be >= 0');
  return clamp(anchorSimulationTime_s+screenElapsed_s*session.playbackRate,0,session.duration_s);
}

export function telemetryFromState(state){
  if(!state||!state.masterClock?.allSubsystemsReadSameTime)throw new Error('shared-clock simulation state required');
  return Object.freeze({
    t_s:state.t_s,
    targetPosition_W:state.target.position_W,
    targetRange_m:state.target.range_m,
    targetSpeed_mps:state.target.speed_mps,
    targetAz_rad:state.target.az_rad,
    targetEl_rad:state.target.el_rad,
    targetLosAngularVelocity_W:state.target.losAngularVelocity_W,
    bore_W:state.gun.bore_W,
    gunAz_rad:state.gun.az_rad,
    gunEl_rad:state.gun.el_rad,
    gunAngularSpeed_radps:state.gun.angularSpeed_radps,
    signedApparentAzSeparation_rad:state.relationship.signedApparentAzSeparation_rad,
    physicalLead_m:state.relationship.physicalLead_m,
    apparentLeadAngle_rad:state.relationship.apparentLeadAngle_rad,
    shotTime_s:state.ballistic.shotIntercept?state.narrative.find(e=>e.type==='SHOT')?.t_s:null,
    pelletTOF_s:state.ballistic.shotIntercept.pelletTOF_s,
    pelletArrival_s:state.ballistic.pelletArrival_s,
    interceptValid:state.ballistic.currentIntercept.valid,
    gunStrategyId:state.gunStrategy.id,
    gunStrategyProvenanceClass:state.gunStrategy.provenanceClass,
    gunStrategyStatus:state.gunStrategy.status,
    methodReferenceId:state.method.id,
    methodReferenceRole:state.method.role,
    methodKinematicsStatus:state.method.kinematicsStatus,
    methodId:null,
    methodEvidenceClass:state.method.evidenceClass,
    thresholdEventsStatus:state.method.thresholdEventsStatus,
    activeNarrativeEvents:state.activeNarrativeEvents.map(e=>e.type),
    providerStatus:state.ballistic.providerStatus,
    realisticClay:state.certification.realisticClay,
    instructionalMotion:state.certification.instructionalMotion
  });
}

export function debugFrame(session,frameIndex){const sample=sampleFrame(session,frameIndex);return Object.freeze({...sample,telemetry:telemetryFromState(sample.state)});}
