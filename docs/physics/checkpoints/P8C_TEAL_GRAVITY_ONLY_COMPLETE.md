# P8C — Teal Strong-Vertical Gravity-Only Engineering Proof — COMPLETE

## Stage / status
- Stage: P8 — Canonical Expansion
- Substage: P8C — teal / strong vertical component
- Status: **COMPLETE AS TOY_GRAVITY_ONLY ENGINEERING PROOF ONLY**
- Branch: `physics-engine-v1`
- Verified source head: `b925faedfc35b9b91476bef2893a87147d3bb655`
- GitHub Actions run: `33912521193` — **SUCCESS**

## Certification boundary
This is not realistic teal-clay certification. The target path uses standard gravity plus explicitly labelled engineering launch-state inputs. Aerodynamics, spin, trap setting → launch state and held-out real-flight calibration remain HOLD. The phrase “rise under power” is not inferred from the presentation name: it is explicitly `HOLD_NO_TRAP_LAUNCH_OR_EMPIRICAL_POWERED_REGION_MODEL`.

Ballistics remain TEST_ONLY. The gun strategy is `ENGINEERING_INTERCEPT_REFERENCE / NOT_A_COACHING_METHOD`. No coaching method is selected and no break is manufactured.

## Completed implementation
- `physics/canonical-teal-gravity-v1.mjs`: strong-vertical-component guard; gravity-only XYZ/velocity; rise/apex/descent; trajectory-aware intercept; camera projection/LOS; mirror geometry; one master clock.
- `physics/teal-gravity-debug-v1.mjs`: deterministic frame/scrub telemetry.
- `p8-teal-debug.html`: normalised pinhole engineering projection, controls, strong-vertical/phase telemetry, explicit power/method/certification HOLD disclosures.
- `tests/physics-canonical-teal-gravity-v1.mjs`: closed-form, apex, vertical dominance, changing projection/LOS, intercept, mirror, determinism and fail-closed tests.
- `tests/physics-p8-teal-browser-debug-v1.mjs`: browser contract and control-state checks.
- `tests/p8-teal-rendered-review.mjs`: desktop/mobile adversarial rendered review.

## Error correction during rendered review
The first rendered gate failed because the long, explicit rise-under-power HOLD token overflowed the 390 px mobile viewport. This was a real product QA failure. The disclosure text and all scientific behaviour were preserved; only overflow wrapping was repaired. The subsequent full CI run passed.

## Final validation
At source head `b925faedfc35b9b91476bef2893a87147d3bb655`, Actions run `33912521193` passed all existing P3–P8C gates, including P8C numerical, browser contract and rendered adversarial review.

Rendered artefact:
- artifact id: `9951899571`
- digest: `sha256:238d9a5581621da431e598e3e116e8fccf8656dbc973d02f959401d162baf4ee`

## Remaining HOLDs
- realistic clay aerodynamic calibration / validation;
- target release spin;
- trap setting → launch state;
- “rise under power” empirical/launch model;
- dense shot-cloud and sporting-load validation;
- camera-to-bore calibration uncertainty;
- coaching-method transition tolerances / expert gun kinematics;
- rabbit ground-contact dynamics.

## Interpretation guard
P8C proves only that ShotSight can produce and render a coherent, strongly vertical gravity-only engineering trajectory and derived target/gun/intercept/narrative state. It must not be represented as the measured flight of a real teal target or as an instructional shooting-method animation.
