// ShotSight Virtual Shooter L3 — shooter-visible trigger commitment timing exploration.
// Governing axiom: READ THE LINE -> MATCH THE SPEED -> APPLY THE METHOD -> TRIGGER -> FOLLOW THROUGH.
// This learner-side module never imports oracle/physics scoring and receives no range, intercept,
// pellet TOF, miss geometry, exact future path or metric lead.

import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';
import {buildDynamicCouplingCommand,assessDynamicCoupling,L3_DYNAMIC_COUPLING_HYPOTHESES_V1} from './dynamic-perceptual-coupling-v1.mjs';
import {createGunPlantState,runFiniteGunPlant,PROVISIONAL_GUN_PLANT_LIMITS_V1} from './gun-plant-v1.mjs';

const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const finite=(v,n)=>{if(!Number.isFinite(v))throw new Error(`${n} must be finite`);return v;};
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}

export const L3_TRIGGER_TIMING_HYPOTHESES_V1=freezePlain({
  evidenceClass:'SHOTSIGHT_HYPOTHESIS_SHOOTER_VISIBLE_TRIGGER_COMMITMENT_TIMING',
  commitmentHalfWidth_progress:0.025,
  followThrough_s:L3_DYNAMIC_COUPLING_HYPOTHESES_V1.followThrough_s,
  note:'Commitment offset is a dimensionless location inside the shooter-planned break window, not seconds, pellet TOF or oracle intercept timing.'
});

function validateFrame(frame){
  if(!frame||frame.schema!=='MAINTAINED_LEAD_PERCEPTION_FRAME_V1')throw new Error('MAINTAINED_LEAD_PERCEPTION_FRAME_V1 required');
  if(!frame.plan||frame.plan.schema!=='PRESENTATION_LEVEL_SHOT_PLAN_V1'||frame.plan.method!=='MAINTAINED_LEAD')throw new Error('maintained-lead plan required');
  assertNoPrivilegedShooterData(frame,{path:'dynamicTriggerTiming.frame'});
}

export function shooterVisibleCommitmentWindow(frame,{commitmentOffset_progress=0,commitmentHalfWidth_progress=L3_TRIGGER_TIMING_HYPOTHESES_V1.commitmentHalfWidth_progress}={}){
  validateFrame(frame);finite(commitmentOffset_progress,'commitmentOffset_progress');finite(commitmentHalfWidth_progress,'commitmentHalfWidth_progress');
  if(Math.abs(commitmentOffset_progress)>0.20)throw new Error('commitmentOffset_progress outside exploratory bounds');
  if(commitmentHalfWidth_progress<=0||commitmentHalfWidth_progress>0.10)throw new Error('commitmentHalfWidth_progress outside exploratory bounds');
  const p=frame.plan.presentationProgress;
  const centre=clamp(p.intendedBreak+commitmentOffset_progress,p.breakWindow.start,p.breakWindow.end);
  const start=clamp(centre-commitmentHalfWidth_progress,p.breakWindow.start,p.breakWindow.end);
  const end=clamp(centre+commitmentHalfWidth_progress,p.breakWindow.start,p.breakWindow.end);
  const out=freezePlain({schema:'SHOOTER_VISIBLE_TRIGGER_COMMITMENT_WINDOW_V1',centre,start,end,current:p.current,inWindow:p.current>=start&&p.current<=end,evidenceClass:'SHOTSIGHT_HYPOTHESIS_PRESENTATION_PROGRESS_ONLY'});
  assertNoPrivilegedShooterData(out,{path:'dynamicTriggerTiming.commitmentWindow'});return out;
}

export function runDynamicMaintainedLeadWithTriggerTiming({frames,forwardRelationship_rad=0,lineNormalRelationship_rad=0,commitmentOffset_progress=0,limits=PROVISIONAL_GUN_PLANT_LIMITS_V1,seed=1,couplingHypotheses=L3_DYNAMIC_COUPLING_HYPOTHESES_V1,timingHypotheses=L3_TRIGGER_TIMING_HYPOTHESES_V1}={}){
  if(!Array.isArray(frames)||frames.length<2)throw new Error('perception frames required');frames.forEach(validateFrame);
  const initialState=createGunPlantState({t_s:frames[0].t_s,az_rad:frames[0].belief.prediction.azMean_rad,el_rad:frames[0].belief.prediction.elMean_rad});
  const commands=[];for(const frame of frames){const c=buildDynamicCouplingCommand(frame,{forwardRelationship_rad,lineNormalRelationship_rad,motorDelay_s:limits.visualMotorDelay_s}).command;commands.push(c,c);}
  const gunTrace=runFiniteGunPlant({initialState,commands,limits,seed});
  let trigger=null,triggerState=null,triggerFrameIndex=null;const couplingTrace=[];
  for(let i=0;i<frames.length;i++){
    const state=gunTrace.states[Math.min(gunTrace.states.length-1,(i+1)*2)];
    const base=assessDynamicCoupling(frames[i],state,{forwardRelationship_rad,lineNormalRelationship_rad,hypotheses:couplingHypotheses});
    const commitment=shooterVisibleCommitmentWindow(frames[i],{commitmentOffset_progress,commitmentHalfWidth_progress:timingHypotheses.commitmentHalfWidth_progress});
    const processReady=base.confidenceReady&&base.lineReadable&&base.relationshipStable&&base.speedMatched&&base.breakWindowOpen;
    const timingTrigger=processReady&&commitment.inWindow;
    const coupling=freezePlain({...base,trigger:timingTrigger,legacyFixedCommitWindow:base.inCommitWindow,shooterVisibleCommitment:commitment,evidenceClass:'SHOTSIGHT_HYPOTHESIS_DYNAMIC_COUPLING_PLUS_SHOOTER_VISIBLE_TRIGGER_TIMING'});
    couplingTrace.push(coupling);
    if(!trigger&&timingTrigger){trigger=coupling;triggerState=state;triggerFrameIndex=i;}
  }
  let followThrough=null;
  if(trigger){const endTime=trigger.t_s+timingHypotheses.followThrough_s;const post=couplingTrace.slice(triggerFrameIndex).filter(x=>x.t_s<=endTime+1e-12);followThrough=freezePlain({schema:'POST_TRIGGER_FOLLOW_THROUGH_V1',requestedDuration_s:timingHypotheses.followThrough_s,samples:post.length,lastTime_s:post.length?post.at(-1).t_s:trigger.t_s,continuedGunMotion:post.some((x,j)=>j>0&&Math.abs(x.gunAlongRate_radps)>0.01),meanSpeedMatchError_radps:post.length?post.reduce((s,x)=>s+x.speedMatchError_radps,0)/post.length:null,meanRelationshipError_rad:post.length?post.reduce((s,x)=>s+x.relationshipError_rad,0)/post.length:null});}
  const result=freezePlain({schema:'DYNAMIC_MAINTAINED_LEAD_TRIGGER_TIMING_RUN_V1',status:trigger?'TRIGGERED':'NO_TRIGGER',method:'MAINTAINED_LEAD',action:{forwardRelationship_rad,lineNormalRelationship_rad,commitmentOffset_progress},initialState,trigger,triggerState,couplingTrace,gunTrace,followThrough,evidenceClass:'SHOTSIGHT_HYPOTHESIS_DYNAMIC_PERCEPTUAL_COUPLING_TRIGGER_TIMING'});
  assertNoPrivilegedShooterData(result,{path:'dynamicTriggerTiming.run'});return result;
}
