# ShotSight P4 — Ballistics & Intercept Engine v1

Date: 2026-09-04
Status: **COMPLETE — infrastructure/research-validation gate only**
Branch: `physics-engine-v1`
Verified CI run: `33870858185` at head `91101eb52f18042745caf24c5a1e711939f532aa` — **SUCCESS**

## Scope and certification boundary

P4 is complete only in the sense required to provide a mathematically tested ballistic-provider and intercept infrastructure for later ShotSight stages. This checkpoint does **not** certify realistic dense shotgun-cloud ballistics and does **not** authorise the Allen provider for instructional output.

`REALISTIC_BALLISTICS`: **HOLD**.

## Verified outputs

### `physics/ballistics-v1.mjs`

- `ANALYTIC_CONSTANT_SPEED_TEST_ONLY` provider for closed-form geometry tests;
- analytic constant-velocity target interception used as an independent toy-case oracle;
- physical and apparent/angular lead geometry;
- `FREE_SPHERE_ALLEN_2018` provider with `RESEARCH_VALIDATION_ONLY` status;
- Allen valid-domain guard `0.2 <= Mach <= 2.0`;
- exact piecewise velocity-vs-range implementation based on recovered primary equations;
- independent RK4 integration of Allen's governing Mach-distance ODE;
- independent Simpson time-of-flight quadrature;
- fail-closed instructional-provider guard.

### `physics/allen-tof-derived-v1.mjs`

A generic closed-form time increment was **derived**, not misrepresented as a verbatim primary transcription, from:

`dM/dz = -(3/4) M (a + bM)`

with segment integration split at Mach 1.2 and 0.7. Evidence class is explicitly:

`DERIVED_VALUE_FROM_PRIMARY_GOVERNING_ODE`.

The derived time expression was validated in two distinct ways:

1. equation-level comparison with independent numerical quadrature of the governing ODE transformed to time;
2. external worked-example comparison against Allen paper Eq. (24), using the paper's printed Eq. (23) endpoint velocities and published values `t = 0.0892 s` at 30 yd and `t = 0.2229 s` at 60 yd.

The first CI attempt failed because the test incorrectly demanded near-machine-precision agreement between the ODE-derived expression and separately printed rounded velocity-formula coefficients. The gate was held. The test was corrected by separating equation-level validation from a looser rounded-formula gross-consistency guard. No physical equation was changed to obtain a pass.

### `physics/ballistic-intercept-tof-v1.mjs`

A provider-based bisection intercept solver now derives the future target point and lead from `provider.timeToRange(range)` rather than a canned lead distance. It is explicitly limited to a straight pellet path and constant target velocity during pellet flight.

Tests show:

- equivalence with the independent analytic constant-speed intercept solution;
- a drag-aware free-sphere provider produces longer TOF and greater target displacement/apparent lead than an unphysical constant-muzzle-speed provider for the same transverse toy case;
- provider status/limitations propagate into the result;
- impossible bounded intercept cases fail closed.

## Shot-cloud interaction evidence and boundary

The free-sphere model must not be silently promoted to a dense shot-cloud model.

Szmelter & Leeming, *Factors Affecting The Dispersion Of Shotgun Pellets In Short-Range Combat* (Journal of Battlefield Technology 9(1), 2006), specifically investigates aerodynamic interaction. The paper identifies the first ~10 m as the region of primary interest for close pellet interaction, uses ~5 m as a representative proximity condition, and reports wake attraction/reduced drag on trailing pellets with possible collision. It also notes simplifications and does **not** establish a universal range after which every sporting pellet can be treated as independent.

Compton's UCL doctoral work, *An experimental and theoretical investigation of shot cloud ballistics* (1996), experimentally reconstructs shot-cloud development and describes a later regime from which pellets become sufficiently separated to model as independent free spheres, but the accessible evidence does not justify assigning one universal distance to that transition across choke/load/pellet conditions.

Therefore ShotSight records:

- `0–10 m`: **INTERACTION_MATERIAL_RISK** for dense shot clouds; free-sphere equivalence must not be assumed;
- `>10 m`: **NO UNIVERSAL FREE-SPHERE CERTIFICATION** — interaction generally reduces as dispersion develops, but the transition is load/choke/pellet dependent and remains an empirical validation requirement;
- open-choke / larger-shot cases may be more compatible with Allen's stated assumptions, but this remains source applicability, not ShotSight sporting-load certification.

No invented hard boundary has been introduced.

## Sporting-sized parameter sweep status

P4 tests exercise pellet diameters/densities/speeds in the sporting-shot scale only as **research/property tests** inside Allen's stated Mach domain. They are not calibrated cartridge predictions. Nominal atmosphere and material values in these tests are model inputs, not claims about a specific commercial load.

Required future sporting-load validation remains:

- measured muzzle velocity for the actual load;
- actual pellet diameter/material/density distribution;
- choke/load configuration;
- empirical time-of-flight or downrange-velocity data where obtainable;
- shot-cloud/string/pattern observations.

## CI gate

GitHub Actions run `33870858185`: **SUCCESS**.

Passed steps:

- P3 target physics analytic tests;
- P4 ballistic/intercept analytic tests;
- P4 Allen closed-form TOF validation;
- P4 provider-based TOF intercept validation.

## P4 exit review

Required exit conditions are satisfied at infrastructure level:

- pellet velocity decays under a source-backed free-sphere drag model rather than constant-speed instructional fiction;
- finite pellet TOF is calculated;
- a provider-based intercept solver derives physical/apparent lead from future geometry;
- analytic toy cases, numerical ODE checks, external worked values, domain guards and fail-closed provider status are tested;
- no generic hard-coded lead value is used as physical truth.

### Holds carried forward

- dense shot-cloud wake interaction;
- shot string and pellet-to-pellet collision;
- gravity/wind-curved shotgun trajectory in the provider-based intercept solver;
- sporting-load empirical validation;
- authorisation of any ballistic provider for instructional output.

These holds do not prevent P5 projection/gun-kinematics infrastructure work because P5 can remain source/model-status aware.

## Next action

Advance to **P5 — Shooter Projection & Gun Kinematics v1**. Implement and verify world-to-shooter/camera projection and bore angular kinematics using the normative P2 frame/convention specification. Preserve the existing ballistics HOLDs.
