# Gate I — Bible-style renderer CI green; adversarial visual QA HOLD

Date: 2026-09-05

Status: **CI PASS / FINAL BIBLE-QUALITY VISUAL ACCEPTANCE HOLD**.

Verified head: `3667884d9a0779151f0535f2ec1d1d1e3767db63`.
GitHub Actions run: `33932658938` — **SUCCESS**.
Rendered three-method artifact: `reviewer-method-comparison-videos`, artifact id `9959107117`, digest `sha256:c789a0bcac85c735820eb66bde404a3a7cd6c70032ce8324f81bd720e0c412c7`.

## What is verified

- All existing physics/method CI remains green on the exact style-candidate head.
- Three H.264 reviewer MP4s encode successfully at 1440×980 / 60 fps / 2.0167 s.
- The renderer remains downstream of the mathematical state; this gate changed presentation pixels only.
- Same canonical target XYZ/time, same 0.8 s shot time, same canonical ballistic shot solution and same method-state topology remain protected by existing tests and render-state checks.
- Swing-through, Pull-away and Maintained Lead remain `SHOTSIGHT_HYPOTHESIS_PENDING_EXPERT_REVIEW`; no instructional numerical claim is unlocked.

## Visual Bible re-check

The actual `ShotSight_Visual_Style_Animation_Bible_v0_1(2).pdf` was re-read before acceptance review. The locked target is simple/calm/purposeful 3D with a simple rounded instructional mannequin, strong silhouette and technically legible hands/shoulders/mount; a simplified sporting O/U gun; warm neutral world; large visual quiet; and instructional hierarchy of target → movement relationship → decisive point → explanation.

Representative start / approach / shot / post-shot frames were inspected across all three rendered methods.

## Adversarial findings

### PASS / improvement
- rounded mannequin body/limbs read substantially better than the prior stick/engineering rig;
- matte wood/dark-metal gun language is directionally correct;
- warm neutral environment, soft hills and sparse rounded landscape masses align with the world language;
- orange/red target, blue gun-path, green connection and amber shot semantics remain coherent;
- first-person barrels are restrained and do not dominate the target.

### HOLD — why this is not yet final Bible quality
1. **Shooter scale / technical legibility:** in the principal coach frame the shooter occupies too little of the visual field. Hands, shoulder relationship, mount and body-driven motion are not legible at the strength required by the Bible.
2. **Hierarchy:** the exported movie still reads first as a review dashboard/UI rather than as the ShotSight instructional 3D scene. Header, multiple panels, metrics and controls compete with target → movement relationship → decisive point.
3. **Premium 3D depth:** the Canvas shading is improved pseudo-3D, but the overall scene still reads flatter and more technical than the Bible's rounded premium instructional renders.
4. **Main-view composition:** the coach camera attempts to include shooter and the full 35 m crosser at once, making both smaller than ideal. The Bible reference achieves a stronger hero composition with the shooter clearly readable while the target/path remains the visual teaching focus.
5. **Comparison views:** synchronized shooter-eye and oblique verification views are useful, but should become subordinate evidence views rather than equal dashboard-weight content in the final encoded deliverable.

These are presentation defects only. Do **not** alter target/gun transforms, shot timing, method state or camera clock to make the picture prettier.

## Required next iteration

Create a dedicated **FINAL_RENDER / CINEMATIC_REVIEW_MODE** that still consumes the exact same frame state but composes it as a premium ShotSight teaching scene:
- make the coach/hero scene dominant and substantially enlarge the mannequin while preserving visible target/path relationship;
- keep shooter-eye and elevated-oblique as synchronized subordinate insets or short companion sequences, not dashboard-equivalent panels;
- remove or greatly reduce telemetry, controls and status chrome from encoded MP4 frames while preserving provenance in sidecar data/reports;
- improve deterministic 3D depth/readability (rounded volumes, occlusion/shadow hierarchy) without cosmetic motion easing;
- preserve a separate engineering reviewer surface for frame stepping and telemetry; final video presentation should not be forced to look like that engineering surface.

After implementation: rerender all three methods, repeat numerical checks and adversarial frame inspection before lifting HOLD.

## CPSA Episode 3 state

A fresh attempt to access YouTube id `ejE_ljX-ylE` through available web retrieval did not yield frame-accessible footage. No pixel/angular observations were invented. The source-direction conflict therefore remains unresolved and CPSA reconstruction remains `VIDEO_FRAME_ACCESS_REQUIRED`.
