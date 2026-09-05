import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildL3LowDiscrepancyRelationshipActions,runL3ContinuousRelationshipRewardSupport} from '../learning/dynamic-continuous-relationship-evaluation-v1.mjs';

const actions=buildL3LowDiscrepancyRelationshipActions({count:128});
assert.equal(actions.length,128);
assert.ok(actions.every(a=>a.forwardRelationship_rad>=0&&a.forwardRelationship_rad<=0.12));
assert.ok(actions.every(a=>a.lineNormalRelationship_rad>=-0.04&&a.lineNormalRelationship_rad<=0.04));

const out=runL3ContinuousRelationshipRewardSupport({nCrossers:8,bankSeedBase:361000,lowDiscrepancyActionCount:128});
assert.equal(out.population.partition,'FRESH_TRAINING_CALIBRATION_DIAGNOSTIC_NOT_SEALED_TEST');
assert.equal(out.population.bankSeedBase,361000);
assert.equal(out.population.nCrossers,8);
assert.equal(out.sampling.type,'DETERMINISTIC_HALTON_BASE2_BASE3');
assert.equal(out.sampling.definitionUsesOracleOutcome,false);
assert.equal(out.sampling.definitionUsesMissDistance,false);
assert.equal(out.sampling.definitionUsesRange,false);
assert.equal(out.sampling.definitionUsesIntercept,false);
assert.equal(out.processCalibration.oracleScoring,'NONE');
assert.equal(out.quasiContinuous.attempts,1024);
assert.equal(out.coarseBaseline.attempts,440);
assert.ok(out.quasiContinuous.triggers>0,'quasi-continuous diagnostic must produce physical triggers');
assert.ok(out.quasiContinuous.followThroughTriggers>0,'triggered quasi-continuous episodes must follow through');
assert.equal(out.boundary.oracleUsage,'POST_TRIGGER_SCORE_ONLY');
assert.equal(out.antiCheat.startsWith('PASS_'),true);

const rewardSupport=out.status==='L3_CONTINUOUS_RELATIONSHIP_BINARY_REWARD_SUPPORT_DISCOVERED_V1';
if(process.env.GITHUB_OUTPUT){
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`reward_support=${rewardSupport?'true':'false'}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`hits=${out.quasiContinuous.hits}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`triggers=${out.quasiContinuous.triggers}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`coarse_hits=${out.coarseBaseline.hits}\n`);
}

console.log(JSON.stringify({
  suite:'ShotSight L3 quasi-continuous relationship reward-support v1',
  status:out.status,
  population:out.population,
  sampling:out.sampling,
  quasiContinuous:out.quasiContinuous,
  coarseBaseline:out.coarseBaseline,
  antiCheat:out.antiCheat
},null,2));
console.log('virtual-shooter-continuous-relationship-reward-v1: PASS');
