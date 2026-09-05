import assert from 'node:assert/strict';
import {createHitMissOnlyFeedback} from '../learning/hit-miss-memory-v1.mjs';
import {createShotQualityV1,createBinaryBreakQualityV1,createSatisfactionV1,createEllisExperienceRecordV1,createSelfDiagnosisV1,createInterventionRecordV1,auditExperienceRecordV1} from '../learning/ellis-experience-v1.mjs';

const sq=createShotQualityV1({lineRead:.9,connectionStability:.95,speedRelationshipStability:.9,separationControl:.88,jerkControl:.92,triggerCommitment:.85,followThrough:.95,methodTopology:.93});
assert.ok(sq.score>89&&sq.score<94);
const missBQ=createBinaryBreakQualityV1({hit:false,observationConfidence:.9});
const hitBQ=createBinaryBreakQualityV1({hit:true,observationConfidence:.9});
const missSS=createSatisfactionV1({shotQuality:sq,breakQuality:missBQ});
const hitSS=createSatisfactionV1({shotQuality:sq,breakQuality:hitBQ});
assert.ok(missSS.score>50,'high-quality miss should retain meaningful process satisfaction');
assert.ok(hitSS.score>missSS.score,'break must add outcome value');
assert.equal(createSatisfactionV1({shotQuality:sq,breakQuality:hitBQ,enabled:false}).score,null);

const diagnosis=createSelfDiagnosisV1({hypothesis:'execution stable; current relationship hypothesis remains uncertain',evidence:'line read and connection were stable but no visible break',confidence:.62,keepFixed:'connection and follow-through routine',changeVariable:'separation development',reason:'structured exploration after a high-quality miss',falsifier:'repeated similar attempts do not improve binary breaks'});
const record=createEllisExperienceRecordV1({episodeIndex:12,before:{belief:{family:'CROSSER',confidence:.73},method:'PULL_AWAY',reason:'primary learning hypothesis with controlled separation exploration'},during:{connectionStable:true,speedMatchQuality:.88,separationControl:.9,triggerReason:'planned region reached',followThrough:true},outcome:createHitMissOnlyFeedback({hit:false}),shotQuality:sq,breakQuality:missBQ,satisfaction:missSS,selfDiagnosis:diagnosis});
assert.equal(auditExperienceRecordV1(record).status,'PASS');
assert.ok(Object.isFrozen(record));
assert.throws(()=>{record.before.method='MAINTAINED_LEAD';},TypeError);

const intervention=createInterventionRecordV1({parentEpisodeIndices:[10,11,12],hypothesis:diagnosis.hypothesis,changedVariable:'separation development',fixedVariables:['connection','visual focus','trigger routine'],comparisonWindow:5});
assert.equal(intervention.decision,'PENDING');

for(const forbidden of [
  {range_m:31},{missVector_W:[1,0,0]},{pelletTOF_s:.08},{requiredLead:.12},{oracleAction:'MOVE_RIGHT'},
  {targetInitial_W:[0,0,0]},{targetVelocity_W:[1,0,0]},{exactIntercept:[1,2,3]},
  {targetSeed:371001},{scenarioSeed:371001},{missDistance_m:.19},{missDistance:.19},{trueRange_m:33},
  {requiredLead_rad:.08},{requiredLead_m:1.2},{futureTrajectory:[[0,0,0]]},{exactFuturePath:[[0,0,0]]},
  {oracleCorrection:'MORE_LEAD'},{correctionDirection:'RIGHT'},{directCorrection:'MOVE_RIGHT'},{exactTargetState:{x:1}}
]){
  assert.throws(()=>createEllisExperienceRecordV1({episodeIndex:1,before:{belief:{...forbidden}},during:{},outcome:createHitMissOnlyFeedback({hit:false}),shotQuality:sq,breakQuality:missBQ,satisfaction:missSS}),/PRIVILEGED_STATE_LEAK/);
}

const poorSQ=createShotQualityV1({lineRead:.3,connectionStability:.3,speedRelationshipStability:.3,separationControl:.2,jerkControl:.2,triggerCommitment:.4,followThrough:.3,methodTopology:.3});
const lucky=createSatisfactionV1({shotQuality:poorSQ,breakQuality:hitBQ});
assert.ok(lucky.score<hitSS.score,'lucky poor-process hit must not outrank coherent good-process hit');

console.log(JSON.stringify({status:'PASS',schema:'ELLIS_EXPERIENCE_TEST_V1',shotQuality:sq.score,highQualityMissSatisfaction:missSS.score,highQualityHitSatisfaction:hitSS.score,luckyPoorProcessHitSatisfaction:lucky.score,antiCheat:'PASS',immutability:'PASS',binaryTruthPreserved:true,privilegedAliasProbes:21},null,2));
