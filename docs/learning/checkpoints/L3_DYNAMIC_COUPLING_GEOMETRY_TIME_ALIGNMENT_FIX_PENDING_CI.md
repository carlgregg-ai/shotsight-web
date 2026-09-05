# L3 — Dynamic coupling geometry/time-alignment audit

Status: **IMPLEMENTED — CI VERIFICATION PENDING**

## Governing axiom

**GOOD SHOOTING IS CONTINUOUS PERCEPTUAL COUPLING BETWEEN TARGET AND GUN: READ THE LINE -> MATCH THE SPEED -> APPLY THE METHOD -> TRIGGER -> FOLLOW THROUGH.**

## Resume context

This checkpoint follows `L3_SHOOTER_VISIBLE_TRIGGER_TIMING_NO_REWARD_1.md`. The trigger-timing sweep remains a valid negative baseline: 100 physical follow-through shots across 1,512 attempts produced zero engineering-proxy hits. No hit proxy was widened and no oracle miss gradient was fed back.

## Concrete defect found

The first geometry/expressivity audit found a learner-side temporal alignment defect in `runDynamicMaintainedLeadCoupling`.

Perception frames are generated at 60 Hz and the finite gun plant integrates at 120 Hz. The controller correctly duplicated each 60 Hz command for two plant steps, but coupling assessment used `gunTrace.states[(i+1)*2]` for perception frame `i`. Because `states[0]` is already the gun state at the first frame time, this compared every shooter-visible perception frame with the gun state approximately **16.7 ms in the future**.

This did not leak oracle state, but it made the measured target-gun relationship and speed-match gates temporally inconsistent with the perception frame that generated the command.

## Implemented correction

`learning/dynamic-perceptual-coupling-v1.mjs` now:

- exports the learner-side target-line tangent/normal basis for explicit audit;
- makes tangent direction follow perceived target travel, so positive forward relationship remains forward for both left-to-right and right-to-left targets;
- uses one deterministic +90-degree line normal in azimuth/elevation image coordinates;
- resamples each shooter-visible command into the finite plant for the number of 120 Hz integration steps actually spanning the next perception-frame interval;
- records the exact plant-state index associated with each perception frame;
- assesses frame `i` against the plant state at frame `i` time instead of the next 60 Hz frame;
- exposes `stateTimeAlignmentError_s` as a process-only diagnostic;
- leaves the 120 ms visual-motor delay in the finite plant intact;
- preserves motor-delay anticipation as a shooter-known latency compensation, not ballistic interception.

## New process-only audit

Added `tests/virtual-shooter-dynamic-coupling-geometry-v1.mjs` and wired it into the ShotSight virtual-shooter CI workflow.

The audit uses no oracle score and checks:

1. target-line tangent and normal are unit and orthogonal;
2. tangent follows perceived motion for both target directions;
3. positive forward relationship projects correctly for both left-to-right and right-to-left motion;
4. command construction and relationship assessment use the same tangent/normal coordinates;
5. gun-speed matching is projected onto that same tangent;
6. finite-plant frame/state mapping is monotonic and timestamp-aligned within integration tolerance;
7. learner controller source still contains no oracle/physics-scoring import or privileged miss/intercept/lead fields.

## Anti-cheat

**PASS BY CONSTRUCTION FOR THIS CHANGE.**

No oracle outcome, miss distance, target seed, range, exact future trajectory, intercept, pellet TOF or metric lead is used by the controller or the new geometry test.

## CI

Head carrying workflow integration: `0e87650365e32a087856aa2ed19b33dbc7ce951e`.

Workflow run: `33959350395` (`ShotSight virtual shooter`). At checkpoint creation the run is still in progress; L0 and early L1/L2 gates observed so far are green. **Do not promote this checkpoint to VERIFIED until the complete L0->L3 workflow, including the new geometry audit and trigger-timing regression, succeeds.**

## Next exact operation

1. Inspect workflow run `33959350395` to completion.
2. If red, diagnose the exact failing gate and repair without weakening safeguards.
3. If green, promote the geometry/time-alignment audit to a verified checkpoint.
4. Then rerun a **fresh non-sealed** dynamic-coupling binary reward-support diagnostic with this corrected time alignment.
5. Do not use miss-distance optimisation, widen the 55 mm engineering proxy, expose oracle lead, or scale to 100k merely because the correction exists.

This change repairs the semantics of perceptual coupling measurement. It is not evidence that Ellis can yet break a clay.
