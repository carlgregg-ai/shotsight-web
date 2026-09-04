# ShotSight P4 — Allen Free-Sphere Research Provider Checkpoint

Date: 2026-09-04
Status: **IN_PROGRESS — research-validation provider verified; instructional ballistics remains HOLD**
Branch: `physics-engine-v1`
Verified head before this checkpoint: `2dff735c649f293606101c9b75bf59f264afeba4`

## Scope

This checkpoint records progress inside P4 only. It does **not** certify realistic shotgun ballistics and does not advance to P5.

## Primary model evidence recovered

Primary source: E. J. Allen, *Approximate ballistics formulas for spherical pellets in free flight*, Defence Technology 14 (2018), 1–11, DOI 10.1016/j.dt.2017.11.004.

Recovered/verified from the accessible full-text representation:

- scaled Mach `M = v/v_s`;
- scaled distance `z = x/k_z`, with `k_z = D rho_p/rho_a`;
- governing dimensionless ODE `dM/dz = -(3/4) M C(M,Re)`;
- Case-1 exact piecewise velocity-distance expressions and transition structure;
- published worked flight-time equations/example confirming that Allen derives time as a function of trajectory distance;
- explicit free-pellet limitation: individual non-interacting spheres, not a complete dense shot-cloud/string solution.

## Derived quantities, explicitly not mislabelled as quoted primary constants

By differentiating the recovered primary exact velocity solutions and comparing them with the governing ODE, the implementation uses the following piecewise-linear drag coefficients as **DERIVED_VALUE**:

- `C(M) = 0.418 + 0.11 M` for the low-Mach segment;
- `C(M) = 0.94 M - 0.163` for the middle segment;
- `C(M) = 0.92 + 0.0375 M` for the high segment.

They are continuous at the published segment boundaries to the precision of the printed coefficients. The code must not present those values as a verbatim Eq. (8) transcription until Eq. (8) itself is independently recovered in a sufficiently legible primary representation.

For starts inside the middle or low Mach segments, integration constants are algebraically derived by enforcing `M(0)=M0`; they are not new empirical fits.

## Implementation

`physics/ballistics-v1.mjs` now contains:

- `FREE_SPHERE_ALLEN_2018` with status `RESEARCH_VALIDATION_ONLY`;
- valid-domain guard `0.2 <= M <= 2.0`;
- exact piecewise velocity-vs-range evaluation based on the recovered Allen solution;
- deterministic Simpson integration of `t = integral(dx/v(x))` as an independent TOF validation utility;
- direct RK4 integration of Allen's governing Mach-distance ODE as an independent cross-check;
- explicit provider limitations and instructional fail-closed guard.

The provider does **not** include:

- dense shot-cloud wake interaction;
- shot string;
- pellet-to-pellet collisions;
- gravity/wind curvature in this scalar provider version;
- any claim of realistic instructional authorisation.

## Adversarial QA and correction history

The first new validation runs failed. The stage gate was therefore held rather than advanced.

The failures exposed two QA issues in the tests rather than evidence for promoting the model:

1. rounded secondary worked-example distances were initially treated too strictly as exact transition positions; this was corrected to test transition positions from Allen's own formula, retaining only a loose rounded external sanity check;
2. the independent ODE check initially demanded near-machine-precision agreement even though the published analytic coefficients are rounded; the tolerance was tied instead to the observed source-coefficient precision;
3. Simpson TOF convergence initially used tolerances appropriate to a globally smooth integrand, despite crossing a piecewise coefficient boundary; the tolerance was corrected after explicit convergence measurement.

No physical equation was altered merely to make a test pass.

## Verified CI

GitHub Actions run `33866417141`, head `2dff735c649f293606101c9b75bf59f264afeba4`: **SUCCESS**.

The workflow confirms:

- P3 target-physics suite remains green;
- P4 analytic intercept suite remains green;
- Allen drag-boundary checks pass;
- Allen transition/formula checks pass;
- independent ODE cross-check passes within source-coefficient precision;
- all three Mach-start segments reproduce their initial condition;
- numerical TOF convergence check passes;
- valid-domain guard passes;
- research provider remains rejected by the instructional-authorisation guard.

## Additional flight-time evidence recovered during this run

The primary full-text index exposes a worked Case-2 time formula (paper Eq. 24) and reported values such as `t = 0.0892 s` at 30 yd and `t = 0.2229 s` at 60 yd for the paper's example. This provides a new independent target for the next P4 substep.

The generic closed-form time expression has **not yet been promoted from the primary paper**. A generic time expression can also be algebraically integrated from the now-verified velocity segments; if implemented, it must be labelled DERIVED and then cross-checked against the primary worked Eq. (24) plus numerical quadrature.

## Gate status

P4 remains **IN_PROGRESS**.

`REALISTIC_BALLISTICS`: **HOLD**.

The free-sphere model is now a verified research-validation component, but a single free pellet is not a validated dense sporting-shot cloud. Instructional use remains prohibited.

## Exact next action

1. Recover or derive-with-explicit-provenance the generic Allen closed-form flight-time expressions.
2. Cross-check them against the primary paper's worked Eq. (24) values and independent numerical quadrature.
3. Add sporting-shot-sized parameter sweeps inside Allen's stated domain, without claiming dense-cloud equivalence.
4. Quantify/record the free-pellet versus interacting-shot-cloud boundary from available evidence.
5. Only then evaluate whether the P4 engine gate can close as an infrastructure gate while leaving dense-cloud realism as a downstream validation HOLD.
