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
function median(xs){const a=[...xs].filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;}

export const L3_EXPLORATORY_STATIC_SEPARATIONS_RAD=Object.freeze([0,0.015,0.030,0.045,0.060,0.075]);
export const L3_PRESENTATION_OBSERVATION_ENVELOPE_V1=freezePlain({evalTime_s:1.45,window_s:1.25,latency_s:0.08,evidenceClass:'SHOTSIGHT_HYPOTHESIS_PRESENTATION_ENVELOPE'});

function observedAngularTravel(history){
  const seen=history.filter(o=>o.visible);let travel=0;
  for(let i=1;i<seen.length;i++)travel+=Math.hypot(seen[i].az_rad-seen[i-1].az_rad,seen[i].el_rad-seen[i-1].el_rad);
  return {travel_rad:travel,duration_s:seen.length>1?seen.at(-1).observationTime_s-seen[0].observationTime_s:0};
}

export function fitL3ShooterVisibleStandPrior({nCalibration=36,seedBase=151000,acquisitionQuality=0.9,angleNoiseSd_rad=0.0015,rateNoiseSd_radps=0.02}={}){
  const bank=createL1MultiFamilyBank({nPerFamily:nCalibration,seedBase}).filter(r=>r.family==='CROSSER');
  const samples=bank.map((record,i)=>{
    const history=createL1ObservationHistory(record,{...L3_PRESENTATION_OBSERVATION_ENVELOPE_V1,angleNoiseSd_rad,rateNoiseSd_radps,acquisitionQuality,seed:seedBase*13+i*101});
    assertNoPrivilegedShooterData(history,{path:'l3StandPriorCalibration.observations'});
    return observedAngularTravel(history);
  });
  const demonstratedAngularSpan_rad=median(samples.map(s=>s.travel_rad));
  const expectedPresentationDuration_s=median(samples.map(s=>s.duration_s));
  if(!(demonstratedAngularSpan_rad>0.05)||!(expectedPresentationDuration_s>0.2))throw new Error('invalid observation-only L3 stand-prior fit');
  const prior=createShooterStandPrior({expectedDirection:'UNKNOWN',demonstratedFamilyProb:{CROSSER:0.75,QUARTERER:0.18,LOOPER:0.04,OTHER:0.03},expectedPresentationDuration_s,demonstratedAngularSpan_rad,pickupProgressPrior:0.08,breakWindow:{start:0.70,end:0.92},source:'L3_CALIBRATION_OBSERVATIONS_ONLY_NO_ORACLE_OUTCOME'});
  const fit=freezePlain({schema:'L3_SHOOTER_VISIBLE_STAND_PRIOR_FIT_V1',calibrationN:bank.length,seedBase,demonstratedAngularSpan_rad,expectedPresentationDuration_s,prior,boundary:'FIT FROM DELAYED_NOISY ANGULAR OBSERVATION TRAVEL ONLY; NO RANGE, TRAJECTORY, LEAD, INTERCEPT, HIT OR MISS USED'});
  assertNoPrivilegedShooterData(fit,{path:'l3StandPriorCalibration'});return fit;
}

export function buildL3MaintainedLeadLearnerFrames(history,model,standPrior){
  const frames=[];
  for(let i=0;i<history.length;i++){
    const prefix=history.slice(0,i+1),last=prefix.at(-1);if(!last.visible)continue;
    // The latest ShooterObservation is stamped at the delayed visible/capture time. The
    // belief therefore advances exactly by that observation's known sensory latency to
    // represent the shooter's estimate of the target NOW. Gun-plant motor anticipation is
    // applied separately in the learner controller. Using a fixed 120 ms horizon here when
    // the observation was only 80 ms old double-counted 40 ms of future target travel.
    const belief=buildMultiFamilyBelief(prefix,{model,predictionHorizon_s:last.latency_s,maxHistory_s:0.35});if(!belief.prediction)continue;
    const context=buildShooterVisiblePresentationContext(prefix,belief,standPrior);
    const plan=buildPresentationLevelShotPlan(belief,context,{method:'MAINTAINED_LEAD',priorMode:'SOURCE_PRIOR'});
    const now_s=last.observationTime_s+last.latency_s;
    const frame=freezePlain({schema:'MAINTAINED_LEAD_PERCEPTION_FRAME_V1',t_s:now_s,belief,plan});
    assertNoPrivilegedShooterData(frame,{path:'l3Evaluation.frame'});frames.push(frame);
  }
  return Object.freeze(frames);
}

export function runL3MaintainedLeadEpisode({record,model,standPrior,separation_rad=0,seed=1,targetProxyRadius_m=L0_DISC_PROXY_RADIUS_M,acquisitionQuality=0.9,angleNoiseSd_rad=0.0015,rateNoiseSd_radps=0.02}={}){
  if(!record||record.family!=='CROSSER')throw new Error('held-out CROSSER record required');if(!standPrior)throw new Error('calibration-frozen stand prior required');
  const history=createL1ObservationHistory(record,{...L3_PRESENTATION_OBSERVATION_ENVELOPE_V1,angleNoiseSd_rad,rateNoiseSd_radps,acquisitionQuality,seed});
  const frames=buildL3MaintainedLeadLearnerFrames(history,model,standPrior);if(frames.length<2)throw new Error('insufficient learner frames');
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
  const decisions=episodes.flatMap(e=>e.run.decisionTrace??[]),commit=decisions.filter(d=>d.inCommitWindow);
  return freezePlain({
    n:episodes.length,triggers:fired.length,triggerRate:fired.length/episodes.length,proxyHits:scores.filter(s=>s.proxyHit).length,proxyHitRateAll:episodes.filter(e=>e.score.proxyHit).length/episodes.length,proxyHitRateTriggered:fired.length?scores.filter(s=>s.proxyHit).length/fired.length:0,meanMissDistance_m:mean(misses),meanTriggerTime_s:mean(fired.map(e=>e.run.trigger.t_s)),meanVisualPictureError_rad:mean(fired.map(e=>e.run.trigger.visualPictureError_rad)),
    triggerDiagnostics:{decisionN:decisions.length,commitWindowDecisionN:commit.length,episodesReachingCommitWindow:episodes.filter(e=>(e.run.decisionTrace??[]).some(d=>d.inCommitWindow)).length,episodesConfidenceReady:episodes.filter(e=>(e.run.decisionTrace??[]).some(d=>d.confidenceReady)).length,episodesVisualPictureReady:episodes.filter(e=>(e.run.decisionTrace??[]).some(d=>d.visualPictureReady)).length,episodesAllThreeReady:episodes.filter(e=>(e.run.decisionTrace??[]).some(d=>d.inCommitWindow&&d.confidenceReady&&d.visualPictureReady)).length,meanMaxProgress:mean(episodes.map(e=>Math.max(...(e.run.decisionTrace??[]).map(d=>d.currentProgress)))),meanMaxConfidence:mean(episodes.map(e=>Math.max(...(e.run.decisionTrace??[]).map(d=>d.confidence)))),meanMinVisualPictureErrorInCommitWindow_rad:mean(episodes.map(e=>{const xs=(e.run.decisionTrace??[]).filter(d=>d.inCommitWindow).map(d=>d.visualPictureError_rad);return xs.length?Math.min(...xs):null;}).filter(Number.isFinite))}
  });
}

export function runL3MaintainedLeadNoLearningBenchmark({nCrossers=30,trainNPerFamily=60,trainSeedBase=41000,calibrationN=36,calibrationSeedBase=151000,heldoutSeedBase=181000}={}){
  const model=trainL1FamilyPrototypeModel({nPerFamily:trainNPerFamily,seedBase:trainSeedBase});
  const standPriorFit=fitL3ShooterVisibleStandPrior({nCalibration:calibrationN,seedBase:calibrationSeedBase});
  const standPrior=standPriorFit.prior;
  const bank=createL1MultiFamilyBank({nPerFamily:nCrossers,seedBase:heldoutSeedBase}).filter(r=>r.family==='CROSSER');
  const conditions={};
  for(const separation_rad of L3_EXPLORATORY_STATIC_SEPARATIONS_RAD){
    const episodes=bank.map((record,i)=>runL3MaintainedLeadEpisode({record,model,standPrior,separation_rad,seed:heldoutSeedBase*7+i*101}));
    conditions[separation_rad.toFixed(3)]=summarise(episodes);
  }
  const poorEpisodes=bank.map((record,i)=>runL3MaintainedLeadEpisode({record,model,standPrior,separation_rad:0.045,seed:heldoutSeedBase*11+i*101,acquisitionQuality:0.40,angleNoiseSd_rad:0.0035,rateNoiseSd_radps:0.06}));
  const result=freezePlain({status:'L3_MAINTAINED_LEAD_NO_LEARNING_BASELINE_V1',scoreStatus:L0_SCORE_STATUS,standPriorFit,heldout:{nCrossers:bank.length,seedBase:heldoutSeedBase,sameHiddenBankAcrossSeparations:true,untouchedByStandPriorFit:true,retiredDiagnosticSeedBase:131000},staticSeparationSweep:{evidenceClass:'PREDECLARED_EXPLORATORY_GRID_NOT_LEARNED_NOT_ORACLE_OPTIMISED',values_rad:L3_EXPLORATORY_STATIC_SEPARATIONS_RAD,conditions},poorObservationAt0045:summarise(poorEpisodes),antiCheat:'LEARNER MODULE HAS NO ORACLE OR PHYSICS IMPORT; REFEREE SCORES ONLY AFTER TRIGGER',interpretation:'Baseline maps static perceived angular pictures through L1 belief, calibration-frozen L2 presentation context, finite gun plant and shooter-visible trigger. Sweep differences are diagnostics only; no separation is promoted as a correct lead.'});
  assertNoPrivilegedShooterData({standPriorFit:result.standPriorFit,heldout:result.heldout,staticSeparationSweep:result.staticSeparationSweep,poorObservationAt0045:result.poorObservationAt0045},{path:'l3PublicBenchmark'});return result;
}
