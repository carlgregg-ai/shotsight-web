# ShotSight P3 — Target Physics Engine v1 (COMPLETE, WITH REALISTIC-CLAY HOLD)

Date: 2026-09-04
Status: **COMPLETE — ENGINE/INFRASTRUCTURE GATE ONLY**
Branch: `physics-engine-v1`

## Scope boundary

P3 is complete as the deterministic, provenance-aware target-physics engine required by the master programme. This checkpoint **does not certify realistic clay flight**. `REALISTIC_CLAY` remains fail-closed until aerodynamic coefficients and launch-state quantities are supplied by verified extraction or documented calibration and then independently validated against held-out real flight data.

## Verified implementation

- Right-handed ShotSight world-vector primitives and finite-state guards.
- Scalar-first Hamilton quaternion convention matching the P2 normative specification.
- Deterministic fixed-step classical RK4 translational integration.
- Analytic stationary, constant-velocity and gravity-only reference cases.
- Final shortened-step policy with no time overshoot.
- Nonlinear test-only RK4 step-halving convergence check.
- Rigid-body rotational integration using diagonal principal-axis inertia and Euler rigid-body dynamics.
- Principal-axis zero-moment spin test against analytic axis-angle orientation.
- Quaternion norm control and finite-state checks.
- Provenance-backed target parameter records with explicit classification and units.
- Source-specific Andert reference target values ingested as VERIFIED_FACT only for the published reference target: mass 0.105 kg, area 0.0095 m², diameter 0.11 m, inertia diag(1.33,1.33,2.57)e-4 kg·m².
- Aerodynamic coefficients represented as explicit HOLD records with no runtime numeric defaults.
- Runtime target-definition ingestion refuses UNKNOWN/HOLD values when a numeric quantity is required.
- `REALISTIC_CLAY` provider remains deliberately unavailable/fail-closed.

## CI evidence

Latest verified P3 CI:

- workflow: `ShotSight physics engine`
- run: `33861166576`
- head SHA: `75b7db732049497d46a53c2097a1255258aa3a9b`
- job: `target-physics-v1`
- conclusion: **SUCCESS**

The suite includes world handedness, quaternion convention, stationary/constant-velocity/gravity analytic cases, deterministic replay, final-step policy, principal-axis rotation, Euler derivative, provenance-backed target definition, aerodynamic HOLD fail-closed behaviour, input safety and nonlinear RK4 convergence.

## Unresolved holds carried forward

- Andert-family numerical aerodynamic coefficients / calibrated alternative.
- Target release spin.
- Trap setting → launch-state mapping.
- Empirical real-flight calibration and held-out validation.
- Production physics timestep for realistic clay (must be selected from convergence once a real provider exists).
- Rabbit ground-contact dynamics.

## Exit decision

P3 exit criteria for the **engine core** are met: target state is deterministic, numerically testable, provenance-backed and no rendered path is being used as physics ground truth.

No claim of realistic clay trajectory is made. A later integrated/canonical gate must remain blocked from physics-certified instructional target flight until the empirical/parameter holds above are resolved.

## Next action

Proceed to **P4 — Shotgun Ballistics & Intercept Engine v1**. First recover the complete primary Allen free-sphere equation/scaling set or another equally defensible primary implementation basis. Do not implement `FREE_SPHERE_ALLEN` from incomplete secondary fragments. A test-only constant-speed provider may be used only for intercept-solver analytic verification.
