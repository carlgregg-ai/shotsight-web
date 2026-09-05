import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runL3MaintainedLeadNoLearningBenchmark,L3_EXPLORATORY_STATIC_SEPARATIONS_RAD} from '../learning/maintained-lead-evaluation-v1.mjs';

const learnerSource=fs.readFileSync(new URL('../learning/maintained-lead-baseline-v1.mjs',import.meta.url),'utf8');
for(const forbidden of ['oracle-evaluation','../physics/','physicalLead_m','pelletTOF_s','requiredLead','exactIntercept'])assert.equal(learnerSource.includes(forbidden),false,`learner-side L3 module must not contain/import ${forbidden}`);

const out=runL3MaintainedLeadNoLearningBenchmark({nCrossers:24,trainNPerFamily:48,trainSeedBase:41000,heldoutSeedBase:131000});
console.log(JSON.stringify(out,null,2));
assert.equal(out.status,'L3_MAINTAINED_LEAD_NO_LEARNING_BASELINE_V1');
assert.equal(out.heldout.sameHiddenBankAcrossSeparations,true);
assert.equal(out.staticSeparationSweep.values_rad.length,L3_EXPLORATORY_STATIC_SEPARATIONS_RAD.length);
const rows=Object.values(out.staticSeparationSweep.conditions);
assert.equal(rows.length,6);
assert.ok(rows.every(r=>r.n===24&&r.triggerRate>=0&&r.triggerRate<=1&&r.proxyHitRateAll>=0&&r.proxyHitRateAll<=1));
assert.ok(rows.some(r=>r.triggers>0),'at least one predeclared static picture must exercise the trigger→oracle score path');
const finiteMisses=rows.map(r=>r.meanMissDistance_m).filter(Number.isFinite);
assert.ok(finiteMisses.length>0,'triggered shots must produce finite post-action referee miss distances');
assert.ok(Math.max(...finiteMisses)-Math.min(...finiteMisses)>1e-6,'different static visual separations should produce measurably different referee outcomes');
assert.equal(out.antiCheat.includes('SCORES ONLY AFTER TRIGGER'),true);
assert.equal(out.poorObservationAt0045.n,24);

console.log('virtual-shooter-maintained-lead-baseline-v1: PASS');
