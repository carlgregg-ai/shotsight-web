# ShotSight Virtual Shooter — L3 Human Vision Reward Replication Pending CI 1

Date: 2026-09-05
Status: IMPLEMENTED; PENDING AUTHORITATIVE CI

## Purpose

The previous Human Vision pull-away reward-support run produced four engineering-proxy hits, all on one calibration population, while the first one-dimensional hit/miss memory failed to transfer to development-held-out targets. Before adding memory complexity or compute, this operation tests whether binary reward support reproduces across fresh independent development populations.

## Predeclared design

Four fresh non-sealed crosser blocks are used:

- REPLICATION_A — seed base 401000
- REPLICATION_B — seed base 402000
- REPLICATION_C — seed base 403000
- REPLICATION_D — seed base 404000

Each block receives the identical 61-point learner-safe visual-separation grid from 0 to 0.12 rad in 0.002 rad increments. The default gate uses four crossers per block, for 244 attempts per block and 976 attempts overall.

The experiment does not select a policy. Referee hit results are reported after the sweep but are not used to redefine, rank or tune the action grid.

## Scientific classification

The diagnostic reports one of two descriptive outcomes:

- `L3_PULL_AWAY_HUMAN_VISION_REWARD_SUPPORT_REPLICATED_MULTIPLE_FRESH_BLOCKS_V1` if at least two fresh blocks contain one or more engineering-proxy hits;
- `L3_PULL_AWAY_HUMAN_VISION_REWARD_SUPPORT_REMAINS_POPULATION_SENSITIVE_V1` otherwise.

This classification is not a pass percentage or proof criterion. Either result is a valid experiment outcome and the CI test is expected to remain green if the implementation and containment are correct.

## Anti-cheat boundary

- Human Vision constrained pull-away policy is unchanged.
- Oracle scoring remains post-trigger only.
- No miss distance, exact intercept, required lead, target seed identity or oracle action is used to construct or select learner actions.
- Rewarded action identities from previous runs are not used to initialise the grid or policy.

## Files

- `learning/pull-away-human-vision-reward-replication-v1.mjs`
- `tests/virtual-shooter-pull-away-human-vision-reward-replication-v1.mjs`
- `.github/workflows/virtual-shooter.yml`

## Next decision after CI

If reward support occurs on multiple fresh populations, proceed to a learner-safe richer episodic/contextual memory experiment while retaining the one-dimensional UCB1 result as a negative baseline.

If reward support remains isolated or absent, do not add 100k compute. Diagnose the reward landscape, presentation context, trigger opportunity and learner-safe representation before increasing memory complexity.
