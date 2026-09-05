# L3 maintained-lead reward-support diagnosis — 1

Date: 2026-09-05
Programme stage: L3 — Single-method crosser learning
Scientific result: **NEGATIVE ACTION-SUPPORT RESULT / MOTOR SUPPORT PRESENT / REDESIGN SHOOTER-VISIBLE COUPLING ACTION**

## Verified CI

Workflow: `ShotSight virtual shooter`
Run: `33955131080`
Head: `3a89b948a0b336bd4305054a6f964654d3145c54`
Conclusion: **success**

The full L0/L1/L2/L3 regression chain passed, including anti-cheat containment, perception calibration, whole-presentation planning, finite gun plant, the original hit/miss-only learner, and the new reward-support diagnostic.

## Diagnostic population

The referee-side diagnostic repeated the existing learner-safe maintained-lead action grid on a larger training/calibration population only:
- 242 crosser attempts;
- 61 valid triggers (`25.21%`);
- 0 engineering centreline-proxy hits;
- Wilson 95% upper bound on hit rate: `0.01563`;
- requested visual-separation grid remained `0.000` to `0.250 rad` in `0.025 rad` steps.

The learner still received **binary HIT/MISS only**. Miss distance, achieved separation and trigger progress below are researcher/referee post-action diagnostics and were not passed to memory or action selection.

## Reward-support result

No explored action reached the 55 mm engineering centreline proxy.

- best observed post-action miss distance: `0.323247591 m`;
- engineering proxy radius: `0.055 m`;
- reward support observed: **false**;
- best observed action by minimum miss distance: `0.000 rad`;
- larger positive separation generally increased miss distance rather than revealing a hidden rewarded band.

This confirms the original 132-target zero-reward result was not merely an unlucky sparse sample.

## Motor/trigger diagnosis

The finite gun plant is **not currently the primary explanation for the absence of reward support**:
- maximum requested separation: `0.250 rad`;
- maximum mean achieved separation among firing actions: `0.255637 rad`;
- achieved/requested support ratio: `1.02255`;
- maximum action trigger rate: `0.50`;
- mean trigger progress across firing actions: `0.86758`.

Therefore the plant can physically traverse the current exploratory separation envelope and valid shots occur in the intended late presentation/break region. Brute-force widening of motor limits is not justified by this result.

## Controller inspection

The maintained-lead controller was inspected after the diagnostic. It already derives left/right sign from the shooter's perceived azimuth rate, so the failure is **not** simply an unsigned 'always lead right' bug.

However, the current learner action is still only a scalar horizontal visual separation applied to a short-horizon predicted target point. Elevation is copied directly from the target prediction and there is no learnable two-dimensional line/tangent relationship, line-normal adjustment, target-gun speed relationship, or explicit coupling-quality state. This is materially weaker than the programme's perception-action objective and the newly clarified ShotSight shooting axiom:

> **Good shooting is continuous perceptual coupling between target and gun.**
>
> READ THE LINE → MATCH THE SPEED → APPLY THE METHOD → TRIGGER → FOLLOW THROUGH.

Lead should emerge as a measured consequence of that process, not be the learner's privileged objective.

## Scientific interpretation

The evidence now supports the hypothesis that the current **one-dimensional static visual-picture action is structurally incomplete** for L3. It does not support scaling this policy to 100k, providing oracle lead, widening the hit proxy, or injecting referee miss-distance gradients.

The next action must remain shooter-visible and anti-cheat safe. Replace/augment the static horizontal-separation action with a dynamic perceptual-coupling representation constructed only from delayed/noisy apparent target observations and the shooter's belief/plan. At minimum it should represent:
1. live apparent target-line/tangent estimate in azimuth and elevation;
2. target-gun angular-speed relationship / speed matching;
3. method-specific development of a forward relationship along the perceived line;
4. optional learnable line-normal picture rather than assuming zero vertical relationship;
5. trigger commitment from stability of the live target-gun relationship and break-region opportunity;
6. continued gun movement after trigger (follow-through) with post-trigger trace retained until visible outcome.

Numerical relationship values remain `SHOTSIGHT_HYPOTHESIS` / learnable parameters. Do not derive them from oracle intercept or referee miss vectors.

## Anti-cheat status

**PASS.** Referee miss distance and other post-action diagnostics remain outside learner memory/action selection. Oracle remains scorer only after action. No range, future path, exact intercept, pellet TOF, metric lead, seed identity or direct corrective vector was added to the shooter.

## Score limitation

The score remains `ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY`. The inherited crosser/shot model remains an engineering proof environment, not certified real clay aerodynamics or shot-cloud breakability.

## Durable next substage

`L3_DYNAMIC_PERCEPTUAL_COUPLING_ACTION_V1`

Build and test the learner-safe dynamic coupling controller on fresh training/calibration seeds. Preserve the existing static-separation learner as a negative baseline. Do not touch sealed final-test banks.
