# ShotSight Virtual Shooter — L3 Human Vision Pull-Away Reward Replication Green 1

Date: 2026-09-05
Status: VERIFIED REWARD-SUPPORT REPLICATION; LEARNING GATE STILL NEGATIVE

## Authoritative verification

- Branch: `virtual-shooter-v1`
- Verified code/workflow HEAD: `311599eff16d335c2137851bada2b692b1e379a1`
- Workflow: `ShotSight virtual shooter`
- Authoritative CI run: `33988682722`
- CI conclusion: `success`
- Full L0 -> L3 chained regression: GREEN
- New CI step: `Run L3 pull-away Human Vision reward-support replication gate`

## Replication result

The same predeclared 61-point learner-safe visual-separation grid was run on four fresh independently seeded, non-sealed crosser blocks. The referee did not select or tune a learner policy from these results.

Overall:

- blocks: 4
- blocks with at least one engineering-proxy hit: 3
- attempts: 976
- learner-generated triggers: 730
- engineering-proxy hits: 4

By block:

- REPLICATION_A / seed 401000: 244 attempts, 244 triggers, 2 hits
- REPLICATION_B / seed 402000: 244 attempts, 244 triggers, 1 hit
- REPLICATION_C / seed 403000: 244 attempts, 123 triggers, 0 hits
- REPLICATION_D / seed 404000: 244 attempts, 119 triggers, 1 hit

Experiment status: `L3_PULL_AWAY_HUMAN_VISION_REWARD_SUPPORT_REPLICATED_MULTIPLE_FRESH_BLOCKS_V1`.

## Interpretation

Binary engineering-proxy reward support under the Human Vision constrained pull-away policy is no longer confined to the earlier calibration population. It occurred on three independently seeded fresh development blocks.

This is a meaningful architecture result: the legal learner action space contains rewarded outcomes on multiple target populations without exposing oracle lead, exact future path, miss gradient, target seed identity or direct corrective action.

It is **not** a learning proof. Reward remains sparse, one block still produced zero hits, and the previously verified one-dimensional UCB1 memory still failed development-held-out transfer.

The rewarded visual-separation identities observed here are referee-side diagnostic observations only. They must not be copied into Ellis memory or used to initialise a preferred learner action.

## Anti-cheat status

GREEN.

- Human Vision constrained pull-away policy unchanged.
- Same predeclared action grid used on every block.
- Oracle score occurs only after a learner-generated trigger.
- No oracle miss distance, intercept, range, pellet TOF, required lead or oracle action defines or ranks the grid.
- Replication diagnostic performs no learner policy selection.

## Score boundary

All hits remain `ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY` using the 55 mm centreline-disc engineering proxy. This does not validate realistic shotgun pattern density, pellet-cloud probability or clay breakability.

## Preserved negative result

The immediately preceding learning checkpoint remains authoritative:

`L3_PULL_AWAY_HUMAN_VISION_NO_HELDOUT_LEARNING_SIGNAL_V1`

Training produced 1 hit in 244 attempts, the learned policy produced 0/3 on development-heldout, and the no-memory uniform comparator produced 1/183. Memory advantage was negative. This negative result is not superseded by the replication result.

## Next operation

Proceed to the first richer learner-safe memory architecture, while retaining the one-dimensional UCB1 learner as the negative baseline.

The next memory experiment should add **context**, not oracle precision. Candidate context must be available to Ellis from his own perception/experience, for example acquisition quality/phase, visual confidence, observation span, presentation progress/runway, method phase and process history. It must not contain target seed, true range, future trajectory, exact intercept, miss distance or required lead.

Prefer an interpretable episodic/contextual memory before RL/neural policies. Compare on distinct train/calibration/development-heldout populations:

1. context-free one-dimensional UCB1 memory;
2. learner-safe contextual/episodic memory;
3. no-memory uniform exploration.

Do not scale to the 100k existential bank until contextual memory produces reproducible held-out learning advantage and survives anti-cheat audit.
