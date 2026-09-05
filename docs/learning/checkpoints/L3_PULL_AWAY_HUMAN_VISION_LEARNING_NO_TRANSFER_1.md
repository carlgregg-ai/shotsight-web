# ShotSight Virtual Shooter — L3 Human Vision Pull-Away Learning: No Held-Out Transfer 1

Date: 2026-09-05
Status: VERIFIED NEGATIVE LEARNING RESULT; ANTI-CHEAT GREEN

## Authoritative verification

- Branch: `virtual-shooter-v1`
- Verified HEAD: `44d701594e455de61475d98417782a5203106a17`
- Workflow: `ShotSight virtual shooter`
- Authoritative CI run: `33985663294`
- CI conclusion: `success`
- Full chained L0 -> L3 regression: GREEN

## Human Vision reward-support result

The first committed pull-away Human Vision reward-support gate established that engineering-proxy hits are possible without oracle leakage:

- attempts: 1,098
- learner-generated triggers: 772
- engineering-proxy hits: 4
- TRAIN_DEVELOPMENT: 0 / 366
- CALIBRATION_DEVELOPMENT: 4 / 366
- HELDOUT_DEVELOPMENT: 0 / 366

This is binary reward support, but it is sparse and strongly population-sensitive. It is not yet reproducible reward support across independent populations.

## First hit/miss memory-learning result

The first learner-side pull-away memory was deliberately simple: 61 learner-safe visual-separation actions, UCB1 exploration, and memory containing only action exposure counts plus binary hit counts.

Verified result:

- training attempts: 244
- training triggers: 117
- training hits: 1
- calibration candidate policies: 5
- calibration hits: 0 across all five 3-target candidate evaluations
- selected calibration separation: 0 rad by the predeclared tie-break
- development-held-out learned policy: 0 / 3
- development-held-out uniform no-memory comparator: 1 / 183
- learned-policy hit rate: 0
- uniform no-memory hit rate: 0.00546448087431694
- memory advantage: -0.00546448087431694
- `learningSignalObserved`: false

Experiment status: `L3_PULL_AWAY_HUMAN_VISION_NO_HELDOUT_LEARNING_SIGNAL_V1`.

## Scientific interpretation

This gate does **not** support a claim that Ellis has learned a transferable pull-away policy. A single training hit is insufficient, calibration supplied no positive discrimination, and the frozen learned policy did not beat the no-memory comparator on the development-held-out population.

The result must not be repaired by widening the 55 mm engineering proxy, importing referee miss distance, seeding the learner from known rewarded action identities, increasing oracle-derived feedback, or scaling directly to 100k presentations.

The immediate scientific uncertainty is upstream of large-scale learning: binary reward support itself may be too sparse and population-sensitive for a context-free one-dimensional memory to acquire a transferable policy.

## Anti-cheat status

GREEN.

- Learner memory imports no oracle, target physics, ballistic/intercept solver, scenario generator or referee evaluation module.
- Learner memory stores only selected visual-separation action counts and binary hit counts.
- Held-out targets are not used for policy selection.
- Oracle scoring occurs only after a learner-generated trigger.
- Exact future trajectory, range, intercept, pellet TOF, required lead, miss vector and direct correction remain unavailable to learner policy and memory.

## Score boundary

All hits remain `ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY` using the inherited 55 mm centreline-disc engineering proxy. This is not a validated shotgun shot-cloud or breakability model.

## Preserved negative finding

**A context-free one-dimensional visual-separation UCB1 memory did not demonstrate held-out learning in the first Human Vision pull-away experiment.**

This is a durable negative result and must remain visible even if later memory architectures succeed.

## Next operation

Before enriching memory or increasing presentation count, test binary reward-support reproducibility on several fresh, predeclared, independently seeded non-sealed development populations using the exact same learner-safe 61-point visual-separation action grid.

The replication diagnostic must:

1. make no policy selection from referee results;
2. keep the same action definition across every block;
3. oracle-score only after learner-generated trigger;
4. report hits and triggers for every fresh block;
5. preserve zero-hit blocks as valid scientific outcomes;
6. not promote any rewarded action identity into learner memory;
7. decide the subsequent architecture step from whether sparse reward is reproducible, not from a desired percentage.

Do not scale to the 100k existential bank until held-out learning and reward support are demonstrably robust enough to justify it.
