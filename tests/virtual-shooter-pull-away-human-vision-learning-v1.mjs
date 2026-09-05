import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runL3PullAwayHumanVisionHitMissLearningV1} from '../learning/pull-away-human-vision-learning-v1.mjs';
import {L3_PULL_AWAY_LEARNER_ACTION_GRID_V1,createPullAwayHitMissMemoryV1} from '../learning/pull-away-hit-miss-memory-v1.mjs';

const memorySource=fs.readFileSync(new URL('../learning/pull-away-hit-miss-memory-v1.mjs',import.meta.url),'utf8');
const importLines=memorySource.split('\n').filter(line=>/^\s*import\s/.test(line)).join('\n');
for(const forbidden of ['oracle-evaluation','target-engine','canonical-flat-crosser','ballistics','intercept','multifamily-evaluation','pull-away-human-vision-evaluation'])assert.equal(importLines.includes(forbidden),false,`learner memory must not import ${forbidden}`);
const memory=createPullAwayHitMissMemoryV1();
assert.equal(memory.arms.length,61);
assert.equal(memory.arms[0].separation_rad,0);
assert.equal(memory.arms.at(-1).separation_rad,0.12);
assert.deepEqual(memory.arms.map(a=>a.separation_rad),L3_PULL_AWAY_LEARNER_ACTION_GRID_V1);

const result=runL3PullAwayHumanVisionHitMissLearningV1({nCrossersPerPartition:3,adaptiveEpisodes:61});
assert.equal(result.scoreBoundary,'ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY');
assert.equal(result.training.attempts,61*3+61);
assert.ok(result.training.triggers>0,'learner experiment must generate physical pull-away triggers');
assert.equal(result.calibration.candidateCount,5);
assert.equal(result.calibration.selectedPolicy.schema,'FROZEN_PULL_AWAY_HIT_MISS_POLICY_V1');
assert.ok(result.calibration.selectedPolicy.separation_rad>=0&&result.calibration.selectedPolicy.separation_rad<=0.12);
assert.equal(result.heldout.noMemoryUniform.actionCount,61);
assert.equal(result.heldout.noMemoryUniform.attempts,61*3);
assert.equal(result.heldout.learned.attempts,3);
assert.ok(['L3_PULL_AWAY_HUMAN_VISION_HELDOUT_LEARNING_SIGNAL_V1','L3_PULL_AWAY_HUMAN_VISION_NO_HELDOUT_LEARNING_SIGNAL_V1'].includes(result.status));
assert.equal(result.heldout.learningSignalObserved,result.status==='L3_PULL_AWAY_HUMAN_VISION_HELDOUT_LEARNING_SIGNAL_V1');
console.log(JSON.stringify({status:'PASS',schema:'L3_PULL_AWAY_HUMAN_VISION_HIT_MISS_LEARNING_GATE_V1',experimentStatus:result.status,training:{attempts:result.training.attempts,triggers:result.training.triggers,hits:result.training.hits},calibration:{selectedSeparation_rad:result.calibration.selectedPolicy.separation_rad,candidates:result.calibration.candidates.map(x=>({separation_rad:x.separation_rad,hits:x.hits,attempts:x.attempts}))},heldout:{learned:result.heldout.learned,noMemoryUniform:result.heldout.noMemoryUniform,memoryAdvantageHitRate:result.heldout.memoryAdvantageHitRate,learningSignalObserved:result.heldout.learningSignalObserved},antiCheat:result.antiCheat,limitations:result.limitations},null,2));