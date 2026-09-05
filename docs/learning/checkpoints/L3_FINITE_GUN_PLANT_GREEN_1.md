# L3 Finite Gun / Shooter Plant — Green Gate 1

Date: 2026-09-05
Stage: L3 — single-method crosser learning
Status: FINITE_GUN_PLANT_GREEN_NOT_SHOOTING_SUCCESS
Verified CI run: 33951254843
Verified branch SHA: f0d70853c09691413a30c15075b59afb0b203988

## What was added

`learning/gun-plant-v1.mjs` introduces the first learner-side finite angular gun/shooter plant. It accepts only `PERCEIVED_ANGULAR_GUN_COMMAND_V1` commands and imports only the anti-cheat boundary. There is no physics, ballistic, intercept, oracle-future or metric-lead import in the motor controller.

The initial parameter set is deliberately labelled `PROVISIONAL_METHOD_KINEMATICS`. The current engineering values are 120 Hz integration, 120 ms visual-motor delay, 2.4 rad/s angular-velocity cap, 12 rad/s² angular-acceleration cap and 120 rad/s³ jerk cap. These are simulator calibration parameters, not claims about human shooting limits; Sense/video must later calibrate or replace them.

## Constraint gate

The CI test commands a large angular move and verifies:
- no first-frame teleportation;
- no movement before the configured visual-motor delay expires;
- finite response begins after the delay;
- angular velocity never exceeds the configured cap;
- angular acceleration never exceeds the configured cap;
- angular jerk never exceeds the configured cap;
- the plant makes substantial progress toward a target command without simply snapping to it;
- injection of a forbidden `requiredLead` field into the command is rejected by the privileged-state audit.

The deterministic local/CI reference trace reached a final azimuth of approximately 0.440 rad after one second for a 0.600 rad commanded azimuth. Peak velocity/acceleration/jerk reached the provisional caps (2.4 rad/s, 12 rad/s² and 120 rad/s³ respectively), demonstrating that the limits are active constraints rather than decorative metadata.

## Scientific interpretation

This gate establishes only that Ellis now has a non-teleporting, delayed, bounded motor plant which can be driven from perception/plan-derived angular commands. It does **not** establish human realism, good gun movement, a valid shooting method, correct lead, or target-breaking ability.

A useful negative implication is preserved: because the current simple controller can reach its provisional caps, those caps will materially influence learned behaviour. They therefore must remain exposed experimental parameters and later receive sensitivity analysis and Sense/video calibration; they must not silently become 'human truth'.

## Regression / anti-cheat status

The complete existing L0–L2 regression suite and the new L3 motor test passed in CI run 33951254843. The oracle/shooter information boundary remains green through this gate.

## Next action

Build the first **maintained-lead no-learning baseline** on crossers. It must convert only live apparent target belief plus the L2 presentation plan into a learnable target–gun angular-separation command, pass that command through the finite gun plant, choose a trigger using shooter-visible state, and let the oracle score the shot only afterwards. Do not provide exact required lead or intercept. Establish poor/static and exploratory separation baselines before adaptive learning, then test whether outcome history can improve the separation/trigger policy on unseen targets.
