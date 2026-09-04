# ShotSight P4 — Ballistics & Intercept Engine v1 (ANALYTIC CORE CHECKPOINT)

Date: 2026-09-04
Status: **IN_PROGRESS**
Branch: `physics-engine-v1`

## Verified progress

P4 now has an analytically solvable, explicitly `TEST_ONLY` ballistic/intercept core. It is used to verify geometry and solver semantics independently of the still-held realistic shotgun drag model.

Implemented:

- `physics/ballistics-v1.mjs`;
- explicit ballistic provider status boundary;
- `ANALYTIC_CONSTANT_SPEED_TEST_ONLY` provider that cannot pass instructional-authorisation checks;
- analytic constant-velocity target / constant-speed pellet intercept solver;
- physical lead vector/magnitude derivation;
- apparent angular lead calculation from line-of-sight and bore vectors;
- no-positive-intercept handling;
- mirror-symmetry checks;
- residual/miss-vector calculation.

## Analytic validation

`tests/physics-ballistics-v1.mjs` verifies:

- stationary-target TOF = range / speed;
- pure transverse target closed-form intercept time;
- transverse physical and apparent lead;
- receding LOS target `tau = R/(s-v_r)`;
- approaching LOS target `tau = R/(s+v_r)`;
- no intercept when a target recedes directly faster than the test pellet;
- left/right mirror symmetry;
- angular separation sanity;
- independent residual recomputation;
- test provider is rejected for instructional use.

CI run `33861378610`, head `2ae077718939fa085818ef350335162069723ecb`: both the P3 target suite and P4 ballistics/intercept suite completed successfully in the job steps.

## Primary ballistics research update

A publicly indexed copy of E. J. Allen (Defence Technology 14 (2018) 1–11, DOI 10.1016/j.dt.2017.11.004) exposes the paper notation and governing free-sphere drag equation, including:

- `M = v/v_s`;
- dimensionless distance `Z = rho_a x/(rho_p D) = x/k_z`;
- `k_z = D rho_p / rho_a`;
- sphere drag force `F = pi D^2 rho_a v^2 C(M,Re)/8`;
- governing equation `m dv/dt = -pi D^2 rho_a v^2 C(M,Re)/8`;
- the paper then approximates the drag curve and derives piecewise analytic velocity and flight-time relations.

This is sufficient to confirm the model architecture but **not yet sufficient to implement `FREE_SPHERE_ALLEN`**. The complete piecewise coefficient/formula set must be recovered and checked from the primary paper before implementation.

## Holds retained

- `FREE_SPHERE_ALLEN`: HOLD pending complete primary formula/scaling extraction and verification.
- Dense shot cloud / wake interaction / shot string: HOLD; a free-sphere model must not imply these effects are solved.
- Realistic sporting-load validation: not yet performed.

## Next action

1. Recover the complete Allen piecewise drag/velocity/flight-time formula set from an accessible primary/full-text representation and record it with equation-level provenance.
2. Independently unit-check/scaling-check the formulas before code.
3. Implement `FREE_SPHERE_ALLEN` only after that review, with valid-domain and free-pellet limitations explicit.
4. Compare numeric integration of the governing drag ODE against Allen’s closed-form results as a cross-check.
5. Keep realistic instructional ballistics unauthorised until the provider and validation gates pass.
