# P9B — Physics-Constrained Bearing-Track Fitting — COMPLETE

## Status
- Stage: P9 — Video-Understanding Foundation
- Substage: P9B — physics-constrained fitting
- Status: **COMPLETE**
- Branch: `physics-engine-v1`
- Verified source head: `fa4ea5dd377702d421e2209668e8ad800ae539ef`
- GitHub Actions run: `33913129859` — **SUCCESS**

## Implemented bounded model
`physics/video-trajectory-fit-v1.mjs` implements the first explicit trajectory-fit family:
- static calibrated camera;
- calibrated bearing/ray observations;
- one constant-velocity 3-D target trajectory over the fitted interval;
- one provenance-backed metric range anchor to resolve projective scale.

Outputs are `INFERRED`, carry a model id and explicit assumptions, and expose per-frame angular residuals plus RMS/max residual. Residuals are evidence for model fit; they are deliberately **not** converted into an invented universal real-clay classification threshold.

## Fail-closed scale rule
Without a metric range anchor, the fitter returns `UNOBSERVABLE_AMBIGUOUS` with `MONOCULAR_SCALE_UNRESOLVED_CONSTANT_VELOCITY_FIT` rather than returning metric position or velocity.

The synthetic regression quantitatively demonstrates projective scale dependence: doubling the metric range anchor doubles the recovered metric anchor position and velocity while preserving essentially the same bearing fit. Therefore the metric-anchor provenance is part of the result, not metadata that may be discarded.

## Quantitative synthetic recovery
Using the P8A constant-velocity quarterer only as provenance-labelled synthetic test data:
- recovered camera-frame velocity matches the generator’s exact camera-frame velocity to numerical precision;
- exact in-family RMS angular residual is floating-point limited (order 1e-8 rad in the independent pre-CI cross-check);
- no confidence probability is manufactured from this synthetic exact fit.

## Documented model-mismatch failure mode
The same constant-velocity fitter is deliberately applied to the P8B gravity-curved looper synthetic track. Its angular residual becomes millions of times larger than the exact in-family quarterer fit in the deterministic test case. This proves that fit residuals can expose a wrong trajectory family. The test does not turn that case-specific separation into a universal threshold.

## Other failure modes
- fewer than three calibrated bearing observations: rejected;
- missing metric-anchor provenance: rejected;
- no metric anchor: metric trajectory remains ambiguous;
- invalid/non-unit calibrated ray: rejected;
- model mismatch: reported through residuals rather than hidden;
- all synthetic sources retain `realisticClay:false` where appropriate.

## Verification
The complete P3–P9B regression workflow passed in Actions run `33913129859`, including all prior rendered P7/P8 gates, P9A observation/provenance recovery tests and P9B trajectory-fit tests.

## Scope boundary
This fitter is not a real-clay trajectory estimator, not a detector/tracker, and not a method classifier. It is a bounded physics-constrained recovery primitive showing how calibrated observations, metric anchors, model assumptions and residual evidence must interact.
