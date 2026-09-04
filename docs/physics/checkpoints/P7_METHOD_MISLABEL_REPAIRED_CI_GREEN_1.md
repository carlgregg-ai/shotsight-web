# P7 — Method/Gun-Strategy Contract Repair — CI GREEN

Date: 2026-09-04
Branch: `physics-engine-v1`
Verified repair head: `4320c3a26260cec2f520242134a9038fa90ff670`
GitHub Actions run: `33898370365` — SUCCESS

## Recovered failure

P7 previously failed adversarial review because the displayed bore path continuously tracked the instantaneous physical intercept while telemetry exposed `NSCA_LONG_CROSSER_PULL_AWAY` as though it were the active gun method. That was a method/numerical-state integrity violation.

## Repair completed

The integrated canonical flat-crosser now separates two different concepts explicitly:

- active gun strategy: `ENGINEERING_INTERCEPT_REFERENCE`;
- gun-strategy provenance: `ENGINEERING_REFERENCE`;
- gun-strategy status: `NOT_A_COACHING_METHOD`;
- source method reference: `NSCA_LONG_CROSSER_PULL_AWAY`;
- source method role: `SOURCE_REFERENCE_ONLY`;
- source-method kinematics: `HOLD_NOT_IMPLEMENTED`;
- active coaching method telemetry: `null`.

The bore path remains the same verified instantaneous-intercept engineering reference. No physical interception equation, target state, pellet TOF calculation, camera projection or scientific tolerance was altered to make this repair pass.

## Regression protection

`tests/physics-canonical-flat-crosser-v1.mjs` now fails if:

- the engineering gun strategy is not explicitly identified;
- the source coaching method is presented as the active gun strategy;
- method-specific kinematics are presented as implemented;
- debug telemetry exposes an active coaching method while those kinematics remain unimplemented.

`tests/physics-p7-browser-debug-v1.mjs` now requires the browser surface to show the engineering strategy and source method reference separately and to retain the existing certification/HOLD locks.

## Browser/debug surface

`p7-debug.html` now visibly labels:

- `ENGINEERING_INTERCEPT_REFERENCE · ENGINEERING_REFERENCE · NOT_A_COACHING_METHOD`;
- `NSCA_LONG_CROSSER_PULL_AWAY · SOURCE_REFERENCE_ONLY · kinematics HOLD_NOT_IMPLEMENTED`;
- active coaching method as `NONE` through telemetry;
- ACQUISITION / CONNECTION / SPEED_MATCH as HOLD unless an authorised predicate exists.

## Verification

Full ShotSight physics workflow run `33898370365` completed with conclusion `success` at head `4320c3a26260cec2f520242134a9038fa90ff670`.

The scientific locks remain unchanged:

- realistic clay flight: HOLD;
- instructional dense-shot ballistics: HOLD;
- TEST_ONLY constant-speed ballistic provider enforced in P7;
- no decorative BREAK event;
- instructional motion certification remains false.

## Gate status

The specific P7 method-mislabel failure is **REPAIRED AND REGRESSION-GUARDED**.

P7 is not yet declared complete because the master programme still requires the final rendered/frame-by-frame adversarial visual/narrative review after the repair. Do not advance to P8 until that review is durably completed with no material expert-facing inconsistency.

## Exact next action

Perform the post-repair rendered adversarial P7 review at start, pre-shot, shot, pellet-arrival and end/follow-through, checking target/bore geometry, strategy labels, source-reference/HOLD labels, narrative event timing, scrub/frame-step behaviour and mobile layout. If no material issue is found, persist the P7 completion gate and immediately begin P8. If a material issue is found, persist a new failed checkpoint and remain in P7.
