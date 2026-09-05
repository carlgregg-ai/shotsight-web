# L1 Multi-family Ambiguity — Green Checkpoint 1

Date: 2026-09-05
Branch: `virtual-shooter-v1`
Status: GREEN SUBGATE — MIXED-FAMILY BELIEF WORKS, POOR-ACQUISITION LIMIT EXPOSED

## What changed

- Added a gun-free multi-family perception learner for CROSSER / QUARTERER / LOOPER.
- Runtime input remains `ShooterObservation` only; the learner imports no physics/oracle/evaluator module.
- The learner fits quadratic apparent-motion features from delayed/noisy angular histories and builds probabilistic family/path beliefs.
- A labelled calibration/training partition is used only to fit statistical family prototypes; held-out runtime observations contain no oracle family label.
- Added 270 labelled training presentations (90/family) and 540 completely separate held-out presentations (180/family).
- Added FULL 300 ms, SHORT 240 ms, and degraded PARTIAL 220 ms observation conditions.
- Added anti-cheat static import checks and runtime boundary audits.

## Verified CI

Workflow: `ShotSight virtual shooter`
Run: `33940550902`
Head: `ca081de1868b3675fcec0031196eb1d5869ed005`
Conclusion: SUCCESS

All prior L0/L1 gates and the new held-out mixed-family ambiguity test passed.

## Held-out results

### FULL — 300 ms
- n: 540
- family accuracy: **0.8370**
- multiclass Brier: **0.2604**
- mean belief confidence: **0.5763**
- azimuth future-path RMSE: **0.00441 rad**
- elevation future-path RMSE: **0.00249 rad**
- crosser-v-quarterer accuracy: **0.7556**
- crosser recall: **0.7889**
- quarterer recall: **0.7222**
- looper recall: **1.0000**

### SHORT — 240 ms
- family accuracy: **0.7704**
- multiclass Brier: **0.3983**
- mean belief confidence: **0.3527**
- azimuth future-path RMSE: **0.00511 rad**
- elevation future-path RMSE: **0.00385 rad**
- crosser-v-quarterer accuracy: **0.6556**
- looper recall: **1.0000**

### PARTIAL / POOR ACQUISITION — 220 ms
- family accuracy: **0.4556**
- multiclass Brier: **0.6489**
- mean belief confidence: **0.1564**
- azimuth future-path RMSE: **0.01002 rad**
- elevation future-path RMSE: **0.01271 rad**
- crosser-v-quarterer accuracy: **0.1833**
- crosser recall: **0.1333**
- quarterer recall: **0.2333**
- looper recall: **1.0000**

## Interpretation

The reader extracts useful target-family information from short human-like angular histories without privileged state. At 300 ms, loopers in the current toy-gravity world are very easy to recognise; crossers and quarterers are materially more ambiguous but still separable above chance. At 240 ms the system retains useful discrimination while confidence falls appropriately.

The degraded 220 ms condition exposes a genuine limitation. The current quadratic-feature model cannot reliably distinguish crossers from quarterers when acquisition quality/noise is poor. Crucially, confidence falls sharply rather than remaining falsely high. This is a desirable scientific failure mode: the shooter should be able to represent 'I have not read this bird well enough yet.'

## Negative findings / safeguards

- Do NOT interpret 100% looper recall as general looper understanding. The inherited looper world is a gravity-only engineering toy and has a strong vertical-curvature signature.
- Crosser-v-quarterer discrimination is the harder and more valuable ambiguity test. Poor 220 ms acquisition is currently below useful classification performance.
- Family-label supervision is used only in the training partition to fit prototypes; no held-out runtime oracle family label is exposed.
- The mixed-family model's uncertainty is heuristic and has not yet received the same held-out interval-calibration treatment as the stable-crosser model.
- No gun, lead, intercept or trigger policy has entered L1.
- Current target worlds remain engineering/provisional models, not certified real-clay aerodynamics.

## Decision

Do NOT close L1 yet. The subgate is green because the architecture learns useful family/path beliefs and correctly degrades confidence, but L1 still needs a decision-quality ambiguity test: determine whether waiting for additional visual information improves the difficult poor-acquisition crosser/quarterer cases, calibrate multi-family probability confidence on a separate calibration split, and establish a principled `WAIT_FOR_MORE_INFORMATION` criterion before L2 planning.

## Next action

1. Add explicit family-probability calibration (reliability/ECE/Brier by confidence bin) on a new calibration partition.
2. For ambiguous 200–300 ms observations, compare immediate classification against waiting another 50–150 ms for more visual evidence.
3. Require the belief to identify low-information cases without oracle access.
4. Test whether selective waiting materially improves held-out crosser/quarterer discrimination and future-path error.
5. Only then decide whether L1 is ready to close and L2 pickup/hold/break planning may begin.
