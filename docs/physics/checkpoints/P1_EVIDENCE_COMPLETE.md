# ShotSight P1 — Evidence / Parameter Register (COMPLETE)

Date: 2026-09-04
Status: **COMPLETE**
Branch: `physics-engine-v1`

## Completion basis

P1 is complete because all model-input families required for the P2 specification now have one of the following explicit statuses:

- verified/source-backed;
- derived by later model stages;
- parameter-to-calibrate;
- extraction-required;
- hold/excluded from initial canonical model.

No unresolved quantity has been silently promoted into a default.

## Durable evidence outputs

- `docs/physics/EVIDENCE_PARAMETER_REGISTER_v0.1.md`
- `docs/physics/EVIDENCE_PARAMETER_REGISTER_P1_TRANCHE3.md`
- `docs/physics/EVIDENCE_PARAMETER_REGISTER_P1_TRANCHE4_FINAL.md`

## Key verified architecture

- clay-specific rigid-body/aerodynamic modelling precedent from Andert/Freudenthal/Levedag;
- source-target geometry/mass/inertia reference constants for the Andert case;
- variable-drag free-spherical-pellet ballistic precedent from Allen;
- explicit dense-shot-cloud limitation from interaction literature;
- perspective/projection and camera-to-bore calibration requirement;
- source-permitted qualitative method vocabulary without invented numerical kinematics.

## Explicit holds carried forward

- Andert numerical aerodynamic coefficient set/model-fit details;
- generic target release spin and trap-setting→launch-state mapping;
- full primary Allen formula/scaling extraction before P4 implementation;
- dense shot-cloud correction/shot string;
- method timing/tolerance and expert gun-angular profiles;
- rabbit ground-contact model.

## Exit gate result

**PASS.** These unknowns do not prevent P2 from specifying the system because they are represented as explicit parameters/interfaces/holds. P3/P4 cannot bypass their later evidence requirements.

## Next action

Begin P2 immediately: create `SHOTSIGHT_PHYSICS_KINEMATICS_SPEC_v1.md` defining frames, units, state vectors, equations/contracts, numerical integration, projection, ballistics/intercept interfaces, event clock, uncertainty/provenance schema, validation strategy and deliberate model boundaries. Perform dimensional/adversarial review before P2 completion.
