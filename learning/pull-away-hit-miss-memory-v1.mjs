// ShotSight Virtual Shooter L3 — learner-side pull-away binary-outcome general memory.
// Deliberately interpretable before RL/neural policies. It consumes only the learner's own
// selected visual relationship and post-outcome HIT_MISS_ONLY_FEEDBACK_V1.
// It imports no target physics, ballistics, oracle/referee, scenario generator or target identity.

import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';
import {L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1} from './pull-away-human-vision-evaluation-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
const finite=(v,n)=>{if(!Number.isFinite(v))throw new Error(`${n} must be finite`);return v;};

export function createPullAwayHitMissMemoryV1({actions=L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1,explorationStrength=Math.SQRT2}={}){
  if(!Array.isArray(actions)||actions.length<2)throw new Error('at least two pull-away actions required');
  const sorted=[...actions].map((x,i)=>{finite(x,`actions[${i}]`);if(x<0||x>0.12)throw new Error('pull-away action outside learner-safe visual-picture bounds');return x;}).sort((a,b)=>a-b);
  finite(explorationStrength,'explorationStrength');if(explorationStrength<0)throw new Error('explorationStrength must be non-negative');
  const out={schema:'PULL_AWAY_HIT_MISS_MEMORY_V1',evidenceClass:'INTERPRETABLE_UCB1_GENERAL_MEMORY_HIT_MISS_ONLY',explorationStrength,totalOutcomes:0,arms:sorted.map(separation_rad=>({separation_rad,outcomes:0,hits:0}))};
  assertNoPrivilegedShooterData(out,{path:'pullAwayHitMissMemory'});return out;
}

export function selectPullAwayVisualPictureV1(memory){
  if(!memory||memory.schema!=='PULL_AWAY_HIT_MISS_MEMORY_V1')throw new Error('PULL_AWAY_HIT_MISS_MEMORY_V1 required');
  assertNoPrivilegedShooterData(memory,{path:'pullAwayHitMissMemory.select'});
  const untried=memory.arms.find(a=>a.outcomes===0);
  if(untried)return freezePlain({schema:'PULL_AWAY_ACTION_SELECTION_V1',separation_rad:untried.separation_rad,reason:'SYSTEMATIC_INITIAL_EXPLORATION',score:null});
  const total=Math.max(1,memory.totalOutcomes);let best=null;
  for(const arm of memory.arms){
    const empirical=arm.hits/arm.outcomes;
    const bonus=memory.explorationStrength*Math.sqrt(Math.log(total)/arm.outcomes);
    const score=empirical+bonus;
    if(!best||score>best.score+1e-15||(Math.abs(score-best.score)<=1e-15&&arm.separation_rad<best.separation_rad))best={separation_rad:arm.separation_rad,score,empirical,bonus};
  }
  return freezePlain({schema:'PULL_AWAY_ACTION_SELECTION_V1',separation_rad:best.separation_rad,reason:'UCB1_HIT_MISS_GENERAL_MEMORY',score:best.score,empiricalHitRate:best.empirical,explorationBonus:best.bonus});
}

export function updatePullAwayHitMissMemoryV1(memory,selection,feedback){
  if(!memory||memory.schema!=='PULL_AWAY_HIT_MISS_MEMORY_V1')throw new Error('memory required');
  if(!selection||selection.schema!=='PULL_AWAY_ACTION_SELECTION_V1')throw new Error('selection required');
  if(!feedback||feedback.schema!=='HIT_MISS_ONLY_FEEDBACK_V1'||typeof feedback.hit!=='boolean')throw new Error('HIT_MISS_ONLY_FEEDBACK_V1 required');
  assertNoPrivilegedShooterData({memory,selection,feedback},{path:'pullAwayHitMissMemory.update'});
  const arm=memory.arms.find(a=>Math.abs(a.separation_rad-selection.separation_rad)<1e-12);if(!arm)throw new Error('selection not in memory action set');
  arm.outcomes+=1;if(feedback.hit)arm.hits+=1;memory.totalOutcomes+=1;return memory;
}

export function rankPullAwayMemoryActionsV1(memory){
  if(!memory||memory.schema!=='PULL_AWAY_HIT_MISS_MEMORY_V1')throw new Error('memory required');
  assertNoPrivilegedShooterData(memory,{path:'pullAwayHitMissMemory.rank'});
  return freezePlain(memory.arms.filter(a=>a.outcomes>0).map(a=>({separation_rad:a.separation_rad,outcomes:a.outcomes,hits:a.hits,hitRate:a.hits/a.outcomes})).sort((a,b)=>b.hitRate-a.hitRate||b.outcomes-a.outcomes||a.separation_rad-b.separation_rad));
}

export function freezePullAwayHitMissPolicyV1(memory){
  const ranked=rankPullAwayMemoryActionsV1(memory);if(!ranked.length)throw new Error('cannot freeze untrained pull-away policy');
  const best=ranked[0];const out=freezePlain({schema:'FROZEN_PULL_AWAY_HIT_MISS_POLICY_V1',separation_rad:best.separation_rad,trainingHitRate:best.hitRate,trainingOutcomesAtSelectedAction:best.outcomes,trainingHitsAtSelectedAction:best.hits,selectionRule:'HIGHEST_TRAINING_HIT_RATE_THEN_MORE_OUTCOMES_THEN_SMALLER_VISUAL_SEPARATION',feedbackBoundary:'HIT_MISS_ONLY_NO_MISS_DISTANCE_NO_TARGET_ID_NO_ORACLE_CORRECTION'});
  assertNoPrivilegedShooterData(out,{path:'pullAwayHitMissMemory.frozenPolicy'});return out;
}

export function publicPullAwayMemorySummaryV1(memory){
  if(!memory||memory.schema!=='PULL_AWAY_HIT_MISS_MEMORY_V1')throw new Error('memory required');
  const out=freezePlain({schema:'PULL_AWAY_HIT_MISS_MEMORY_SUMMARY_V1',totalOutcomes:memory.totalOutcomes,arms:memory.arms.map(a=>({separation_rad:a.separation_rad,outcomes:a.outcomes,hits:a.hits,hitRate:a.outcomes?a.hits/a.outcomes:0})),boundary:'GENERAL MEMORY STORES ONLY VISUAL-RELATIONSHIP ACTION COUNTS AND BINARY HIT COUNTS; NO TARGET IDS/SEEDS/MISS DISTANCE/RANGE/FUTURE PATH'});
  assertNoPrivilegedShooterData(out,{path:'pullAwayHitMissMemory.summary'});return out;
}