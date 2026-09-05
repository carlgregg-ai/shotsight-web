// ShotSight Virtual Shooter L3 — first genuine Human Vision pull-away hit/miss learner experiment.
// EXPERIMENT ORCHESTRATOR / REFEREE-SIDE: this module owns hidden presentation populations and calls
// the post-trigger referee episode runner. The learner memory itself is isolated in
// pull-away-hit-miss-memory-v1.mjs and receives only selected visual relationship + binary outcome.

import {createL1MultiFamilyBank} from './multifamily-evaluation-v1.mjs';
import {runPullAwayHumanVisionEpisodeV1} from './pull-away-human-vision-evaluation-v1.mjs';
import {createPullAwayHitMissMemoryV1,selectPullAwayVisualPictureV1,updatePullAwayHitMissMemoryV1,rankPullAwayMemoryActionsV1,publicPullAwayMemorySummaryV1,L3_PULL_AWAY_LEARNER_ACTION_GRID_V1} from './pull-away-hit-miss-memory-v1.mjs';
import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;

export const L3_PULL_AWAY_HUMAN_VISION_LEARNING_POPULATIONS_V1=freezePlain({
  TRAIN:{seedBase:391000,partition:'NON_SEALED_TRAIN_LEARNING'},
  CALIBRATION:{seedBase:392000,partition:'NON_SEALED_CALIBRATION_LEARNING'},
  HELDOUT:{seedBase:393000,partition:'NON_SEALED_HELDOUT_DEVELOPMENT_LEARNING'}
});

function crosserBank(seedBase,nCrossers){
  return createL1MultiFamilyBank({nPerFamily:nCrossers,seedBase}).filter(r=>r.family==='CROSSER');
}

function runActionOnBank({bank,separation_rad,seedBase,episodeIndexStart=0}){
  const episodes=[];
  for(let i=0;i<bank.length;i++)episodes.push(runPullAwayHumanVisionEpisodeV1({record:bank[i],separationTarget_rad:separation_rad,observationSeed:seedBase*13+i*2003+Math.round(separation_rad*1e6),episodeIndex:episodeIndexStart+i}));
  const hits=episodes.filter(e=>e.hit).length,triggers=episodes.filter(e=>e.triggered).length;
  return freezePlain({separation_rad,attempts:episodes.length,triggers,hits,hitRate:hits/episodes.length,meanTopologyScore:mean(episodes.map(e=>e.methodTopologyScore)),meanVisualConfidence:mean(episodes.map(e=>e.maxVisualConfidence))});
}

export function runL3PullAwayHumanVisionHitMissLearningV1({nCrossersPerPartition=6,adaptiveEpisodes=244,explorationStrength=Math.SQRT2}={}){
  if(!Number.isInteger(nCrossersPerPartition)||nCrossersPerPartition<2)throw new Error('nCrossersPerPartition must be integer >=2');
  if(!Number.isInteger(adaptiveEpisodes)||adaptiveEpisodes<0)throw new Error('adaptiveEpisodes must be non-negative integer');
  const trainBank=crosserBank(L3_PULL_AWAY_HUMAN_VISION_LEARNING_POPULATIONS_V1.TRAIN.seedBase,nCrossersPerPartition);
  const calibrationBank=crosserBank(L3_PULL_AWAY_HUMAN_VISION_LEARNING_POPULATIONS_V1.CALIBRATION.seedBase,nCrossersPerPartition);
  const heldoutBank=crosserBank(L3_PULL_AWAY_HUMAN_VISION_LEARNING_POPULATIONS_V1.HELDOUT.seedBase,nCrossersPerPartition);
  const memory=createPullAwayHitMissMemoryV1({explorationStrength});
  let episodeIndex=0,trainHits=0,trainTriggers=0;

  // Predeclared blocked exploration: every visual relationship is experienced on every training crosser once.
  // This avoids declaring a winner from a single lucky sparse hit and does not inspect oracle miss geometry.
  for(const separation_rad of L3_PULL_AWAY_LEARNER_ACTION_GRID_V1){
    for(let i=0;i<trainBank.length;i++){
      const selection=freezePlain({schema:'PULL_AWAY_ACTION_SELECTION_V1',separation_rad,reason:'PREDECLARED_BLOCKED_INITIAL_EXPLORATION',score:null});
      const ep=runPullAwayHumanVisionEpisodeV1({record:trainBank[i],separationTarget_rad:separation_rad,observationSeed:L3_PULL_AWAY_HUMAN_VISION_LEARNING_POPULATIONS_V1.TRAIN.seedBase*17+i*2017+Math.round(separation_rad*1e6),episodeIndex:episodeIndex++});
      updatePullAwayHitMissMemoryV1(memory,selection,ep.feedback);trainHits+=ep.hit?1:0;trainTriggers+=ep.triggered?1:0;
    }
  }

  // Adaptive phase: UCB1 chooses only from remembered action/count/hit history.
  // Target records are cycled independently of the selected action; target identity is never stored in memory.
  for(let k=0;k<adaptiveEpisodes;k++){
    const selection=selectPullAwayVisualPictureV1(memory);
    const i=k%trainBank.length;
    const ep=runPullAwayHumanVisionEpisodeV1({record:trainBank[i],separationTarget_rad:selection.separation_rad,observationSeed:L3_PULL_AWAY_HUMAN_VISION_LEARNING_POPULATIONS_V1.TRAIN.seedBase*19+k*2029+Math.round(selection.separation_rad*1e6),episodeIndex:episodeIndex++});
    updatePullAwayHitMissMemoryV1(memory,selection,ep.feedback);trainHits+=ep.hit?1:0;trainTriggers+=ep.triggered?1:0;
  }

  const ranked=rankPullAwayMemoryActionsV1(memory);
  const candidateActions=ranked.slice(0,Math.min(5,ranked.length));
  const calibrationCandidates=candidateActions.map((candidate,j)=>runActionOnBank({bank:calibrationBank,separation_rad:candidate.separation_rad,seedBase:L3_PULL_AWAY_HUMAN_VISION_LEARNING_POPULATIONS_V1.CALIBRATION.seedBase+j*101,episodeIndexStart:episodeIndex+j*calibrationBank.length}));
  const selectedCalibration=[...calibrationCandidates].sort((a,b)=>b.hitRate-a.hitRate||b.triggers-a.triggers||a.separation_rad-b.separation_rad)[0];
  const selectedPolicy=freezePlain({schema:'FROZEN_PULL_AWAY_HIT_MISS_POLICY_V1',separation_rad:selectedCalibration.separation_rad,selectionRule:'TOP_5_TRAINING_MEMORY_ACTIONS_THEN_HIGHEST_BINARY_CALIBRATION_HIT_RATE',feedbackBoundary:'TRAIN_AND_CALIBRATION_USE_HIT_MISS_ONLY; HELDOUT_UNUSED_UNTIL_FINAL_EVALUATION'});
  assertNoPrivilegedShooterData({memory:publicPullAwayMemorySummaryV1(memory),selectedPolicy},{path:'pullAwayLearning.learnerState'});

  const learnedHeldout=runActionOnBank({bank:heldoutBank,separation_rad:selectedPolicy.separation_rad,seedBase:L3_PULL_AWAY_HUMAN_VISION_LEARNING_POPULATIONS_V1.HELDOUT.seedBase,episodeIndexStart:episodeIndex+100000});
  const noMemoryHeldoutActions=L3_PULL_AWAY_LEARNER_ACTION_GRID_V1.map((separation_rad,j)=>runActionOnBank({bank:heldoutBank,separation_rad,seedBase:L3_PULL_AWAY_HUMAN_VISION_LEARNING_POPULATIONS_V1.HELDOUT.seedBase+j*103,episodeIndexStart:episodeIndex+200000+j*heldoutBank.length}));
  const noMemoryHits=noMemoryHeldoutActions.reduce((a,x)=>a+x.hits,0),noMemoryAttempts=noMemoryHeldoutActions.reduce((a,x)=>a+x.attempts,0);
  const noMemoryUniformRate=noMemoryAttempts?noMemoryHits/noMemoryAttempts:0;
  const memoryAdvantage=learnedHeldout.hitRate-noMemoryUniformRate;
  const heldoutLearningObserved=learnedHeldout.hits>0&&memoryAdvantage>0;

  const result=freezePlain({
    status:heldoutLearningObserved?'L3_PULL_AWAY_HUMAN_VISION_HELDOUT_LEARNING_SIGNAL_V1':'L3_PULL_AWAY_HUMAN_VISION_NO_HELDOUT_LEARNING_SIGNAL_V1',
    scoreBoundary:'ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY',
    populations:L3_PULL_AWAY_HUMAN_VISION_LEARNING_POPULATIONS_V1,
    training:{attempts:memory.totalOutcomes,triggers:trainTriggers,hits:trainHits,adaptiveEpisodes,memory:publicPullAwayMemorySummaryV1(memory)},
    calibration:{candidateCount:calibrationCandidates.length,candidates:calibrationCandidates,selectedPolicy},
    heldout:{learned:learnedHeldout,noMemoryUniform:{attempts:noMemoryAttempts,hits:noMemoryHits,hitRate:noMemoryUniformRate,actionCount:noMemoryHeldoutActions.length},memoryAdvantageHitRate:memoryAdvantage,learningSignalObserved:heldoutLearningObserved},
    antiCheat:'LEARNER_MEMORY_IMPORTS_NO_ORACLE_OR_PHYSICS; MEMORY STORES ONLY VISUAL-RELATIONSHIP ACTION COUNTS AND BINARY HIT COUNTS; HELDOUT NOT USED FOR POLICY SELECTION',
    interpretation:heldoutLearningObserved?'Binary-outcome general memory selected a visual relationship that beat uniform no-memory exploration on a distinct non-sealed held-out development population. This is a development learning signal, not the existential proof.':'No positive held-out memory advantage was demonstrated in this development run. Preserve as a negative result and diagnose sparse reward/generalisation before scaling.',
    limitations:['55 mm centreline-disc engineering proxy is not real break probability','Human Vision and motor numerics remain provisional','Development held-out is not the future sealed existential test','One-dimensional visual-separation memory is intentionally simple and may be insufficient']
  });
  return result;
}