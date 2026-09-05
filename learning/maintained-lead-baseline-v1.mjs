// ShotSight Virtual Shooter L3 — maintained-lead no-learning learner-side controller.
// Consumes only perception/belief/plan state plus the finite gun plant.
// The angular separation is an exploratory visual-picture parameter, not ballistic lead.

import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';
import {createGunPlantState,runFiniteGunPlant,perceivedAngularCommand,PROVISIONAL_GUN_PLANT_LIMITS_V1} from './gun-plant-v1.mjs';

const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function finite(v,n){if(!Number.isFinite(v))throw new Error(`${n} must be finite`);return v;}

export const L3_MAINTAINED_LEAD_BASELINE_HYPOTHESES_V1=freezePlain({
  evidenceClass:'SHOTSIGHT_HYPOTHESIS_NO_LEARNING_BASELINE',
  triggerConfidenceMin:0.20,
  triggerProgressEarlyMargin:0.045,
  triggerVisualPictureTolerance_rad:0.055,
  note:'Trigger gates are provisional engineering controls, not human timing constants. Visual-picture tolerance is not metric lead.'
});

function validateFrame(frame){
  if(!frame||frame.schema!=='MAINTAINED_LEAD_PERCEPTION_FRAME_V1')throw new Error('MAINTAINED_LEAD_PERCEPTION_FRAME_V1 required');
  finite(frame.t_s,'frame.t_s');
  if(!frame.belief||frame.belief.schema!=='MULTIFAMILY_BELIEF_V1'||!frame.belief.prediction)throw new Error('predictive MULTIFAMILY_BELIEF_V1 required');
  if(!frame.plan||frame.plan.schema!=='PRESENTATION_LEVEL_SHOT_PLAN_V1'||frame.plan.method!=='MAINTAINED_LEAD')throw new Error('maintained-lead presentation plan required');
  assertNoPrivilegedShooterData(frame,{path:'maintainedLead.frame'});
}

function perceivedDirection(frame){const rate=frame.belief.apparentMotion?.azRateMean_radps??0;return rate>1e-6?1:rate<-1e-6?-1:0;}

export function buildMaintainedLeadPerceivedCommand(frame,{separation_rad=0,motorDelay_s=PROVISIONAL_GUN_PLANT_LIMITS_V1.visualMotorDelay_s}={}){
  validateFrame(frame);finite(separation_rad,'separation_rad');finite(motorDelay_s,'motorDelay_s');if(separation_rad<0||separation_rad>0.25)throw new Error('separation_rad outside exploratory visual-picture bounds');if(motorDelay_s<0||motorDelay_s>0.5)throw new Error('motorDelay_s outside provisional bounds');
  const rate=frame.belief.apparentMotion?.azRateMean_radps??0;
  const direction=perceivedDirection(frame);
  // Perception-only angular feed-forward compensates the known finite motor delay. It is
  // derived from apparent angular rate, never range, pellet time, intercept or oracle state.
  const motorAnticipation_rad=rate*motorDelay_s;
  const desiredAz_rad=frame.belief.prediction.azMean_rad+direction*separation_rad+motorAnticipation_rad;
  const desiredEl_rad=frame.belief.prediction.elMean_rad;
  const out=perceivedAngularCommand({t_s:frame.t_s,desiredAz_rad,desiredEl_rad,source:'MAINTAINED_LEAD_PERCEIVED_TARGET_PLUS_STATIC_VISUAL_SEPARATION_AND_MOTOR_LATENCY_FEEDFORWARD'});
  assertNoPrivilegedShooterData(out,{path:'maintainedLead.command'});return out;
}

export function chooseMaintainedLeadTrigger(frame,gunState,command,{requestedSeparation_rad=0,hypotheses=L3_MAINTAINED_LEAD_BASELINE_HYPOTHESES_V1}={}){
  validateFrame(frame);finite(requestedSeparation_rad,'requestedSeparation_rad');if(!gunState||gunState.schema!=='FINITE_GUN_PLANT_STATE_V1')throw new Error('FINITE_GUN_PLANT_STATE_V1 required');
  assertNoPrivilegedShooterData({gunState,command,hypotheses},{path:'maintainedLead.trigger'});
  const p=frame.plan.presentationProgress,current=p.current,intended=p.intendedBreak,window=p.breakWindow;
  const confidence=clamp(frame.belief.confidence??0,0,1),direction=perceivedDirection(frame);
  const achievedSeparation_rad=direction*(gunState.az_rad-frame.belief.prediction.azMean_rad);
  const separationError_rad=Math.abs(achievedSeparation_rad-requestedSeparation_rad);
  const elevationPictureError_rad=Math.abs(gunState.el_rad-frame.belief.prediction.elMean_rad);
  const visualPictureError_rad=Math.hypot(separationError_rad,elevationPictureError_rad);
  const servoCommandError_rad=Math.hypot(command.desiredAz_rad-gunState.az_rad,command.desiredEl_rad-gunState.el_rad);
  const inCommitWindow=current>=Math.max(window.start,intended-hypotheses.triggerProgressEarlyMargin)&&current<=window.end;
  const confidenceReady=confidence>=hypotheses.triggerConfidenceMin;
  const visualPictureReady=visualPictureError_rad<=hypotheses.triggerVisualPictureTolerance_rad;
  const breakWindowOpen=!frame.plan.executionAdaptation.breakWindowMissed;
  const ready=inCommitWindow&&confidenceReady&&visualPictureReady&&breakWindowOpen;
  return freezePlain({schema:'MAINTAINED_LEAD_TRIGGER_DECISION_V1',trigger:ready,t_s:frame.t_s,confidence,currentProgress:current,intendedBreak:intended,requestedSeparation_rad,achievedSeparation_rad,separationError_rad,elevationPictureError_rad,visualPictureError_rad,servoCommandError_rad,inCommitWindow,confidenceReady,visualPictureReady,breakWindowOpen,evidenceClass:'SHOTSIGHT_HYPOTHESIS_TRIGGER_POLICY_NO_ORACLE'});
}

export function runMaintainedLeadNoLearning({frames,separation_rad=0,limits=PROVISIONAL_GUN_PLANT_LIMITS_V1,seed=1}={}){
  if(!Array.isArray(frames)||frames.length<2)throw new Error('perception frames required');frames.forEach(validateFrame);finite(separation_rad,'separation_rad');
  const firstCommand=buildMaintainedLeadPerceivedCommand(frames[0],{separation_rad,motorDelay_s:limits.visualMotorDelay_s});
  const initialState=createGunPlantState({t_s:frames[0].t_s,az_rad:frames[0].belief.prediction.azMean_rad,el_rad:frames[0].belief.prediction.elMean_rad});
  const commands=[];for(const f of frames){const c=buildMaintainedLeadPerceivedCommand(f,{separation_rad,motorDelay_s:limits.visualMotorDelay_s});commands.push(c,c);}
  const trace=runFiniteGunPlant({initialState,commands,limits,seed});
  let trigger=null,triggerState=null,triggerCommand=null;const decisionTrace=[];
  for(let i=0;i<frames.length;i++){
    const state=trace.states[Math.min(trace.states.length-1,(i+1)*2)],command=buildMaintainedLeadPerceivedCommand(frames[i],{separation_rad,motorDelay_s:limits.visualMotorDelay_s});
    const decision=chooseMaintainedLeadTrigger(frames[i],state,command,{requestedSeparation_rad:separation_rad});decisionTrace.push(decision);
    if(decision.trigger){trigger=decision;triggerState=state;triggerCommand=command;break;}
  }
  const result=freezePlain({schema:'MAINTAINED_LEAD_NO_LEARNING_RUN_V1',status:trigger?'TRIGGERED':'NO_TRIGGER',method:'MAINTAINED_LEAD',separation_rad,initialState,firstCommand,trigger,triggerState,triggerCommand,decisionTrace,gunTrace:trace,evidenceClass:'NO_LEARNING_STATIC_VISUAL_SEPARATION_BASELINE'});
  assertNoPrivilegedShooterData(result,{path:'maintainedLead.run'});return result;
}
