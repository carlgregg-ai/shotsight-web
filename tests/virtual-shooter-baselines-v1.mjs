import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanonicalFlatCrosserScenario} from '../physics/canonical-flat-crosser-v1.mjs';
import {apparentAnglesFromCameraVector,mulMat3Vec3} from '../physics/projection-gun-v1.mjs';
import {createShooterObservation,assertNoPrivilegedShooterData} from '../learning/virtual-shooter-boundary-v1.mjs';
import {createNaiveNoLearningAction,apparentAnglesToWorldUnit,L0_PUBLIC_CAMERA_R_CW} from '../learning/naive-shooter-v1.mjs';
import {buildHiddenOracleFrames,createOracleCeilingAction,evaluateOracleShot,runNaiveBaselineEpisode,runL0BaselineBenchmark,L0_SCORE_STATUS} from '../learning/oracle-evaluation-v1.mjs';

// Learner-facing naive shooter must remain structurally independent of physics/oracle modules.
const naiveSource=fs.readFileSync(new URL('../learning/naive-shooter-v1.mjs',import.meta.url),'utf8');
assert.equal(/\.\.\/physics\//.test(naiveSource),false,'naive shooter imports privileged physics');
assert.equal(/oracle-evaluation/.test(naiveSource),false,'naive shooter imports oracle evaluator');

// Coordinate-contract gate: world -> camera -> apparent angles -> learner-safe inverse
// must round-trip. This specifically protects the positive-up elevation convention
// against the historical +Y/-Y sign error.
const worldUnit0=[0.2017733089221273,0.968511882826211,0.14527778242393165];
const cameraUnit0=mulMat3Vec3(L0_PUBLIC_CAMERA_R_CW,worldUnit0);
const apparent0=apparentAnglesFromCameraVector(cameraUnit0);
assert(apparent0.el_rad>0,'positive world-up target must have positive apparent elevation');
const roundTrip=apparentAnglesToWorldUnit({...apparent0});
const dot=worldUnit0[0]*roundTrip[0]+worldUnit0[1]*roundTrip[1]+worldUnit0[2]*roundTrip[2];
assert(dot>1-1e-12,`apparent-angle round trip failed: dot=${dot}`);
assert(roundTrip[2]>0,'positive apparent elevation must reconstruct positive world-up bore');

const scenario=createCanonicalFlatCrosserScenario();
const frames=buildHiddenOracleFrames(scenario,{duration_s:0.8,frameRate_hz:120});
const observations=[];for(let i=0;i<20;i++){const now=0.30+i*0.025;observations.push(createShooterObservation({oracleFrames:frames,now_s:now,latency_s:0.08,seed:900+i,context:{trapRegionKnown:true}}));}
const action=createNaiveNoLearningAction(observations,{decisionTime_s:0.8});
assert.equal(action.schema,'SHOOTER_ACTION_V1');assert.equal(action.trigger,true);assert.equal(assertNoPrivilegedShooterData(action,{path:'action'}),true);
assert.equal(Object.hasOwn(action,'physicalLead_m'),false);assert.equal(Object.hasOwn(action,'pelletTOF_s'),false);

const oracleAction=createOracleCeilingAction({scenario,shotTime_s:0.8});
const oracleScore=evaluateOracleShot({scenario,shotTime_s:0.8,bore_W:oracleAction.actionBore_W});
assert.equal(oracleScore.status,L0_SCORE_STATUS);assert.equal(oracleScore.proxyHit,true);assert(oracleScore.missDistance_m<1e-6,`oracle miss ${oracleScore.missDistance_m}`);

const naiveEpisode=runNaiveBaselineEpisode({scenario,decisionTime_s:0.8,seed:1234});
assert.equal(naiveEpisode.audit.status,'PASS');assert.equal(naiveEpisode.audit.privilegedFieldAccess,0);assert.equal(naiveEpisode.score.status,L0_SCORE_STATUS);assert(Number.isFinite(naiveEpisode.score.missDistance_m));

const benchmark=runL0BaselineBenchmark({seedBase:20260905});
assert.equal(benchmark.status,'L0_BASELINE_BENCHMARK_V1');assert.equal(benchmark.oracle.n,12);assert.equal(benchmark.naive.n,12);assert.equal(benchmark.oracle.proxyHitRate,1);
assert(benchmark.naive.meanMissDistance_m>benchmark.oracle.meanMissDistance_m+0.01,'naive baseline unexpectedly matches oracle ceiling');
assert(benchmark.naive.proxyHitRate<benchmark.oracle.proxyHitRate,'naive baseline should remain below privileged oracle ceiling');

console.log(JSON.stringify({suite:'ShotSight virtual shooter L0 baselines v1',status:'PASS',coordinateRoundTripDot:dot,benchmark},null,2));
