// ShotSight Virtual Shooter L3 — referee-side evaluation for similarity-weighted contextual/episodic memory V2.
// Hidden populations and scoring stay referee-side. Learner V2 sees only pre-action Human Vision context,
// selected visual relationship, and binary hit/miss outcome.
import {createL1MultiFamilyBank,createL1ObservationHistory} from './multifamily-evaluation-v1.mjs';
import {buildEllisHumanVisualEvidence} from './human-visual-acquisition-v1.mjs';
import {runPullAwayHumanVisionEpisodeV1} from './pull-away-human-vision-evaluation-v1.mjs';
import {createPullAwayHitMissMemoryV1,selectPullAwayVisualPictureV1,updatePullAwayHitMissMemoryV1,rankPullAwayMemoryActionsV1} from './pull-away-hit-miss-memory-v1.mjs';
import {createContextualPullAwayMemoryV2,selectContextualPullAwayVisualPictureV2,chooseContextualPullAwayVisualPictureV2,updateContextualPullAwayMemoryV2,publicContextualPullAwayMemorySummaryV2,L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V2} from './pull-away-contextual-episodic-memory-v2.mjs';
import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';
const freezePlain=v=>{if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;};
export const L3_CONTEXTUAL_MEMORY_POPULATIONS_V2=freezePlain({TRAIN:{seedBase:421000,partition:'NON_SEALED_CONTEXTUAL_V2_TRAIN'},CALIBRATION:{seedBase:422000,partition:'NON_SEALED_CONTEXTUAL_V2_CALIBRATION'},HELDOUT:{seedBase:423000,partition:'NON_SEALED_CONTEXTUAL_V2_DEVELOPMENT_HELDOUT'}});
const bank=(seedBase,n)=>createL1MultiFamilyBank({nPerFamily:n,seedBase}).filter(r=>r.family==='CROSSER');
export function buildEarlyPullAwayLearnerContextV2(record,observationSeed){
  const obs=createL1ObservationHistory(record,{evalTime_s:0.98,window_s:0.80,latency_s:0.08,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.95,seed:observationSeed});
  const h=[];let e=null;for(const o of obs){h.push(o);e=buildEllisHumanVisualEvidence(h,{contrast:0.95,clutter:0.05,attention:1});const span=e.uncertainty?.observationSpan_s??0;if(span>=0.24||(e.phase==='TRACKING'&&span>=0.16))break;}
  const c=freezePlain({schema:'PULL_AWAY_LEARNER_CONTEXT_V2',direction:e?.motion?.direction??'UNKNOWN',speedBand:e?.motion?.speedBand??'UNKNOWN',acquisitionPhase:e?.phase??'EXPECTED_RELEASE',visualConfidence:e?.confidence??0,acquisitionScore:e?.acquisitionScore??0,observationSpan_s:e?.uncertainty?.observationSpan_s??0,source:'EARLY_SHOOTER_OBSERVATION_TO_ELLIS_VISUAL_EVIDENCE_ONLY'});
  assertNoPrivilegedShooterData(c,{path:'contextualExperimentV2.preActionContext'});return c;
}
const runEpisode=(record,separation_rad,seed,index)=>runPullAwayHumanVisionEpisodeV1({record,separationTarget_rad:separation_rad,observationSeed:seed,episodeIndex:index});
const fixedV2=separation_rad=>freezePlain({schema:'PULL_AWAY_CONTEXTUAL_ACTION_SELECTION_V2',separation_rad,reason:'PREDECLARED_GLOBAL_BLOCKED_INITIAL_EXPLORATION',score:null});
const fixedV1=separation_rad=>freezePlain({schema:'PULL_AWAY_ACTION_SELECTION_V1',separation_rad,reason:'PREDECLARED_BLOCKED_INITIAL_EXPLORATION',score:null});
function evaluate({records,repetitions,seedBase,contextualMemory,contextFreeMemory}){
  const cf=rankPullAwayMemoryActionsV1(contextFreeMemory)[0];let contextualHits=0,contextFreeHits=0,uniformHits=0,contextualTriggers=0,contextFreeTriggers=0,uniformTriggers=0,attempts=0,effectiveWeightSum=0;
  for(let r=0;r<repetitions;r++)for(let i=0;i<records.length;i++){
    const seed=seedBase+r*10007+i*1009,index=r*records.length+i,context=buildEarlyPullAwayLearnerContextV2(records[i],seed),cs=chooseContextualPullAwayVisualPictureV2(contextualMemory,context);effectiveWeightSum+=cs.effectiveWeight;
    const ce=runEpisode(records[i],cs.separation_rad,seed,index);contextualHits+=ce.hit?1:0;contextualTriggers+=ce.triggered?1:0;
    const fe=runEpisode(records[i],cf.separation_rad,seed+700000,index+100000);contextFreeHits+=fe.hit?1:0;contextFreeTriggers+=fe.triggered?1:0;
    const ua=L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V2[(r*records.length+i)%L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V2.length],ue=runEpisode(records[i],ua,seed+1400000,index+200000);uniformHits+=ue.hit?1:0;uniformTriggers+=ue.triggered?1:0;attempts++;
  }
  return freezePlain({attempts,contextualV2:{hits:contextualHits,triggers:contextualTriggers,hitRate:contextualHits/attempts,meanEffectiveRecallWeight:effectiveWeightSum/attempts},contextFree:{hits:contextFreeHits,triggers:contextFreeTriggers,hitRate:contextFreeHits/attempts,separation_rad:cf.separation_rad},noMemoryUniform:{hits:uniformHits,triggers:uniformTriggers,hitRate:uniformHits/attempts}});
}
export function runL3PullAwayContextualEpisodicMemoryV2({nCrossersPerPartition=4,adaptiveEpisodes=244,evaluationRepetitions=61}={}){
  if(!Number.isInteger(nCrossersPerPartition)||nCrossersPerPartition<2)throw new Error('nCrossersPerPartition must be integer >=2');if(!Number.isInteger(adaptiveEpisodes)||adaptiveEpisodes<0)throw new Error('adaptiveEpisodes invalid');if(!Number.isInteger(evaluationRepetitions)||evaluationRepetitions<1)throw new Error('evaluationRepetitions invalid');
  const train=bank(L3_CONTEXTUAL_MEMORY_POPULATIONS_V2.TRAIN.seedBase,nCrossersPerPartition),cal=bank(L3_CONTEXTUAL_MEMORY_POPULATIONS_V2.CALIBRATION.seedBase,nCrossersPerPartition),held=bank(L3_CONTEXTUAL_MEMORY_POPULATIONS_V2.HELDOUT.seedBase,nCrossersPerPartition),contextual=createContextualPullAwayMemoryV2(),contextFree=createPullAwayHitMissMemoryV1();let episodeIndex=0,trainHitsV2=0,trainHitsContextFree=0;
  for(const separation_rad of L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V2)for(let i=0;i<train.length;i++){
    const seed=L3_CONTEXTUAL_MEMORY_POPULATIONS_V2.TRAIN.seedBase*17+i*2017,context=buildEarlyPullAwayLearnerContextV2(train[i],seed),ep=runEpisode(train[i],separation_rad,seed,episodeIndex++);updateContextualPullAwayMemoryV2(contextual,context,fixedV2(separation_rad),ep.feedback);updatePullAwayHitMissMemoryV1(contextFree,fixedV1(separation_rad),ep.feedback);trainHitsV2+=ep.hit?1:0;trainHitsContextFree+=ep.hit?1:0;
  }
  for(let k=0;k<adaptiveEpisodes;k++){
    const i=k%train.length,seed=L3_CONTEXTUAL_MEMORY_POPULATIONS_V2.TRAIN.seedBase*23+k*2029,context=buildEarlyPullAwayLearnerContextV2(train[i],seed),cs=selectContextualPullAwayVisualPictureV2(contextual,context),ce=runEpisode(train[i],cs.separation_rad,seed,episodeIndex++);updateContextualPullAwayMemoryV2(contextual,context,cs,ce.feedback);trainHitsV2+=ce.hit?1:0;
    const fs=selectPullAwayVisualPictureV1(contextFree),fe=runEpisode(train[i],fs.separation_rad,seed+500000,episodeIndex++);updatePullAwayHitMissMemoryV1(contextFree,fs,fe.feedback);trainHitsContextFree+=fe.hit?1:0;
  }
  assertNoPrivilegedShooterData({contextualMemory:publicContextualPullAwayMemorySummaryV2(contextual),contextFreeRanking:rankPullAwayMemoryActionsV1(contextFree)},{path:'contextualExperimentV2.learnerState'});
  const calibration=evaluate({records:cal,repetitions:evaluationRepetitions,seedBase:L3_CONTEXTUAL_MEMORY_POPULATIONS_V2.CALIBRATION.seedBase,contextualMemory:contextual,contextFreeMemory:contextFree}),heldout=evaluate({records:held,repetitions:evaluationRepetitions,seedBase:L3_CONTEXTUAL_MEMORY_POPULATIONS_V2.HELDOUT.seedBase,contextualMemory:contextual,contextFreeMemory:contextFree});
  const advantageVsContextFree=heldout.contextualV2.hitRate-heldout.contextFree.hitRate,advantageVsUniform=heldout.contextualV2.hitRate-heldout.noMemoryUniform.hitRate,signal=heldout.contextualV2.hits>0&&advantageVsContextFree>0&&advantageVsUniform>0;
  return freezePlain({status:signal?'L3_CONTEXTUAL_EPISODIC_MEMORY_V2_HELDOUT_ADVANTAGE':'L3_CONTEXTUAL_EPISODIC_MEMORY_V2_NO_HELDOUT_ADVANTAGE',scoreBoundary:'ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY',populations:L3_CONTEXTUAL_MEMORY_POPULATIONS_V2,training:{blockedAttempts:61*train.length,adaptiveEpisodes,contextualV2Hits:trainHitsV2,contextFreeHits:trainHitsContextFree,memory:publicContextualPullAwayMemorySummaryV2(contextual)},calibration,heldout:{...heldout,advantageVsContextFree,advantageVsUniform,learningSignalObserved:signal},antiCheat:'V2 LEARNER IMPORTS ONLY BOUNDARY; SIMILARITY FEATURES ARE EARLY DEGRADED HUMAN-VISION DIRECTION/SPEED/PHASE/CONFIDENCE/ACQUISITION/OBSERVATION-SPAN; MEMORY RECEIVES CONTEXT + SELECTED VISUAL RELATIONSHIP + BINARY OUTCOME ONLY; NO TARGET SEED/ID/RANGE/FUTURE PATH/INTERCEPT/PELLET TOF/MISS VECTOR/REQUIRED LEAD/ORACLE ACTION',limitations:['55 mm centreline-disc engineering proxy is not real break probability','V2 similarity scales are SHOTSIGHT_HYPOTHESIS','Human Vision and motor limits remain provisional','Development held-out is not the future sealed existential test','No 100k scaling is authorised by this gate alone']});
}
