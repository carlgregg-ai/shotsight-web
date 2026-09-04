# P7 — Rendered Review Findings & Renderer Repair 1

Date: 2026-09-04
Branch: `physics-engine-v1`
Recovered head before repair: `72979c3fde2697d54ea423998831aad722fa7a71`

## Adversarial rendered/source review finding

The post-method-repair P7 review found two product-facing defects that prevent a clean P7 exit:

1. `p7-debug.html` rendered already-derived target/bore angles using an arbitrary linear `scale=1.2` and hard clipping to fixed SVG limits. That did not alter the underlying physics state, but it could alter/hide the displayed geometric relationship and therefore violated the programme principle that rendering must not change physical relationships or conceal wrong geometry.
2. The six-column frame-QA table had no horizontal-overflow containment for narrow mobile viewports, so the required mobile debug review could not be considered robust.

A smaller QA omission was also corrected: the fixed frame-QA sample set did not explicitly include the immediately pre-shot frame.

## Repair

The debug renderer now:

- maps shooter apparent azimuth/elevation to a **normalised pinhole image plane** using `x = tan(az)` and `y = -tan(el)/cos(az)`;
- applies only a single uniform auto-fit scale derived from all target/bore samples in the deterministic session, preserving the normalised pinhole relationship without inventing a camera FOV;
- explicitly labels this as `NORMALISED PINHOLE DEBUG PROJECTION · AUTO-FIT · NOT CAMERA CALIBRATION`;
- removes hard clipping of target/bore display coordinates;
- wraps the QA table in horizontal overflow containment for mobile layouts;
- includes start, immediately pre-shot, shot, pellet-arrival and end/reference-continuation rows in the fixed QA table.

No target physics, intercept equation, pellet TOF, camera-frame mathematics, source method contract, physical tolerance or scientific constant was changed.

## Regression protection

`tests/physics-p7-browser-debug-v1.mjs` now requires the pinhole debug projection label/functions, rejects the previous arbitrary scale/hard-clip implementation, requires mobile table overflow containment, and requires an explicit pre-shot QA frame.

## Gate status

P7 remains `IN_PROGRESS`. This repair addresses defects found by the required adversarial rendered review; it does not self-award the final P7 visual gate before CI and post-repair rendering/control inspection are verified.

## Exact next action

Verify CI at the repair commit. Then perform the post-repair desktop/mobile rendered review and control interaction check at start, pre-shot, shot, pellet arrival and end/reference continuation. If clean, persist P7 COMPLETE and immediately begin P8. Otherwise persist the next bounded failure checkpoint and remain in P7.
