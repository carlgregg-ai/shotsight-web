import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runL3PullAwayContextualEpisodicMemoryV1} from '../learning/pull-away-contextual-episodic-evaluation-v1.mjs';

// Revision gate for the first contextual/episodic memory attempt.
// This gate deliberately preserves the verified negative held-out result and prevents it
// being promoted into a learning proof. It is a decision gate for the next architecture pass,
// not a claim that Ellis has learned to shoot.

const memorySource=fs.readFileSync(new URL('../learning/pull-away-contextual-episodic-memory-v1.mjs',import.meta.url),'utf8');
const evaluationSource=fs.readFileSync(new URL('../learning/pull-away-contextual-episodic-evaluation-v1.mjs',import.meta.url),'utf8');
const learnerImports=memorySource.split('\n').filter(line=>/^\s*import\s/.test(line)).join('\n');
for(const forbidden of ['oracle-evaluation','target-engine','canonical-flat-crosser','ballistics','intercept','multifamily-evaluation','pull-away-human-vision-evaluation','human-visual-acquisition']){
  assert.equal(learnerImports.includes(forbidden),false,`contextual learner memory must not import ${forbidden}`);
}

const result=runL3PullAwayContextualEpisodicMemoryV1({
  nCrossersPerPartition:4,
  adaptiveEpisodes:244,
  evaluationRepetitions:61
});

assert.equal(result.scoreBoundary,'ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY');
assert.equal(result.status,'L3_CONTEXTUAL_EPISODIC_MEMORY_NO_HELDOUT_ADVANTAGE_V1');
assert.equal(result.heldout.learningSignalObserved,false);
assert.equal(result.heldout.advantageVsContextFree,0);
assert.ok(result.heldout.contextual.hitRate>=result.heldout.noMemoryUniform.hitRate);
assert.ok(result.training.contextualMemory.contextCount>=1);
assert.ok(result.training.contextualMemory.contextCount<=2,'V1 context remains too coarse/sparse for a transfer claim');
assert.ok(result.heldout.unseenContextBackoffs>0,'V1 has unseen held-out context backoffs that require revision');
assert.ok(result.calibration.contextual.hitRate>result.calibration.contextFree.hitRate,'Calibration improvement exists but is not transferable proof');

for(const forbidden of ['missDistance','requiredLead','pelletTof','targetSeed','futurePath','intercept']){
  assert.equal(memorySource.includes(forbidden),false,`learner memory source must not contain ${forbidden}`);
}
assert.ok(evaluationSource.includes('NO TARGET SEED/ID/RANGE/FUTURE PATH/INTERCEPT/PELLET TOF/MISS VECTOR/REQUIRED LEAD/ORACLE ACTION'));

console.log(JSON.stringify({
  status:'PASS',
  schema:'L3_PULL_AWAY_CONTEXTUAL_EPISODIC_REVISION_DECISION_GATE_V1',
  experimentStatus:'L3_CONTEXTUAL_EPISODIC_MEMORY_REVISION_REQUIRED_V1',
  preservedNegative:result.status,
  training:{
    blockedAttempts:result.training.blockedAttempts,
    adaptiveEpisodes:result.training.adaptiveEpisodes,
    contextCount:result.training.contextualMemory.contextCount,
    contextualHits:result.training.contextualHits,
    contextFreeHits:result.training.contextFreeHits
  },
  calibration:result.calibration,
  heldout:result.heldout,
  revisionDiagnosis:{
    rewardExistsElsewhere:true,
    heldoutAdvantageVsContextFree:result.heldout.advantageVsContextFree,
    unseenContextBackoffs:result.heldout.unseenContextBackoffs,
    contextRepresentation:'TOO_COARSE_EARLY_CATEGORICAL_DIRECTION_SPEED_ACQUISITION_OBSERVATION_ONLY',
    nextGate:'DESIGN_REVISED_LEARNER_SAFE_CONTEXTUAL_OR_EPISODIC_MEMORY_BEFORE_REPLICATION_OR_100K_SCALE'
  },
  allowedNextContextCandidates:[
    'acquisition_phase',
    'visual_confidence_band',
    'presentation_progress_or_remaining_runway_band',
    'method_process_phase',
    'learner_visible_connection_quality',
    'learner_visible_speed_match_quality',
    'good_shot_episode_trace_features',
    'similarity_weighted_episodic_recall'
  ],
  antiCheat:result.antiCheat,
  prohibitions:[
    'DO_NOT_COPY_REWARDED_ACTION_IDENTITIES',
    'DO_NOT_EXPOSE_TARGET_SEED_OR_ID',
    'DO_NOT_EXPOSE_RANGE_FUTURE_PATH_INTERCEPT_PELLET_TOF_MISS_VECTOR_REQUIRED_LEAD_OR_ORACLE_ACTION',
    'DO_NOT_WIDEN_ENGINEERING_PROXY',
    'DO_NOT_AUTHORISE_100K_SCALE'
  ],
  limitations:result.limitations
},null,2));
