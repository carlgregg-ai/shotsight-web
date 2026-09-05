// ShotSight Virtual Shooter L3 — referee-side maintained-lead no-learning baseline.
// Oracle state is used only to create hidden worlds and score after the learner triggers.

import {createL1MultiFamilyBank,createL1ObservationHistory,trainL1FamilyPrototypeModel} from './multifamily-evaluation-v1.mjs';
import {buildMultiFamilyBelief} from './multifamily-belief-v1.mjs';
import {createShooterStandPrior,buildShooterVisiblePresentationContext} from './presentation-context-v1.mjs';
import {buildPresentationLevelShotPlan} from './presentation-shot-plan-v1.mjs';
import {runMaintainedLeadNoLearning} from './maintained-lead-baseline-v1.mjs';
import {apparentAnglesToWorldUnit} from './naive-shooter-v1.mjs';
import {evaluateOracleShot,L0_DISC_PROXY_RADIUS_M,L0_SCORE_STATUS} from './oracle-evaluation-v1.mjs';
import {auditShooterBoundary,assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function mean(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}

export const L3_EXPLORATORY_STATIC_SEPARATIONS_RAD=Object.freeze([0,0.015,0.030,0.045,0.060,0.075]);

function buildLearnerFrames(history,model,standPrior){
  const frames=[];
  for(let i=0;i<history.length;i++){
    const prefix=history.slice(0,i+1),last=prefix.at(-1);if(!last.visible)continue;
    const belief=buildMultiFamilyBelief(prefix,{model,predictionHorizon_s:0.12,maxHistory_s:0.35});if(!belief.prediction)continue;
    const context=buildShooterVisiblePresentationContext(prefix,belief,standPrior);
    const plan=buildPresentationLevelShotPlan(belief,context,{method:'MAINTAINED_LEAD',priorMode:'SOURCE_PRIOR'});
    const now_s=last.observationTime_s+last.latency_s;
    const frame=freezePlain({schema:'MAINTAINED_LEAD_PERCEPTION_FRAME_V1',t_s:now_s,belief,plan});
    assertNoPrivilegedShooterData(frame,{path:'l3Evaluation.frame'});frames.push(frame);
  }
  return Object.freeze(frames);
}

export function runL3MaintainedLeadEpisode({record,model,separation_rad=0,seed=1,targetProxyRadius_m=L0_DISC_PROXY_RADIUS_M,acquisitionQuality=0.9,angleNoiseSd_rad=0.0015,rateNoiseSd_radps=0.02}={}){
  if(!record||record.family!=='CROSSER')throw new Error('held-out CROSSER record required');
  const history=createL1ObservationHistory(record,{evalTime_s:1.05,window_s:0.90,latency_s:0.08,angleNoiseSd_rad,rateNoiseSd_radps,acquisitionQuality,seed});
  const standPrior=createShooterStandPrior({expectedDirection:'UNKNOWN',demonstratedFamilyProb:{CROSSER:0.75,QUARTERER:0.18,LOOPER:0.04,OTHER:0.03},expectedPresentationDuration_s:0.95,demonstratedAngularSpan_rad:0.60,pickupProgressPrior:0.08,breakWindow:{start:0.70,end:0.92},source:'L3_FIXED_DEMONSTRATION_PRIOR_NOT_CURRENT_ORACLE'});
  const frames=buildLearnerFrames(history,model,standPrior);if(frames.length<2)throw new Error('insufficient learner frames');
  const run=runMaintainedLeadNoLearning({frames,separation_rad,seed:seed+700000});
  auditShooterBoundary({observations:history,beliefs:[standPrior,...frames,run]});
  let score;
  if(run.trigger&&run.triggerState){
    const bore_W=apparentAnglesToWorldUnit({az_rad:run.triggerState.az_rad,el_rad:run.triggerState.el_rad});
    score=evaluateOracleShot({scenario:record.scenario,shotTime_s:run.trigger.t_s,bore_W,targetProxyRadius_m});
  }else score=freezePlain({status:L0_SCORE_STATUS,shotTime_s:null,missDistance_m:null,proxyHit:false,targetProxyRadius_m,limitations:['no trigger: oracle not asked for a hypothetical corrective shot']});
  return freezePlain({schema:'L3_MAINTAINED_LEAD_BASELINE_EPISODE_V1',recordId:record.id,separation_rad,run,score,scoreStatus:L0_SCORE_STATUS,antiCheat:'PASS_ORACLE_USED_ONLY_AFTER_ACTION'});
}

function summarise(episodes){
  const fired=episodes.filter(e=>e.run.trigger),scores=fired.map(e=>e.score),misses=scores.map(s=>s.missDistance_m).filter(Number.isFinite);
  return freezePlain({n:episodes.length,triggers:fired.length,triggerRate:fired.length/episodes.length,proxyHits:scores.filter(s=>s.proxyHit).length,proxyHitRateAll:episodes.filter(e=>e.score.proxyHit).length/episodes.length,proxyHitRateTriggered:fired.length?scores.filter(s=>s.proxyHit).length/fired.length:0,meanMissDistance_m:mean(misses),meanTriggerTime_s:mean(fired.map(e=>e.run.trigger.t_s)),meanTrackingError_rad:mean(fired.map(e=>e.run.trigger.trackingError_rad))});
}

export function runL3MaintainedLeadNoLearningBenchmark({nCrossers=36,trainNPerFamily=60,trainSeedBase=41000,heldoutSeedBase=131000}={}){
  const model=trainL1FamilyPrototypeModel({nPerFamily:trainNPerFamily,seedBase:trainSeedBase});
  const bank=createL1MultiFamilyBank({nPerFamily:nCrossers,seedBase:heldoutSeedBase}).filter(r=>r.family==='CROSSER');
  const conditions={};
  for(const separation_rad of L3_EXPLORATORY_STATIC_SEPARATIONS_RAD){
    const episodes=bank.map((record,i)=>runL3MaintainedLeadEpisode({record,model,separation_rad,seed:heldoutSeedBase*7+i*101}));
    conditions[separation_rad.toFixed(3)]=summarise(episodes);
  }
  const poorEpisodes=bank.map((record,i)=>runL3MaintainedLeadEpisode({record,model,separation_rad:0.045,seed:heldoutSeedBase*11+i*101,acquisitionQuality:0.40,angleNoiseSd_rad:0.0035,rateNoiseSd_radps:0.06}));
  const result=freezePlain({status:'L3_MAINTAINED_LEAD_NO_LEARNING_BASELINE_V1',scoreStatus:L0_SCORE_STATUS,heldout:{nCrossers:bank.length,seedBase:heldoutSeedBase,sameHiddenBankAcrossSeparations:true},staticSeparationSweep:{evidenceClass:'PREDECLARED_EXPLORATORY_GRID_NOT_LEARNED_NOT_ORACLE_OPTIMISED',values_rad:L3_EXPLORATORY_STATIC_SEPARATIONS_RAD,conditions},poorObservationAt0045:summarise(poorEpisodes),antiCheat:'LEARNER MODULE HAS NO ORACLE OR PHYSICS IMPORT; REFEREE SCORES ONLY AFTER TRIGGER',interpretation:'Baseline maps static perceived angular pictures through L1 belief, L2 plan, finite gun plant and shooter-visible trigger. Sweep differences are diagnostics only; no separation is promoted as a correct lead.'});
  assertNoPrivilegedShooterData({heldout:result.heldout,staticSeparationSweep:result.staticSeparationSweep,poorObservationAt0045:result.poorObservationAt0045},{path:'l3PublicBenchmark'});return result;
}
