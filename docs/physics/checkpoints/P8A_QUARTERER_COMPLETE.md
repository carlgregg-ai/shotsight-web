# P8A — Canonical Quarterer — COMPLETE

Date: 2026-09-04
Branch: `physics-engine-v1`
Verified head: `9f7bbece3bebd64516830a8f52fc2d0f49bcfaf6`
GitHub Actions run: `33910678002` — SUCCESS
Rendered-review artifact: `p8-quarterer-rendered-review`, artifact id `9951232827`, digest `sha256:4185ec281f222c4182816a01e0fec7ef3faca3b1f02d4d31cfb4a5f5fb1520bd`

## Exit decision

P8A quarterer is COMPLETE as a **non-instructional constant-velocity engineering geometry proof**. It is not realistic clay-flight certification.

The scenario deliberately isolates the geometry required by Canonical Case 2: changing range, line of sight, apparent angular speed and intercept-derived lead. It introduces no invented clay aerodynamic coefficients or coaching-method kinematics.

## Verified scientific behaviour

- immutable documented scenario with world-space target state;
- target position matches closed-form constant-velocity motion exactly;
- camera-origin range varies with time rather than being held constant;
- analytic range rate `dot(r,v)/|r|` passes an independent central finite-difference derivative check;
- LOS angular speed is generated from world geometry and changes over the quartering sequence;
- LOS angular speed passes an independent finite-difference cross-check from apparent azimuth/elevation;
- TEST_ONLY intercept-derived physical lead equals the constant-velocity analytic `v * pelletTOF` relationship within numerical solver resolution;
- left/right mirror preserves scalar range/range-rate/LOS-rate/lead and reverses lateral azimuth/separation signs;
- an explicit approaching quarterer produces negative initial range rate while the baseline receding quarterer produces positive range rate, proving the sign is derived rather than hard-coded;
- deterministic replay and direct frame/scrub mapping preserve one master simulation clock;
- SHOT and PELLET_ARRIVAL remain ordered by calculated TOF;
- no decorative BREAK exists;
- no coaching method is selected; method kinematics remain `HOLD_NO_AUTHORISED_APPLICABILITY_MAPPING`;
- active bore strategy remains `ENGINEERING_INTERCEPT_REFERENCE / ENGINEERING_REFERENCE / NOT_A_COACHING_METHOD`.

## Browser/debug and rendered QA

`p8-quarterer-debug.html` exposes play/pause, ±1 frame, playback speed and scrub controls plus target XYZ, range, range rate, LOS angular speed, target/bore angles, lead, shot/TOF/arrival, strategy, method hold and certification state.

The exact page was rendered in Google Chrome 152.0.7977.64 at desktop 1440×1200 and mobile 390×844. Automated and screenshot inspection verified:

- no document-level horizontal overflow;
- mobile QA table owns its internal horizontal scrolling;
- target/bore debug geometry remains in the normalised pinhole projection without hard clipping;
- range visibly changes from ~26.2492 m at start to ~38.4841 m at 2 s in this engineering scenario;
- LOS angular speed visibly changes from ~0.4935 rad/s to ~0.2296 rad/s;
- shot QA frame 48 at 0.800 s shows `SHOT`;
- first frame at/after pellet arrival is frame 53 at 0.883 s and shows `SHOT · PELLET_ARRIVAL`;
- 0.25× / 0.5× / 1× / 2× playback maps only screen time to the master simulation clock;
- no realistic-clay or coaching-method certification leaks into the UI.

Adversarial screenshot inspection also caught raw IEEE-754 coordinate noise in the telemetry at non-integer frames. The display was corrected to fixed engineering formatting and the full scientific/browser/rendered CI chain was rerun successfully. The model state itself was unchanged.

## Permanent boundaries carried forward

- realistic clay aerodynamics remain `HOLD_PENDING_VERIFIED_OR_CALIBRATED_AERO_AND_HELD_OUT_REAL_FLIGHT_VALIDATION`;
- dense shot-cloud / sporting-load instructional ballistics remain held;
- camera calibration remains distinct from the normalised debug projection;
- source method applicability/transition tolerances remain held;
- rabbit remains held pending credible ground-contact dynamics.

## P8B authorisation

Proceed to chandelle/looper only as an explicitly labelled physically generated **toy/engineering** curved-flight proof unless and until clay aerodynamics are supported/calibrated. The P2 specification explicitly permits `TOY_GRAVITY_ONLY` target motion with standard gravity `g = 9.80665 m/s²`, while forbidding it from being presented as a realistic clay model. Use that existing verified specification boundary rather than inventing a display arc.
