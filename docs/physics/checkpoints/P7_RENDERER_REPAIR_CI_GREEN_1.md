# P7 — Renderer/Mobile Repair — CI GREEN

Date: 2026-09-04
Branch: `physics-engine-v1`
Verified repair head: `e5460c0cd19fbda2e2b3474431158b1a3bad34d2`
GitHub Actions run: `33903908672` — SUCCESS

## Verified repair

The P7 post-repair review had identified two renderer/product issues: arbitrary linear angle scaling with hard clipping, and missing mobile overflow containment for the frame-QA table. The repair commit replaced that renderer with a normalised pinhole debug projection and a single uniform auto-fit scale, explicitly labelled as not camera calibration; removed hard clipping; added mobile horizontal overflow containment; and added an immediately pre-shot QA sample.

The complete P3–P7 workflow passed at the repair head. In particular:

- P3 target physics analytic tests: PASS;
- P4 ballistic/intercept analytic tests: PASS;
- P4 Allen closed-form TOF validation: PASS;
- P4 provider-based TOF intercept validation: PASS;
- P5 projection and gun kinematics validation: PASS;
- P6 method/narrative fail-closed validation: PASS;
- P6 source-attributed method registry validation: PASS;
- P7 integrated flat-crosser engineering proof: PASS;
- P7 browser debug contract validation: PASS.

No physical equation, scientific constant, tolerance or source-method behaviour was weakened to obtain green CI.

## Gate status

P7 remains `IN_PROGRESS`. CI verifies the repaired code and browser contract, but the master programme still requires the final post-repair rendered desktop/mobile visual and control-interaction review before P7 can be marked COMPLETE.

## Exact next action

Perform the post-repair rendered desktop/mobile review at start, immediately pre-shot, shot, pellet arrival and end/reference continuation. Exercise play/pause, ±1 frame, 0.25×/0.5×/1×/2× playback and scrub. Verify no clipping/overflow, no method-label leakage, correct event timing and coherent target/bore geometry. If clean, persist P7 COMPLETE and immediately begin P8. If any material defect remains, persist a bounded failure checkpoint and stay in P7.
