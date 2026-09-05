// ShotSight Virtual Shooter L3 — learner-side binary outcome memory.
// Deliberately simple/interpretable before RL or neural policies.
// It never imports oracle/physics and never accepts miss distance, target seed or exact lead.

import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
const finite=(v,n)=>{if(!Number.isFinite(v))throw new Error(`${n} must be finite`);return v;};

export const L3_MAINTAINED_LEAD_LEARNING_ACTIONS_V1=Object.freeze([
  0.000,0.025,0.050,0.075,0.100,0.125,0.150,0.175,0.200,0.225,0.250
]);

export function createHitMissOnlyFeedback({hit}={}){
  if(typeof hit!=='boolean')throw new Error('hit must be boolean');
  const out=freezePlain({schema:'HIT_MISS_ONLY_FEEDBACK_V1',hit});
  assertNoPrivilegedShooterData(out,{path:'hitMissFeedback'});return out;
}

export function createMaintainedLeadHitMissMemory({actions=L3_MAINTAINED_LEAD_LEARNING_ACTIONS_V1,explorationStrength=Math.SQRT2}={}){
  if(!Array.isArray(actions)||actions.length<2)throw new Error('at least two actions required');
  const sorted=[...actions].map((x,i)=>{finite(x,`actions[${i}]`);if(x<0||x>0.25)throw new Error('action outside learner-safe angular-picture bounds');return x;}).sort((a,b)=>a-b);
  finite(explorationStrength,'explorationStrength');if(explorationStrength<0)throw new Error('explorationStrength must be non-negative');
  const out={schema:'MAINTAINED_LEAD_HIT_MISS_MEMORY_V1',evidenceClass:'INTERPRETABLE_UCB1_GENERAL_MEMORY_HIT_MISS_ONLY',explorationStrength,totalOutcomes:0,arms:sorted.map(separation_rad=>({separation_rad,outcomes:0,hits:0}))};
  assertNoPrivilegedShooterData(out,{path:'hitMissMemory'});return out;
}

export function selectMaintainedLeadVisualPicture(memory){
  if(!memory||memory.schema!=='MAINTAINED_LEAD_HIT_MISS_MEMORY_V1')throw new Error('MAINTAINED_LEAD_HIT_MISS_MEMORY_V1 required');
  assertNoPrivilegedShooterData(memory,{path:'hitMissMemory.select'});
  const untried=memory.arms.find(a=>a.outcomes===0);
  if(untried)return freezePlain({schema:'MAINTAINED_LEAD_ACTION_SELECTION_V1',separation_rad:untried.separation_rad,reason:'SYSTEMATIC_INITIAL_EXPLORATION',score:null});
  const total=Math.max(1,memory.totalOutcomes);
  let best=null;
  for(const arm of memory.arms){
    const mean=arm.hits/arm.outcomes;
    const bonus=memory.explorationStrength*Math.sqrt(Math.log(total)/arm.outcomes);
    const score=mean+bonus;
    if(!best||score>best.score+1e-15||(Math.abs(score-best.score)<=1e-15&&arm.separation_rad<best.separation_rad))best={separation_rad:arm.separation_rad,score,mean,bonus};
  }
  return freezePlain({schema:'MAINTAINED_LEAD_ACTION_SELECTION_V1',separation_rad:best.separation_rad,reason:'UCB1_HIT_MISS_MEMORY',score:best.score,empiricalHitRate:best.mean,explorationBonus:best.bonus});
}

export function updateMaintainedLeadHitMissMemory(memory,selection,feedback){
  if(!memory||memory.schema!=='MAINTAINED_LEAD_HIT_MISS_MEMORY_V1')throw new Error('memory required');
  if(!selection||selection.schema!=='MAINTAINED_LEAD_ACTION_SELECTION_V1')throw new Error('selection required');
  if(!feedback||feedback.schema!=='HIT_MISS_ONLY_FEEDBACK_V1'||typeof feedback.hit!=='boolean')throw new Error('HIT_MISS_ONLY_FEEDBACK_V1 required');
  assertNoPrivilegedShooterData({memory,selection,feedback},{path:'hitMissMemory.update'});
  const arm=memory.arms.find(a=>Math.abs(a.separation_rad-selection.separation_rad)<1e-12);if(!arm)throw new Error('selection not in memory action set');
  arm.outcomes+=1;if(feedback.hit)arm.hits+=1;memory.totalOutcomes+=1;
  return memory;
}

export function freezeLearnedMaintainedLeadPolicy(memory){
  if(!memory||memory.schema!=='MAINTAINED_LEAD_HIT_MISS_MEMORY_V1')throw new Error('memory required');
  assertNoPrivilegedShooterData(memory,{path:'hitMissMemory.freeze'});
  let best=null;
  for(const arm of memory.arms){
    if(arm.outcomes===0)continue;
    const rate=arm.hits/arm.outcomes;
    if(!best||rate>best.hitRate+1e-15||(Math.abs(rate-best.hitRate)<=1e-15&&arm.outcomes>best.outcomes)||(Math.abs(rate-best.hitRate)<=1e-15&&arm.outcomes===best.outcomes&&arm.separation_rad<best.separation_rad))best={separation_rad:arm.separation_rad,hitRate:rate,outcomes:arm.outcomes,hits:arm.hits};
  }
  if(!best)throw new Error('cannot freeze untrained policy');
  const out=freezePlain({schema:'FROZEN_MAINTAINED_LEAD_HIT_MISS_POLICY_V1',separation_rad:best.separation_rad,trainingHitRate:best.hitRate,trainingOutcomesAtSelectedAction:best.outcomes,trainingHitsAtSelectedAction:best.hits,selectionRule:'HIGHEST_TRAINING_HIT_RATE_THEN_MORE_OUTCOMES_THEN_SMALLER_VISUAL_SEPARATION',feedbackBoundary:'HIT_MISS_ONLY_NO_MISS_DISTANCE_NO_ORACLE_CORRECTION'});
  assertNoPrivilegedShooterData(out,{path:'hitMissMemory.frozenPolicy'});return out;
}

export function publicMemorySummary(memory){
  if(!memory||memory.schema!=='MAINTAINED_LEAD_HIT_MISS_MEMORY_V1')throw new Error('memory required');
  const out=freezePlain({schema:'MAINTAINED_LEAD_HIT_MISS_MEMORY_SUMMARY_V1',totalOutcomes:memory.totalOutcomes,arms:memory.arms.map(a=>({separation_rad:a.separation_rad,outcomes:a.outcomes,hits:a.hits,hitRate:a.outcomes?a.hits/a.outcomes:0})),boundary:'GENERAL MEMORY STORES ONLY ACTION COUNTS AND BINARY HIT COUNTS; NO TARGET IDS/SEEDS/MISS DISTANCE'});
  assertNoPrivilegedShooterData(out,{path:'hitMissMemory.summary'});return out;
}
