# ShotSight Virtual Shooter — L3 Pull-Away Contextual/Episodic Memory No Advantage 1

Date: 2026-09-05
Status: VERIFIED DEVELOPMENT GATE; NO HELDOUT LEARNING ADVANTAGE

## Authoritative verification

- Branch: `virtual-shooter-v1`
- Verified code/workflow HEAD: `39e1d9e86e19ffc912f746039f5520f5d39cd78e`
- Workflow: `ShotSight virtual shooter`
- Authoritative CI run: `33991998135`
- CI conclusion: `success`
- Full L0 -> L3 chained regression: GREEN
- New CI step verified in this run: `Run L3 pull-away contextual/episodic memory gate`

## Gate result

Experiment status: `L3_CONTEXTUAL_EPISODIC_MEMORY_NO_HELDOUT_ADVANTAGE_V1`.

The first contextual/episodic pull-away memory gate completed successfully as a development test, but it did **not** demonstrate a positive held-out learning signal.

## Training result

- blocked attempts: 244
- adaptive episodes: 244
- learner-safe context count: 2
- contextual memory hits: 3
- context-free memory hits: 4

Interpretation: the contextual learner did not show a training advantage over the context-free learner in this development configuration.

## Calibration result

- attempts: 244
- contextual: 5 hits / 101 triggers / hit rate 0.020491803278688523
- context-free: 3 hits / 101 triggers / hit rate 0.012295081967213115
- no-memory uniform: 0 hits / 93 triggers / hit rate 0
- unseen context backoffs: 0

Interpretation: contextual memory showed a calibration improvement signal, but calibration is not proof of transferable learning.

## Development-heldout result

- attempts: 244
- contextual: 1 hit / 244 triggers / hit rate 0.004098360655737705
- context-free: 1 hit / 244 triggers / hit rate 0.004098360655737705
- no-memory uniform: 0 hits / 244 triggers / hit rate 0
- unseen context backoffs: 4
- advantage vs context-free: 0
- advantage vs uniform: 0.004098360655737705
- learning signal observed: false

Interpretation: contextual memory matched the context-free frozen policy on development-heldout, and therefore did not prove transferable learning. The small advantage over uniform exploration is insufficient because the required comparison is against both context-free memory and no-memory exploration.

## Anti-cheat status

GREEN for this gate.

The contextual learner module imports only the boundary checker. Context is derived from early degraded shooter observations and Human Vision evidence. Memory receives categorical context, selected visual relationship and binary outcome only. It does not receive target seed, target identity, true range, future path, intercept, pellet time-of-flight, miss vector, required lead or oracle action.

## Score boundary

All hits remain `ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY` using the 55 mm centreline-disc engineering proxy. This does not validate realistic shotgun pattern density, pellet-cloud probability or clay breakability.

## Preserved interpretation

This checkpoint does **not** supersede the previous reward-replication checkpoint. Reward support still exists in the legal Human Vision pull-away action space across multiple fresh blocks.

This checkpoint adds a new negative/partial result:

> The first learner-safe contextual/episodic memory did not yet exploit sparse reward well enough to beat context-free memory on development-heldout.

## Diagnostic implications

The likely issue is not simply that reward does not exist. Reward support has already replicated. The issue is that the first contextual representation is too thin and/or too coarse to transfer.

Current context is limited to categorical early visual features:

- direction
- speed band
- acquisition band
- observation-span band

Only two context buckets were populated during training, and development-heldout still produced four unseen-context backoffs. This suggests context coverage and context resolution need revision.

## Required next operation

Proceed to a **revision gate**, not a replication gate and not 100k scaling.

The next revision should diagnose and improve learner-safe memory representation while preserving the anti-cheat boundary. Candidate improvements must remain learner-visible and may include:

1. acquisition phase rather than only observation-span band;
2. visual confidence band;
3. presentation progress / remaining runway band;
4. method/process phase at action selection;
5. connection quality and speed-match quality where derived from learner-visible process quantities;
6. first-break / good-shot episodic trace features;
7. nearest-neighbour or similarity-weighted episodic recall rather than only hard categorical bucket memory.

The next gate must compare at minimum:

1. current contextual/episodic V1 memory;
2. context-free one-dimensional memory;
3. no-memory uniform exploration;
4. revised learner-safe contextual memory, if implemented.

## Hard prohibitions

Do not:

- copy rewarded action identities into Ellis memory;
- expose target seed or target identity;
- expose true range;
- expose future trajectory;
- expose intercept point;
- expose pellet time-of-flight;
- expose miss distance or miss vector;
- expose required lead;
- inject referee gradients;
- widen the 55 mm engineering proxy;
- call this real-world validation;
- authorise 100k scaling from this gate.

## Next checkpoint expectation

The next durable result should be one of:

- `L3_PULL_AWAY_CONTEXTUAL_EPISODIC_REVISION_GATE_GREEN_1.md` if a revised learner-safe context/memory architecture demonstrates development-heldout advantage over both baselines; or
- `L3_PULL_AWAY_CONTEXTUAL_EPISODIC_REVISION_NO_ADVANTAGE_1.md` if the revision still fails to transfer; or
- a diagnostic checkpoint if the result shows reward sparsity, context sparsity, or anti-cheat concerns rather than a clean pass/fail.
