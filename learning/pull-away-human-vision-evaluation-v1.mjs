// ShotSight Virtual Shooter L3 — referee-side Human Vision pull-away reward-support evaluation.
// The learner sees only degraded ShooterObservation -> ELLIS_VISUAL_EVIDENCE_V1, its finite gun state,
// its own method phase, and its chosen exploratory visual separation. Oracle scoring occurs only after trigger.

import {createL1MultiFamilyBank,createL1ObservationHistory} from './multifamily-evaluation-v1.mjs';
import {buildEllisHumanVisualEvidence} from './human-visual-acquisition-v1.mjs';
import {createGunPlantState,stepFiniteGunPlant} from './gun-plant-v1.mjs';
import {createPullAwayPolicyStateV1} from './pull-away-human-vision-policy-v1.mjs';
import {apparentAnglesToWorldUnit} from './naive-shooter-v1.mjs';
import {evaluateOracleShot,L0_DISC_PROXY_RADIUS_M,L0_SCORE_STATUS} from './oracle-evaluation-v1.mjs';
import {createHitMissOnlyFeedback} from './hit-miss-memory-v1.mjs';
import {createShotQualityV1,createBinaryBreakQualityV1,createSatisfactionV1,createAcquisitionExperienceV1,createEllisExperienceRecordV1,auditExperienceRecordV1} from './ellis-experience-v1.mjs';
import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;

export const L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1=Object.freeze(
  Array.from({length:61},(_,i)=>Number((i*0.002).toFixed(3)))
);

export const L3_PULL_AWAY_HUMAN_VISION_POPULATIONS_V1=freezePlain({
  TRAIN_DEVELOPMENT:{seedBase:381000,partition:'NON_SEALED_TRAIN_DEVELOPMENT'},
  CALIBRATION_DEVELOPMENT:{seedBase:382000,partition:'NON_SEALED_CALIBRATION_DEVELOPMENT'},
  HELDOUT_DEVELOPMENT:{seedBase:383000,partition:'NON_SEALED_HELDOUT_DEVELOPMENT'}
});

function orderedTopology(phases){
  const wanted=['CONNECT','MATCH_SPEED','DEVELOP_SEPARATION','TRIGGER_READY'];
  let cursor=-1;
  for(const phase of wanted){const idx=phases.indexOf(phase,cursor+1);if(idx<0)return phase==='TRIGGER_READY'?0.75:phase==='DEVELOP_SEPARATION'?0.5:0.25;cursor=idx;}
  return 1;
}

function finalAcquisitionExperience(evidence,waited){
  const u=evidence.uncertainty??{};
  const streakVsResolved=evidence.phase==='TRACKING'?'RESOLVED':evidence.phase==='EXPECTED_RELEASE'?'NONE':'STREAK';
  return createAcquisitionExperienceV1({
    phase:evidence.phase,
    acquisitionScore:clamp(evidence.acquisitionScore??0,0,1),
    observationSpan_s:Math.max(0,u.observationSpan_s??0),
    contrast:clamp(u.contrast??0.95,0,1),
    clutter:clamp(u.clutter??0.05,0,1),
    occluded:u.occluded===true,
    waitedForMoreEvidence:waited,
    reacquisitionOccurred:false,
    streakVsResolved
  });
}

export function runPullAwayHumanVisionEpisodeV1({record,separationTarget_rad,observationSeed,episodeIndex=0}={}){
  if(!record||record.family!=='CROSSER')throw new Error('CROSSER record required');
  if(!Number.isFinite(separationTarget_rad)||separationTarget_rad<0||separationTarget_rad>0.12)throw new Error('learner-safe visual separation must be within [0,0.12] rad');
  if(!Number.isFinite(observationSeed))throw new Error('finite observationSeed required');
  const observations=createL1ObservationHistory(record,{evalTime_s:0.98,window_s:0.80,latency_s:0.08,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.95,seed:observationSeed});
  let gun=createGunPlantState({t_s:observations[0].observationTime_s});
  let previousPhase=null,triggerState=null,triggerPolicy=null,lastEvidence=null,maxConfidence=0,waited=false;
  const history=[],phases=[],policyTrace=[];

  outer: for(let i=0;i<observations.length;i++){
    history.push(observations[i]);
    const evidence=buildEllisHumanVisualEvidence(history,{contrast:0.95,clutter:0.05,attention:1});
    lastEvidence=evidence;maxConfidence=Math.max(maxConfidence,evidence.confidence??0);
    if(evidence.phase!=='TRACKING')waited=true;
    for(let sub=0;sub<2;sub++){
      const policy=createPullAwayPolicyStateV1({visualEvidence:evidence,gunState:gun,separationTarget_rad,previousPhase});
      phases.push(policy.phase);policyTrace.push(policy);
      if(policy.trigger){triggerState=gun;triggerPolicy=policy;break outer;}
      gun=stepFiniteGunPlant(gun,policy.command,{seed:observationSeed+i*97+sub*7919});
      previousPhase=policy.phase;
    }
  }

  const score=triggerState
    ?evaluateOracleShot({scenario:record.scenario,shotTime_s:triggerState.t_s,bore_W:apparentAnglesToWorldUnit({az_rad:triggerState.az_rad,el_rad:triggerState.el_rad}),targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M})
    :freezePlain({status:L0_SCORE_STATUS,shotTime_s:null,missDistance_m:null,proxyHit:false,targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M});
  const feedback=createHitMissOnlyFeedback({hit:score.proxyHit===true});
  const topology=orderedTopology(phases);
  const developed=phases.includes('DEVELOP_SEPARATION')||phases.includes('TRIGGER_READY');
  const matched=phases.includes('MATCH_SPEED')||developed;
  const connected=phases.includes('CONNECT')||matched;
  const shotQuality=createShotQualityV1({
    lineRead:clamp(maxConfidence,0,1),
    connectionStability:connected?1:0,
    speedRelationshipStability:matched?1:0,
    separationControl:triggerState?1:developed?0.6:0,
    jerkControl:0.5,
    triggerCommitment:triggerState?1:0,
    followThrough:triggerState?0.5:0,
    methodTopology:topology
  });
  const breakQuality=createBinaryBreakQualityV1({hit:feedback.hit,observationConfidence:lastEvidence?.confidence??0});
  const satisfaction=createSatisfactionV1({shotQuality,breakQuality,enabled:false});
  const acquisition=finalAcquisitionExperience(lastEvidence,waited);
  const experience=createEllisExperienceRecordV1({
    episodeIndex,
    before:{method:'PULL_AWAY',selectedVisualSeparation_rad:separationTarget_rad,feedbackCondition:'HIT_MISS_ONLY',satisfactionEnabled:false},
    during:{triggerFired:Boolean(triggerState),finalMethodPhase:triggerPolicy?.phase??phases.at(-1)??'WAIT_FOR_ACQUISITION',maxVisualConfidence:maxConfidence,methodTopologyScore:topology,processStatus:'PROVISIONAL_PROCESS_SUMMARY_NOT_USED_AS_REWARD'},
    outcome:feedback,shotQuality,breakQuality,satisfaction,acquisition
  });
  auditExperienceRecordV1(experience);
  assertNoPrivilegedShooterData({observations,policyTrace,experience},{path:'pullAwayHumanVision.learnerCorpus'});
  return freezePlain({triggered:Boolean(triggerState),hit:feedback.hit,feedback,selectedVisualSeparation_rad:separationTarget_rad,finalPhase:triggerPolicy?.phase??phases.at(-1)??null,maxVisualConfidence:maxConfidence,methodTopologyScore:topology,experience});
}

function runPartition({seedBase,partition,nCrossers}){
  const bank=createL1MultiFamilyBank({nPerFamily:nCrossers,seedBase}).filter(r=>r.family==='CROSSER');
  const actions=[];let totalTriggers=0,totalHits=0,episodeIndex=0;
  for(const separationTarget_rad of L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1){
    const episodes=[];
    for(let i=0;i<bank.length;i++)episodes.push(runPullAwayHumanVisionEpisodeV1({record:bank[i],separationTarget_rad,observationSeed:seedBase*7+i*1009+Math.round(separationTarget_rad*100000),episodeIndex:episodeIndex++}));
    const triggers=episodes.filter(e=>e.triggered).length,hits=episodes.filter(e=>e.hit).length;
    totalTriggers+=triggers;totalHits+=hits;
    actions.push(freezePlain({separationTarget_rad,attempts:episodes.length,triggers,hits,hitRateAll:hits/episodes.length,triggerRate:triggers/episodes.length,meanTopologyScore:mean(episodes.map(e=>e.methodTopologyScore)),meanVisualConfidence:mean(episodes.map(e=>e.maxVisualConfidence))}));
  }
  return freezePlain({partition,seedBase,nCrossers:bank.length,sameHiddenBankAcrossActions:true,actionCount:L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1.length,attempts:bank.length*L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1.length,triggers:totalTriggers,hits:totalHits,rewardSupportObserved:totalHits>0,actions});
}

export function runL3PullAwayHumanVisionRewardSupportV1({nCrossersPerPartition=6}={}){
  if(!Number.isInteger(nCrossersPerPartition)||nCrossersPerPartition<1)throw new Error('nCrossersPerPartition must be positive integer');
  const partitions={};
  for(const [name,cfg] of Object.entries(L3_PULL_AWAY_HUMAN_VISION_POPULATIONS_V1))partitions[name]=runPartition({...cfg,nCrossers:nCrossersPerPartition});
  const overall={attempts:Object.values(partitions).reduce((a,p)=>a+p.attempts,0),triggers:Object.values(partitions).reduce((a,p)=>a+p.triggers,0),hits:Object.values(partitions).reduce((a,p)=>a+p.hits,0)};
  const out=freezePlain({
    status:overall.hits>0?'L3_PULL_AWAY_HUMAN_VISION_BINARY_REWARD_SUPPORT_DISCOVERED_V1':'L3_PULL_AWAY_HUMAN_VISION_NO_BINARY_REWARD_SUPPORT_V1',
    scoreStatus:L0_SCORE_STATUS,
    actionSpace:{kind:'PREDECLARED_DENSE_INTERPRETABLE_VISUAL_SEPARATION_SWEEP',values_rad:L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1,evidenceClass:'SHOTSIGHT_HYPOTHESIS_NOT_ORACLE_LEAD'},
    populations:partitions,overall,
    feedbackToLearner:'HIT_MISS_ONLY_FEEDBACK_V1_AFTER_OUTCOME',
    memory:'OFF_FOR_REWARD_SUPPORT_GATE',
    satisfaction:'OFF_FOR_REWARD_SUPPORT_GATE',
    oracleUsage:'POST_TRIGGER_ENGINEERING_PROXY_SCORE_ONLY',
    antiCheat:'PASS_BY_CONSTRUCTION_POLICY_IMPORTS_NO_ORACLE; EXPERIENCE_ACCEPTS_BINARY_OUTCOME_ONLY; PRIVILEGED_FIELDS_AUDITED_RECURSIVELY',
    limitations:['55 mm centreline-disc engineering proxy is not real break probability','Human Vision and motor numerics remain provisional','This establishes reward support only, not learning or human validity']
  });
  return out;
}