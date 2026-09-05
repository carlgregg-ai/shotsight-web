# L3 dynamic perceptual coupling — no binary reward support (1)

Date: 2026-09-05
Programme stage: L3 — Single-method crosser learning
Substage: L3_DYNAMIC_PERCEPTUAL_COUPLING_ACTION_V1
Scientific result: **DYNAMIC COUPLING ARCHITECTURE GREEN / PROCESS SUPPORT PRESENT / NO BINARY REWARD YET**

## Governing shooting axiom

> **Good shooting is continuous perceptual coupling between target and gun.**
>
> READ THE LINE → MATCH THE SPEED → APPLY THE METHOD → TRIGGER → FOLLOW THROUGH.

The maintained-lead experiment now represents the shooting picture in the live, shooter-perceived target-line coordinate system rather than as only a static horizontal separation.

## Verified CI

Workflow: `ShotSight virtual shooter`
Run: `33956051848`
Head: `65c1833c832743e572610ce4781a38b5efc73711`
Conclusion: **success**

The complete L0/L1/L2/L3 regression chain passed, including containment, uncertainty calibration, planning, finite gun plant, static no-learning baseline, hit/miss learner, static reward-support diagnosis, and the new dynamic perceptual-coupling diagnostic.

## Timing semantic correction

L3 previously advanced a delayed ShooterObservation by a fixed 120 ms even though the observation carried a known 80 ms sensory latency, then separately applied a 120 ms gun motor-delay anticipation. This over-projected the target by 40 ms before any learner-selected relationship was added.

The belief prediction horizon is now the observation's own `latency_s`; gun-plant anticipation remains separate. This is a timestamp/semantics repair, not outcome tuning.

After this fix the existing scalar static learner still had no positive reward:
- 132 training crossers: 43 triggers, 0 hits;
- 48 transfer crossers: frozen fallback 18 triggers, 0 hits; no-memory control 7 triggers, 0 hits;
- expanded 242-crosser static reward-support diagnostic: 81 triggers, 0 hits;
- closest post-action static diagnostic miss improved to `0.241408676 m` versus `0.055 m` engineering proxy;
- best observed static diagnostic action shifted to about `0.05 rad`.

Therefore the timing repair improved geometry but did not rescue the static one-dimensional visual-picture action.

## Dynamic perceptual-coupling controller

New learner-side module: `learning/dynamic-perceptual-coupling-v1.mjs`.

It imports no oracle/physics evaluator and consumes only delayed/noisy belief, presentation plan and finite gun state. The learner-side relationship is represented using:
1. a live apparent 2-D target-line tangent derived from perceived azimuth/elevation angular motion;
2. a line-normal coordinate;
3. a selected forward relationship along the perceived line;
4. a selected line-normal relationship;
5. gun angular rate projected along/normal to the live perceived target line;
6. target-gun angular-speed matching;
7. relationship stability;
8. shooter-visible break-region opportunity;
9. explicit post-trigger follow-through.

The diagnostic action grid was deliberately broad and predeclared:
- forward relationship: `0.00` to `0.10 rad` in `0.01 rad` increments;
- line-normal relationship: `-0.02, -0.01, 0, +0.01, +0.02 rad`;
- 55 action pairs.

These are `SHOTSIGHT_HYPOTHESIS` exploration coordinates, not metric lead prescriptions or claimed human values.

## First dynamic sweep: trigger scarcity

With the initial conservative relationship-stability gate, the fresh 10-crosser × 55-action diagnostic produced:
- 550 action/target trials;
- 5 triggers;
- 0 hits;
- all 5 triggered episodes continued gun movement after trigger.

That population was too trigger-sparse to diagnose reward support.

Shooter-visible process diagnostics — computed without oracle outcomes — showed that during the break region:
- target-gun speed matching was feasible on the large majority of trials;
- the original `0.05 rad` relationship-stability threshold was the dominant exploration bottleneck.

## Process-only trigger calibration

A separate non-sealed process-calibration bank was therefore introduced using seed base `321000`, distinct from the reward diagnostic bank `331000`.

The calibration:
- ran 330 process-only action/target trials;
- computed **no oracle score**;
- observed 275 runs reaching the intended commit region;
- 186 had a speed-matched commit opportunity;
- used the 65th percentile of minimum shooter-visible relationship error as an exploration-feasibility statistic;
- raw value was `0.180766220 rad`;
- a predeclared safety clip froze the exploratory relationship tolerance at `0.12 rad`.

This is an engineering exploration threshold only, not a human constant and not fitted to hit rate, miss distance, lead or oracle geometry.

## Reward-support result with frozen process calibration

On the distinct fresh reward-diagnostic bank:
- targets: 10 crossers;
- action pairs: 55;
- total attempts: **550**;
- physical triggers: **50** (`9.09%`);
- proxy hits: **0**;
- follow-through-maintained triggers: **50/50**.

The absence of reward therefore can no longer be dismissed as merely a no-trigger problem.

The process gates were active and physically reachable:
- commit-window coverage: `385/550 = 70.0%`;
- relationship-stable somewhere: `550/550`;
- speed-matched somewhere: `550/550`;
- relationship + commit: `268/550 = 48.73%`;
- speed-match + commit: `226/550 = 41.09%`;
- all current process gates together before final break-window validity: `50/550 = 9.09%`.

Mean minimum relationship error in the commit region was `0.09190 rad`; mean minimum speed-match error there was `0.36755 rad/s`.

The referee-only closest triggered action in this small reward bank was forward `0.02 rad`, normal `0`, with minimum miss `0.794889 m`. **This value is researcher diagnosis only and must not be promoted to the learner, used as a gradient, or interpreted as 'correct lead'.**

## Anti-cheat status

**PASS.** The dynamic controller source is explicitly tested for forbidden oracle/physics imports and privileged concepts. The process-calibration bank has `oracleScoring: NONE`. The reward referee scores only after trigger. Miss distance, range, future trajectory, exact intercept, pellet TOF, metric lead, target seed and direct correction are not exposed to the controller or memory.

## Follow-through status

Follow-through is now part of the physical episode rather than ending action at trigger time. All 50 triggered episodes in the calibrated reward-support run continued gun movement after the trigger and retained post-trigger coupling traces. This is an architectural gate only; it does not establish human-valid follow-through timing.

## Scientific interpretation

The new representation is much closer to the intended human shooting loop than the scalar static action and is scientifically cleaner, but it has **not yet found binary reward support** under the current trigger timing and engineering scorer.

Do not scale to 100k yet. Do not widen the hit proxy, inject miss gradients, reveal oracle lead, or select an action from referee miss distance.

The next diagnosis should focus on whether the current trigger timing/break-region rule and target-gun relationship are temporally aligned with the oracle scoring event, while preserving the live perceptual-coupling model. A useful next experiment is to expose **shooter-visible temporal commitment as a learnable/exploratory dimension** inside the planned break region, while keeping forward/normal relationship and speed matching dynamic. This should be compared against the current fixed trigger commitment rule on fresh non-sealed training/calibration banks.

Because pellet arrival occurs after trigger in the referee, the learner may need to discover *when the visual relationship is shootable*, not merely *what relationship to hold*. That timing must be learned from hit/miss outcome, not derived from oracle pellet time-of-flight.

## Score limitation

The score remains `ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY`: point-target versus pellet-centreline timing with a 55 mm proxy. This checkpoint is not real-world shooting validation.

## Durable next substage

`L3_DYNAMIC_COUPLING_TRIGGER_TIMING_EXPLORATION_V1`

Preserve the current dynamic coupling controller and static learner as negative baselines. Add a shooter-visible trigger-commitment/action dimension within the already planned break region, with finite movement and follow-through unchanged. Use fresh non-sealed training/calibration seeds and binary hit/miss only for learner updates. Referee miss geometry remains post-action diagnosis only. Do not touch sealed final-test banks.
