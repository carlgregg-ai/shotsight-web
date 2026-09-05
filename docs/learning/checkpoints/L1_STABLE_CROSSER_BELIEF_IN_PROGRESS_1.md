# L1 Stable Crosser Belief — In Progress Checkpoint 1

Date: 2026-09-05
Branch: `virtual-shooter-v1`
Status: IN PROGRESS — PERCEPTION WORKS, UNCERTAINTY CALIBRATION NOT YET ACCEPTABLE

## Completed this tranche

- Added learner-side `learning/crosser-belief-v1.mjs` with no physics/oracle imports.
- The belief model uses only validated delayed/noisy ShooterObservation history.
- It estimates apparent azimuth/elevation rates, left/right probability, short-horizon apparent path mean, path uncertainty and confidence.
- Added referee-side `learning/perception-evaluation-v1.mjs`; oracle truth is consulted only after the belief has been frozen.
- Added source-import guards and anti-cheat checks.
- Added three information conditions: CLEAR, SHORT evidence window and NOISY/low-quality evidence.
- Added L1 CI test suite.

## Verified CI

Workflow: `ShotSight virtual shooter`
Run: `33934708438`
Head: `af5efee100270e7d9c292b7193e5ae359a701208`
L0 boundary: PASS
L0 baselines: PASS
L1 perception: PASS as implemented

## L1 benchmark results — 12 hidden stable crossers

### CLEAR
- direction accuracy: 1.000
- direction Brier: ~0.000001
- azimuth prediction RMSE: 0.003218 rad
- elevation prediction RMSE: 0.001642 rad
- azimuth ±2σ coverage: **0.667**
- elevation ±2σ coverage: 1.000
- mean confidence: 0.892

### SHORT observation window
- direction accuracy: 1.000
- azimuth prediction RMSE: 0.001246 rad
- elevation prediction RMSE: 0.002488 rad
- azimuth ±2σ coverage: 1.000
- elevation ±2σ coverage: 1.000
- mean confidence: **0.447**

### NOISY / lower acquisition quality
- direction accuracy: 1.000
- azimuth prediction RMSE: 0.008169 rad
- elevation prediction RMSE: 0.007428 rad
- azimuth ±2σ coverage: 0.750
- elevation ±2σ coverage: 0.917
- mean confidence: **0.538**

## Interpretation

The stable-crossing direction task is currently easy enough that even degraded observations preserve the correct left/right sign on this small bank. That is not evidence of hidden-state leakage by itself because learner imports remain clean and confidence falls substantially under shorter/noisier evidence.

The important failure is **uncertainty calibration**. CLEAR azimuth ±2σ coverage of 0.667 is too low for a probabilistic path belief intended to represent honest uncertainty. NOISY azimuth coverage of 0.750 is also under-dispersed. The current simple regression uncertainty is overconfident about future apparent path.

This is a useful scientific failure: point prediction is already reasonably accurate for simple stable crossers, but confidence intervals are not yet trustworthy. L1 must not be declared complete until uncertainty calibration improves and holds on a larger held-out perception bank.

## Safeguards / negative findings

- Do not promote perfect direction accuracy on 12 stable crossers as general target-reading competence.
- Do not treat current direction Brier saturation as proof of broad confidence calibration; left/right sign is too easy here.
- Do not tune interval width solely to make this 12-target bank look good. Introduce a calibration split and a separate held-out perception test.
- Keep the gun absent until L1 belief calibration passes.

## Next action

1. Build a larger deterministic L1 perception bank with train/calibration/held-out partitions and wider speed/range/angle/noise variation while retaining stable-crossing physics.
2. Calibrate belief uncertainty on calibration data only; evaluate interval coverage and proper scoring on untouched held-out data.
3. Add stronger information-reduction probes, including very short visual windows and partial acquisition.
4. Require plausible confidence/coverage degradation without privileged-state leakage.
5. Only then close L1 and advance to L2 pickup/hold/break planning.
