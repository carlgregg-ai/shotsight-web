# ShotSight P1 Evidence / Parameter Register — Tranche 4 / Final

Date: 2026-09-04
Status: **P1 EVIDENCE GATE READY TO CLOSE**
Branch: `physics-engine-v1`

This tranche completes the P1 exit decision. It does **not** authorise production simulator constants that remain unavailable.

## 1. Final targeted extraction results

### Allen 2018 — spherical-pellet ballistics

Primary publication: E. J. Allen, “Approximate ballistics formulas for spherical pellets in free flight”, *Defence Technology* 14(1), 1–11 (2018), DOI `10.1016/j.dt.2017.11.004`.

Primary repository/index endpoints located during P1:
- Texas Tech University repository item: `https://ttu-ir.tdl.org/items/f2206e50-e7be-4e6b-aa33-017b122fbe5c`
- Elsevier/ScienceDirect article: `https://www.sciencedirect.com/science/article/pii/S2214914717301459`

Verified from primary indexing and peer-reviewed secondary use:
- Allen models spherical shotgun/muzzleloader projectiles with realistic, velocity-dependent sphere drag rather than constant velocity.
- The formulation uses a continuous three-segment approximation across Mach regimes and supplies analytical velocity-vs-distance and flight-time-vs-distance relations after scaling.
- The free-flight formulation assumes non-interacting pellets.
- Peer-reviewed secondary application confirms the practical segment boundaries above Mach 1.2, Mach 1.2→0.7, and below Mach 0.7, with Allen cited as valid over approximately Mach 2 to 0.2 for that application.

**Extraction result:** the complete primary formula/scaling set was not reliably accessible through the available indexed interfaces in this run. P1 therefore does not reproduce or reconstruct missing primary equations from secondary snippets.

Classification:
- ballistics architecture / variable-drag free sphere: **VERIFIED_FACT**;
- segment-boundary corroboration: **PEER_REVIEWED_SECONDARY**;
- exact implementation equations/scales: **EXTRACTION_REQUIRED / HOLD_FOR_P4**.

P2 is allowed to specify a `BallisticProvider` interface and an Allen provider candidate, but P4 may not implement `FREE_SPHERE_ALLEN` from incomplete secondary reproductions.

### Andert / Freudenthal / Levedag 2016 — clay flight

Primary publication: “Visual Target Tracking in Clay Pigeon Shooting Sports: Estimation of Flight Parameters and Throwing Range”, VISAPP 2016, DOI `10.5220/0005674602950302`.

Primary/publication endpoints:
- `https://www.scitepress.org/PublishedPapers/2016/56746/`
- `https://www.scitepress.org/papers/2016/56746/56746.pdf`

P1 already verified the clay-specific rigid-body state/equation structure and source-target constants:
- `A = 0.0095 m²`
- `d = 0.11 m`
- `m = 0.105 kg`
- `I = diag(1.33, 1.33, 2.57) × 10^-4 kg m²`
- lift/drag/pitch/yaw moment architecture recorded in tranche 3.

Final targeted search did not yield a reliable text extraction of the numerical coefficient set (`C_L0`, `C_Lalpha`, `C_D0`, `K`, `C_M0`, `C_Malpha`, `C_N`) or sufficient fit details to promote them to verified implementation constants.

Classification:
- state/force/moment architecture: **VERIFIED_FACT**;
- source-target geometry/inertia constants above: **VERIFIED_FACT for that reference target**;
- aerodynamic coefficient values: **PARAMETER_TO_CALIBRATE / EXTRACTION_REQUIRED**.

P2 may define these as required coefficient inputs with provenance and uncertainty. P3 may only run a physical reference case when coefficients are supplied from verified extraction or a documented calibration dataset; it may use analytic zero-aero/gravity-only toy cases for solver verification without claiming clay realism.

## 2. Quantitative clay release spin / trap mapping

A final search found qualitative and enthusiast measurements/claims but no sufficiently authoritative, general quantitative mapping from commercial trap setting + target type to release translational state and spin that should be promoted as a ShotSight default.

Examples located include video-derived/enthusiast estimates and forum discussions; these are useful for designing measurement experiments but are not implementation authority.

Therefore:
- release spin `omega_spin(0)`: **PARAMETER_TO_CALIBRATE**;
- trap setting → launch speed/elevation/azimuth/spin: **PARAMETER_TO_CALIBRATE**;
- trap arm contact/rolling mechanism producing spin: **QUALITATIVE MECHANISM SUPPORTED, NUMERICAL MAPPING UNKNOWN**.

P2 must treat launch state as explicit input data, not derive it from an invented “trap power” scalar.

## 3. Shot-cloud boundary retained

Szmelter & Leeming evidence remains material: close pellet wakes/collisions make dense early shot-cloud behaviour different from independent free spheres. No defensible universal correction factor was established in P1.

Therefore:
- `FREE_SPHERE` TOF model may be an explicitly labelled provider/baseline;
- dense-cloud correction/shot-string: **HOLD / CALIBRATION_RESEARCH_REQUIRED**;
- hit-probability claims based on an unvalidated pattern/string model: **NOT AUTHORISED**.

## 4. Final P1 exit matrix

| Input/model family | Final P1 status | P2/P3/P4 rule |
|---|---|---|
| world/reference frames | engineering definition required | define explicitly in P2 |
| SI units | VERIFIED convention | mandatory internal units |
| standard target dimensions/mass | VERIFIED source data | provenance-backed parameter |
| Andert reference area/inertia | VERIFIED for source target | reference-case only |
| clay rigid-body/aero equation structure | VERIFIED clay-specific precedent | architecture authorised |
| clay aero coefficient values | PARAMETER_TO_CALIBRATE / EXTRACTION_REQUIRED | no silent defaults |
| launch speed/vector | INPUT / PARAMETER_TO_CALIBRATE | explicit launch-state input |
| release spin | PARAMETER_TO_CALIBRATE | explicit input + uncertainty |
| trap setting → launch state | PARAMETER_TO_CALIBRATE | no invented transfer function |
| gravity | VERIFIED physical constant | authorised |
| atmosphere | measured/model input | explicit environmental state |
| variable-drag spherical-pellet architecture | VERIFIED precedent | provider architecture authorised |
| complete Allen formulas/scales | EXTRACTION_REQUIRED | P4 implementation hold |
| dense cloud / shot string | HOLD | provider uncertainty boundary |
| physical intercept | DERIVED quantity | specify solver contract |
| visual/apparent lead | DERIVED projection quantity | specify separately from physical lead |
| camera projection | VERIFIED projective-geometry basis | specify in P2 |
| camera↔bore transform | PARAMETER_TO_CALIBRATE | explicit transform + uncertainty |
| pull-away/swing-through/maintained-lead vocabulary | DIRECT source permission | P6 state architecture permitted |
| method timing/tolerances/acceleration profiles | PARAMETER_TO_CALIBRATE / UNKNOWN | no arbitrary defaults |
| rabbit ground dynamics | HOLD | excluded from initial canonical flight engine |

## 5. P1 exit decision

**P1 can close.**

Reason: the unresolved quantities do not prevent writing a rigorous physics/kinematics specification. They are now explicitly represented as required external/calibrated parameters or later-stage extraction holds. Closing P1 does not convert them into facts and does not authorise realistic production simulation without them.

P2 is authorised to define interfaces, state, equations, units, uncertainty and validation contracts. P3/P4 remain subject to their own evidence gates.

## 6. Permanent anti-hallucination constraints carried forward

1. Never infer Andert aerodynamic coefficients from plots by eye.
2. Never implement Allen from incomplete secondary formula fragments.
3. Never assign a generic clay RPM because a trap throws at a particular speed.
4. Never map a trap spring/power setting to launch state without measured/manufacturer calibration.
5. Never claim exact shot-cloud centre/string from an independent-pellet baseline.
6. Never select method timing/lead for visual convenience.
7. Every runtime numerical parameter must expose provenance class and uncertainty/status.
