// ShotSight Virtual Shooter L3 — Human Vision pull-away binary reward-support replication.
// REFEREE-SIDE DIAGNOSTIC ONLY. This tests population sensitivity on fresh predeclared
// development blocks. It does not tune learner actions, expose oracle gradients, or select
// a policy from referee information.

import {createL1MultiFamilyBank} from './multifamily-evaluation-v1.mjs';
import {runPullAwayHumanVisionEpisodeV1,L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1} from './pull-away-human-vision-evaluation-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}

export const L3_PULL_AWAY_HUMAN_VISION_REPLICATION_BLOCKS_V1=freezePlain([
  {name:'REPLICATION_A',seedBase:401000,partition:'FRESH_NON_SEALED_REWARD_REPLICATION'},
  {name:'REPLICATION_B',seedBase:402000,partition:'FRESH_NON_SEALED_REWARD_REPLICATION'},
  {name:'REPLICATION_C',seedBase:403000,partition:'FRESH_NON_SEALED_REWARD_REPLICATION'},
  {name:'REPLICATION_D',seedBase:404000,partition:'FRESH_NON_SEALED_REWARD_REPLICATION'}
]);

function runBlock({name,seedBase,partition,nCrossers}){
  const bank=createL1MultiFamilyBank({nPerFamily:nCrossers,seedBase}).filter(r=>r.family==='CROSSER');
  let attempts=0,triggers=0,hits=0,episodeIndex=0;
  const rewardedActions=[];
  for(const separationTarget_rad of L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1){
    let actionHits=0,actionTriggers=0;
    for(let i=0;i<bank.length;i++){
      const ep=runPullAwayHumanVisionEpisodeV1({
        record:bank[i],
        separationTarget_rad,
        observationSeed:seedBase*23+i*2039+Math.round(separationTarget_rad*1e6),
        episodeIndex:episodeIndex++
      });
      attempts+=1;
      if(ep.triggered){triggers+=1;actionTriggers+=1;}
      if(ep.hit){hits+=1;actionHits+=1;}
    }
    if(actionHits>0)rewardedActions.push(freezePlain({separationTarget_rad,hits:actionHits,triggers:actionTriggers,attempts:bank.length}));
  }
  return freezePlain({name,partition,seedBase,nCrossers:bank.length,actionCount:L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1.length,attempts,triggers,hits,rewardSupportObserved:hits>0,rewardedActions});
}

export function runL3PullAwayHumanVisionRewardReplicationV1({nCrossersPerBlock=4}={}){
  if(!Number.isInteger(nCrossersPerBlock)||nCrossersPerBlock<2)throw new Error('nCrossersPerBlock must be integer >=2');
  const blocks=L3_PULL_AWAY_HUMAN_VISION_REPLICATION_BLOCKS_V1.map(cfg=>runBlock({...cfg,nCrossers:nCrossersPerBlock}));
  const supportBlocks=blocks.filter(b=>b.rewardSupportObserved).length;
  const totalAttempts=blocks.reduce((a,b)=>a+b.attempts,0);
  const totalTriggers=blocks.reduce((a,b)=>a+b.triggers,0);
  const totalHits=blocks.reduce((a,b)=>a+b.hits,0);
  const status=supportBlocks>=2
    ?'L3_PULL_AWAY_HUMAN_VISION_REWARD_SUPPORT_REPLICATED_MULTIPLE_FRESH_BLOCKS_V1'
    :'L3_PULL_AWAY_HUMAN_VISION_REWARD_SUPPORT_REMAINS_POPULATION_SENSITIVE_V1';
  return freezePlain({
    status,
    experimentClass:'PREDECLARED_FRESH_NON_SEALED_REPLICATION_DIAGNOSTIC',
    blocks,
    summary:{blockCount:blocks.length,supportBlocks,totalAttempts,totalTriggers,totalHits},
    actionDefinition:'SAME_PREDECLARED_61_POINT_LEARNER_SAFE_VISUAL_SEPARATION_GRID_ON_EVERY_BLOCK',
    policySelection:'NONE_REFEREE_DIAGNOSTIC_DOES_NOT_SELECT_OR_TUNE_A_LEARNER_POLICY',
    antiCheat:'EPISODE POLICY REMAINS HUMAN_VISION_CONSTRAINED; ORACLE SCORES ONLY AFTER TRIGGER; NO MISS DISTANCE OR ORACLE ACTION IS USED TO DEFINE OR RANK THE ACTION GRID',
    interpretation:supportBlocks>=2
      ?'Binary engineering-proxy reward support occurred on more than one independently seeded fresh development block. This supports proceeding to learner-memory architecture experiments, but is not learning proof.'
      :'Binary engineering-proxy reward support did not occur on multiple independently seeded fresh development blocks. Treat sparse reward/population sensitivity as the immediate architecture problem; do not scale training or tune to known rewarded identities.',
    limitations:['55 mm centreline-disc engineering proxy is not real break probability','Human Vision and motor numerics remain provisional','Fresh blocks are development diagnostics, not sealed existential-test targets','No success percentage is inferred from this replication classification']
  });
}
