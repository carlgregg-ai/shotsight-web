# Gate J — cinematic three-method renders accepted; CPSA reconstruction blocked external

Date: 2026-09-05

Status: **THREE-METHOD CINEMATIC RENDER PASS / FOURTH DELIVERABLE BLOCKED_EXTERNAL**.

## Verification

Branch head inspected before this checkpoint: `8df88ab6d87221b6ca8c37e518e1da6f9e83359b`.

Repair source head: `bb27a480a523f58fcd75d10099c75eb5470492ff`.
GitHub Actions run: `33938799882` — **SUCCESS**.
Fresh rendered artifact: `reviewer-method-comparison-videos`, artifact id `9961094184`, digest `sha256:9654a3eeb8f53ca19e384ad2b30f743b3730e5e6bb6f87ca554e42a09420e68d`.

The workflow passed the existing physics/ballistics, method-registry, reviewer-adapter, three-method topology, manifest/trace export, deterministic 60 Hz frame rendering and MP4 encoding checks. The rendered artifact was downloaded and inspected directly rather than accepted from CI status alone.

## Three-method visual acceptance

Representative start/pre-shot/shot/post-shot frames were inspected from the encoded artifact. The final cinematic composition is accepted for the current ShotSight reviewer scope because it now satisfies the controlling Bible direction sufficiently for review handoff:

- dominant warm-neutral coach scene with large rounded stylised mannequin and technically legible mount;
- simplified matte sporting gun with blue gun/path semantics;
- orange/red clay remains visually dominant;
- amber spatial `SHOT` cue is derived from the canonical target position at `scenario.shotTime_s`, not hand-positioned;
- synchronized shooter-eye and elevated-oblique views remain subordinate to the coach view;
- reduced dashboard chrome/telemetry and substantial negative space;
- no fake BREAK event;
- all displayed motion remains driven by the shared mathematical frame state;
- Swing-through, Pull-away and Maintained Lead remain visibly distinct while using the exact same canonical clay, master clock, shot time and shot solution.

This acceptance is **visual/reviewer acceptance only**. It does not upgrade clay realism, dense shot-cloud realism, or method numerical kinematics. Numerical timings/separations remain `SHOTSIGHT_HYPOTHESIS_PENDING_EXPERT_REVIEW`; body/arm rig remains `VISUAL_RIG_ONLY_NOT_METHOD_KINEMATICS`; target orientation remains HOLD.

## Numerical safeguards retained

All three methods still use the same canonical target XYZ/time and 0.8 s shot event and converge to the same canonical bore at shot time. Quantitative traces expose signed target-bore separation, target angular velocity, gun angular velocity, relative angular velocity, gun angular acceleration and method phase. No source-certified numerical method thresholds have been invented.

## CPSA Episode 3 reconstruction — exact blocker

The fourth required deliverable cannot be completed scientifically with the currently accessible source interfaces.

YouTube id: `ejE_ljX-ylE`.

Current web retrieval can recover CPSA page metadata but cannot provide frame-accessible footage. A fresh retrieval on 2026-09-05 again found the CPSA modern Series 3 page describing Episode 3 as left-to-right, while the CPSA video-library title describes two right-to-left standards. Direct YouTube retrieval did not expose video frames. Because the source metadata conflicts, the footage itself is required before direction, image-space target track, gun track, target-gun separation history, shot/break timing or camera geometry can be marked OBSERVED.

Therefore the reconstruction remains `BLOCKED_EXTERNAL: FRAME_ACCESSIBLE_CPSA_S3E3_FOOTAGE_REQUIRED`.

Acceptable unblock inputs are either:
1. a local/uploaded copy of the relevant CPSA Episode 3 video or frame sequence with provenance; or
2. a tool/source that exposes the actual video frames for observation.

Do not infer the disputed direction or fabricate pixel/angular tracks from metadata.

## Resume point

When frame-accessible footage becomes available:
1. build an OBSERVED / INFERRED / UNOBSERVABLE_AMBIGUOUS frame table;
2. resolve direction from footage;
3. estimate only footage-supported image-space/angular target and gun tracks and event timing;
4. fit the existing physics-constrained model while preserving monocular scale/depth ambiguity;
5. produce residuals/confidence/assumptions sidecar;
6. render the fitted reconstruction through the accepted cinematic ShotSight renderer;
7. run numerical + visual adversarial QA and only then close the four-video programme.
