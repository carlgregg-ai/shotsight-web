# Gate H — three-method deterministic video pipeline green; final style HOLD

Date: 2026-09-05

Result: **ENGINEERING VIDEO PIPELINE PASS / FINAL BIBLE-QUALITY ACCEPTANCE HOLD**.

Verified head: `80c1ce11b04cb210171f381aa0ca19f59a35ac97`.
GitHub Actions run: `33929522627` — **SUCCESS**.
Video artifact: `reviewer-method-comparison-videos` (artifact id `9958047818`).

## What is now verified

- The exact same canonical flat-crosser target state and 60 Hz master clock feed Swing-through, Pull-away and Maintained Lead.
- All three retain the same target XYZ/time, 0.8 s shot time and canonical ballistic shot solution.
- All three converge to the same canonical bore at the shot.
- The renderer consumes the model state; it does not create or correct the movement.
- Quantitative per-frame method traces now expose signed target-bore angular separation, target angular velocity, gun angular velocity, relative angular velocity and gun angular acceleration.
- Qualitative topology gates pass:
  - Swing-through begins behind, crosses through the target relationship and develops forward separation before shot.
  - Pull-away reaches connection/speed-match relationship and then separates before shot.
  - Maintained Lead preserves the forward target-bore angular separation in this provisional flat-crosser model.
- Numerical timings/separations remain `SHOTSIGHT_HYPOTHESIS_PENDING_EXPERT_REVIEW`; no instructional claim has been unlocked.
- Deterministic headless-Chrome frame capture and H.264 MP4 encoding now complete successfully for all three methods.
- The complete existing physics CI suite remains green after renderer integration.

## Adversarial visual review

The first successfully encoded renderer was inspected frame-by-frame. It failed an internal visual-quality gate because the coach view made the shooter too small and the shooter-eye barrels visually dominated the target. Those presentation-only defects were repaired without changing simulation state. The second render has substantially improved coach framing and subordinate first-person barrels.

However, the present Canvas reviewer is still best classified as a **polished technical review renderer**, not yet the final premium rounded 3D / claymation-style renderer shown by the ShotSight Visual Style & Animation Bible. The final task explicitly asks for bible-quality output, so the videos are **not accepted as final deliverables yet** merely because they encode successfully.

## CPSA Episode 3 reconstruction state

`docs/reviewer-animation/CPSA_S3E3_RECONSTRUCTION_EVIDENCE_v1.md` records a critical source conflict:
- modern CPSA Series 3 summary says left-to-right;
- CPSA's video-library title and original May 2019 companion article say right-to-left.

The original article also supplies useful direct context (simultaneous standards, green-fence origin, approximate 50 m presentation, low/flat A, slightly rising/falling B, visual pickup, gun hold, break region, Pull Away on A, Maintained Lead on B), but actual video frames are still required to resolve direction and to obtain observation tracks. This is `VIDEO_FRAME_ACCESS_REQUIRED`, not permission to infer unseen measurements.

## Resume point

1. Upgrade/finalise the presentation layer to a genuine bible-quality rounded/stylised 3D look while preserving exact model transforms and cameras.
2. Re-render the three method videos and perform visual + numerical adversarial QA.
3. Obtain frame-accessible CPSA Episode 3 footage through an available source/tool; resolve the direction conflict from the footage itself.
4. Build the OBSERVED table, fit the dynamic reconstruction with uncertainty, render it through the same final ShotSight renderer, and produce the sidecar fit report.

Do not regress to VTK/debug output and do not promote the current technical videos to final bible-quality merely to satisfy the completion count.
