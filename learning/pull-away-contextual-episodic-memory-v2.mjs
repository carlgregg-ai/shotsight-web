// ShotSight Virtual Shooter L3 — learner-side similarity-weighted contextual/episodic pull-away memory V2.
// Learner inputs are restricted to early shooter-visible Human Vision evidence, selected visual relationship,
// and binary hit/miss feedback. No target/scenario identity, physics, ballistics, oracle or referee imports.
import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';
const freezePlain=v=>{if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;};
const finite=(v,n)=>{if(!Number.isFinite(v))throw new Error(`${n} must be finite`);return v;};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export const L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V2=Object.freeze(Array.from({length:61},(_,i)=>Number((i*0.002).toFixed(3))));
const DIR=new Set(['LEFT','RIGHT','STATIONARY','UNKNOWN']),SPEED=new Set(['SLOW','MEDIUM','FAST','UNKNOWN']),PHASE=new Set(['EXPECTED_RELEASE','FLASH_STREAK','ACQUIRING','TRACKING','REACQUIRING']);
export function validatePullAwayLearnerContextV2(c){
  if(!c||c.schema!=='PULL_AWAY_LEARNER_CONTEXT_V2')throw new Error('PULL_AWAY_LEARNER_CONTEXT_V2 required');
  if(!DIR.has(c.direction)||!SPEED.has(c.speedBand)||!PHASE.has(c.acquisitionPhase))throw new Error('invalid contextual V2 categorical feature');
  for(const k of ['visualConfidence','acquisitionScore','observationSpan_s'])finite(c[k],k);
  if(c.visualConfidence<0||c.visualConfidence>1||c.acquisitionScore<0||c.acquisitionScore>1||c.observationSpan_s<0||c.observationSpan_s>1)throw new Error('invalid contextual V2 numeric feature');
  assertNoPrivilegedShooterData(c,{path:'contextualPullAwayMemoryV2.context'});return c;
}
const arms=actions=>actions.map(separation_rad=>({separation_rad,outcomes:0,hits:0}));
export function createContextualPullAwayMemoryV2({actions=L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V2,explorationStrength=0.9,globalBackoffWeight=2,similarityFloor=0.04}={}){
  if(!Array.isArray(actions)||actions.length<2)throw new Error('at least two actions required');
  const sorted=[...actions].map((x,i)=>{finite(x,`actions[${i}]`);if(x<0||x>0.12)throw new Error('action outside learner-safe bounds');return x;}).sort((a,b)=>a-b);
  for(const [k,v] of Object.entries({explorationStrength,globalBackoffWeight,similarityFloor}))finite(v,k);
  if(explorationStrength<0||globalBackoffWeight<0||similarityFloor<0||similarityFloor>1)throw new Error('invalid memory controls');
  const m={schema:'PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_V2',evidenceClass:'INTERPRETABLE_SIMILARITY_WEIGHTED_EPISODIC_HIT_MISS_ONLY',explorationStrength,globalBackoffWeight,similarityFloor,totalOutcomes:0,globalArms:arms(sorted),episodes:[]};
  assertNoPrivilegedShooterData(m,{path:'contextualPullAwayMemoryV2'});return m;
}
function similarity(a,b){
  validatePullAwayLearnerContextV2(a);validatePullAwayLearnerContextV2(b);
  let s=1;
  s*=a.direction===b.direction?1:(a.direction==='UNKNOWN'||b.direction==='UNKNOWN'?0.65:0.25);
  s*=a.speedBand===b.speedBand?1:(a.speedBand==='UNKNOWN'||b.speedBand==='UNKNOWN'?0.7:0.45);
  s*=a.acquisitionPhase===b.acquisitionPhase?1:0.6;
  s*=Math.exp(-Math.abs(a.visualConfidence-b.visualConfidence)/0.22);
  s*=Math.exp(-Math.abs(a.acquisitionScore-b.acquisitionScore)/0.22);
  s*=Math.exp(-Math.abs(a.observationSpan_s-b.observationSpan_s)/0.10);
  return clamp(s,0,1);
}
function armEstimate(m,c,index){
  const ga=m.globalArms[index],sep=ga.separation_rad;let w=0,h=0;
  for(const ep of m.episodes){if(Math.abs(ep.separation_rad-sep)>1e-12)continue;const x=similarity(c,ep.context);if(x<m.similarityFloor)continue;w+=x;h+=x*(ep.hit?1:0);}
  const contextual=w>0?h/w:0,global=ga.outcomes?ga.hits/ga.outcomes:0,blend=w/(w+m.globalBackoffWeight),value=blend*contextual+(1-blend)*global;
  return {value,contextual,global,effectiveWeight:w};
}
export function selectContextualPullAwayVisualPictureV2(m,c){
  if(!m||m.schema!=='PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_V2')throw new Error('contextual V2 memory required');validatePullAwayLearnerContextV2(c);assertNoPrivilegedShooterData(m,{path:'contextualPullAwayMemoryV2.select'});
  const untried=m.globalArms.find(a=>a.outcomes===0);if(untried)return freezePlain({schema:'PULL_AWAY_CONTEXTUAL_ACTION_SELECTION_V2',separation_rad:untried.separation_rad,reason:'GLOBAL_SYSTEMATIC_INITIAL_EXPLORATION',score:null});
  let best=null;for(let i=0;i<m.globalArms.length;i++){const e=armEstimate(m,c,i),den=Math.max(1,e.effectiveWeight),bonus=m.explorationStrength*Math.sqrt(Math.log(Math.max(2,m.totalOutcomes+1))/den),score=e.value+bonus;if(!best||score>best.score+1e-15||(Math.abs(score-best.score)<=1e-15&&m.globalArms[i].separation_rad<best.separation_rad))best={separation_rad:m.globalArms[i].separation_rad,score,bonus,...e};}
  return freezePlain({schema:'PULL_AWAY_CONTEXTUAL_ACTION_SELECTION_V2',separation_rad:best.separation_rad,reason:'SIMILARITY_WEIGHTED_CONTEXTUAL_UCB_HIT_MISS',score:best.score,empiricalHitRate:best.value,effectiveWeight:best.effectiveWeight});
}
export function chooseContextualPullAwayVisualPictureV2(m,c){
  if(!m||m.schema!=='PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_V2')throw new Error('contextual V2 memory required');validatePullAwayLearnerContextV2(c);let best=null;
  for(let i=0;i<m.globalArms.length;i++){const e=armEstimate(m,c,i),sep=m.globalArms[i].separation_rad;if(!best||e.value>best.value+1e-15||(Math.abs(e.value-best.value)<=1e-15&&sep<best.separation_rad))best={separation_rad:sep,...e};}
  return freezePlain({schema:'FROZEN_CONTEXTUAL_PULL_AWAY_POLICY_ACTION_V2',separation_rad:best.separation_rad,reason:'SIMILARITY_WEIGHTED_EPISODIC_RECALL_WITH_GLOBAL_BACKOFF',empiricalHitRate:best.value,effectiveWeight:best.effectiveWeight});
}
export function updateContextualPullAwayMemoryV2(m,c,s,f){
  if(!m||m.schema!=='PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_V2')throw new Error('contextual V2 memory required');validatePullAwayLearnerContextV2(c);if(!s||s.schema!=='PULL_AWAY_CONTEXTUAL_ACTION_SELECTION_V2')throw new Error('contextual V2 selection required');if(!f||f.schema!=='HIT_MISS_ONLY_FEEDBACK_V1'||typeof f.hit!=='boolean')throw new Error('HIT_MISS_ONLY_FEEDBACK_V1 required');
  assertNoPrivilegedShooterData({m,c,s,f},{path:'contextualPullAwayMemoryV2.update'});const i=m.globalArms.findIndex(a=>Math.abs(a.separation_rad-s.separation_rad)<1e-12);if(i<0)throw new Error('selection not in action grid');m.globalArms[i].outcomes++;if(f.hit)m.globalArms[i].hits++;m.totalOutcomes++;m.episodes.push({context:freezePlain({...c}),separation_rad:s.separation_rad,hit:f.hit});return m;
}
export function publicContextualPullAwayMemorySummaryV2(m){
  if(!m||m.schema!=='PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_V2')throw new Error('contextual V2 memory required');const out=freezePlain({schema:'PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_SUMMARY_V2',totalOutcomes:m.totalOutcomes,episodeCount:m.episodes.length,globalArms:m.globalArms.map(a=>({separation_rad:a.separation_rad,outcomes:a.outcomes,hits:a.hits,hitRate:a.outcomes?a.hits/a.outcomes:0})),boundary:'EARLY SHOOTER-VISIBLE DIRECTION/SPEED/ACQUISITION-PHASE/VISUAL-CONFIDENCE/ACQUISITION-SCORE/OBSERVATION-SPAN + SELECTED RELATIONSHIP + BINARY OUTCOME ONLY'});assertNoPrivilegedShooterData(out,{path:'contextualPullAwayMemoryV2.summary'});return out;
}
