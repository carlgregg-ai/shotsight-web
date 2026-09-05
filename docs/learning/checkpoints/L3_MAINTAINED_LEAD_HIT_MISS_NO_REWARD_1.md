# L3 maintained-lead hit/miss learning — NO REWARD 1

Date: 2026-09-05
Programme stage: L3 — Single-method crosser learning
Scientific result: **NEGATIVE / DIAGNOSE BEFORE SCALING**

## Verified experiment

CI run `33954620241`, head `468a3aad31b09c8d5dd1e4e5785cf9ee14a5357b`, completed successfully. The workflow was green because the experiment and containment rules executed correctly; the scientific result itself was negative.

All prior L0/L1/L2/L3 containment, perception, planning and finite-gun tests remained green.

## Learner

The first learner is deliberately interpretable rather than RL/neural:
- maintained lead only;
- UCB1 general memory;
- visual target-gun separation actions: `0.000` through `0.250 rad` in `0.025 rad` increments;
- action values are predeclared exploratory visual relationships, not ballistic lead values;
- after each attempt, the learner receives only `HIT_MISS_ONLY_FEEDBACK_V1 { hit: boolean }`;
- learner memory stores only action outcome counts and binary hit counts;
- no target IDs/seeds, range, future path, exact intercept, pellet TOF, metric lead, referee miss distance/vector, or direct correction enter memory/action selection.

## Partitions

- family perception training seed base: `41000`
- whole-presentation stand calibration seed base: `151000`
- learner training seed base: `211000`
- learner training crossers: `132`
- untouched transfer seed base: `271000`
- untouched transfer crossers: `48`

## Training result

- 132 target attempts
- 31 valid trigger events (`23.48%` trigger rate)
- **0 proxy hits**
- hit rate: `0.000`
- Wilson 95% upper bound: `0.02828`
- first third: 0/44 hits, 10 triggers
- last third: 0/44 hits, 8 triggers

Because all binary rewards were zero, every UCB action arm remained equivalent and each received 12 outcomes. The nominal frozen action of `0 rad` is only a deterministic tie-break fallback and **must not be described as a learned useful policy**.

## Untouched transfer result

Frozen fallback policy on 48 unseen crossers:
- 19 trigger events
- **0/48 proxy hits**
- Wilson 95% upper bound: `0.07410`

No-memory round-robin control on the same hidden bank:
- 10 trigger events
- **0/48 proxy hits**
- delta hit rate versus frozen fallback: `0`

## Interpretation

This is a useful existential failure. The programme has now demonstrated that the current perception -> whole-presentation plan -> finite gun -> shooter-visible trigger architecture can produce actual scored shots without oracle leakage, but the current maintained-lead action support did not produce a single binary reward. A binary learner cannot discover a useful policy if the environment provides no observed hits.

The result must **not** be repaired by:
- widening the 55 mm engineering centreline target merely to manufacture reward;
- passing referee miss distance/vector into the hit/miss-only learner;
- looking up the oracle intercept/lead and seeding the action;
- brute-force scaling from 132 directly to 100k while the action/reward support is unproven;
- weakening the trigger/anti-cheat boundary to obtain a positive number.

## Required diagnosis before further learning

Use researcher/referee-side **post-action diagnostics on training/calibration data only** to determine why reward support is absent while keeping those diagnostics entirely outside the learner boundary. Examine:
1. trigger feasibility by visual-separation action;
2. achieved versus requested target-gun separation at the actual trigger;
3. trigger progress/break-region coverage;
4. post-action miss-distance trend by action only as a researcher diagnostic, never learner feedback;
5. whether finite motor limits prevent larger visual relationships from being established;
6. whether the present one-dimensional horizontal separation action is structurally incomplete;
7. whether perception/vertical picture or shot timing dominates error.

If no existing learner-safe action can reach the hit proxy, redesign the action representation from shooter-visible quantities and re-run a fresh training/calibration probe. Do not derive an exact corrective action from oracle truth.

## Status

`L3_MAINTAINED_LEAD_REWARD_SUPPORT_DIAGNOSIS_V1`

No claim of crosser learning proof is made. Score remains `ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY`.
