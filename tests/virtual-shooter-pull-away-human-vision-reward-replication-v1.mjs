import assert from 'node:assert/strict';
import {runL3PullAwayHumanVisionRewardReplicationV1,L3_PULL_AWAY_HUMAN_VISION_REPLICATION_BLOCKS_V1} from '../learning/pull-away-human-vision-reward-replication-v1.mjs';

assert.equal(L3_PULL_AWAY_HUMAN_VISION_REPLICATION_BLOCKS_V1.length,4);
assert.equal(new Set(L3_PULL_AWAY_HUMAN_VISION_REPLICATION_BLOCKS_V1.map(x=>x.seedBase)).size,4);
const result=runL3PullAwayHumanVisionRewardReplicationV1({nCrossersPerBlock:4});
assert.equal(result.blocks.length,4);
assert.equal(result.summary.blockCount,4);
assert.equal(result.summary.totalAttempts,4*61*4);
assert.equal(result.summary.totalAttempts,result.blocks.reduce((a,b)=>a+b.attempts,0));
assert.equal(result.summary.totalTriggers,result.blocks.reduce((a,b)=>a+b.triggers,0));
assert.equal(result.summary.totalHits,result.blocks.reduce((a,b)=>a+b.hits,0));
assert.equal(result.summary.supportBlocks,result.blocks.filter(b=>b.hits>0).length);
for(const block of result.blocks){
  assert.equal(block.actionCount,61);
  assert.equal(block.attempts,61*4);
  assert.equal(block.partition,'FRESH_NON_SEALED_REWARD_REPLICATION');
}
assert.ok([
  'L3_PULL_AWAY_HUMAN_VISION_REWARD_SUPPORT_REPLICATED_MULTIPLE_FRESH_BLOCKS_V1',
  'L3_PULL_AWAY_HUMAN_VISION_REWARD_SUPPORT_REMAINS_POPULATION_SENSITIVE_V1'
].includes(result.status));
assert.equal(result.policySelection,'NONE_REFEREE_DIAGNOSTIC_DOES_NOT_SELECT_OR_TUNE_A_LEARNER_POLICY');
console.log(JSON.stringify({status:'PASS',schema:'L3_PULL_AWAY_HUMAN_VISION_REWARD_REPLICATION_GATE_V1',experimentStatus:result.status,summary:result.summary,blocks:result.blocks.map(b=>({name:b.name,seedBase:b.seedBase,attempts:b.attempts,triggers:b.triggers,hits:b.hits,rewardSupportObserved:b.rewardSupportObserved,rewardedActions:b.rewardedActions})),antiCheat:result.antiCheat,interpretation:result.interpretation,limitations:result.limitations},null,2));
