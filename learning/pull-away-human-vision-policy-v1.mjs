// ShotSight Virtual Shooter L3 — pull-away policy constrained by Ellis Human Vision V1.
// Learner-side only. This module MUST NOT consume raw ShooterObservation coordinates.
// ORACLE KNOWS. SHOOTER ACQUIRES, CONNECTS, MATCHES, SEPARATES, TRIGGERS, REMEMBERS.

import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';
import {perceivedAngularCommand,PROVISIONAL_GUN_PLANT_LIMITS_V1} from './gun-plant-v1.mjs';

const finite=(v,n)=>{if(!Number.isFinite(v))throw new Error(`${n} must be finite`);return v;};
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}

export const PULL_AWAY_HUMAN_VISION_HYPOTHESES_V1=freezePlain({
  evidenceClass:'SHOTSIGHT_HYPOTHESIS_PROVISIONAL_METHOD_KINEMATICS',
  connectionTolerance_rad:0.020,
  speedMatchTolerance_radps:0.30,
  minimumTrackConfidence:0.50,
  defaultSeparationTarget_rad:0.035,
  triggerSeparationFraction:0.80,
  note:'Numerical values are provisional and must be calibrated/ablated; no value is an oracle lead or certified human constant.'
});

const VALID_METHOD_PHASES=new Set(['WAIT_FOR_ACQUISITION','CONNECT','MATCH_SPEED','DEVELOP_SEPARATION','TRIGGER_READY']);

function validateVisualEvidence(e){
  if(!e||e.schema!=='ELLIS_VISUAL_EVIDENCE_V1')throw new Error('PULL_AWAY_POLICY_REQUIRES_ELLIS_VISUAL_EVIDENCE_V1');
  assertNoPrivilegedShooterData(e,{path:'pullAway.visualEvidence'});
  if(e.phase==='TRACKING'){
    if(!e.resolved)throw new Error('TRACKING requires resolved visual estimate');
    for(const k of ['az_rad','el_rad','apparentAzRate_radps','apparentElRate_radps','positionSd_rad','rateConfidence','observationTime_s'])finite(e.resolved[k],`resolved.${k}`);
  }else if(e.resolved!==null){
    throw new Error('PULL_AWAY_POLICY_LEAK:unresolved visual phase exposed precise target state');
  }
  return e;
}

function validateGunState(g){
  if(!g||g.schema!=='FINITE_GUN_PLANT_STATE_V1')throw new Error('FINITE_GUN_PLANT_STATE_V1 required');
  for(const k of ['t_s','az_rad','el_rad','azRate_radps','elRate_radps'])finite(g[k],`gun.${k}`);
  assertNoPrivilegedShooterData(g,{path:'pullAway.gunState'});return g;
}

function lineBasis(resolved){
  const azRate=resolved.apparentAzRate_radps,elRate=resolved.apparentElRate_radps;
  const speed=Math.hypot(azRate,elRate);
  if(speed<1e-9)return {speed,tAz:0,tEl:0,nAz:0,nEl:1};
  return {speed,tAz:azRate/speed,tEl:elRate/speed,nAz:-elRate/speed,nEl:azRate/speed};
}

export function createPullAwayPolicyStateV1({visualEvidence,gunState,separationTarget_rad=PULL_AWAY_HUMAN_VISION_HYPOTHESES_V1.defaultSeparationTarget_rad,hypotheses=PULL_AWAY_HUMAN_VISION_HYPOTHESES_V1,previousPhase=null}={}){
  validateVisualEvidence(visualEvidence);validateGunState(gunState);finite(separationTarget_rad,'separationTarget_rad');
  if(separationTarget_rad<0||separationTarget_rad>0.12)throw new Error('separationTarget_rad outside exploratory bounds');
  if(previousPhase!==null&&!VALID_METHOD_PHASES.has(previousPhase))throw new Error('invalid previousPhase');
  assertNoPrivilegedShooterData(hypotheses,{path:'pullAway.hypotheses'});

  // If current vision is lost, do not continue a precise separation command from hidden truth.
  // Acquisition/reacquisition always takes precedence over method-phase persistence.
  if(visualEvidence.phase!=='TRACKING'){
    const command=perceivedAngularCommand({t_s:gunState.t_s,desiredAz_rad:gunState.az_rad,desiredEl_rad:gunState.el_rad,source:'PULL_AWAY_WAIT_FOR_HUMAN_VISUAL_ACQUISITION'});
    const out=freezePlain({schema:'PULL_AWAY_HUMAN_VISION_POLICY_STATE_V1',phase:'WAIT_FOR_ACQUISITION',trigger:false,usableVisualTarget:false,visualPhase:visualEvidence.phase,acquisitionScore:visualEvidence.acquisitionScore,command,connectionError_rad:null,speedMatchError_radps:null,achievedForward_rad:null,separationTarget_rad,evidenceClass:hypotheses.evidenceClass,phasePersistence:'RESET_ON_VISUAL_LOSS'});
    assertNoPrivilegedShooterData(out,{path:'pullAway.policy'});return out;
  }

  const r=visualEvidence.resolved,line=lineBasis(r);
  const dAz=gunState.az_rad-r.az_rad,dEl=gunState.el_rad-r.el_rad;
  const achievedForward_rad=dAz*line.tAz+dEl*line.tEl;
  const achievedNormal_rad=dAz*line.nAz+dEl*line.nEl;
  const connectionError_rad=Math.hypot(dAz,dEl);
  const gunAlongRate=gunState.azRate_radps*line.tAz+gunState.elRate_radps*line.tEl;
  const speedMatchError_radps=Math.abs(gunAlongRate-line.speed);
  const confidenceReady=visualEvidence.confidence>=hypotheses.minimumTrackConfidence;
  const connected=connectionError_rad<=hypotheses.connectionTolerance_rad;
  const speedMatched=speedMatchError_radps<=hypotheses.speedMatchTolerance_radps;

  // Pull-away has topology, not just instantaneous predicates. Once Ellis has genuinely
  // connected and matched speed, deliberately developing separation is a persistent method
  // phase. Without this state, leaving the connection tolerance would incorrectly command a
  // return to the target and undo the pull-away. Persistence uses only Ellis's own prior phase.
  const separationCommitted=previousPhase==='DEVELOP_SEPARATION'||previousPhase==='TRIGGER_READY';
  let phase='CONNECT';
  if(connected&&confidenceReady)phase='MATCH_SPEED';
  if((connected&&confidenceReady&&speedMatched)||separationCommitted)phase='DEVELOP_SEPARATION';
  if(confidenceReady&&separationCommitted&&achievedForward_rad>=separationTarget_rad*hypotheses.triggerSeparationFraction)phase='TRIGGER_READY';

  const responseDt=PROVISIONAL_GUN_PLANT_LIMITS_V1.visualMotorDelay_s;
  const targetAtResponseAz=r.az_rad+r.apparentAzRate_radps*responseDt;
  const targetAtResponseEl=r.el_rad+r.apparentElRate_radps*responseDt;
  const useSeparation=phase==='DEVELOP_SEPARATION'||phase==='TRIGGER_READY';
  const desiredForward=useSeparation?separationTarget_rad:0;
  const desiredAz=targetAtResponseAz+line.tAz*desiredForward;
  const desiredEl=targetAtResponseEl+line.tEl*desiredForward;
  const command=perceivedAngularCommand({t_s:gunState.t_s,desiredAz_rad:desiredAz,desiredEl_rad:desiredEl,source:`PULL_AWAY_${phase}_FROM_RESOLVED_HUMAN_VISUAL_EVIDENCE`});
  const trigger=phase==='TRIGGER_READY';
  const out=freezePlain({schema:'PULL_AWAY_HUMAN_VISION_POLICY_STATE_V1',phase,previousPhase,trigger,usableVisualTarget:true,visualPhase:visualEvidence.phase,acquisitionScore:visualEvidence.acquisitionScore,visualConfidence:visualEvidence.confidence,connectionError_rad,speedMatchError_radps,achievedForward_rad,achievedNormal_rad,separationTarget_rad,lineSpeed_radps:line.speed,command,evidenceClass:hypotheses.evidenceClass,phasePersistence:'LEARNER_INTERNAL_METHOD_PHASE_ONLY_RESET_ON_VISUAL_LOSS',boundary:'NO_RAW_SHOOTER_OBSERVATION_OR_ORACLE_STATE_ACCEPTED'});
  assertNoPrivilegedShooterData(out,{path:'pullAway.policy'});return out;
}

export function auditPullAwayHumanVisionPolicyInputV1(input){
  if(input?.schema==='SHOOTER_OBSERVATION_V1')throw new Error('PULL_AWAY_POLICY_RAW_OBSERVATION_BYPASS_FORBIDDEN');
  validateVisualEvidence(input);
  return freezePlain({schema:'PULL_AWAY_HUMAN_VISION_POLICY_AUDIT_V1',status:'PASS',rawObservationAccepted:false,privilegedFieldAccess:0});
}
