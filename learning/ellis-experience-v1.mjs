// ShotSight Virtual Shooter L3 — Ellis apprenticeship / experience record v1.
// Learner-side only: no physics/oracle imports. Binary outcome remains existential truth.
import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
const finite=(v,n)=>{if(!Number.isFinite(v))throw new Error(`${n} must be finite`);return v;};
const unit=(v,n)=>{finite(v,n);if(v<0||v>1)throw new Error(`${n} outside [0,1]`);return v;};
const safe=(v,path)=>{assertNoPrivilegedShooterData(v,{path});return v;};

export const SATISFACTION_WEIGHTS_V1=Object.freeze({process:0.60,outcome:0.40,coherenceBonus:0.05,instabilityPenalty:0.05});

export function createShotQualityV1({lineRead,connectionStability,speedRelationshipStability,separationControl,jerkControl,triggerCommitment,followThrough,methodTopology}={}){
  const parts={lineRead,connectionStability,speedRelationshipStability,separationControl,jerkControl,triggerCommitment,followThrough,methodTopology};
  for(const [k,v] of Object.entries(parts))unit(v,k);
  // Equal weighting is deliberately interpretable for the first ablation; no oracle correctness term exists.
  const score=100*Object.values(parts).reduce((a,b)=>a+b,0)/Object.keys(parts).length;
  const out=freezePlain({schema:'ELLIS_SHOT_QUALITY_V1',score,components:parts,boundary:'PROCESS_ONLY_NO_ORACLE_LEAD_OR_MISS_GEOMETRY'});
  safe(out,'ellis.shotQuality');return out;
}

export function createBinaryBreakQualityV1({hit,observationConfidence=1}={}){
  if(typeof hit!=='boolean')throw new Error('hit must be boolean');unit(observationConfidence,'observationConfidence');
  // Initial BQ deliberately contains no hidden centrality information. Later graded break evidence needs its own observation model.
  const out=freezePlain({schema:'ELLIS_BREAK_QUALITY_BINARY_V1',hit,score:hit?100:0,observationConfidence,evidence:'BINARY_VISIBLE_BREAK_ONLY'});
  safe(out,'ellis.breakQuality');return out;
}

export function createSatisfactionV1({shotQuality,breakQuality,enabled=true,weights=SATISFACTION_WEIGHTS_V1}={}){
  if(!shotQuality||shotQuality.schema!=='ELLIS_SHOT_QUALITY_V1')throw new Error('ELLIS_SHOT_QUALITY_V1 required');
  if(!breakQuality||breakQuality.schema!=='ELLIS_BREAK_QUALITY_BINARY_V1')throw new Error('ELLIS_BREAK_QUALITY_BINARY_V1 required');
  safe({shotQuality,breakQuality,weights},'ellis.satisfaction.input');
  if(!enabled)return freezePlain({schema:'ELLIS_SATISFACTION_V1',enabled:false,score:null,reason:'ABLATION_OFF'});
  for(const [k,v] of Object.entries(weights))finite(v,`weights.${k}`);
  if(weights.process<0||weights.outcome<0)throw new Error('negative primary weight');
  const process=shotQuality.score/100,outcome=breakQuality.score/100;
  const coherence=(process>=0.8&&outcome>=0.8)?weights.coherenceBonus:0;
  const instability=(outcome>0&&process<0.5)?weights.instabilityPenalty:0;
  const raw=weights.process*process+weights.outcome*outcome+coherence-instability;
  const score=100*Math.max(0,Math.min(1,raw));
  const out=freezePlain({schema:'ELLIS_SATISFACTION_V1',enabled:true,score,processScore:shotQuality.score,outcomeScore:breakQuality.score,weights,coherenceApplied:coherence>0,instabilityPenaltyApplied:instability>0,boundary:'SHAPED_LEARNING_AID_NOT_BREAK_TRUTH'});
  safe(out,'ellis.satisfaction');return out;
}

export function createAcquisitionExperienceV1({phase,acquisitionScore,observationSpan_s,contrast,clutter,occluded=false,waitedForMoreEvidence=false,reacquisitionOccurred=false,streakVsResolved}={}){
  const allowed=new Set(['EXPECTED_RELEASE','FLASH_STREAK','ACQUIRING','TRACKING','REACQUIRING']);
  if(!allowed.has(phase))throw new Error('invalid acquisition phase');
  unit(acquisitionScore,'acquisitionScore');finite(observationSpan_s,'observationSpan_s');if(observationSpan_s<0)throw new Error('observationSpan_s must be non-negative');
  unit(contrast,'contrast');unit(clutter,'clutter');
  if(typeof occluded!=='boolean'||typeof waitedForMoreEvidence!=='boolean'||typeof reacquisitionOccurred!=='boolean')throw new Error('acquisition flags must be boolean');
  if(!['STREAK','RESOLVED','NONE'].includes(streakVsResolved))throw new Error('streakVsResolved invalid');
  if(phase==='TRACKING'&&streakVsResolved!=='RESOLVED')throw new Error('TRACKING acquisition record must be RESOLVED');
  if(['FLASH_STREAK','ACQUIRING','REACQUIRING'].includes(phase)&&streakVsResolved==='RESOLVED')throw new Error('unresolved phase cannot be recorded as RESOLVED');
  const out=freezePlain({schema:'ELLIS_ACQUISITION_EXPERIENCE_V1',phase,acquisitionScore,observationSpan_s,contrast,clutter,occluded,waitedForMoreEvidence,reacquisitionOccurred,streakVsResolved,boundary:'LEARNER_VISIBLE_HUMAN_ANALOGOUS_ACQUISITION_ONLY'});
  safe(out,'ellis.acquisition');return out;
}

export function createEllisExperienceRecordV1({episodeIndex,before,during,outcome,shotQuality,breakQuality,satisfaction,selfDiagnosis=null,acquisition=null}={}){
  if(!Number.isInteger(episodeIndex)||episodeIndex<0)throw new Error('episodeIndex must be non-negative integer');
  if(!before||typeof before!=='object'||!during||typeof during!=='object')throw new Error('before/during required');
  if(!outcome||outcome.schema!=='HIT_MISS_ONLY_FEEDBACK_V1')throw new Error('binary outcome feedback required');
  if(!shotQuality||shotQuality.schema!=='ELLIS_SHOT_QUALITY_V1')throw new Error('shotQuality required');
  if(!breakQuality||breakQuality.schema!=='ELLIS_BREAK_QUALITY_BINARY_V1')throw new Error('breakQuality required');
  if(!satisfaction||satisfaction.schema!=='ELLIS_SATISFACTION_V1')throw new Error('satisfaction required');
  if(acquisition!==null&&acquisition?.schema!=='ELLIS_ACQUISITION_EXPERIENCE_V1')throw new Error('acquisition must be ELLIS_ACQUISITION_EXPERIENCE_V1 or null');
  const out=freezePlain({schema:'ELLIS_EXPERIENCE_RECORD_V1',episodeIndex,before,during,acquisition,outcome,shotQuality,breakQuality,satisfaction,selfDiagnosis,immutability:'FROZEN_LEARNER_VISIBLE_APPRENTICESHIP_RECORD'});
  safe(out,'ellis.experience');return out;
}

export function createSelfDiagnosisV1({hypothesis,evidence,confidence,keepFixed,changeVariable,reason,falsifier}={}){
  for(const [k,v] of Object.entries({hypothesis,evidence,keepFixed,changeVariable,reason,falsifier}))if(typeof v!=='string'||!v.trim())throw new Error(`${k} must be non-empty string`);
  unit(confidence,'confidence');
  const out=freezePlain({schema:'ELLIS_SELF_DIAGNOSIS_V1',hypothesis,evidence,confidence,keepFixed,changeVariable,reason,falsifier,status:'UNCERTAIN_LEARNER_SIDE_HYPOTHESIS'});
  safe(out,'ellis.selfDiagnosis');return out;
}

export function createInterventionRecordV1({parentEpisodeIndices,hypothesis,changedVariable,fixedVariables,comparisonWindow,decision='PENDING',decisionReason='PENDING'}={}){
  if(!Array.isArray(parentEpisodeIndices)||!parentEpisodeIndices.length||parentEpisodeIndices.some(x=>!Number.isInteger(x)||x<0))throw new Error('valid parentEpisodeIndices required');
  if(typeof hypothesis!=='string'||!hypothesis.trim()||typeof changedVariable!=='string'||!changedVariable.trim())throw new Error('hypothesis/changedVariable required');
  if(!Array.isArray(fixedVariables))throw new Error('fixedVariables array required');
  if(!Number.isInteger(comparisonWindow)||comparisonWindow<1)throw new Error('comparisonWindow must be positive integer');
  const out=freezePlain({schema:'ELLIS_INTERVENTION_RECORD_V1',parentEpisodeIndices:[...parentEpisodeIndices],hypothesis,changedVariable,fixedVariables:[...fixedVariables],comparisonWindow,decision,decisionReason,rule:'ONE_VARIABLE_AT_A_TIME_RETAIN_NEGATIVE_FINDINGS'});
  safe(out,'ellis.intervention');return out;
}

export function auditExperienceRecordV1(record){
  if(!record||record.schema!=='ELLIS_EXPERIENCE_RECORD_V1')throw new Error('ELLIS_EXPERIENCE_RECORD_V1 required');
  safe(record,'ellis.experience.audit');
  if(!Object.isFrozen(record))throw new Error('experience record must be immutable');
  return freezePlain({schema:'ELLIS_EXPERIENCE_ANTI_CHEAT_AUDIT_V1',status:'PASS',privilegedFieldAccess:0,immutable:true});
}
