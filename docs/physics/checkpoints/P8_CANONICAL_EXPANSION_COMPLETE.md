# P8 — Canonical Expansion — COMPLETE

## Status
- Stage: **P8 — Canonical Expansion**
- Status: **COMPLETE**
- Branch: `physics-engine-v1`
- Final required-case verification source head: `b925faedfc35b9b91476bef2893a87147d3bb655`
- Final required-case Actions run: `33912521193` — **SUCCESS**

## Exit-criterion accounting
The master programme requires P8 to add quarterer, chandelle/looper and teal/driven one presentation at a time, using the P7-equivalent gate, with rabbit only if validated and unsupported behaviours held.

Completed required canonical cases:
1. **P8A quarterer** — constant-velocity quartering engineering geometry with changing range/LOS; numerical + browser + rendered gates PASS. Not realistic clay certification.
2. **P8B chandelle/looper** — `TOY_GRAVITY_ONLY` curved-flight engineering proof with rise/apex/descent; numerical + browser + rendered gates PASS. Not realistic chandelle certification.
3. **P8C teal** — `TOY_GRAVITY_ONLY` strong-vertical engineering proof; numerical + browser + rendered gates PASS. “Rise under power” remains explicit HOLD; not realistic teal certification.

Rabbit is **not implemented** because `rabbit ground-contact dynamics` remains an explicit high-priority HOLD. This satisfies the master rule “rabbit only if validated”; it is not treated as a missing pass.

## Cross-case invariants preserved
- physics state drives rendering; no hand-drawn target display paths;
- one master clock for target, gun, intercept and narrative;
- lead derived from interception geometry, not canned pixels;
- TEST_ONLY ballistics stay visibly TEST_ONLY;
- engineering intercept-reference gun paths stay `NOT_A_COACHING_METHOD`;
- coaching-method applicability/transition states fail closed when unsupported;
- no decorative break without an authorised hit predicate;
- desktop/mobile rendered QA and controls are part of the gates;
- realistic clay certification remains HOLD pending aerodynamic/launch/real-data validation.

## Durable completion evidence
- P8A checkpoint: `docs/physics/checkpoints/P8A_QUARTERER_COMPLETE.md`
- P8B checkpoint: `docs/physics/checkpoints/P8B_LOOPER_GRAVITY_ONLY_COMPLETE.md`
- P8C checkpoint: `docs/physics/checkpoints/P8C_TEAL_GRAVITY_ONLY_COMPLETE.md`

## Unresolved HOLDs carried forward
- realistic target aerodynamics / calibrated equivalent and held-out real-flight validation;
- target release spin;
- trap setting → launch state mapping;
- dense shot-cloud / shot-string / sporting-load empirical validation;
- camera-to-bore calibration uncertainty;
- method transition tolerances / expert gun angular kinematics;
- teal “rise under power” empirical phase model;
- rabbit ground-contact dynamics.

## Next stage
Proceed to **P9 — Video-Understanding Foundation**. Build the observation pipeline and physics-constrained fitting so output classes are explicitly OBSERVED, CALIBRATED/DERIVED, INFERRED and UNOBSERVABLE/AMBIGUOUS. Use synthetic simulator data for quantitative recovery tests, but do not train/validate against physically false synthetic motion or claim precise 3-D depth from uncalibrated monocular video.
