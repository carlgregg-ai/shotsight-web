// ShotSight P8A quarterer deterministic debug/scrub surface.
// Playback controls map screen time to the single simulation clock only.

import {assertFiniteNumber} from './target-engine-v1.mjs';
import {simulateCanonicalQuarterer} from './canonical-quarterer-v1.mjs';

export function createQuartererDebugSession({scenario,duration_s=2,frameRate_hz=60,playbackRate=1}={}){
  if(!scenario)throw new Error('scenario required');
  for(const [k,v] of Object.entries({duration_s,frameRate_hz,playbackRate}))assertFiniteNumber(v,k);
  if(!(duration_s>0&&frameRate_hz>0&&playbackRate>0))throw new Error('duration/frame rate/playback rate must be > 0');
  const frameCount=Math.round(duration_s*frameRate_hz)+1;
  return Object.freeze({scenario,duration_s,frameRate_hz,playbackRate,frameCount});
}

export function screenElapsedToQuartererSimulationTime(session,screenElapsed_s){
  assertFiniteNumber(screenElapsed_s,'screenElapsed_s');if(screenElapsed_s<0)throw new Error('screenElapsed_s must be >= 0');
  return Math.min(session.duration_s,screenElapsed_s*session.playbackRate);
}

export function quartererFrame(session,frameIndex){
  if(!Number.isInteger(frameIndex)||frameIndex<0||frameIndex>=session.frameCount)throw new Error('frameIndex out of range');
  const t_s=Math.min(session.duration_s,frameIndex/session.frameRate_hz);
  return sampleQuartererAt(session,t_s,{frameIndex});
}

export function sampleQuartererAt(session,t_s,{frameIndex=null}={}){
  assertFiniteNumber(t_s,'t_s');if(t_s<0||t_s>session.duration_s)throw new Error('t_s outside debug duration');
  const state=simulateCanonicalQuarterer(session.scenario,t_s);
  const telemetry=Object.freeze({
    t_s,
    targetPosition_W:state.target.position_W,
    targetRange_m:state.target.range_m,
    targetRangeRate_mps:state.target.rangeRate_mps,
    targetSpeed_mps:state.target.speed_mps,
    targetAz_rad:state.target.az_rad,
    targetEl_rad:state.target.el_rad,
    targetLosAngularSpeed_radps:state.target.losAngularSpeed_radps,
    gunAz_rad:state.gun.az_rad,
    gunEl_rad:state.gun.el_rad,
    gunAngularSpeed_radps:state.gun.angularSpeed_radps,
    signedApparentAzSeparation_rad:state.relationship.signedApparentAzSeparation_rad,
    physicalLead_m:state.relationship.physicalLead_m,
    apparentLeadAngle_rad:state.relationship.apparentLeadAngle_rad,
    ballisticShotOriginLeadAngle_rad:state.relationship.ballisticShotOriginLeadAngle_rad,
    shotTime_s:session.scenario.shotTime_s,
    pelletTOF_s:state.ballistic.shotIntercept.pelletTOF_s,
    pelletArrival_s:state.ballistic.pelletArrival_s,
    interceptValid:state.ballistic.currentIntercept.valid,
    gunStrategyId:state.gunStrategy.id,
    gunStrategyProvenanceClass:state.gunStrategy.provenanceClass,
    gunStrategyStatus:state.gunStrategy.status,
    methodId:state.method.id,
    methodKinematicsStatus:state.method.kinematicsStatus,
    thresholdEventsStatus:state.method.thresholdEventsStatus,
    providerStatus:state.ballistic.providerStatus,
    realisticClay:state.certification.realisticClay,
    instructionalMotion:state.certification.instructionalMotion,
    activeNarrativeEvents:Object.freeze(state.activeNarrativeEvents.map(e=>e.type))
  });
  return Object.freeze({frameIndex,t_s,state,telemetry});
}

export function scrubQuartererNormalized(session,u){
  assertFiniteNumber(u,'u');if(u<0||u>1)throw new Error('scrub u must be in [0,1]');
  return sampleQuartererAt(session,u*session.duration_s);
}
