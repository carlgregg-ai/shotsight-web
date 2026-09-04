# P9A — Video Observation & Provenance Contract — COMPLETE

## Status
- Stage: P9 — Video-Understanding Foundation
- Substage: P9A — observation/provenance contract
- Status: **COMPLETE**
- Branch: `physics-engine-v1`
- Verified source head: `c238520437bf316791695da52ec6c9aec64ad695`
- GitHub Actions run: `33912840315` — **SUCCESS**

## Implemented evidence classes
`physics/video-observation-v1.mjs` defines and enforces:
- `OBSERVED` — image measurements such as frame/time and pixel track coordinates;
- `CALIBRATED_DERIVED` — quantities recoverable only after an explicit calibration, such as camera rays and apparent azimuth/elevation;
- `INFERRED` — model-dependent candidates requiring explicit model id, assumptions and optional confidence;
- `UNOBSERVABLE_AMBIGUOUS` — quantities that cannot be identified from the available observation/calibration.

## Fail-closed monocular-depth rule
An image observation does not receive an absolute range. `monocularAbsoluteRangeResult(...)` returns `UNOBSERVABLE_AMBIGUOUS` with reason `UNCALIBRATED_MONOCULAR_DEPTH_NOT_IDENTIFIABLE` unless an explicit metric scene/range calibration and provenance are supplied.

The regression includes an exact projective scale-ambiguity demonstration: two distinct 3-D camera-frame vectors lying on the same ray project to the same pixel. Therefore no absolute depth is inferred from an uncalibrated monocular track.

## Synthetic recovery test
`tests/physics-video-observation-v1.mjs` uses the existing P8A quarterer engineering simulator only as **synthetic recovery test data**. Generator provenance explicitly records:
- `SYNTHETIC_TEST_DATA`;
- source scenario/generator id;
- generator certification status;
- `realisticClay:false`;
- warning `DO_NOT_TREAT_AS_REAL_CLAY_VIDEO`.

Synthetic pinhole intrinsics are explicitly engineering test inputs. Target state is projected to pixels, wrapped as `OBSERVED`, then angular coordinates are recovered as `CALIBRATED_DERIVED` and checked against the source simulation to floating-point resolution. This tests the observation/calibration pipeline; it does not validate real-world vision performance or realistic clay flight.

## Other guards verified
- front-camera plane required for pinhole projection;
- focal lengths must be positive;
- calibration provenance is mandatory;
- an `INFERRED` candidate cannot be created without explicit assumptions;
- calibrated metric range requires a positive range measurement and provenance;
- observed pixel values never silently become calibrated angular or metric values.

## Verification
Full P3–P9A workflow passed in Actions run `33912840315`, including all existing rendered P7/P8 gates and `Run P9A video observation/provenance recovery tests`.

## Scope boundary
P9A does **not** implement target detection, tracking, optical flow, camera calibration from real footage, 3-D reconstruction, method recognition or realistic real-video validation. It establishes the data/provenance contract those later components must obey.

## Next action
Proceed to P9B physics-constrained model fitting. Use deterministic synthetic observations with retained generator provenance. Quantify recovery residuals and model rejection/failure modes. Keep absolute scale/depth ambiguous unless metric calibration is explicitly provided; fitted/model-dependent states must remain `INFERRED` and carry their assumptions.
