# ShotSight P3 — Target Physics Engine v1 — Translational Core Checkpoint

Date: 2026-09-04
Status: **IN_PROGRESS — translational/math core verified**
Branch: `physics-engine-v1`

## Completed substage

Implemented:

- `physics/target-engine-v1.mjs`
- `tests/physics-target-v1.mjs`
- `.github/workflows/physics-engine.yml`

The implementation contains:

- finite-state guards;
- auditable vec3 operations;
- Hamilton quaternion primitives and body-rate derivative convention;
- deterministic fixed-step classical RK4 for translational target state;
- zero-acceleration and gravity-only TEST_ONLY providers;
- analytic constant-acceleration reference;
- explicit Andert coefficient schema guard;
- `REALISTIC_CLAY` fail-closed hold instead of invented aerodynamics.

## Verification

GitHub Actions physics-engine run `33856884446` on head `a6044a3f739ba72589c41f96772dd24b04da8141` completed **SUCCESS**.

The automated suite verifies:

- right-handed world cross-product convention;
- quaternion identity/body-rate derivative convention;
- stationary target analytic case;
- constant-velocity analytic case;
- gravity-only analytic case;
- deterministic replay;
- shortened final timestep lands exactly at requested end time;
- invalid/non-finite input rejection;
- `REALISTIC_CLAY` fails closed without complete aerodynamic parameters;
- RK4 step-halving reduces error for a nonlinear velocity-dependent toy acceleration.

## Boundary

This is **not** a realistic clay-flight certification. The nonlinear convergence case is explicitly mathematical TEST_ONLY infrastructure, and `REALISTIC_CLAY` still throws by design.

No Andert coefficient, target spin or trap→launch mapping has been invented.

## Next P3 work

1. add rotational-state RK4 integration with quaternion normalisation and analytic constant-axis verification;
2. add source-parameter/provenance validation suitable for target definitions;
3. define/implement clay aerodynamic provider shell using required external coefficients, with force/moment diagnostics and no defaults;
4. if reliable coefficients remain unavailable, retain realistic-clay hold and determine whether P3 can only reach `READY_FOR_CALIBRATION` rather than false COMPLETE;
5. keep P4 blocked until P3 exit status is honestly determined.
