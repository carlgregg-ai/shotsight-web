// ShotSight Virtual Shooter L3 — referee harness for the first maintained-lead learner.
// Referee may see oracle scores after action. Learner receives only HIT_MISS_ONLY_FEEDBACK_V1.

import {createL1MultiFamilyBank,trainL1FamilyPrototypeModel} from './multifamily-evaluation-v1.mjs';
import {fitL3ShooterVisibleStandPrior,runL3MaintainedLeadEpisode} from './maintained-lead-evaluation-v1.mjs';
import {createMaintainedLeadHitMissMemory,selectMaintainedLeadVisualPicture,updateMaintainedLeadHitMissMemory,createHitMissOnlyFeedback,freezeLearnedMaintainedLeadPolicy,publicMemorySummary,L3_MAINTAINED_LEAD_LEARNING_ACTIONS_V1} from './hit-miss-memory-v1.mjs';
import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function mean(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}
function wilson95(k,n){if(!n)return {lo:null,hi:null};const z=1.959963984540054,p=k/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt((p*(1-p)+z*z/(4*n))/n)/d;return {lo:Math.max(0,c-h),hi:Math.min(1,c+h)};}
function episodeOutcome(e){return {hit:Boolean(e.score.proxyHit),triggered:Boolean(e.run.trigger)};}
function summariseOutcomes(rows){const n=rows.length,hits=rows.filter(r=>r.hit).length,triggers=rows.filter(r=>r.triggered).length;return freezePlain({n,hits,hitRate:n?hits/n:0,hitRateWilson95:wilson95(hits,n),triggers,triggerRate:n?triggers/n:0});}

function evaluateFrozenPolicy({bank,model,standPrior,separation_rad,seedBase}){
  return bank.map((record,i)=>episodeOutcome(runL3MaintainedLeadEpisode({record,model,standPrior,separation_rad,seed:seedBase+i*1009})));
}
function evaluateNoMemoryRoundRobin({bank,model,standPrior,seedBase}){
  return bank.map((record,i)=>episodeOutcome(runL3MaintainedLeadEpisode({record,model,standPrior,separation_rad:L3_MAINTAINED_LEAD_LEARNING_ACTIONS_V1[i%L3_MAINTAINED_LEAD_LEARNING_ACTIONS_V1.length],seed:seedBase+i*1009})));
}

export function runL3MaintainedLeadHitMissLearningExperiment({
  trainCrossers=132,
  heldoutCrossers=48,
  familyTrainNPerFamily=48,
  familyTrainSeedBase=41000,
  standCalibrationN=30,
  standCalibrationSeedBase=151000,
  learnerTrainSeedBase=211000,
  heldoutSeedBase=271000
}={}){
  const model=trainL1FamilyPrototypeModel({nPerFamily:familyTrainNPerFamily,seedBase:familyTrainSeedBase});
  const standPriorFit=fitL3ShooterVisibleStandPrior({nCalibration:standCalibrationN,seedBase:standCalibrationSeedBase});
  const standPrior=standPriorFit.prior;
  const trainingBank=createL1MultiFamilyBank({nPerFamily:trainCrossers,seedBase:learnerTrainSeedBase}).filter(r=>r.family==='CROSSER');
  const memory=createMaintainedLeadHitMissMemory();
  const trainingRows=[];
  for(let i=0;i<trainingBank.length;i++){
    const selection=selectMaintainedLeadVisualPicture(memory);
    const episode=runL3MaintainedLeadEpisode({record:trainingBank[i],model,standPrior,separation_rad:selection.separation_rad,seed:learnerTrainSeedBase*19+i*1009});
    const outcome=episodeOutcome(episode);
    // This is the ONLY referee information transferred into learner memory.
    const feedback=createHitMissOnlyFeedback({hit:outcome.hit});
    updateMaintainedLeadHitMissMemory(memory,selection,feedback);
    trainingRows.push({step:i+1,separation_rad:selection.separation_rad,hit:outcome.hit,triggered:outcome.triggered});
  }
  const frozenPolicy=freezeLearnedMaintainedLeadPolicy(memory);
  const memorySummary=publicMemorySummary(memory);
  const heldoutBank=createL1MultiFamilyBank({nPerFamily:heldoutCrossers,seedBase:heldoutSeedBase}).filter(r=>r.family==='CROSSER');
  const learnedRows=evaluateFrozenPolicy({bank:heldoutBank,model,standPrior,separation_rad:frozenPolicy.separation_rad,seedBase:heldoutSeedBase*23});
  const noMemoryRows=evaluateNoMemoryRoundRobin({bank:heldoutBank,model,standPrior,seedBase:heldoutSeedBase*23});
  const third=Math.max(1,Math.floor(trainingRows.length/3));
  const first=summariseOutcomes(trainingRows.slice(0,third)),last=summariseOutcomes(trainingRows.slice(-third));
  const learnedHeldout=summariseOutcomes(learnedRows),noMemoryHeldout=summariseOutcomes(noMemoryRows);
  const trainingHits=trainingRows.filter(r=>r.hit).length;
  const result=freezePlain({
    status:trainingHits>0?'L3_HIT_MISS_LEARNING_REWARD_DISCOVERED_V1':'L3_HIT_MISS_LEARNING_NO_REWARD_DISCOVERED_V1',
    scoreStatus:'ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY',
    partitions:{familyTrainingSeedBase:familyTrainSeedBase,standCalibrationSeedBase,learnerTraining:{seedBase:learnerTrainSeedBase,n:trainingBank.length},heldout:{seedBase:heldoutSeedBase,n:heldoutBank.length,untouchedDuringLearning:true}},
    actionSpace:{values_rad:L3_MAINTAINED_LEAD_LEARNING_ACTIONS_V1,evidenceClass:'PREDECLARED_BROAD_VISUAL_PICTURE_GRID_NOT_BALLISTIC_LEAD_LOOKUP'},
    feedbackBoundary:'LEARNER UPDATE RECEIVES ONLY HIT_MISS_ONLY_FEEDBACK_V1 BOOLEAN; REFEREE MISS DISTANCE/TRUTH IS NOT PASSED',
    training:{overall:summariseOutcomes(trainingRows),firstThird:first,lastThird:last,memory:memorySummary,frozenPolicy},
    heldout:{learnedFrozenPolicy:learnedHeldout,noMemoryRoundRobin:noMemoryHeldout,deltaHitRate:learnedHeldout.hitRate-noMemoryHeldout.hitRate},
    antiCheat:'PASS_LEARNER_MEMORY_CONTAINS_ONLY_ACTION_COUNTS_AND_BINARY_HIT_COUNTS_NO_TARGET_ID_SEED_MISS_DISTANCE_RANGE_INTERCEPT_OR_PELLET_TOF',
    interpretation:trainingHits>0?'Binary outcome experience found at least one rewarded visual relationship; held-out comparison determines whether that experience transfers.':'The broad learner-safe visual-picture action space produced no binary reward during this probe. Do not invent a gradient from referee miss distance; diagnose perception/trigger/motor/action-space support before scaling.'
  });
  assertNoPrivilegedShooterData({partitions:result.partitions,actionSpace:result.actionSpace,feedbackBoundary:result.feedbackBoundary,training:{memory:result.training.memory,frozenPolicy:result.training.frozenPolicy},heldout:result.heldout,antiCheat:result.antiCheat},{path:'l3HitMissLearningPublic'});
  return result;
}
