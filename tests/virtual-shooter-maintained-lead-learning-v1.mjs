import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runL3MaintainedLeadHitMissLearningExperiment} from '../learning/maintained-lead-learning-evaluation-v1.mjs';

const learnerSource=fs.readFileSync(new URL('../learning/hit-miss-memory-v1.mjs',import.meta.url),'utf8');
for(const forbidden of ['oracle-evaluation','../physics/','missDistance','missVector','targetSeed','requiredLead','exactIntercept','pelletTOF','physicalLead_m'])assert.equal(learnerSource.includes(forbidden),false,`learner memory must not contain/import ${forbidden}`);

const out=runL3MaintainedLeadHitMissLearningExperiment({trainCrossers:132,heldoutCrossers:48,familyTrainNPerFamily:48,standCalibrationN:30,learnerTrainSeedBase:211000,heldoutSeedBase:271000});
console.log(JSON.stringify(out,null,2));
assert.ok(['L3_HIT_MISS_LEARNING_REWARD_DISCOVERED_V1','L3_HIT_MISS_LEARNING_NO_REWARD_DISCOVERED_V1'].includes(out.status));
assert.equal(out.partitions.heldout.untouchedDuringLearning,true);
assert.equal(out.partitions.learnerTraining.seedBase,211000);
assert.equal(out.partitions.heldout.seedBase,271000);
assert.equal(out.actionSpace.values_rad.length,11);
assert.equal(out.feedbackBoundary.includes('ONLY HIT_MISS_ONLY_FEEDBACK_V1 BOOLEAN'),true);
assert.equal(out.training.memory.totalOutcomes,132);
assert.equal(out.training.memory.boundary.includes('NO TARGET IDS/SEEDS/MISS DISTANCE'),true);
assert.equal(out.training.frozenPolicy.feedbackBoundary.includes('HIT_MISS_ONLY'),true);
assert.equal(out.antiCheat.startsWith('PASS_'),true);
assert.ok(out.heldout.learnedFrozenPolicy.hitRate>=0&&out.heldout.learnedFrozenPolicy.hitRate<=1);
assert.ok(out.heldout.noMemoryRoundRobin.hitRate>=0&&out.heldout.noMemoryRoundRobin.hitRate<=1);

console.log('virtual-shooter-maintained-lead-learning-v1: PASS');
