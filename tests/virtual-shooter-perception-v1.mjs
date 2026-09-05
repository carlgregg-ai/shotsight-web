import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanonicalFlatCrosserScenario} from '../physics/canonical-flat-crosser-v1.mjs';
import {createShooterObservation,assertNoPrivilegedShooterData} from '../learning/virtual-shooter-boundary-v1.mjs';
import {buildHiddenOracleFrames} from '../learning/oracle-evaluation-v1.mjs';
import {buildStableCrosserBelief} from '../learning/crosser-belief-v1.mjs';
import {runL1StableCrosserBenchmark} from '../learning/perception-evaluation-v1.mjs';

const learnerSource=fs.readFileSync(new URL('../learning/crosser-belief-v1.mjs',import.meta.url),'utf8');
assert.equal(/\.\.\/physics\//.test(learnerSource),false,'belief model imports privileged physics');
assert.equal(/oracle-evaluation|perception-evaluation/.test(learnerSource),false,'belief model imports referee module');

const scenario=createCanonicalFlatCrosserScenario();const frames=buildHiddenOracleFrames(scenario,{duration_s:1,frameRate_hz:120});
const observations=[];for(let i=0;i<18;i++){const t=0.33+i/60;observations.push(createShooterObservation({oracleFrames:frames,now_s:t,latency_s:0.08,seed:700+i,context:{trapRegionKnown:true}}));}
const belief=buildStableCrosserBelief(observations,{predictionHorizon_s:0.12,maxHistory_s:0.30});
assert.equal(belief.status,'STABLE_CROSSER_BELIEF');assert.equal(assertNoPrivilegedShooterData(belief,{path:'belief'}),true);assert(belief.confidence>=0&&belief.confidence<1);assert(Math.abs(belief.directionProb.LEFT+belief.directionProb.RIGHT-1)<1e-12);assert(belief.prediction.azSd_rad>0);

const benchmark=runL1StableCrosserBenchmark({seedBase:20260905});
assert.equal(benchmark.status,'L1_STABLE_CROSSER_BENCHMARK_V1');
for(const name of ['CLEAR','SHORT','NOISY']){const m=benchmark.conditions[name];assert.equal(m.n,12);assert(m.validN>0);assert(Number.isFinite(m.directionAccuracy));assert(Number.isFinite(m.azRmse_rad));assert(m.meanConfidence>=0&&m.meanConfidence<1);}
assert(benchmark.conditions.CLEAR.directionAccuracy>=0.9,'clear direction reading unexpectedly poor');
assert(benchmark.conditions.SHORT.meanConfidence<benchmark.conditions.CLEAR.meanConfidence,'shorter evidence window did not reduce confidence');
assert(benchmark.conditions.NOISY.meanConfidence<benchmark.conditions.CLEAR.meanConfidence,'noisier evidence did not reduce confidence');
assert(benchmark.conditions.CLEAR.azRmse_rad<0.03,'clear short-horizon apparent-path prediction too inaccurate for L1 stable crossers');

console.log(JSON.stringify({suite:'ShotSight virtual shooter L1 perception v1',status:'PASS',benchmark},null,2));
