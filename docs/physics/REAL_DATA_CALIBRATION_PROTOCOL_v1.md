# ShotSight Real-Data Calibration Protocol v1

## Purpose
Provide a reproducible capture, calibration, fit and held-out validation protocol for real target/gun data without promoting synthetic agreement or unmeasured assumptions into physical truth.

## Required capture record
Each session must durably record:
- session id, date, location and operator;
- target manufacturer/type/model where known, with provenance;
- trap identity/model and known settings with provenance; unknown launch-state mappings remain UNKNOWN/HOLD;
- camera identity, recording mode, nominal frame rate and a versioned camera calibration id/provenance;
- measured camera/trap/field reference geometry in the programme coordinate convention, including measurement method/uncertainty;
- environmental temperature, pressure and, when available/material, wind vector and uncertainty;
- raw video filenames/checksums and immutable original timing metadata;
- per-throw id and predetermined role: `FIT`, `VALIDATION` or `EXCLUDED` with exclusion reason.

## Camera and geometry calibration
Use a calibration target/field references of measured geometry to recover intrinsics/extrinsics appropriate to the capture. Preserve raw calibration observations, fit outputs, residuals and calibration version. Do not silently assume camera-to-bore alignment for gun-mounted footage; store that as a separate measured/calibrated transform with uncertainty when available.

## Target trajectory capture
Preferred target-flight calibration uses repeated throws of one known target/trap condition with two calibrated viewpoints when practical. One-view footage may support angular/bearing observations but does not by itself identify absolute metric depth. Time-synchronise viewpoints using a recorded common event or hardware synchronisation whose uncertainty is documented.

## Ground-truth observations
Store image-space detections/tracks as `OBSERVED`. Convert to rays/angles only through a referenced calibration and label these `CALIBRATED_DERIVED`. Any fitted trajectory/model state remains `INFERRED`. Unrecoverable scale/depth/method quantities remain `UNOBSERVABLE_AMBIGUOUS`.

## Fit/validation separation
Assign throws to fit and held-out validation before model tuning. A throw used to estimate parameters must never appear in held-out validation. Preserve split membership in the durable manifest. If data are too sparse for a meaningful split, return `READY_FOR_REAL_DATA`/insufficient evidence rather than reporting a validation score.

## Calibration workflow
1. Validate session manifest and provenance completeness.
2. Validate camera calibration and field geometry.
3. Recover observation tracks and associated timing uncertainty.
4. Fit only explicitly named parameters/model families to `FIT` throws.
5. Freeze fitted parameters/model version.
6. Evaluate on held-out `VALIDATION` throws without refitting.
7. Report per-throw and aggregate residuals in physically interpretable units (angular residual minimum; metric residual only where metric geometry is actually identified).
8. Preserve residual distributions, failed fits and excluded throws; do not report only successful cases.
9. Compare candidate models where scientifically justified; do not invent a universal pass threshold from one capture campaign.
10. Record the exact dataset, code commit, calibration ids, parameter set and result digest needed for reproduction.

## Expert gun/method reference footage
For named-method validation, capture an expert shooter only with explicit method/source context. Where available, synchronise gun-mounted camera with independent gun-motion sensing and shot/break event timing. Compare measured gun angular movement with the named method's actual numerical invariants. A verbal method label alone is not ground truth for kinematics.

## Ballistics/break validation
A visible break frame is an observation of break timing/location, not automatic proof of pellet-cloud centre intersection. Sporting-load validation requires provenance-backed ammunition inputs and a ballistics model whose current unresolved dense-cloud/shot-string limitations remain disclosed.

## Reproducibility package
A valid calibration campaign should archive: raw media hashes, session manifest, camera calibration, measured geometry, observation tracks, split declaration, code commit, model id, fitted parameters with provenance/uncertainty, fit residuals, held-out residuals, failures/exclusions and a short scope statement identifying what the campaign did not establish.

## Current programme status
The repository framework can now enforce the manifest/split/provenance contract, but no real capture campaign is claimed by this document. Until measured real data meeting this protocol are available, realistic clay and expert-method empirical certification remain HOLD.
