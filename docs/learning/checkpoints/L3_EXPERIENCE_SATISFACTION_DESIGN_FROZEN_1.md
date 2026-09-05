# ShotSight Virtual Shooter — L3 Experience & Satisfaction Design Frozen 1

## Status

**DESIGN GATE FROZEN BEFORE GENUINE LEARNING.**

This checkpoint does not claim improved shooting performance. It records a deliberate expansion of the L3 learning architecture before hit/miss learning begins.

## New durable requirement

Ellis's apprenticeship is now a first-class experimental output. Each meaningful attempt must preserve the learner-visible causal chain:

`perception -> belief -> remembered context -> intention -> method/plan -> movement -> trigger -> learner-visible outcome -> shot quality -> break quality -> satisfaction -> self-diagnosis -> one-variable intervention -> later outcome`

The detailed schema and safeguards are defined in:

`docs/learning/ELLIS_EXPERIENCE_AND_SATISFACTION_V1.md`

## Satisfaction hypothesis

Introduce separate learner-visible concepts:
- **Break Quality (BQ)**: what happened to the clay as Ellis can plausibly observe it;
- **Shot Quality (SQ)**: how well Ellis executed the intended dynamic shooting process without access to oracle lead/miss geometry;
- **Satisfaction Score (SS)**: an experimental combination of process and outcome intended to reinforce reproducible good shooting.

Binary break/no-break remains the existential truth signal. Satisfaction must be ablated against binary-only learning and rejected if it merely improves shaped scores without improving held-out breaks, transfer or process robustness.

## Self-diagnosis and intervention history

Before changing policy after an informative miss/cluster, Ellis must record:
- what it thinks happened;
- evidence and confidence;
- what will stay fixed;
- one variable to test;
- why it chose that variable;
- what would falsify the hypothesis.

Failed interventions and contradictions are retained permanently.

## Pull-away priority

Practitioner guidance is incorporated as a `SHOTSIGHT_HYPOTHESIS`: pull-away becomes the primary learning method for the next learner experiment because it offers an interpretable acquire/connect/match/separate/trigger/follow-through sequence and supports intuitive shot-to-shot correction. Maintained lead remains a comparator/specialist method, not deleted or treated as disproven.

## Post-shot directional evidence

Future graded feedback may include coarse learner-visible evidence from chip location, fragment direction, coach/video/Sense-like categorisation, or no directional cue. Such evidence must be noisy/uncertain and post-shot only. Exact oracle miss vectors, lead values and correction directions remain prohibited.

## Chiron value

A research-side linkage may later compare Ellis's learner-visible diagnosis/intervention history with oracle ground truth offline. Oracle fields remain structurally inaccessible to Ellis. The purpose is to create a causal apprenticeship corpus for Chiron rather than merely a successful-shot database.

## Anti-cheat

New anti-cheat tests must cover persisted Experience Records, Satisfaction calculations, self-diagnosis and intervention memory. No target seed, exact range, future path, miss vector, intercept, pellet ToF, required lead, oracle optimal action or hidden-geometry-derived correction may enter learner-side storage or policy updates.

## Next operation

Implement the Experience Record schema and anti-cheat tests first. Preserve binary-only learning as baseline. Then implement SQ/BQ/SS behind experiment flags, make pull-away the primary learner condition, and compare Satisfaction ON/OFF plus memory ON/OFF on separate train/calibration/held-out populations. Do not use the identities of the already observed sparse L3 rewarded actions to initialise the learner.