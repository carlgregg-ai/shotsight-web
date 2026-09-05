import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runL3DynamicCouplingRewardSupport} from '../learning/dynamic-perceptual-coupling-evaluation-v1.mjs';

const controllerSource=fs.readFileSync(new URL('../learning/dynamic-perceptual-coupling-v1.mjs',import.meta.url),'utf8');
for(const forbidden of ['oracle-evaluation','../physics/','missDistance','missVector','targetSeed','requiredLead','exactIntercept','pelletTOF','physicalLead_m'])assert.equal(controllerSource.includes(forbidden),false,`dynamic coupling controller must not contain/import ${forbidden}`);

const out=runL3DynamicCouplingRewardSupport({nCrossers:10,bankSeedBase:331000});
console.log(JSON.stringify(out,null,2));
assert.ok(['L3_DYNAMIC_COUPLING_BINARY_REWARD_SUPPORT_DISCOVERED_V1','L3_DYNAMIC_COUPLING_NO_BINARY_REWARD_SUPPORT_V1'].includes(out.status));
assert.equal(out.population.partition,'FRESH_TRAINING_CALIBRATION_DIAGNOSTIC_NOT_SEALED_TEST');
assert.equal(out.population.sameHiddenBankAcrossActions,true);
assert.equal(out.actionSpace.count,55);
assert.equal(out.overall.attempts,550);
assert.ok(out.overall.triggers>0,'dynamic coupling diagnostic must produce physical trigger opportunities');
assert.ok(out.overall.followThroughTriggers>0,'triggered dynamic coupling episodes must continue gun motion after trigger');
assert.equal(out.antiCheat.startsWith('PASS_'),true);
assert.equal(out.boundary.oracleUsage,'POST_TRIGGER_SCORE_ONLY');
console.log('virtual-shooter-dynamic-perceptual-coupling-v1: PASS');
