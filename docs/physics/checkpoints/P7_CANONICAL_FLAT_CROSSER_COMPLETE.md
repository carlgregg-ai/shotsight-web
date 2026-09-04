# P7 — Canonical Flat-Crosser Integrated Simulator — COMPLETE

Date: 2026-09-04
Branch: `physics-engine-v1`
Verified integration/review head: `20d0036ba68b5c28317e9efa90cecfa324189d65`
GitHub Actions run: `33909744669` — SUCCESS
Rendered-review artifact: `p7-rendered-review`, artifact id `9950878403`, digest `sha256:caacb231eb64cc83f2f4df6d136ba07cb0194cdf3b7d5158fb6df1a3a82fa3b9`

## Exit decision

P7 is COMPLETE **as the documented engineering-integration proof**. This does **not** certify realistic clay flight, dense-shot instructional ballistics, or executable coaching-method kinematics.

The master programme's P7 exit requires scientific, visual and narrative QA to pass for documented scenarios. The canonical flat-crosser now passes that gate with all unsupported instructional behaviours explicitly held rather than invented.

The Canonical Case 1 requirement to demonstrate at least two source-supported methods applies only **if evidence permits**. Existing source evidence supports method identity/narrative but does not authorise numerical connection, speed-match, transition or human-kinematic tolerances. Consequently method execution remains `HOLD_NOT_IMPLEMENTED`; the active bore path is explicitly `ENGINEERING_INTERCEPT_REFERENCE`, provenance `ENGINEERING_REFERENCE`, status `NOT_A_COACHING_METHOD`. This is a deliberate fail-closed boundary, not an implied instructional method implementation.

## Scientific / mathematical verification

GitHub Actions run `33909744669` passed the complete chained suite at `20d0036b...`:

- P3 target physics analytic validation — PASS;
- P4 ballistic/intercept analytic validation — PASS;
- P4 Allen closed-form TOF validation — PASS;
- P4 provider-based TOF intercept validation — PASS;
- P5 projection/gun kinematics validation — PASS;
- P6 method/narrative fail-closed validation — PASS;
- P6 source-attributed method registry validation — PASS;
- P7 integrated flat-crosser engineering proof — PASS;
- P7 browser debug contract — PASS;
- P7 rendered adversarial browser review — PASS;
- rendered-review artifact upload — PASS.

No physical equation, source behaviour or scientific tolerance was weakened to obtain green CI.

## P7 defects found and corrected during adversarial review

1. **Camera handedness inconsistency** found in P5/P7 review — corrected to the documented right-handed camera frame and regression guarded.
2. **Camera-origin vs shot-origin apparent lead conflation** — corrected; rendered apparent lead now uses camera-origin geometry while ballistic shot-origin angle remains separate telemetry.
3. **Engineering intercept-reference bore path mislabeled as source coaching method** — corrected; active strategy and source method reference are now explicitly separated and fail closed.
4. **Arbitrary renderer angle scale / hard clipping** — replaced by normalised pinhole debug projection plus uniform auto-fit, explicitly `NOT CAMERA CALIBRATION`.
5. **Mobile QA overflow** — contained inside the QA table wrapper.
6. **Missing explicit pre-shot review row** — added.
7. **Pellet-arrival QA row selected a frame before actual arrival** because nearest-frame rounding chose frame 53 at 0.8833 s for a ~0.8894 s arrival — corrected to the first frame at/after arrival (`Math.ceil`, frame 54 at 0.9000 s) and regression guarded.
8. **Rendered-review infrastructure itself initially failed** because local/runtime Chrome and then CI DevTools startup were not reliably observable. The review was made reproducible in CI with explicit Chrome startup diagnostics and loopback binding; the final run passed.

## Rendered adversarial review

The exact branch `p7-debug.html` was rendered in Google Chrome 152.0.7977.64 by `tests/p7-rendered-review.mjs` at desktop 1440×1200 and mobile 390×844. The test also exercised controls and captured screenshot/report artifacts.

Verified rendered states:

- start: no authorised event; target/bore relationship visible; certification and method HOLD locks visible;
- immediately pre-shot: QA frame remains before SHOT;
- shot: frame 48 at 0.800 s shows `SHOT` and no premature pellet-arrival event;
- pellet arrival: frame 54 at 0.900 s is at/after the calculated ~0.8894 s arrival and shows `SHOT · PELLET_ARRIVAL`;
- end/reference continuation: later state retains event history without decorative BREAK.

Adversarial screenshot inspection found no clipping, false break, coaching-method leakage or desktop/mobile layout failure. Mobile document width remains contained; the intentionally wide QA table owns its horizontal scrolling.

Control verification:

- +1 frame advances one 60 Hz frame (~0.0167 s);
- −1 frame returns deterministically;
- 40% scrub maps to 0.800 s;
- equal screen-time playback at 0.25× / 0.5× / 1× / 2× advances progressively farther in simulation time while retaining one master simulation clock.

## Permanent P7 boundaries / HOLDs

P7 completion does not change these statuses:

- realistic clay flight: `HOLD_PENDING_VERIFIED_OR_CALIBRATED_AERO_AND_HELD_OUT_REAL_FLIGHT_VALIDATION`;
- realistic dense-shot instructional ballistics: HOLD pending dense-cloud/shot-string/gravity/wind/sporting-load validation;
- source coaching-method kinematics: `HOLD_NOT_IMPLEMENTED` until authorised/validated numerical predicates exist;
- ACQUISITION / CONNECTION / SPEED_MATCH threshold events: HOLD unless authorised predicates exist;
- BREAK: absent because no authorised hit predicate exists;
- debug projection: engineering normalised-pinhole auto-fit only, `NOT CAMERA CALIBRATION`.

## P8 authorisation

P7 now authorises P8 — Canonical Expansion — under the same fail-closed rules. Begin with the quartering engineering proof because changing range / line-of-sight geometry can be tested without inventing unsupported clay aerodynamics. Chandelle/looper and teal/driven must not be presented as realistic clay flight until their physically material flight behaviour is supported or calibrated. Rabbit remains held pending credible ground-interaction validation.
