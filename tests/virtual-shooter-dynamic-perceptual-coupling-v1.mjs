import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runL3DynamicCouplingRewardSupport} from '../learning/dynamic-perceptual-coupling-evaluation-v1.mjs';

const controllerSource=fs.readFileSync(new URL('../learning/dynamic-perceptual-coupling-v1.mjs',import.meta.url),'utf8');
for(const forbidden of ['oracle-evaluation','../physics/','missDistance','missVector','targetSeed','requiredLead','exactIntercept','pelletTOF','physicalLead_m'])assert.equal(controllerSource.includes(forbidden),false,`dynamic coupling controller must not contain/import ${forbidden}`);

const out=runL3DynamicCouplingRewardSupport({nCrossers:10,bankSeedBase:331000});
assert.ok(['L3_DYNAMIC_COUPLING_BINARY_REWARD_SUPPORT_DISCOVERED_V1','L3_DYNAMIC_COUPLING_NO_BINARY_REWARD_SUPPORT_V1'].includes(out.status));
assert.equal(out.processCalibration.partition,'PROCESS_ONLY_NON_SEALED_CALIBRATION');
assert.equal(out.processCalibration.oracleScoring,'NONE');
assert.ok(Number.isFinite(out.processCalibration.frozenRelationshipTolerance_rad));
assert.equal(out.population.partition,'FRESH_TRAINING_CALIBRATION_DIAGNOSTIC_NOT_SEALED_TEST');
assert.equal(out.population.sameHiddenBankAcrossActions,true);
assert.equal(out.population.distinctFromProcessCalibration,true);
assert.equal(out.actionSpace.count,55);
assert.equal(out.overall.attempts,550);
assert.ok(out.overall.triggers>0,'dynamic coupling diagnostic must produce physical trigger opportunities');
assert.ok(out.overall.followThroughTriggers>0,'triggered dynamic coupling episodes must continue gun motion after trigger');
assert.equal(out.antiCheat.startsWith('PASS_'),true);
assert.equal(out.boundary.oracleUsage,'POST_TRIGGER_SCORE_ONLY');

console.log(JSON.stringify({
  suite:'ShotSight L3 dynamic perceptual coupling concise result v1',
  status:out.status,
  processCalibration:{
    partition:out.processCalibration.partition,
    oracleScoring:out.processCalibration.oracleScoring,
    processRuns:out.processCalibration.processRuns,
    commitRuns:out.processCalibration.commitRuns,
    speedMatchedCommitRuns:out.processCalibration.speedMatchedCommitRuns,
    quantileLevel:out.processCalibration.quantileLevel,
    rawRelationshipTolerance_rad:out.processCalibration.rawRelationshipTolerance_rad,
    frozenRelationshipTolerance_rad:out.processCalibration.frozenRelationshipTolerance_rad
  },
  rewardPopulation:out.population,
  overall:out.overall,
  rewardedActions:out.rewardedActions,
  researcherClosestAction:out.researcherClosestAction,
  processGateDiagnosis:out.processGateDiagnosis,
  antiCheat:out.antiCheat
},null,2));
console.log('virtual-shooter-dynamic-perceptual-coupling-v1: PASS');
