# ShotSight Stage 6 — Animation / Visual System (IN PROGRESS)

Date: 2026-09-04
Status: **IN_PROGRESS — reusable lesson schematics implemented; browser QA pending; richer method/gun-path animation not yet certified**

## Recovery

Stage 5 is COMPLETE. Its final production source commit `abf0e0af73f5473e55767d0b316f0da0f057a084` passed both Playbook browser smoke QA (run `33824253720`) and GitHub Pages deployment (run `33824253296`) for the same source commit. Stage 6 began only after those gates passed.

## Durable Stage 6 work completed in this tranche

- Added a reusable `visualProfiles` registry in `playbook.js` for all eight certified representative lessons.
- Each representative lesson now renders a target-geometry schematic directly inside the Playbook lesson rather than only listing a textual visual specification.
- Schematics are explicitly labelled **SCHEMATIC · NOT TO SCALE** to prevent conceptual 2D geometry from being mistaken for ballistic lead or true depth.
- Each visual has an accessible SVG role/label, visible phase/zone labels, and a plain-language caption explaining the limitation or key geometry distinction.
- Covered representative geometry: flat crosser, quartering-away, compound incomer/cutoff, chandelle phases, rising teal under power, crossing rabbit variability, driven incoming/overhead transition, and two-bird pair planning.
- No exact lead values, ballistic geometry, or unsupported gun-path prescriptions were added.
- Existing Stage 4 visual warnings remain rendered below the new schematic; the new diagrams do not relax DIRECT / SYNTHESIS / SHOTSIGHT_HYPOTHESIS / HOLD_DEMOTE evidence permissions.
- `playbook.css` now provides responsive mobile/desktop visual styling.

## QA added

The Playwright smoke gate now opens all eight representative lessons on both 390×844 mobile and 1280×800 desktop viewports and requires, for each lesson:

1. the correct `data-visual-id` schematic host;
2. at least one target path;
3. an explicit SCHEMATIC/not-to-scale disclosure;
4. a non-empty novice explanatory caption.

The existing Stage 5 runtime/search/modal checks remain in the same suite.

## Technical QA status

Static design audit completed:

- Lesson IDs map one-to-one to the eight Stage 4 representative lessons.
- Target-only schematics are deliberately used where an exact method/gun path is not yet source-safe.
- Pair planning uses two independent target paths rather than pretending the pair itself is one target family.
- Driven visual explicitly discloses that a wall display cannot reproduce true depth.
- Rabbit visual explicitly disclaims exact ground physics.
- Chandelle labels rise/apex/descent separately.
- Teal distinguishes under-power from near-peak context.
- Cutoff/incomer visual calls out the transition rather than teaching the same path for all incomers.

## Novice-comprehension QA status

Structural novice-comprehension safeguards are implemented (visible target path, labels, caption, not-to-scale disclosure), and automated browser checks have been added. A visual screenshot/manual comprehension review is still required before Stage 6 may be called COMPLETE.

## Still required before Stage 6 may pass

1. Confirm the fresh Playbook browser smoke QA succeeds with all eight visual assertions on both viewport sizes.
2. Confirm the matching GitHub Pages deployment succeeds.
3. Inspect rendered mobile and desktop screenshots/visuals rather than relying only on DOM assertions; correct clipped/ambiguous labels if found.
4. Decide lesson-by-lesson which representative visuals have sufficient source permission for gun-path/method animation. Do not add a generic blue gun line to every target.
5. For source-safe examples, implement reusable target/gun motion with clearly attributed method selection and perform technical + novice-comprehension QA.
6. Preserve target-only schematics for lessons where a gun path would overclaim.

## Recovery instruction

Resume at **Stage 6 visual QA and source-safe motion layer**. Do not redo Stages 1–5. First inspect the latest `Playbook browser smoke QA` and Pages deployment generated from commit `d86e411b29b56d388a8c981788ffeb71e9107861` or the latest descendant. If browser QA fails, repair before adding richer animation. Stage 7 must not begin until Stage 6 is technically and visually certified.