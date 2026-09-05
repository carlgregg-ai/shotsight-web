// ShotSight Virtual Shooter L3 — learner-side contextual/episodic pull-away memory.
// Interpretable hierarchical UCB memory before RL/neural policies.
// Consumes only categorical shooter-visible early visual context, the learner's chosen
// visual relationship, and post-outcome HIT_MISS_ONLY_FEEDBACK_V1.
// It imports no target/scenario generator, physics, ballistics, oracle/referee or target identity.

import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
const finite=(v,n)=>{if(!Number.isFinite(v))throw new Error(`${n} must be finite`);return v;};
export const L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V1=Object.freeze(Array.from({length:61},(_,i)=>Number((i*0.002).toFixed(3))));
const ALLOWED_DIRECTION=new Set(['LEFT','RIGHT','STATIONARY','UNKNOWN']);
const ALLOWED_SPEED=new Set(['SLOW','MEDIUM','FAST','UNKNOWN']);
const ALLOWED_ACQ=new Set(['LOW','MEDIUM','HIGH']);
const ALLOWED_SPAN=new Set(['SHORT','MEDIUM','LONG']);

export function validatePullAwayLearnerContextV1(context){
  if(!context||context.schema!=='PULL_AWAY_LEARNER_CONTEXT_V1')throw new Error('PULL_AWAY_LEARNER_CONTEXT_V1 required');
  if(!ALLOWED_DIRECTION.has(context.direction))throw new Error('invalid context direction');
  if(!ALLOWED_SPEED.has(context.speedBand))throw new Error('invalid context speedBand');
  if(!ALLOWED_ACQ.has(context.acquisitionBand))throw new Error('invalid context acquisitionBand');
  if(!ALLOWED_SPAN.has(context.observationBand))throw new Error('invalid context observationBand');
  assertNoPrivilegedShooterData(context,{path:'contextualPullAwayMemory.context'});
  return context;
}

export function pullAwayLearnerContextKeyV1(context){
  validatePullAwayLearnerContextV1(context);
  return `${context.direction}|${context.speedBand}|${context.acquisitionBand}|${context.observationBand}`;
}

function makeArms(actions){return actions.map(separation_rad=>({separation_rad,outcomes:0,hits:0}));}

export function createContextualPullAwayMemoryV1({actions=L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V1,explorationStrength=Math.SQRT2,globalBackoffWeight=2}={}){
  if(!Array.isArray(actions)||actions.length<2)throw new Error('at least two actions required');
  const sorted=[...actions].map((x,i)=>{finite(x,`actions[${i}]`);if(x<0||x>0.12)throw new Error('action outside learner-safe visual-picture bounds');return x;}).sort((a,b)=>a-b);
  finite(explorationStrength,'explorationStrength');finite(globalBackoffWeight,'globalBackoffWeight');
  if(explorationStrength<0||globalBackoffWeight<0)throw new Error('memory controls must be non-negative');
  const out={schema:'PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_V1',evidenceClass:'INTERPRETABLE_HIERARCHICAL_CONTEXTUAL_UCB_HIT_MISS_ONLY',explorationStrength,globalBackoffWeight,totalOutcomes:0,globalArms:makeArms(sorted),contexts:{}};
  assertNoPrivilegedShooterData(out,{path:'contextualPullAwayMemory'});return out;
}

function ensureContext(memory,context){
  const key=pullAwayLearnerContextKeyV1(context);
  if(!memory.contexts[key])memory.contexts[key]={context:freezePlain({...context}),outcomes:0,arms:makeArms(memory.globalArms.map(a=>a.separation_rad))};
  return memory.contexts[key];
}

function scoreArm(memory,ctxArm,globalArm,contextTotal){
  const contextualMean=ctxArm.outcomes?ctxArm.hits/ctxArm.outcomes:0;
  const globalMean=globalArm.outcomes?globalArm.hits/globalArm.outcomes:0;
  const weight=ctxArm.outcomes/(ctxArm.outcomes+memory.globalBackoffWeight);
  const empirical=weight*contextualMean+(1-weight)*globalMean;
  const bonus=ctxArm.outcomes?memory.explorationStrength*Math.sqrt(Math.log(Math.max(2,contextTotal+1))/ctxArm.outcomes):Infinity;
  return {score:empirical+bonus,empirical,bonus,contextualMean,globalMean};
}

export function selectContextualPullAwayVisualPictureV1(memory,context){
  if(!memory||memory.schema!=='PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_V1')throw new Error('contextual memory required');
  assertNoPrivilegedShooterData(memory,{path:'contextualPullAwayMemory.select'});
  const bucket=ensureContext(memory,context);
  const untried=bucket.arms.find(a=>a.outcomes===0);
  if(untried)return freezePlain({schema:'PULL_AWAY_CONTEXTUAL_ACTION_SELECTION_V1',contextKey:pullAwayLearnerContextKeyV1(context),separation_rad:untried.separation_rad,reason:'CONTEXT_SYSTEMATIC_INITIAL_EXPLORATION',score:null});
  let best=null;
  for(let i=0;i<bucket.arms.length;i++){
    const arm=bucket.arms[i],globalArm=memory.globalArms[i],s=scoreArm(memory,arm,globalArm,bucket.outcomes);
    if(!best||s.score>best.score+1e-15||(Math.abs(s.score-best.score)<=1e-15&&arm.separation_rad<best.separation_rad))best={separation_rad:arm.separation_rad,...s};
  }
  return freezePlain({schema:'PULL_AWAY_CONTEXTUAL_ACTION_SELECTION_V1',contextKey:pullAwayLearnerContextKeyV1(context),separation_rad:best.separation_rad,reason:'HIERARCHICAL_CONTEXTUAL_UCB_HIT_MISS',score:best.score,empiricalHitRate:best.empirical,contextualHitRate:best.contextualMean,globalHitRate:best.globalMean,explorationBonus:best.bonus});
}

export function updateContextualPullAwayMemoryV1(memory,context,selection,feedback){
  if(!memory||memory.schema!=='PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_V1')throw new Error('contextual memory required');
  validatePullAwayLearnerContextV1(context);
  if(!selection||selection.schema!=='PULL_AWAY_CONTEXTUAL_ACTION_SELECTION_V1')throw new Error('contextual selection required');
  if(!feedback||feedback.schema!=='HIT_MISS_ONLY_FEEDBACK_V1'||typeof feedback.hit!=='boolean')throw new Error('HIT_MISS_ONLY_FEEDBACK_V1 required');
  assertNoPrivilegedShooterData({memory,context,selection,feedback},{path:'contextualPullAwayMemory.update'});
  const bucket=ensureContext(memory,context),key=pullAwayLearnerContextKeyV1(context);
  if(selection.contextKey!==key)throw new Error('selection context mismatch');
  const idx=bucket.arms.findIndex(a=>Math.abs(a.separation_rad-selection.separation_rad)<1e-12);if(idx<0)throw new Error('selection not in action grid');
  bucket.arms[idx].outcomes++;memory.globalArms[idx].outcomes++;bucket.outcomes++;memory.totalOutcomes++;
  if(feedback.hit){bucket.arms[idx].hits++;memory.globalArms[idx].hits++;}
  return memory;
}

export function bestGlobalContextFreeActionV1(memory){
  if(!memory||memory.schema!=='PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_V1')throw new Error('contextual memory required');
  const ranked=memory.globalArms.filter(a=>a.outcomes>0).map(a=>({separation_rad:a.separation_rad,outcomes:a.outcomes,hits:a.hits,hitRate:a.hits/a.outcomes})).sort((a,b)=>b.hitRate-a.hitRate||b.outcomes-a.outcomes||a.separation_rad-b.separation_rad);
  if(!ranked.length)throw new Error('untrained memory');return freezePlain(ranked[0]);
}

export function publicContextualPullAwayMemorySummaryV1(memory){
  if(!memory||memory.schema!=='PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_V1')throw new Error('contextual memory required');
  const out=freezePlain({schema:'PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_SUMMARY_V1',totalOutcomes:memory.totalOutcomes,contextCount:Object.keys(memory.contexts).length,contextKeys:Object.keys(memory.contexts).sort(),globalArms:memory.globalArms.map(a=>({separation_rad:a.separation_rad,outcomes:a.outcomes,hits:a.hits,hitRate:a.outcomes?a.hits/a.outcomes:0})),boundary:'CONTEXT IS CATEGORICAL EARLY SHOOTER-VISIBLE DIRECTION/SPEED/ACQUISITION/OBSERVATION-SPAN ONLY; MEMORY STORES ACTION COUNTS + BINARY OUTCOMES; NO TARGET IDS/SEEDS/RANGE/FUTURE PATH/INTERCEPT/MISS VECTOR/REQUIRED LEAD'});
  assertNoPrivilegedShooterData(out,{path:'contextualPullAwayMemory.summary'});return out;
}
