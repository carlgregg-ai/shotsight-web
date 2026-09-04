// ShotSight P6 — Shooting-Method / Narrative Engine v1
//
// This module intentionally separates:
// 1) mathematical relative-motion facts that can be derived from state; and
// 2) coaching labels/events that require an authorised source-specific predicate.
//
// No hidden MATCH / CONNECTION / human-speed tolerance exists here.

import {assertFiniteNumber} from './target-engine-v1.mjs';

export const EVIDENCE_CLASS=Object.freeze({
  DIRECT:'DIRECT',SYNTHESIS:'SYNTHESIS',SHOTSIGHT_HYPOTHESIS:'SHOTSIGHT_HYPOTHESIS',HOLD:'HOLD',TEST_ONLY:'TEST_ONLY'
});

export function createMethodEvidenceContract({id,name,sources,evidenceClass,applicability,authorisedPredicates={}}){
  if(typeof id!=='string'||!id||typeof name!=='string'||!name)throw new Error('method id/name required');
  if(!Array.isArray(sources)||sources.length<1||sources.some(s=>typeof s!=='string'||!s))throw new Error('method sources required');
  if(!Object.values(EVIDENCE_CLASS).includes(evidenceClass))throw new Error('invalid evidence class');
  if(!applicability||typeof applicability!=='object')throw new Error('method applicability required');
  for(const [event,predicate] of Object.entries(authorisedPredicates)){
    if(typeof predicate!=='function')throw new Error(`authorised predicate ${event} must be a function`);
  }
  return Object.freeze({id,name,sources:Object.freeze([...sources]),evidenceClass,applicability:Object.freeze({...applicability}),authorisedPredicates:Object.freeze({...authorisedPredicates})});
}

export function relativeMotionFacts({signedSeparationPrev_rad,signedSeparationNow_rad,dt_s}){
  assertFiniteNumber(signedSeparationPrev_rad,'signedSeparationPrev_rad');
  assertFiniteNumber(signedSeparationNow_rad,'signedSeparationNow_rad');
  assertFiniteNumber(dt_s,'dt_s');if(!(dt_s>0))throw new Error('dt_s must be > 0');
  const delta=signedSeparationNow_rad-signedSeparationPrev_rad;
  const magnitudeDelta=Math.abs(signedSeparationNow_rad)-Math.abs(signedSeparationPrev_rad);
  const crossed=(signedSeparationPrev_rad<0&&signedSeparationNow_rad>=0)||(signedSeparationPrev_rad>0&&signedSeparationNow_rad<=0);
  return Object.freeze({
    separationSign:Math.sign(signedSeparationNow_rad),
    signedSeparation_rad:signedSeparationNow_rad,
    signedSeparationRate_radps:delta/dt_s,
    magnitudeIncreasing:magnitudeDelta>0,
    magnitudeDecreasing:magnitudeDelta<0,
    passThroughCandidate:crossed,
    classification:'MATHEMATICAL_INVARIANT_NOT_COACHING_METHOD'
  });
}

export function evaluateAuthorisedEvent({method,eventName,state,mode='INSTRUCTIONAL'}){
  if(!method||!method.authorisedPredicates)throw new Error('method evidence contract required');
  const fn=method.authorisedPredicates[eventName];
  if(typeof fn!=='function'){
    return Object.freeze({asserted:false,status:'HOLD_MISSING_AUTHORISED_PREDICATE',eventName,methodId:method.id,mode});
  }
  const result=fn(state);
  if(typeof result!=='boolean')throw new Error(`predicate ${eventName} must return boolean`);
  return Object.freeze({asserted:result,status:'AUTHORISED_PREDICATE_EVALUATED',eventName,methodId:method.id,mode});
}

export function createNarrativeTimeline({shotTime_s=null,pelletTOF_s=null,hitPredicateAuthorised=false,hit=false}){
  if(shotTime_s!==null){assertFiniteNumber(shotTime_s,'shotTime_s');if(shotTime_s<0)throw new Error('shotTime_s must be >= 0');}
  if(pelletTOF_s!==null){assertFiniteNumber(pelletTOF_s,'pelletTOF_s');if(!(pelletTOF_s>=0))throw new Error('pelletTOF_s must be >= 0');}
  const events=[];
  if(shotTime_s!==null)events.push(Object.freeze({type:'SHOT',t_s:shotTime_s,status:'SCENARIO_EVENT'}));
  if(shotTime_s!==null&&pelletTOF_s!==null){
    const arrival=shotTime_s+pelletTOF_s;
    events.push(Object.freeze({type:'PELLET_ARRIVAL',t_s:arrival,status:'BALLISTIC_DERIVED'}));
    if(hit){
      if(!hitPredicateAuthorised){
        events.push(Object.freeze({type:'BREAK',t_s:null,status:'HOLD_NO_AUTHORISED_HIT_PREDICATE'}));
      }else{
        events.push(Object.freeze({type:'BREAK',t_s:arrival,status:'AUTHORISED_HIT_EVENT'}));
      }
    }
  }
  return Object.freeze(events);
}

export function validateNarrativeOrdering(events){
  if(!Array.isArray(events))throw new Error('events array required');
  const shot=events.find(e=>e.type==='SHOT'&&Number.isFinite(e.t_s));
  const arrival=events.find(e=>e.type==='PELLET_ARRIVAL'&&Number.isFinite(e.t_s));
  const breakEvent=events.find(e=>e.type==='BREAK'&&Number.isFinite(e.t_s));
  if(shot&&arrival&&arrival.t_s<shot.t_s)throw new Error('PELLET_ARRIVAL cannot precede SHOT');
  if(arrival&&breakEvent&&breakEvent.t_s<arrival.t_s)throw new Error('BREAK cannot precede PELLET_ARRIVAL');
  if(breakEvent&&!arrival)throw new Error('BREAK cannot exist without pellet arrival in v1 narrative contract');
  return true;
}

export const P6_UNRESOLVED_PREDICATES=Object.freeze([
  'SPEED_MATCH_TOLERANCE',
  'CONNECTION_DEFINITION',
  'METHOD_TRANSITION_THRESHOLDS',
  'HUMAN_GUN_SPEED_ACCELERATION_BOUNDS',
  'SOURCE_SPECIFIC_HOLD_POINT_TO_ANGLE_OR_DISTANCE_MAPPING'
]);
