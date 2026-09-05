// ShotSight Virtual Shooter L3 — referee-side contextual/episodic memory experiment.
// The referee owns hidden target populations and post-trigger scoring. Learner memory sees only
// categorical early Human Vision context + selected visual relationship + binary hit/miss outcome.
import {createL1MultiFamilyBank,createL1ObservationHistory} from './multifamily-evaluation-v1.mjs';
import {buildEllisHumanVisualEvidence} from './human-visual-acquisition-v1.mjs';
import {runPullAwayHumanVisionEpisodeV1} from './pull-away-human-vision-evaluation-v1.mjs';
import {createPullAwayHitMissMemoryV1,selectPullAwayVisualPictureV1,updatePullAwayHitMissMemoryV1,rankPullAwayMemoryActionsV1,L3_PULL_AWAY_LEARNER_ACTION_GRID_V1} from './pull-away-hit-miss-memory-v1.mjs';
import {createContextualPullAwayMemoryV1,selectContextualPullAwayVisualPictureV1,chooseContextualPullAwayVisualPictureV1,updateContextualPullAwayMemoryV1,publicContextualPullAwayMemorySummaryV1,L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V1} from './pull-away-contextual-episodic-memory-v1.mjs';
import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';
const freezePlain=v=>{if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;};
const band=(v,a,b)=>v<a?'LOW':v<b?'MEDIUM':'HIGH';
const spanBand=v=>v<0.14?'SHORT':v<0.24?'MEDIUM':'LONG';
export const L3_CONTEXTUAL_MEMORY_POPULATIONS_V1=freezePlain({TRAIN:{seedBase:411000,partition:'NON_SEALED_CONTEXTUAL_TRAIN'},CALIBRATION:{seedBase:412000,partition:'NON_SEALED_CONTEXTUAL_CALIBRATION'},HELDOUT:{seedBase:413000,partition:'NON_SEALED_CONTEXTUAL_DEVELOPMENT_HELDOUT'}});
function bank(seedBase,n){return createL1MultiFamilyBank({nPerFamily:n,seedBase}).filter(r=>r.family==='CROSSER');}
export function buildEarlyPullAwayLearnerContextV1(record,observationSeed){
  const obs=createL1ObservationHistory(record,{evalTime_s:0.98,window_s:0.80,latency_s:0.08,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.95,seed:observationSeed});
  const h=[];let e=null;
  for(const o of obs){h.push(o);e=buildEllisHumanVisualEvidence(h,{contrast:0.95,clutter:0.05,attention:1});const span=e.uncertainty?.observationSpan_s??0;if(span>=0.24||(e.phase==='TRACKING'&&span>=0.16))break;}
  const c=freezePlain({schema:'PULL_AWAY_LEARNER_CONTEXT_V1',direction:e?.motion?.direction??'UNKNOWN',speedBand:e?.motion?.speedBand??'UNKNOWN',acquisitionBand:band(e?.acquisitionScore??0,0.60,0.80),observationBand:spanBand(e?.uncertainty?.observationSpan_s??0),source:'EARLY_SHOOTER_OBSERVATION_TO_ELLIS_VISUAL_EVIDENCE_ONLY'});
  assertNoPrivilegedShooterData(c,{path:'contextualExperiment.preActionContext'});return c;
}
function runEpisode(record,separation_rad,seed,index){return runPullAwayHumanVisionEpisodeV1({record,separationTarget_rad:separation_rad,observationSeed:seed,episodeIndex:index});}
function fixedSelection(separation_rad){return freezePlain({schema:'PULL_AWAY_ACTION_SELECTION_V1',separation_rad,reason:'PREDECLARED_BLOCKED_INITIAL_EXPLORATION',score:null});}
function contextualFixed(context,separation_rad){return freezePlain({schema:'PULL_AWAY_CONTEXTUAL_ACTION_SELECTION_V1',contextKey:`${context.direction}|${context.speedBand}|${context.acquisitionBand}|${context.observationBand}`,separation_rad,reason:'PREDECLARED_CONTEXT_BLOCKED_INITIAL_EXPLORATION',score:null});}
function evaluate({records,repetitions,seedBase,contextualMemory,contextFreeMemory}){
  const cf=rankPullAwayMemoryActionsV1(contextFreeMemory)[0];let contextualHits=0,contextFreeHits=0,uniformHits=0,contextualTriggers=0,contextFreeTriggers=0,uniformTriggers=0,attempts=0,unseenContextBackoffs=0;
  for(let r=0;r<repetitions;r++)for(let i=0;i<records.length;i++){
    const seed=seedBase+r*10007+i*1009,index=r*records.length+i,context=buildEarlyPullAwayLearnerContextV1(records[i],seed);
    const cs=chooseContextualPullAwayVisualPictureV1(contextualMemory,context);if(cs.reason==='UNSEEN_CONTEXT_GLOBAL_BACKOFF')unseenContextBackoffs++;
    const ce=runEpisode(records[i],cs.separation_rad,seed,index);contextualHits+=ce.hit?1:0;contextualTriggers+=ce.triggered?1:0;
    const fe=runEpisode(records[i],cf.separation_rad,seed+700000,index+100000);contextFreeHits+=fe.hit?1:0;contextFreeTriggers+=fe.triggered?1:0;
    const ua=L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V1[(r*records.length+i)%L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V1.length],ue=runEpisode(records[i],ua,seed+1400000,index+200000);uniformHits+=ue.hit?1:0;uniformTriggers+=ue.triggered?1:0;attempts++;
  }
  return freezePlain({attempts,contextual:{hits:contextualHits,triggers:contextualTriggers,hitRate:contextualHits/attempts},contextFree:{hits:contextFreeHits,triggers:contextFreeTriggers,hitRate:contextFreeHits/attempts,separation_rad:cf.separation_rad},noMemoryUniform:{hits:uniformHits,triggers:uniformTriggers,hitRate:uniformHits/attempts},unseenContextBackoffs});
}
export function runL3PullAwayContextualEpisodicMemoryV1({nCrossersPerPartition=4,adaptiveEpisodes=244,evaluationRepetitions=61}={}){
  if(!Number.isInteger(nCrossersPerPartition)||nCrossersPerPartition<2)throw new Error('nCrossersPerPartition must be integer >=2');if(!Number.isInteger(adaptiveEpisodes)||adaptiveEpisodes<0)throw new Error('adaptiveEpisodes invalid');if(!Number.isInteger(evaluationRepetitions)||evaluationRepetitions<1)throw new Error('evaluationRepetitions invalid');
  const train=bank(L3_CONTEXTUAL_MEMORY_POPULATIONS_V1.TRAIN.seedBase,nCrossersPerPartition),cal=bank(L3_CONTEXTUAL_MEMORY_POPULATIONS_V1.CALIBRATION.seedBase,nCrossersPerPartition),held=bank(L3_CONTEXTUAL_MEMORY_POPULATIONS_V1.HELDOUT.seedBase,nCrossersPerPartition);
  const contextual=createContextualPullAwayMemoryV1(),contextFree=createPullAwayHitMissMemoryV1();let episodeIndex=0,trainHitsContextual=0,trainHitsContextFree=0;
  // Same predeclared 61-point action grid on every training target. Context seed is independent of action,
  // so action identity cannot change the context bucket used to remember the result.
  for(const separation_rad of L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V1)for(let i=0;i<train.length;i++){
    const seed=L3_CONTEXTUAL_MEMORY_POPULATIONS_V1.TRAIN.seedBase*17+i*2017,context=buildEarlyPullAwayLearnerContextV1(train[i],seed),ep=runEpisode(train[i],separation_rad,seed,episodeIndex++);
    updateContextualPullAwayMemoryV1(contextual,context,contextualFixed(context,separation_rad),ep.feedback);trainHitsContextual+=ep.hit?1:0;
    updatePullAwayHitMissMemoryV1(contextFree,fixedSelection(separation_rad),ep.feedback);trainHitsContextFree+=ep.hit?1:0;
  }
  // Adaptive learners now diverge. Both remain binary-outcome-only; contextual learner additionally sees
  // the current categorical early visual context. Neither receives target identity or oracle geometry.
  for(let k=0;k<adaptiveEpisodes;k++){
    const i=k%train.length,seed=L3_CONTEXTUAL_MEMORY_POPULATIONS_V1.TRAIN.seedBase*23+k*2029,context=buildEarlyPullAwayLearnerContextV1(train[i],seed),cs=selectContextualPullAwayVisualPictureV1(contextual,context),ce=runEpisode(train[i],cs.separation_rad,seed,episodeIndex++);updateContextualPullAwayMemoryV1(contextual,context,cs,ce.feedback);trainHitsContextual+=ce.hit?1:0;
    const fs=selectPullAwayVisualPictureV1(contextFree),fe=runEpisode(train[i],fs.separation_rad,seed+500000,episodeIndex++);updatePullAwayHitMissMemoryV1(contextFree,fs,fe.feedback);trainHitsContextFree+=fe.hit?1:0;
  }
  assertNoPrivilegedShooterData({contextualMemory:publicContextualPullAwayMemorySummaryV1(contextual),contextFreeRanking:rankPullAwayMemoryActionsV1(contextFree)},{path:'contextualExperiment.learnerState'});
  const calibration=evaluate({records:cal,repetitions:evaluationRepetitions,seedBase:L3_CONTEXTUAL_MEMORY_POPULATIONS_V1.CALIBRATION.seedBase,contextualMemory:contextual,contextFreeMemory:contextFree});
  const heldout=evaluate({records:held,repetitions:evaluationRepetitions,seedBase:L3_CONTEXTUAL_MEMORY_POPULATIONS_V1.HELDOUT.seedBase,contextualMemory:contextual,contextFreeMemory:contextFree});
  const advantageVsContextFree=heldout.contextual.hitRate-heldout.contextFree.hitRate,advantageVsUniform=heldout.contextual.hitRate-heldout.noMemoryUniform.hitRate;
  const signal=heldout.contextual.hits>0&&advantageVsContextFree>0&&advantageVsUniform>0;
  return freezePlain({status:signal?'L3_CONTEXTUAL_EPISODIC_MEMORY_HELDOUT_ADVANTAGE_V1':'L3_CONTEXTUAL_EPISODIC_MEMORY_NO_HELDOUT_ADVANTAGE_V1',scoreBoundary:'ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY',populations:L3_CONTEXTUAL_MEMORY_POPULATIONS_V1,training:{blockedAttempts:61*train.length,adaptiveEpisodes,contextualHits:trainHitsContextual,contextFreeHits:trainHitsContextFree,contextualMemory:publicContextualPullAwayMemorySummaryV1(contextual)},calibration,heldout:{...heldout,advantageVsContextFree,advantageVsUniform,learningSignalObserved:signal},antiCheat:'CONTEXTUAL LEARNER MODULE IMPORTS ONLY BOUNDARY; CONTEXT IS DERIVED FROM EARLY DEGRADED SHOOTER OBSERVATIONS/HUMAN-VISION EVIDENCE; MEMORY RECEIVES CATEGORICAL CONTEXT + SELECTED VISUAL RELATIONSHIP + BINARY OUTCOME ONLY; NO TARGET SEED/ID/RANGE/FUTURE PATH/INTERCEPT/PELLET TOF/MISS VECTOR/REQUIRED LEAD/ORACLE ACTION',interpretation:signal?'Learner-safe contextual/episodic memory beat both context-free memory and uniform no-memory exploration on a distinct development-heldout population. This is a development signal only, not the existential proof.':'Contextual/episodic memory did not yet demonstrate positive development-heldout advantage over both context-free memory and uniform exploration. Preserve the result and diagnose representation/reward sparsity before scaling.',limitations:['55 mm centreline-disc engineering proxy is not real break probability','Early-context numerical thresholds are SHOTSIGHT_HYPOTHESIS','Human Vision and motor limits remain provisional','Development held-out is not the future sealed existential test','No 100k scaling is authorised by this gate alone']});
}
