# L1 Uncertainty Calibration — Green Checkpoint 1

Date: 2026-09-05
Branch: `virtual-shooter-v1`
Status: GREEN — STABLE-CROSSER UNCERTAINTY CALIBRATED ON HELD-OUT TARGETS

## What changed

- Added a deterministic, partitioned stable-crosser perception bank with wider range, speed, elevation, initial position and left/right direction variation.
- Calibration partition: 120 hidden scenarios.
- Untouched held-out partition: 240 different hidden scenarios.
- Added four perception conditions: CLEAR, SHORT, NOISY and PARTIAL acquisition.
- Added global uncertainty-scale fitting on calibration targets only.
- Oracle truth is used only after beliefs are frozen, to fit global calibration parameters on the calibration split and to score held-out predictions.
- The learner-side `crosser-belief-v1.mjs` remains free of physics/oracle/referee imports.
- Added CI tests requiring plausible held-out interval coverage and lower confidence under information degradation.

## Verified CI

Workflow: `ShotSight virtual shooter`
Run: `33937721467`
Head: `94a7ffd88680a65cbcbece3a9700e2c3e9a6bf0c`
Conclusion: SUCCESS

All L0 boundary/baseline tests, original L1 stable-crosser tests and the new held-out calibration gate passed.

## Held-out metrics

All values below are on 240 untouched scenarios per condition with observation-noise seeds independent of the calibration split.

### CLEAR
- azimuth RMSE: 0.004078 rad
- elevation RMSE: 0.001697 rad
- raw nominal-95% azimuth coverage: 0.575
- calibrated azimuth coverage: **0.9292**
- raw elevation coverage: 0.9833
- calibrated elevation coverage: **0.9083**
- azimuth mean Gaussian NLL improved from -3.500 to **-5.047**
- mean confidence: 0.892

### SHORT
- azimuth RMSE: 0.005190 rad
- elevation RMSE: 0.003533 rad
- raw azimuth coverage: 0.5708
- calibrated azimuth coverage: **0.9375**
- calibrated elevation coverage: **0.9458**
- azimuth mean Gaussian NLL improved from -3.857 to **-5.008**
- mean confidence: 0.382

### NOISY
- azimuth RMSE: 0.009768 rad
- elevation RMSE: 0.007297 rad
- raw azimuth coverage: 0.5083
- calibrated azimuth coverage: **0.9667**
- calibrated elevation coverage: **0.9625**
- azimuth mean Gaussian NLL improved from -1.053 to **-4.293**
- mean confidence: 0.539

### PARTIAL acquisition
- azimuth RMSE: 0.009017 rad
- elevation RMSE: 0.015184 rad
- raw azimuth coverage: 0.4958
- calibrated azimuth coverage: **0.9667**
- calibrated elevation coverage: **0.9292**
- azimuth mean Gaussian NLL improved from -2.022 to **-4.436**
- mean confidence: **0.134**

## Interpretation

The first L1 failure was genuine: the base learner produced useful stable-crosser point predictions but substantially underestimated azimuth uncertainty. A calibration-only global scaling layer corrects most of that under-dispersion on untouched targets. Crucially, calibration does not change the predicted target path mean and therefore does not secretly improve target-reading accuracy; it changes only how uncertain the learner admits it is.

Information degradation behaves directionally correctly: CLEAR confidence is high; SHORT is much lower; PARTIAL acquisition is very low. NOISY point errors are materially larger than CLEAR.

The azimuth calibration scales are large (about 2.0–3.5 depending on observation condition), which is a negative finding about the simple line-fit uncertainty model rather than something to hide. Later work should attempt a more principled heteroscedastic belief model instead of relying permanently on condition-specific global scale factors.

## Safeguards / negative findings

- This closes the stable-crosser uncertainty-calibration subgate, not all of L1.
- Calibration targets and held-out targets are structurally separate and use independent observation-noise seeds.
- Do not tune further on the held-out bank; create a fresh sealed bank if calibration architecture changes materially.
- The current point-belief model is still limited to stable crossers and does not yet prove target-family discrimination or curved/transitioning path understanding.
- The current world remains an engineering/provisional target model, not realistic clay-flight certification.
- Gun and lead remain absent from L1.

## Next action

Advance L1 perception-only work to target-family ambiguity without introducing the gun:
1. create a hidden bank containing stable crossers, quarterers and simple gravity loopers where inherited oracle models are adequate;
2. expose only human-like delayed/noisy angular histories;
3. estimate family probabilities and future apparent-path clouds from those histories;
4. test calibration, confusion structure and confidence under 200–300 ms and partial-acquisition windows;
5. specifically prevent oracle family labels from entering the learner;
6. close L1 only after unseen family/trajectory transfer and uncertainty calibration are credible.
