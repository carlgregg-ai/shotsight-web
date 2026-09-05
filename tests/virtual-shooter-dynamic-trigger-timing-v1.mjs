import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runL3DynamicTriggerTimingRewardSupport,L3_TRIGGER_TIMING_ACTION_GRID_V1,L3_TRIGGER_TIMING_OFFSETS_V1} from '../learning/dynamic-trigger-timing-evaluation-v1.mjs';

const controllerSource=fs.readFileSync(new URL('../learning/dynamic-trigger-timing-v1.mjs',import.meta.url),'utf8');
for(const forbidden of ['oracle-evaluation','../physics/','missDistance','missVector','targetSeed','requiredLead','exactIntercept','pelletTOF','physicalLead_m'])assert.equal(controllerSource.includes(forbidden),false,`trigger timing controller must not contain/import ${forbidden}`);
assert.ok(L3_TRIGGER_TIMING_OFFSETS_V1.includes(0));
assert.ok(L3_TRIGGER_TIMING_OFFSETS_V1.some(x=>x<0)&&L3_TRIGGER_TIMING_OFFSETS_V1.some(x=>x>0));
assert.equal(L3_TRIGGER_TIMING_ACTION_GRID_V1.length,126);

const out=runL3DynamicTriggerTimingRewardSupport({nCrossers:12,bankSeedBase:341000});
assert.ok(['L3_TRIGGER_TIMING_BINARY_REWARD_SUPPORT_DISCOVERED_V1','L3_TRIGGER_TIMING_NO_BINARY_REWARD_SUPPORT_V1'].includes(out.status));
assert.equal(out.population.partition,'FRESH_NON_SEALED_TRIGGER_TIMING_DIAGNOSTIC');
assert.equal(out.population.sameHiddenBankAcrossActions,true);
assert.equal(out.processCalibration.oracleScoring,'NONE');
assert.equal(out.actionSpace.total,126);
assert.equal(out.overall.attempts,1512);
assert.ok(out.overall.triggers>0,'trigger-timing exploration must yield physical shots');
assert.equal(out.overall.followThroughTriggers,out.overall.triggers,'every trigger must retain continued gun movement in this gate');
assert.equal(out.boundary.oracleUsage,'POST_TRIGGER_SCORE_ONLY');
assert.equal(out.antiCheat.startsWith('PASS_'),true);

console.log(JSON.stringify({suite:'ShotSight L3 shooter-visible dynamic trigger timing v1',status:out.status,population:out.population,actionSpace:out.actionSpace,processCalibration:out.processCalibration,overall:out.overall,rewardedActions:out.rewardedActions.slice(0,12),antiCheat:out.antiCheat},null,2));
console.log('virtual-shooter-dynamic-trigger-timing-v1: PASS');
