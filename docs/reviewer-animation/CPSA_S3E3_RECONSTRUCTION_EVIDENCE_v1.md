# CPSA How to Hit Series 3 Episode 3 — reconstruction evidence v1

Date: 2026-09-05
Status: **SOURCE TRIANGULATION COMPLETE; VIDEO-FRAME OBSERVATION STILL REQUIRED**
Target output: model-driven ShotSight technical reconstruction, not pixel tracing.

## Selected source

CPSA How to Hit Series 3 Episode 3 / YouTube id `ejE_ljX-ylE`.
Coach: Simon Arbuckle, CPSA Level 3 Senior Coach.
Companion written source: *Pull!* May 2019, p.22, "A simultaneous pair using the CPSA Method & Maintained Lead".

## Critical source-direction conflict

Do **not** hard-code target direction from the modern summary page.

- Current CPSA Series 3 landing page describes Episode 3 as simultaneous **left-to-right** crossing standards, Pull Away followed by Maintained Lead.
- CPSA video-library/search title describes Episode 3 as "A simultaneous pair: Two R-L Standards".
- Original CPSA *Pull!* May 2019 companion article explicitly says both standards travel **right to left** from behind a green fence to the shooter's right.

Evidence-weight decision: the original contemporaneous companion article + video-library title currently outweigh the modern summary wording, but the reconstruction direction remains `HOLD_VIDEO_CONFIRMATION` until the actual footage is frame-inspected. This contradiction is itself a required provenance output.

## DIRECT observations available from CPSA's contemporaneous written companion

These are source statements, not measurements from video frames:

- The presentation is a simultaneous pair of standard clays.
- Both targets are described as travelling right-to-left.
- Both originate from behind a green fence to the shooter's right.
- Approximate range is described as about 50 metres out front.
- Target A is low and flat.
- Target B rises slightly and then falls away.
- Targets are described as far away and fast.
- Intended break region is far left, toward a metal screen.
- Visual pick-up is slightly left of the trap.
- Gun-hold is slightly farther left than the visual pick-up so the shooter can focus before useful gun movement.
- First target A uses CPSA Method / Pull Away: focus/lock on, move with it, then pull ahead and shoot.
- The first-shot forward gun movement is deliberately used to establish a forward relationship on target B.
- Target B is then shot using Maintained Lead.

## OBSERVED-from-video fields still required

No numerical/video-frame claim may be promoted until the actual footage is accessible and inspected. Required observation table fields:

- source timestamp / frame id
- image-space target-A centroid and uncertainty
- image-space target-B centroid and uncertainty
- visible muzzle/barrel axis proxy and uncertainty
- target visibility state / occlusion
- gun movement onset
- target-A acquisition/connection interval
- target-A separation onset
- first shot timestamp
- first visible break response, if any
- transition from A to B
- target-B relative barrel separation history
- second shot timestamp
- second visible break response, if any
- camera movement/cut status
- usable static landmarks for angular/perspective calibration

## Reconstruction classes

### OBSERVED
Only image/video measurements and explicit source statements. Video-derived values must retain pixel/angular uncertainty and source timestamps.

### CALIBRATED_DERIVED
Only values derived from a documented camera calibration or trustworthy scene anchor. Approximate written "about 50 metres" may be used as an explicit coarse anchor in a sensitivity analysis, never as exact range.

### INFERRED
Candidate metric target/gun trajectories fitted to observations. Must name the model, assumptions, residuals and confidence.

### UNOBSERVABLE_AMBIGUOUS
Absolute depth/scale, precise physical lead, exact eye gaze, hidden barrel/body geometry or any parameter not recoverable from the monocular footage and available anchors.

## Model-fitting rule

Fit dynamics to observed image/angular tracks; never trace a visual path into the final animation. The fitted model must generate target and gun state on a single master clock, then the ShotSight renderer consumes that state. If several metric trajectories explain the footage similarly, preserve the family/uncertainty rather than selecting a falsely precise solution.

## Required contradiction test

Before fitting, determine the actual direction from video frames. If the footage confirms R-L, mark the modern landing-page L-R wording as a metadata inconsistency. If footage confirms L-R, investigate whether the May 2019 article/video id mapping is mismatched. Do not proceed to a named-source technical reconstruction until this is resolved.

## Current external limitation

The automation web layer can retrieve CPSA's source metadata and contemporaneous article text, but the YouTube watch page itself was not frame-accessible during this run. Container networking also could not fetch YouTube. This is not yet a programme-wide blocker because the three-method quantitative/render pipeline can continue; it is a specific `VIDEO_FRAME_ACCESS_REQUIRED` hold on the CPSA reconstruction.
