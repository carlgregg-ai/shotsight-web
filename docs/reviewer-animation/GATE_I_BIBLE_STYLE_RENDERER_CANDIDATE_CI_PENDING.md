# Gate I — Bible-style renderer candidate; CI pending

Date: 2026-09-05

Status: **IN PROGRESS — STYLE CANDIDATE IMPLEMENTED / CI + RENDERED VISUAL QA PENDING**.

Head under verification: `b745ec92f03fd27d101113212ed87289ba96857c`.
GitHub Actions run: `33932628013` (in progress when checkpoint created).

## What changed

The existing model-driven method-comparison renderer was visually upgraded without changing any target, gun, method, event or clock state:

- rounded capsule-based limbs/body instead of thin engineering-stick geometry;
- softer rounded mannequin head/cap and hands;
- simplified matte sporting-gun language with restrained wood/dark-metal treatment;
- ShotSight functional colour semantics retained (orange/red target, blue gun-path, amber shot cue, green connection cue);
- warmer neutral world, softer hills and sparse rounded landscape masses;
- soft deterministic shading/shadows to increase depth while remaining non-photoreal;
- first-person barrels remain subordinate and are still derived from the same model bore.

The renderer boundary remains unchanged: visual rig only. It cannot change the canonical target trajectory, master clock, target/gun timing, bore solution, method lead-scale state, shot event or method topology.

## Visual authority re-read

The governing Visual Style & Animation Bible was re-read before this change. Locked criteria applied include: simple/calm/purposeful 3D; no photoreal instructional animation; target first, movement relationship second, decisive point third; simple rounded mannequin; technically legible mount; simplified over-and-under gun; warm off-white/pale-neutral world; soft abstract horizon; sparse rounded landscape masses; large areas of visual quiet.

## Verification still required

1. GitHub Actions must complete green on this exact head.
2. The newly rendered MP4 artifact must be downloaded and inspected frame-by-frame at start, pre-shot, shot and post-shot for all three methods.
3. Numerical/model QA must remain identical to the previous Gate H behaviour except for presentation pixels.
4. Visual acceptance must be adversarially checked against the bible. Do not call it final Bible-quality merely because CI is green.
5. If the new rounded renderer still reads as technical rather than premium instructional 3D, keep the style HOLD and iterate.

## CPSA reconstruction

No source-video measurements were invented in this gate. CPSA S3E3 remains `VIDEO_FRAME_ACCESS_REQUIRED`; the modern-summary vs original-title/article direction conflict is unresolved until frame-accessible footage is inspected.
