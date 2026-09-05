# ShotSight Virtual Shooter — L3 Ellis Experience Record Foundation Green 1

## Gate status

**VERIFIED FOUNDATION GATE: ELLIS CAN NOW PERSIST A LEARNER-SIDE APPRENTICESHIP RECORD WITHOUT CHANGING THE BINARY BREAK TRUTH SIGNAL.**

This is an architecture/containment gate only. It is **not** evidence that Satisfaction improves learning, that Ellis has learned pull-away, or that the engineering hit proxy represents real-world clay-break probability.

## Authoritative verification

- Branch: `virtual-shooter-v1`
- Verified code/workflow HEAD: `5f19a3bedf8d7139fc09041084088a2348756e05`
- Workflow: `ShotSight virtual shooter`
- Authoritative CI run: `33970337007`
- CI conclusion: `success`
- Full L0 -> L3 chained regression: GREEN
- New CI step: `Run L3 Ellis apprenticeship record / Satisfaction anti-cheat gate`

## Implemented learner-side architecture

`learning/ellis-experience-v1.mjs` now provides:

1. `ELLIS_SHOT_QUALITY_V1`
   - process-only score from learner-visible execution terms;
   - first-pass components: line read, connection stability, speed-relationship stability, separation control, jerk control, trigger commitment, follow-through and method topology;
   - no oracle lead, miss distance or target intersection closeness.

2. `ELLIS_BREAK_QUALITY_BINARY_V1`
   - first condition deliberately contains only visible binary break/miss outcome;
   - hit = 100, miss = 0 for this initial BQ representation;
   - no hidden centrality, miss vector or pellet-density inference.

3. `ELLIS_SATISFACTION_V1`
   - experimental shaped learning aid, not shooting truth;
   - predeclared first-pass weights: 60% Shot Quality, 40% Break Quality;
   - small coherence bonus when strong process and strong outcome agree;
   - small penalty when a break accompanies poor process;
   - explicit OFF mode for ablation.

4. `ELLIS_EXPERIENCE_RECORD_V1`
   - immutable/frozen learner-visible apprenticeship record;
   - preserves before-shot belief/intention/reason, during-shot process, binary outcome, SQ/BQ/SS and optional self-diagnosis;
   - no target seed or referee geometry is required or authorised.

5. `ELLIS_SELF_DIAGNOSIS_V1`
   - stores an explicitly uncertain learner-side hypothesis;
   - requires evidence, confidence, what remains fixed, one variable to change, reason and a falsifier.

6. `ELLIS_INTERVENTION_RECORD_V1`
   - links intervention to parent episodes;
   - records one changed variable and fixed variables;
   - preserves negative findings rather than silently optimising them away.

## Behavioural safeguards tested

The foundation test demonstrates that:

- a high-quality miss can retain meaningful process Satisfaction rather than being treated as equivalent to a poor miss;
- a coherent high-quality hit outranks the same high-quality process with a miss;
- a lucky hit with poor process does not outrank a coherent good-process hit;
- Satisfaction can be disabled completely for the binary-only control;
- Experience Records are recursively immutable;
- known privileged oracle fields are rejected by the existing L0 recursive leakage boundary.

These are design properties only. Their effect on held-out break performance remains untested.

## Scientific boundary retained

The inherited physics remains deliberately fail-closed:

- P4 ballistics/intercept infrastructure is an oracle/reference capability and does not certify realistic dense shot-cloud ballistics;
- P7 flat-crosser engineering strategy remains `ENGINEERING_INTERCEPT_REFERENCE`, `NOT_A_COACHING_METHOD`;
- Ellis's new experience module imports no physics or oracle solver;
- the 55 mm engineering centreline-disc scorer remains an engineering proxy, not a real break-probability model.

## Pull-away learning priority

The next learner condition treats pull-away as the **primary ShotSight hypothesis**, not a universal coaching law. The current Playbook supports a long-crosser pull-away protocol involving useful runway, target focus, speed match and smooth separation, while preserving swing-through and maintained lead as legitimate alternatives/comparators.

The adaptation sequence to test is:

`READ -> CONNECT -> MATCH -> DEVELOP SEPARATION -> TRIGGER -> FOLLOW THROUGH -> OBSERVE -> DIAGNOSE -> CHANGE ONE THING`

Ellis must discover useful separation behaviour from permitted outcomes and experience; no exact lead is supplied.

## Post-gate hardening in progress

After this verified gate, the leakage boundary was strengthened to reject common privileged aliases such as target/scenario seed, miss-distance aliases, exact-future-path aliases and direct-correction aliases. The corresponding adversarial test expansion exists at branch HEAD after this checkpoint's verified SHA, but that stronger revision is **PENDING FULL CI** and is not claimed green here.

## Next operation

1. Verify the strengthened alias-leakage regression at current HEAD.
2. If green, integrate Experience Records into genuine pull-away-primary hit/miss learning episodes on explicit non-sealed train/calibration/held-out populations.
3. Preserve binary-only as the first truth/control condition.
4. Compare memory ON/OFF and Satisfaction ON/OFF; Satisfaction survives only if it improves held-out breaks, transfer/calibration and/or robust process without simulator exploitation.
5. Do not initialise from the identities or oracle geometry of the sparse successful diagnostic actions already observed.
6. Do not scale to the 100k existential bank until genuine held-out learning is demonstrated reproducibly.
