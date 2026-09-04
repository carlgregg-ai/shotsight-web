# ShotSight 3D Maths-Driven Reviewer Animation Build

Status: controlling reviewer-build specification.
Branch: `physics-engine-v1`.

## Mission
Create the canonical flat-crosser reviewer animation in the approved ShotSight stylised 3D language while remaining completely driven by the existing mathematical model. The model creates the animation; the animation never creates the model.

The earlier failures establish two explicit anti-patterns: (1) mathematically safer but visually crude 2-D engineering views; (2) attractive generated keyframes stitched into animation without shared model state. Neither is acceptable.

## Governing rules
- Every displayed target position, target velocity, bore direction, shot time, pellet-arrival time, lead relationship and event comes from the current simulator state.
- All views consume one simulation state at one master-clock time.
- No image-generation system or hand-authored keyframe sequence may act as the animation engine.
- No manually adjusted clay/gun positions, cosmetic motion easing, invented motion blur, invented break or unsupported method behaviour.
- Motion traces are history only and must be derived from previous model states; no future trail is allowed.
- `ENGINEERING_INTERCEPT_REFERENCE` remains engineering reference, never a coaching method.
- Source method reference may be displayed only with its existing provenance/HOLD status.
- A polished renderer must not conceal `realisticClay:false`, `instructionalMotion:false`, TEST_ONLY ballistics or any HOLD.

## Visual authority
The uploaded `ShotSight_Visual_Style_Animation_Bible_v0_1(2).pdf` is the governing visual reference. Locked rules applied here include: unmistakably stylised rather than photoreal; simple rounded instructional mannequin; warm off-white/pale neutral world; visual quiet; orange/red target information; blue gun-path information; amber/yellow reserved for decisive shot/change cues; neutral greys for environment/history; first-person view keeps clay visually dominant and barrel subordinate; multiple views are synchronized from one shot model; technical accuracy outranks visual charm.

Style controls appearance only. It cannot change trajectory, timing, lead, bore direction or event ordering.

## First build scope
Only the canonical P7 flat crosser.

Current authoritative model: `physics/canonical-flat-crosser-v1.mjs`.
Current engineering debug timebase: `physics/flat-crosser-debug-v1.mjs`.

Current limitations must remain visible:
- constant-velocity target engineering proof;
- TEST_ONLY constant-speed pellet provider / straight pellet path;
- no realistic clay aerodynamics;
- no dense shot-cloud model;
- `ENGINEERING_INTERCEPT_REFERENCE` is not a coaching method;
- NSCA long-crosser pull-away is source-reference-only and method kinematics remain HOLD.

## Required reviewer output
- ShotSight stylised 3D review surface.
- Third-person coach view.
- Shooter-eye view.
- Elevated oblique view.
- One shared 60 Hz reviewer frame lattice and master clock.
- Full 2.0 s canonical sequence.
- Looping playback, play/pause, frame step, scrub and 0.25x/0.5x/1x/2x playback.
- Subtle honest status labels.
- No fake break.
- Minimal optional technical state, not telemetry clutter.

## Renderer boundary
The renderer may define fixed reviewer camera placement, abstract environment, materials, lighting, mannequin geometry and deterministic visual rig mapping. It may not invent physical or coaching state.

The neutral mannequin is a visualization rig only. Its gun barrel vector must equal the model bore vector. Body/arm geometry merely supports the displayed gun in a plausible mount and must be labeled `VISUAL_RIG_ONLY_NOT_METHOD_KINEMATICS`; it is not expert gun kinematics.

Target orientation is not available from the current flat-crosser state and must not be invented as physical truth. The renderer uses a neutral orange target marker/disc and records `TARGET_ORIENTATION_HOLD`.

## Gate sequence
A. Recovery/current-state inspection and durable master/state creation.
B. Simulation-state-to-3D mapping specification and fail-closed adapter.
C. Single-frame validation at start, pre-shot, shot and pellet-arrival/post-shot.
D. Full-sequence deterministic renderer and synchronized controls.
E. Visual polish constrained to style/readability only.
F. Adversarial technical/style QA.
G. Final reviewer package and review handoff.

Each gate must be verified and checkpointed. Failed/interrupted execution resumes at the last verified incomplete operation. Never advance through a failed gate.

## Completion criteria
Gate G passes only when the renderer is unmistakably ShotSight-stylised, every technical frame is model-driven, all views are synchronized, trails agree with past motion, gun barrel direction agrees with model bore, frame rate/loop controls are coherent, limitations are visible, no unsupported coaching method is implied, and the result is usable for expert review.
