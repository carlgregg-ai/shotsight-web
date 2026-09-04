# ShotSight P5 — Shooter Projection & Gun Kinematics v1

Date: 2026-09-04
Status: **COMPLETE — infrastructure gate**
Branch: `physics-engine-v1`
Verified CI run: `33871377430` at head `889a53061fe5ca8dfd34ed812f8d96f815eab034` — **SUCCESS**

## Scope

P5 establishes mathematically constrained world-to-camera projection and minimum bore-direction angular kinematics. It does not claim real-camera calibration, camera-to-bore registration or empirical human gun-speed limits.

## Verified outputs

### Corrected normative camera convention

P5 adversarial QA exposed a substantive P2 specification contradiction: the previous camera axes `+X right, +Y up, +Z forward` were labelled right-handed but mathematically form a left-handed basis relative to the ShotSight world.

The gate was held and the normative specification was corrected rather than allowing an improper/reflection matrix into projection.

The controlling camera convention is now:

- `+X_C`: raster/image right;
- `+Y_C`: raster/image down;
- `+Z_C`: optical forward;
- right-handed;
- `R_CW` must be a proper rotation with `R R^T = I` and determinant `+1`;
- pinhole projection: `u=fx X/Z+cx`, `v=fy Y/Z+cy`;
- shooter-intuitive elevation remains positive upward through `el=atan2(-Y_C,sqrt(X_C^2+Z_C^2))`.

Canonical level mapping:

`R_CW = [[1,0,0],[0,0,-1],[0,1,0]]`.

The correction is persisted in `docs/physics/SHOTSIGHT_PHYSICS_KINEMATICS_SPEC_v1_CONVENTIONS.md`.

### `physics/projection-gun-v1.mjs`

Verified primitives include:

- proper rotation-matrix determinant/orthonormality validation;
- world-point → camera-frame transform;
- horizontal-FOV → focal-length derivation with explicit horizontal-FOV scope;
- ideal pinhole projection and front-camera-plane guard;
- apparent azimuth/elevation from camera vector;
- LOS angular-velocity vector `(r×v)/|r|²`;
- finite-difference apparent azimuth/elevation rates;
- minimum bore angular velocity `b×b_dot`;
- sampled bore angular displacement/rate;
- bore-history continuity and optional explicit scenario-bound validation.

No empirical maximum human gun angular speed is invented. The validator accepts such a bound only when supplied by a scenario/evidence layer.

## Adversarial tests

The P5 suite verifies:

- proper camera rotation accepted;
- scaling matrix rejected;
- reflection/improper matrix rejected;
- world/camera axis mapping;
- raster sign convention;
- point behind camera rejected;
- apparent angle signs;
- finite camera-origin offset produces expected parallax;
- eye/camera origins therefore cannot silently collapse;
- LOS angular velocity matches analytic crosser case;
- finite-difference apparent rate matches analytic small-step rate;
- bore angular velocity sign/magnitude;
- radial/non-tangent `b_dot` rejected;
- bore sample angular rate and chronological continuity;
- explicit speed bound accepted/rejected correctly;
- camera-to-bore remains a HOLD for real video.

## Correction history

The first hardened P5 CI failed because the determinant test correctly rejected the original P2 camera mapping. This was not relaxed. The specification, implementation and tests were corrected to a genuinely right-handed camera frame. P3 and P4 remain unaffected because their verified mathematics did not depend on raster/camera handedness.

## CI gate

GitHub Actions run `33871377430`: **SUCCESS**.

Passed steps:

- P3 target physics analytic tests;
- P4 ballistic/intercept analytic tests;
- P4 Allen closed-form TOF validation;
- P4 provider-based TOF intercept validation;
- P5 projection and gun kinematics validation.

## Holds carried forward

- camera-to-bore transform for actual ShotKam/video;
- lens distortion calibration for real cameras;
- eye-to-camera interpretation for real footage;
- empirical/source-backed human gun angular-speed and acceleration ranges;
- method-specific transition tolerances.

These are not required to close P5 as an infrastructure gate because all relevant functions fail closed or require explicit supplied values.

## Exit assessment

P5 exit criteria are satisfied:

- screen coordinates derive from a mathematically defined world/camera transform rather than drawn motion;
- apparent angles/rates derive from geometry;
- eye/camera origin differences produce real parallax rather than being ignored;
- bore direction has explicit angular kinematics and continuity checks;
- invalid camera rotations and unsupported empirical bounds fail closed.

## Next action

Advance to **P6 — Shooting-Method State Machines & Narrative Engine v1**. Inspect the existing ShotSight coaching-evidence register first. Implement only method states whose definitions can be source-attributed; unresolved `MATCH`, `CONNECTION`, transition and expert gun-kinematic tolerances must remain HOLD/TEST_ONLY rather than being invented.
