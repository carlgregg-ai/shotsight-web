// ShotSight Virtual Shooter L3 — learner-side dynamic perceptual coupling controller.
// Governing shooting axiom:
// READ THE LINE -> MATCH THE SPEED -> APPLY THE METHOD -> TRIGGER -> FOLLOW THROUGH.
// This module consumes only delayed/noisy belief + plan state and finite gun state.
// It has no oracle/physics import and never receives range, intercept, pellet TOF or miss vector.

import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';
import {createGunPlantState,runFiniteGunPlant,perceivedAngularCommand,PROVISIONAL_GUN_PLANT_LIMITS_V1} from './gun-plant-v1.mjs';

const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const finite=(v,n)=>{if(!Number.isFinite(v))throw new Error(`${n} must be finite`);return v;};
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}

export const L3_DYNAMIC_COUPLING_HYPOTHESES_V1=freezePlain({
  evidenceClass:'SHOTSIGHT_HYPOTHESIS_DYNAMIC_PERCEPTUAL_COUPLING',
  triggerConfidenceMin:0.20,
  triggerProgressEarlyMargin:0.045,
  relationshipTolerance_rad:0.050,
  speedMatchTolerance_radps:0.35,
  minimumApparentLineSpeed_radps:0.02,
  followThrough_s:0.18,
  note:'Engineering hypotheses only. No value is asserted as a human constant; Sense/video calibration required.'
});

function validateFrame(frame){
  if(!frame||frame.schema!=='MAINTAINED_LEAD_PERCEPTION_FRAME_V1')throw new Error('MAINTAINED_LEAD_PERCEPTION_FRAME_V1 required');
  finite(frame.t_s,'frame.t_s');
  if(!frame.belief||frame.belief.schema!=='MULTIFAMILY_BELIEF_V1'||!frame.belief.prediction)throw new Error('predictive MULTIFAMILY_BELIEF_V1 required');
  if(!frame.plan||frame.plan.schema!=='PRESENTATION_LEVEL_SHOT_PLAN_V1'||frame.plan.method!=='MAINTAINED_LEAD')throw new Error('maintained-lead plan required');
  assertNoPrivilegedShooterData(frame,{path:'dynamicCoupling.frame'});
}

function validateRelationship(forwardRelationship_rad,lineNormalRelationship_rad){
  finite(forwardRelationship_rad,'forwardRelationship_rad');
  finite(lineNormalRelationship_rad,'lineNormalRelationship_rad');
  if(forwardRelationship_rad<0||forwardRelationship_rad>0.12)throw new Error('forwardRelationship_rad outside exploratory bounds');
  if(Math.abs(lineNormalRelationship_rad)>0.04)throw new Error('lineNormalRelationship_rad outside exploratory bounds');
}

export function resolveDynamicRelationship(frame,{forwardRelationship_rad=0,lineNormalRelationship_rad=0,relationshipTrajectory=null}={}){
  validateFrame(frame);
  if(!relationshipTrajectory){
    validateRelationship(forwardRelationship_rad,lineNormalRelationship_rad);
    return freezePlain({forwardRelationship_rad,lineNormalRelationship_rad,phase:0,mode:'CONSTANT'});
  }
  if(relationshipTrajectory.schema!=='SHOOTER_VISIBLE_RELATIONSHIP_TRAJECTORY_V1')throw new Error('SHOOTER_VISIBLE_RELATIONSHIP_TRAJECTORY_V1 required');
  const startForward=relationshipTrajectory.connectionForward_rad;
  const endForward=relationshipTrajectory.breakForward_rad;
  const startNormal=relationshipTrajectory.connectionNormal_rad;
  const endNormal=relationshipTrajectory.breakNormal_rad;
  validateRelationship(startForward,startNormal);validateRelationship(endForward,endNormal);
  assertNoPrivilegedShooterData(relationshipTrajectory,{path:'dynamicCoupling.relationshipTrajectory'});
  const p=frame.plan.presentationProgress.current;
  const connection=frame.plan.executionAdaptation?.effectiveConnection??frame.plan.presentationProgress.plannedConnection;
  const intendedBreak=frame.plan.presentationProgress.intendedBreak;
  const span=Math.max(1e-6,intendedBreak-connection);
  const phase=clamp((p-connection)/span,0,1);
  // Linear phase interpolation is deliberately simple and interpretable. The trajectory is
  // indexed only by shooter-visible presentation progress and the existing pre-shot plan.
  // It is not parameterised by range, pellet flight, future oracle path or miss geometry.
  const forward= startForward+(endForward-startForward)*phase;
  const normal= startNormal+(endNormal-startNormal)*phase;
  const out=freezePlain({forwardRelationship_rad:forward,lineNormalRelationship_rad:normal,phase,mode:'PHASE_DEPENDENT_LINEAR'});
  assertNoPrivilegedShooterData(out,{path:'dynamicCoupling.resolvedRelationship'});
  return out;
}

export function dynamicTargetLineBasis(frame){
  validateFrame(frame);
  const azRate=frame.belief.apparentMotion?.azRateMean_radps??0;
  const elRate=frame.belief.apparentMotion?.elRateMean_radps??0;
  const speed=Math.hypot(azRate,elRate);
  if(speed<1e-9)return freezePlain({azRate,elRate,speed,tAz:0,tEl:0,nAz:0,nEl:1});
  const tAz=azRate/speed,tEl=elRate/speed;
  // Tangent always points in the perceived direction of target travel. Therefore a positive
  // forward relationship remains "in front of the clay" for both L->R and R->L targets.
  // Normal is the deterministic +90 degree rotation of that tangent in az/el image space.
  return freezePlain({azRate,elRate,speed,tAz,tEl,nAz:-tEl,nEl:tAz});
}

export function buildDynamicCouplingCommand(frame,{forwardRelationship_rad=0,lineNormalRelationship_rad=0,motorDelay_s=PROVISIONAL_GUN_PLANT_LIMITS_V1.visualMotorDelay_s}={}){
  validateFrame(frame);
  [forwardRelationship_rad,lineNormalRelationship_rad,motorDelay_s].forEach((v,i)=>finite(v,['forwardRelationship_rad','lineNormalRelationship_rad','motorDelay_s'][i]));
  validateRelationship(forwardRelationship_rad,lineNormalRelationship_rad);
  if(motorDelay_s<0||motorDelay_s>0.5)throw new Error('motorDelay_s outside provisional bounds');
  const line=dynamicTargetLineBasis(frame);
  // `belief.prediction` is the shooter's estimate of target position NOW. Move that perceived
  // target along its currently read 2-D angular line by the known finite motor latency, then
  // express the chosen maintained-lead picture in line-tangent / line-normal coordinates.
  // This is a live target-gun relationship, not an oracle intercept calculation.
  const targetAtMotorResponseAz=frame.belief.prediction.azMean_rad+line.azRate*motorDelay_s;
  const targetAtMotorResponseEl=frame.belief.prediction.elMean_rad+line.elRate*motorDelay_s;
  const desiredAz_rad=targetAtMotorResponseAz+line.tAz*forwardRelationship_rad+line.nAz*lineNormalRelationship_rad;
  const desiredEl_rad=targetAtMotorResponseEl+line.tEl*forwardRelationship_rad+line.nEl*lineNormalRelationship_rad;
  const command=perceivedAngularCommand({t_s:frame.t_s,desiredAz_rad,desiredEl_rad,source:'DYNAMIC_PERCEPTUAL_COUPLING_TARGET_LINE_SPEED_AND_RELATIONSHIP'});
  const out=freezePlain({command,line,relationship:{forwardRelationship_rad,lineNormalRelationship_rad},targetAtMotorResponse:{az_rad:targetAtMotorResponseAz,el_rad:targetAtMotorResponseEl}});
  assertNoPrivilegedShooterData(out,{path:'dynamicCoupling.command'});return out;
}

export function assessDynamicCoupling(frame,gunState,{forwardRelationship_rad=0,lineNormalRelationship_rad=0,hypotheses=L3_DYNAMIC_COUPLING_HYPOTHESES_V1}={}){
  validateFrame(frame);if(!gunState||gunState.schema!=='FINITE_GUN_PLANT_STATE_V1')throw new Error('FINITE_GUN_PLANT_STATE_V1 required');
  validateRelationship(forwardRelationship_rad,lineNormalRelationship_rad);
  const line=dynamicTargetLineBasis(frame);
  const stateTimeAlignmentError_s=gunState.t_s-frame.t_s;
  const dAz=gunState.az_rad-frame.belief.prediction.azMean_rad;
  const dEl=gunState.el_rad-frame.belief.prediction.elMean_rad;
  const achievedForward_rad=dAz*line.tAz+dEl*line.tEl;
  const achievedNormal_rad=dAz*line.nAz+dEl*line.nEl;
  const relationshipError_rad=Math.hypot(achievedForward_rad-forwardRelationship_rad,achievedNormal_rad-lineNormalRelationship_rad);
  const gunAlongRate_radps=gunState.azRate_radps*line.tAz+gunState.elRate_radps*line.tEl;
  const gunNormalRate_radps=gunState.azRate_radps*line.nAz+gunState.elRate_radps*line.nEl;
  const speedMatchError_radps=Math.abs(gunAlongRate_radps-line.speed);
  const p=frame.plan.presentationProgress;
  const confidence=clamp(frame.belief.confidence??0,0,1);
  const inCommitWindow=p.current>=Math.max(p.breakWindow.start,p.intendedBreak-hypotheses.triggerProgressEarlyMargin)&&p.current<=p.breakWindow.end;
  const confidenceReady=confidence>=hypotheses.triggerConfidenceMin;
  const lineReadable=line.speed>=hypotheses.minimumApparentLineSpeed_radps;
  const relationshipStable=relationshipError_rad<=hypotheses.relationshipTolerance_rad;
  const speedMatched=speedMatchError_radps<=hypotheses.speedMatchTolerance_radps;
  const breakWindowOpen=!frame.plan.executionAdaptation.breakWindowMissed;
  const trigger=inCommitWindow&&confidenceReady&&lineReadable&&relationshipStable&&speedMatched&&breakWindowOpen;
  const out=freezePlain({schema:'DYNAMIC_COUPLING_STATE_V1',t_s:frame.t_s,stateTimeAlignmentError_s,trigger,confidence,currentProgress:p.current,intendedBreak:p.intendedBreak,desiredForward_rad:forwardRelationship_rad,desiredNormal_rad:lineNormalRelationship_rad,lineSpeed_radps:line.speed,achievedForward_rad,achievedNormal_rad,relationshipError_rad,gunAlongRate_radps,gunNormalRate_radps,speedMatchError_radps,inCommitWindow,confidenceReady,lineReadable,relationshipStable,speedMatched,breakWindowOpen,evidenceClass:'SHOTSIGHT_HYPOTHESIS_TRIGGER_FROM_SHOOTER_VISIBLE_COUPLING'});
  assertNoPrivilegedShooterData(out,{path:'dynamicCoupling.state'});return out;
}

export function runDynamicMaintainedLeadCoupling({frames,forwardRelationship_rad=0,lineNormalRelationship_rad=0,relationshipTrajectory=null,limits=PROVISIONAL_GUN_PLANT_LIMITS_V1,seed=1,hypotheses=L3_DYNAMIC_COUPLING_HYPOTHESES_V1}={}){
  if(!Array.isArray(frames)||frames.length<2)throw new Error('perception frames required');frames.forEach(validateFrame);
  if(relationshipTrajectory)assertNoPrivilegedShooterData(relationshipTrajectory,{path:'dynamicCoupling.relationshipTrajectory'});
  const firstRelationship=resolveDynamicRelationship(frames[0],{forwardRelationship_rad,lineNormalRelationship_rad,relationshipTrajectory});
  const first=buildDynamicCouplingCommand(frames[0],{...firstRelationship,motorDelay_s:limits.visualMotorDelay_s});
  const initialState=createGunPlantState({t_s:frames[0].t_s,az_rad:frames[0].belief.prediction.azMean_rad,el_rad:frames[0].belief.prediction.elMean_rad});
  const commands=[];
  const stateIndexByFrame=[];
  const resolvedRelationships=[];
  // Learner frames are normally 60 Hz while the finite plant is integrated at 120 Hz.
  // Repeat each frame's shooter-visible command for exactly the number of plant steps until
  // the next perception frame, and assess frame i against the gun state at frame i's own time.
  for(let i=0;i<frames.length;i++){
    stateIndexByFrame.push(commands.length);
    const relationship=resolveDynamicRelationship(frames[i],{forwardRelationship_rad,lineNormalRelationship_rad,relationshipTrajectory});
    resolvedRelationships.push(relationship);
    const c=buildDynamicCouplingCommand(frames[i],{...relationship,motorDelay_s:limits.visualMotorDelay_s}).command;
    const nextTime=i+1<frames.length?frames[i+1].t_s:frames[i].t_s+limits.dt_s;
    const duration=Math.max(limits.dt_s,nextTime-frames[i].t_s);
    const steps=Math.max(1,Math.round(duration/limits.dt_s));
    for(let j=0;j<steps;j++)commands.push(c);
  }
  const gunTrace=runFiniteGunPlant({initialState,commands,limits,seed});
  let trigger=null,triggerState=null,triggerFrameIndex=null;const couplingTrace=[];
  for(let i=0;i<frames.length;i++){
    const state=gunTrace.states[Math.min(gunTrace.states.length-1,stateIndexByFrame[i])];
    const relationship=resolvedRelationships[i];
    const coupling=assessDynamicCoupling(frames[i],state,{...relationship,hypotheses});couplingTrace.push(coupling);
    if(!trigger&&coupling.trigger){trigger=coupling;triggerState=state;triggerFrameIndex=i;}
  }
  let followThrough=null;
  if(trigger){
    const endTime=trigger.t_s+hypotheses.followThrough_s;
    const post=couplingTrace.slice(triggerFrameIndex).filter(x=>x.t_s<=endTime+1e-12);
    followThrough=freezePlain({schema:'POST_TRIGGER_FOLLOW_THROUGH_V1',requestedDuration_s:hypotheses.followThrough_s,samples:post.length,lastTime_s:post.length?post.at(-1).t_s:trigger.t_s,meanSpeedMatchError_radps:post.length?post.reduce((s,x)=>s+x.speedMatchError_radps,0)/post.length:null,meanRelationshipError_rad:post.length?post.reduce((s,x)=>s+x.relationshipError_rad,0)/post.length:null,continuedGunMotion:post.some((x,j)=>j>0&&Math.abs(x.gunAlongRate_radps)>0.01)});
  }
  const result=freezePlain({schema:'DYNAMIC_MAINTAINED_LEAD_COUPLING_RUN_V1',status:trigger?'TRIGGERED':'NO_TRIGGER',method:'MAINTAINED_LEAD',action:relationshipTrajectory?{relationshipTrajectory}:{forwardRelationship_rad,lineNormalRelationship_rad},initialState,firstCommand:first.command,stateIndexByFrame,resolvedRelationships,trigger,triggerState,couplingTrace,gunTrace,followThrough,evidenceClass:'SHOTSIGHT_HYPOTHESIS_DYNAMIC_PERCEPTUAL_COUPLING'});
  assertNoPrivilegedShooterData(result,{path:'dynamicCoupling.run'});return result;
}
