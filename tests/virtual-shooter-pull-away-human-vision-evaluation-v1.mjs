import assert from 'node:assert/strict';
import {runL3PullAwayHumanVisionRewardSupportV1,L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1} from '../learning/pull-away-human-vision-evaluation-v1.mjs';

const result=runL3PullAwayHumanVisionRewardSupportV1({nCrossersPerPartition:6});
assert.equal(result.scoreStatus,'ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY');
assert.equal(result.feedbackToLearner,'HIT_MISS_ONLY_FEEDBACK_V1_AFTER_OUTCOME');
assert.equal(result.memory,'OFF_FOR_REWARD_SUPPORT_GATE');
assert.equal(result.satisfaction,'OFF_FOR_REWARD_SUPPORT_GATE');
assert.equal(result.actionSpace.values_rad.length,L3_PULL_AWAY_HUMAN_VISION_EXPLORATION_GRID_V1.length);
assert.equal(result.actionSpace.values_rad[0],0);
assert.equal(result.actionSpace.values_rad.at(-1),0.12);
for(const p of Object.values(result.populations)){
  assert.equal(p.sameHiddenBankAcrossActions,true);
  assert.equal(p.actionCount,61);
  assert.ok(p.triggers>0,'Human Vision pull-away diagnostic must generate physical learner triggers');
}
assert.ok(result.overall.hits>0,'Binary reward support was not re-established under Human Vision + committed pull-away; keep L3 learning blocked and diagnose perception/policy/motor coupling rather than weakening the scorer or leaking oracle state.');
assert.equal(result.status,'L3_PULL_AWAY_HUMAN_VISION_BINARY_REWARD_SUPPORT_DISCOVERED_V1');
console.log(JSON.stringify({status:'PASS',schema:'L3_PULL_AWAY_HUMAN_VISION_REWARD_SUPPORT_GATE_V1',overall:result.overall,populations:Object.fromEntries(Object.entries(result.populations).map(([k,p])=>[k,{attempts:p.attempts,triggers:p.triggers,hits:p.hits,rewardSupportObserved:p.rewardSupportObserved}])),antiCheat:result.antiCheat,limitations:result.limitations},null,2));
