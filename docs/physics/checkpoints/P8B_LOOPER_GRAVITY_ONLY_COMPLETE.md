# P8B — Looper / Chandelle Gravity-Only Engineering Proof — COMPLETE

## Stage / status
- Stage: P8 — Canonical Expansion
- Substage: P8B — chandelle / looper
- Status: **COMPLETE AS TOY_GRAVITY_ONLY ENGINEERING PROOF ONLY**
- Branch: `physics-engine-v1`
- Verified source head: `0049229b73246645753ddf50cfee6bf13526e6b7`
- GitHub Actions run: `33911908934` — **SUCCESS**

## Scope and certification boundary
This checkpoint does **not** certify realistic clay flight. The P8B trajectory is explicitly `TOY_GRAVITY_ONLY`, with standard gravity `g = 9.80665 m/s^2` from the P2 specification and an engineering-only launch state. The launch-state values are not represented as measured clay throw parameters. Aerodynamic drag/lift/moment, spin, trap-to-launch mapping and real-flight calibration remain HOLD.

The gun strategy is `ENGINEERING_INTERCEPT_REFERENCE`, provenance `ENGINEERING_REFERENCE`, status `NOT_A_COACHING_METHOD`. No coaching method is selected. Method applicability/kinematics and threshold events remain HOLD. Ballistics remain `TEST_ONLY`; no dense shot-cloud or realistic sporting-load certification is implied.

## Completed implementation
- Added `physics/canonical-looper-gravity-v1.mjs`.
- Target XYZ and velocity are generated from constant-gravity equations of motion, not a drawn display arc.
- Rise/apex/descent state is derived from vertical velocity; analytic apex time is `v_z0 / g`.
- Apex classification uses only a machine-arithmetic epsilon guard so roundoff at the analytic zero crossing cannot mislabel the phase.
- Added trajectory-aware interception using the existing explicit future-target-position provider solver.
- Derived changing range, range rate, LOS angles, LOS angular speed, apparent lead and physical lead from state.
- Added mirror construction across world YZ.
- Preserved one master simulation clock for target, gun, intercept and narrative.
- No decorative break is generated; hit remains unauthorised.
- Added deterministic debug/scrub module `physics/looper-gravity-debug-v1.mjs`.
- Added `p8-looper-debug.html` with play/pause, frame-step, playback rates, scrub, phase/apex telemetry and mobile-contained QA table.
- Renderer uses a normalised pinhole engineering projection with auto-fit; it is explicitly NOT camera calibration.

## Validation
Required CI tests all passed in run `33911908934` at source head `0049229b73246645753ddf50cfee6bf13526e6b7`:
- P3 target physics — PASS
- P4 ballistics/intercept/Allen/provider/trajectory tests — PASS
- P5 projection/gun kinematics — PASS
- P6 method/narrative and method registry — PASS
- P7 flat-crosser numerical/browser/rendered gates — PASS
- P8A quarterer numerical/browser/rendered gates — PASS
- P8B gravity-only looper numerical gate — PASS
- P8B browser debug contract — PASS
- P8B rendered adversarial review — PASS

P8B rendered artefact:
- artifact id: `9951690171`
- digest: `sha256:b22a7a66e5acf6fe94cd82ebe75a0ce77e337f67d07a3c65c6836ffc4fa2bbba`
- review includes desktop and mobile rendering, start/apex/shot/pellet-arrival states and interaction checks.

## Explicit unresolved HOLDs
- realistic clay aerodynamic coefficient model / calibrated equivalent;
- target release spin;
- trap setting → launch state mapping;
- held-out real-flight validation;
- dense shot-cloud correction and shot string;
- sporting-load empirical validation;
- camera-to-bore calibration uncertainty;
- source-supported coaching-method transition tolerances and expert gun angular kinematics.

## Adversarial interpretation guard
A passing P8B result means only that ShotSight can generate and render a mathematically coherent curved, gravity-only target trajectory with derived phase/geometry/interception on one clock. It must never be described as proof of the actual flight path of a chandelle/looper clay.

## Next action
Continue P8 one presentation at a time with the required **teal/driven** canonical case. Preserve the same fail-closed boundary: use only model inputs with provenance, do not infer a real-clay trajectory or coaching method from presentation name alone, and require numerical + browser + rendered P7-equivalent gates before completing the next substage.
