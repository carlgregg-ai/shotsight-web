# P9 — Video-Understanding Foundation — COMPLETE

## Status
- Stage: P9 — Video-Understanding Foundation
- Status: **COMPLETE**
- Branch: `physics-engine-v1`
- Verified recovery head: `07c8e496b94b5d04a19722f2cc35b1072b0b506f`
- P9B checkpoint CI at that head: GitHub Actions run `33913217153` — **SUCCESS**

## Exit-gate evidence
P9A established the observation/provenance contract with explicit `OBSERVED`, `CALIBRATED_DERIVED`, `INFERRED`, and `UNOBSERVABLE_AMBIGUOUS` output classes. It demonstrated calibrated angular recovery while refusing falsely precise monocular metric depth.

P9B added bounded physics-constrained fitting for calibrated bearing tracks using a constant-velocity 3-D model with one explicitly provenance-backed metric range anchor. Exact synthetic in-family recovery is quantitatively tested; missing metric scale fails closed as `UNOBSERVABLE_AMBIGUOUS`; curved gravity-only synthetic tracks produce materially elevated residuals under the wrong model family; no universal real-clay threshold is invented.

## P9 exit result
**PASS.** Quantitative recovery tests exist and documented failure/ambiguity modes exist, satisfying the P9 master-programme exit criterion.

## Boundaries preserved
- Synthetic simulator data remain generator-labelled and are not real footage.
- P9 does not certify realistic clay aerodynamics.
- P9 does not certify real-world target range from uncalibrated monocular footage.
- P9 does not certify a coaching method from observations alone.
- Confidence probabilities are not manufactured from exact synthetic recovery.

## Unresolved holds carried forward
- real target-flight aerodynamic calibration and held-out real-flight validation;
- camera-to-bore calibration uncertainty for gun-mounted footage;
- expert-method kinematic tolerances;
- real shot/break timing validation;
- dense shot-cloud/sporting-load validation.

## Exact next action
Proceed to P10 and build the reproducible real-data capture/calibration framework. If no suitable measured real capture dataset is durably available, checkpoint `READY_FOR_REAL_DATA` rather than inventing measurements or calibration results.
