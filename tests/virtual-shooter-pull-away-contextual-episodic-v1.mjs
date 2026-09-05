import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runL3PullAwayContextualEpisodicMemoryV1,buildEarlyPullAwayLearnerContextV1} from '../learning/pull-away-contextual-episodic-evaluation-v1.mjs';
import {createContextualPullAwayMemoryV1,L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V1} from '../learning/pull-away-contextual-episodic-memory-v1.mjs';
import {createL1MultiFamilyBank} from '../learning/multifamily-evaluation-v1.mjs';

const source=fs.readFileSync(new URL('../learning/pull-away-contextual-episodic-memory-v1.mjs',import.meta.url),'utf8');
const imports=source.split('\n').filter(line=>/^\s*import\s/.test(line)).join('\n');
for(const forbidden of ['oracle-evaluation','target-engine','canonical-flat-crosser','ballistics','intercept','multifamily-evaluation','pull-away-human-vision-evaluation','human-visual-acquisition'])assert.equal(imports.includes(forbidden),false,`learner contextual memory must not import ${forbidden}`);
const memory=createContextualPullAwayMemoryV1();
assert.equal(memory.globalArms.length,61);assert.deepEqual(memory.globalArms.map(a=>a.separation_rad),L3_CONTEXTUAL_PULL_AWAY_ACTION_GRID_V1);
const record=createL1MultiFamilyBank({nPerFamily:2,seedBase:419000}).find(r=>r.family==='CROSSER');
const context=buildEarlyPullAwayLearnerContextV1(record,419001);
assert.equal(context.schema,'PULL_AWAY_LEARNER_CONTEXT_V1');
for(const forbidden of ['seed','range','future','intercept','miss','lead','tof','scenario'])assert.equal(JSON.stringify(context).toLowerCase().includes(forbidden),false,`context must not expose ${forbidden}`);

// Development-sized, still non-sealed experiment. This is large enough to exercise the known
// sparse reward regime without unlocking the 100k existential bank. A positive result remains
// a development signal requiring independent replication; a negative result is preserved.
const result=runL3PullAwayContextualEpisodicMemoryV1({nCrossersPerPartition:4,adaptiveEpisodes:244,evaluationRepetitions:61});
assert.equal(result.scoreBoundary,'ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY');
assert.equal(result.training.blockedAttempts,244);assert.equal(result.training.adaptiveEpisodes,244);assert.ok(result.training.contextualMemory.contextCount>=1);
assert.equal(result.calibration.attempts,244);assert.equal(result.heldout.attempts,244);
assert.ok(['L3_CONTEXTUAL_EPISODIC_MEMORY_HELDOUT_ADVANTAGE_V1','L3_CONTEXTUAL_EPISODIC_MEMORY_NO_HELDOUT_ADVANTAGE_V1'].includes(result.status));
assert.equal(result.heldout.learningSignalObserved,result.status==='L3_CONTEXTUAL_EPISODIC_MEMORY_HELDOUT_ADVANTAGE_V1');
console.log(JSON.stringify({status:'PASS',schema:'L3_PULL_AWAY_CONTEXTUAL_EPISODIC_MEMORY_DEVELOPMENT_GATE_V1',experimentStatus:result.status,training:{blockedAttempts:result.training.blockedAttempts,adaptiveEpisodes:result.training.adaptiveEpisodes,contextCount:result.training.contextualMemory.contextCount,contextualHits:result.training.contextualHits,contextFreeHits:result.training.contextFreeHits},calibration:result.calibration,heldout:result.heldout,antiCheat:result.antiCheat,limitations:result.limitations},null,2));
