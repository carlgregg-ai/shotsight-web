# ShotSight flat-crosser three-method reviewer comparison v1

Status: **PROVISIONAL EXPERT-REVIEW HYPOTHESIS — NOT INSTRUCTIONAL**.

The same canonical P7 flat-crosser target and the same 0.8 s shot/intercept are repeated for three recognised method names: swing-through, pull-away and maintained lead. Target state, shot time and ballistic intercept are unchanged between repetitions. Only the renderer-facing gun kinematic hypothesis changes.

## Evidence boundary

CPSA-recognised method existence is source-backed in `physics/method-registry-v1.mjs`. The current source set does **not** authorise numerical connection tolerances, speed-match tolerances, transition times or human angular-speed bounds. Therefore every numerical method trajectory in this comparison is classed `SHOTSIGHT_HYPOTHESIS_PENDING_EXPERT_REVIEW`.

The comparison is deliberately designed to let an expert shooter reject or tune the movement while preserving the physics target and the common shot solution.

## v1 hypothesis parameters

- **Swing-through:** begins at -1.25 × the final shot lead, crosses the target at 0.55 s, and reaches the canonical ballistic shot lead at 0.8 s.
- **Pull-away:** begins at -0.35 × final lead, connects by 0.32 s, holds zero separation through 0.50 s as the provisional speed-match phase, then separates smoothly to the canonical ballistic shot lead at 0.8 s.
- **Maintained lead:** holds 1.0 × the canonical final shot-lead angular relationship throughout the visible move.

The scalar multiplier is applied to the final shot-frame azimuth/elevation lead offset relative to the target. All three methods are mathematically forced to converge to the exact same canonical bore at shot time.

## Locked reviewer rules

- same target XYZ and master clock for every method;
- same shot time and ballistic solution;
- no fake break;
- target orientation remains HOLD;
- method numerical kinematics are not source-certified;
- no instructional claim until expert review and subsequent calibration/validation.

## Expert review sought

Review the gun move rather than the target: starting relationship, connection/crossing timing, apparent gun speed, separation development, shot lead and post-shot continuity. Frame/timestamp-specific comments are preferred.
