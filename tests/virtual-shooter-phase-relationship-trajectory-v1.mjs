import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildL3PhaseDependentRelationshipTrajectories,runL3PhaseDependentRelationshipRewardSupport} from '../learning/dynamic-relationship-trajectory-evaluation-v1.mjs';

const trajectories=buildL3PhaseDependentRelationshipTrajectories({count:128});
assert.equal(trajectories.length,128);
assert.ok(trajectories.every(t=>t.schema==='SHOOTER_VISIBLE_RELATIONSHIP_TRAJECTORY_V1'));
assert.ok(trajectories.every(t=>t.connectionForward_rad>0&&t.connectionForward_rad<0.12));
assert.ok(trajectories.every(t=>t.breakForward_rad>0&&t.breakForward_rad<0.12));
assert.ok(trajectories.every(t=>Math.abs(t.connectionNormal_rad)<0.04&&Math.abs(t.breakNormal_rad)<0.04));

const out=runL3PhaseDependentRelationshipRewardSupport({nCrossers:8,bankSeedBase:371000,trajectoryCount:128,constantActionCount:128});
assert.equal(out.population.partition,'FRESH_TRAINING_CALIBRATION_DIAGNOSTIC_NOT_SEALED_TEST');
assert.equal(out.population.bankSeedBase,371000);
assert.equal(out.population.nCrossers,8);
assert.equal(out.population.sameHiddenBankAcrossActionSets,true);
assert.equal(out.representation.schema,'SHOOTER_VISIBLE_RELATIONSHIP_TRAJECTORY_V1');
assert.equal(out.representation.definitionUsesOracleOutcome,false);
assert.equal(out.representation.definitionUsesMissDistance,false);
assert.equal(out.representation.definitionUsesRange,false);
assert.equal(out.representation.definitionUsesIntercept,false);
assert.equal(out.representation.definitionUsesPelletTof,false);
assert.equal(out.processCalibration.oracleScoring,'NONE');
assert.equal(out.phaseDependent.attempts,1024);
assert.equal(out.constantBaseline.attempts,1024);
assert.ok(out.phaseDependent.triggers>0,'phase-dependent diagnostic must produce physical triggers');
assert.ok(out.phaseDependent.followThroughTriggers>0,'triggered phase-dependent episodes must follow through');
assert.equal(out.boundary.oracleUsage,'POST_TRIGGER_SCORE_ONLY');
assert.equal(out.antiCheat.startsWith('PASS_'),true);

const rewardSupport=out.status==='L3_PHASE_DEPENDENT_RELATIONSHIP_BINARY_REWARD_SUPPORT_DISCOVERED_V1';
if(process.env.GITHUB_OUTPUT){
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`reward_support=${rewardSupport?'true':'false'}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`hits=${out.phaseDependent.hits}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`triggers=${out.phaseDependent.triggers}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`constant_hits=${out.constantBaseline.hits}\n`);
}

console.log(JSON.stringify({
  suite:'ShotSight L3 phase-dependent relationship trajectory reward-support v1',
  status:out.status,
  population:out.population,
  representation:out.representation,
  phaseDependent:out.phaseDependent,
  constantBaseline:out.constantBaseline,
  antiCheat:out.antiCheat
},null,2));
console.log('virtual-shooter-phase-relationship-trajectory-v1: PASS');
