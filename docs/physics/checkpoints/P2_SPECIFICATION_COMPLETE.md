# ShotSight P2 — Formal Physics & Kinematics Specification v1 (COMPLETE)

Date: 2026-09-04
Status: **COMPLETE**
Branch: `physics-engine-v1`

## Durable specification

- `docs/physics/SHOTSIGHT_PHYSICS_KINEMATICS_SPEC_v1.md`
- `docs/physics/SHOTSIGHT_PHYSICS_KINEMATICS_SPEC_v1_CONVENTIONS.md` (normative convention/adversarial addendum)

## Exit review performed

P2 underwent a dedicated dimensional/adversarial review after the first specification draft. The review fixed/locked:

- right-handed world basis;
- body→world quaternion convention and body-expressed angular velocity;
- camera optical and raster projection axes;
- separation of eye, camera and bore frames;
- LOS angular-rate vector versus signed camera azimuth/elevation rates;
- minimum bore angular-velocity semantics;
- curved-pellet closest-approach/intercept semantics;
- physical versus apparent lead definitions;
- hard separation of shooting method from target/ballistic physics;
- fail-closed event predicates when tolerances are unvalidated;
- fail-closed realistic-provider parameter validation.

## Error caught by review

The first draft’s generic intercept-residual wording could have encouraged treating a curved pellet trajectory as a direct vector root with one scalar flight-time variable. The normative addendum replaces this with a closest-approach/finite-geometry contract and limits direct root solving to mathematically valid special cases.

This correction is part of the P2 pass condition.

## Dimensional audit

Specification-level dimensions for aerodynamic force/moment, translational/angular acceleration, LOS angular velocity, apparent lead and event time were checked and found coherent.

## Holds preserved

P2 completion does **not** resolve or invent:

- numerical clay aerodynamic coefficients;
- launch spin;
- trap-setting→launch-state mapping;
- full primary Allen equations;
- dense shot-cloud/string correction;
- source-valid method timing/tolerances;
- rabbit ground physics.

Realistic providers must fail closed when required values are absent.

## Exit gate

**PASS — P2 COMPLETE.**

P3 is now authorised, but only beginning with mathematical infrastructure and analytic/test-only cases. `REALISTIC_CLAY` is not authorised until required aerodynamic inputs are source-backed or calibrated.

## Next action

Begin P3 Target Physics Engine v1:

1. implement vector/quaternion primitives or use a minimal auditable representation;
2. implement provider/schema validation;
3. implement deterministic fixed-step RK4;
4. implement `TOY_GRAVITY_ONLY` target provider;
5. test stationary/constant-velocity/gravity-only analytic cases, determinism, finite-state and step-halving convergence;
6. only then introduce a clay aero provider interface with no unverified defaults.
