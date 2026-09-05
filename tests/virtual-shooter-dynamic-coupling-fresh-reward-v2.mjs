import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runL3DynamicCouplingRewardSupport} from '../learning/dynamic-perceptual-coupling-evaluation-v1.mjs';

// Fresh, non-sealed reward-support bank reserved for the post geometry/time-alignment audit.
// This is deliberately separate from the process-only calibration bank and prior 331000 reward bank.
const out=runL3DynamicCouplingRewardSupport({nCrossers:12,bankSeedBase:351000});

assert.equal(out.processCalibration.partition,'PROCESS_ONLY_NON_SEALED_CALIBRATION');
assert.equal(out.processCalibration.oracleScoring,'NONE');
assert.equal(out.population.partition,'FRESH_TRAINING_CALIBRATION_DIAGNOSTIC_NOT_SEALED_TEST');
assert.equal(out.population.bankSeedBase,351000);
assert.equal(out.population.nCrossers,12);
assert.equal(out.population.sameHiddenBankAcrossActions,true);
assert.equal(out.population.distinctFromProcessCalibration,true);
assert.equal(out.actionSpace.count,55);
assert.equal(out.overall.attempts,660);
assert.ok(out.overall.triggers>0,'fresh corrected-coupling diagnostic must produce physical trigger opportunities');
assert.ok(out.overall.followThroughTriggers>0,'triggered episodes must continue gun motion after trigger');
assert.equal(out.antiCheat.startsWith('PASS_'),true);
assert.equal(out.boundary.oracleUsage,'POST_TRIGGER_SCORE_ONLY');

const rewardSupport=out.status==='L3_DYNAMIC_COUPLING_BINARY_REWARD_SUPPORT_DISCOVERED_V1';
if(process.env.GITHUB_OUTPUT){
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`reward_support=${rewardSupport?'true':'false'}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`hits=${out.overall.hits}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`triggers=${out.overall.triggers}\n`);
}

console.log(JSON.stringify({
  suite:'ShotSight L3 fresh corrected dynamic-coupling reward-support diagnostic v2',
  status:out.status,
  population:out.population,
  overall:out.overall,
  rewardedActions:out.rewardedActions,
  researcherClosestAction:out.researcherClosestAction,
  processGateDiagnosis:out.processGateDiagnosis,
  antiCheat:out.antiCheat
},null,2));
console.log('virtual-shooter-dynamic-coupling-fresh-reward-v2: PASS');
