# ShotSight P1 Evidence / Parameter Register — Tranche 3

Date: 2026-09-04
Status: **P1 IN PROGRESS — numerical extraction / scope tightening**

This tranche extends, but does not supersede, `EVIDENCE_PARAMETER_REGISTER_v0.1.md`. Values below are not production-authorised unless the use boundary says so.

## 1. Andert/Freudenthal/Levedag 2016 — numerical clay model constants now extracted

Primary source: Franz Andert, Simon Freudenthal, Stefan Levedag, “Visual Target Tracking in Clay Pigeon Shooting Sports: Estimation of Flight Parameters and Throwing Range”, VISAPP 2016, DOI 10.5220/0005674602950302.

Primary publication/PDF:
- https://www.scitepress.org/PublishedPapers/2016/56746/
- https://www.scitepress.org/papers/2016/56746/56746.pdf

The primary-source indexed full text exposes the paper’s notation table and equations. The following are **VERIFIED_FACT for the target/model used by that paper**:

- disc reference area `A = 0.0095 m²`;
- disc diameter `d = 0.11 m`;
- disc mass `m = 0.105 kg`;
- inertia tensor `I = diag(1.33, 1.33, 2.57) × 10^-4 kg m²`;
- gravity default `g = 9.81 m/s²`;
- air density default `rho = 1.184 kg/m³`.

The paper defines a rigid-body state containing geodetic/local-Cartesian position, body-frame velocity, Euler attitude and body-fixed rotation rates, plus a separate physical disc spin term inside the disc hull.

Aerodynamic structure, **VERIFIED from the source**:

- `F_L = 1/2 C_L A rho v_a²`;
- for the paper’s considered range `-10° < alpha < 30°`, `C_L ≈ C_L0 + C_Lalpha * alpha`;
- `F_D = 1/2 C_D A rho v_a²`;
- `C_D ≈ C_D0 + K C_L²`;
- pitch moment `M = 1/2 C_M A rho v_a² d` with `C_M ≈ C_M0 + C_Malpha * alpha`;
- yaw/spin-related moment `N = 1/2 C_N I_z omega_spin A rho v_a² d` as represented in the paper;
- the roll-moment term is neglected/minimised in the cited formulation under its precession treatment.

### Important scope boundary

These constants are evidence for **the clay geometry/model used by Andert et al.**, not a universal target database entry for every manufacturer/type. The inertia tensor in particular must not be copied to midi, mini, battue or rabbit targets.

The source’s numerical aerodynamic coefficient values (`C_L0`, `C_Lalpha`, `C_D0`, `K`, `C_M0`, `C_Malpha`, `C_N`) have **not yet been reliably extracted from accessible indexed text in this run**. They remain `EXTRACTION_REQUIRED / HOLD`. Do not reverse-engineer them from plots or invent values.

### P2 implication

P2 may safely adopt the state-vector and force/moment *structure* as a primary clay-specific precedent, and may carry the verified geometry/mass/inertia constants as a documented reference case. P2 must parameterise aerodynamic coefficients and keep them externally supplied/calibratable until provenance is complete.

## 2. Allen 2018 spherical-pellet drag model — applicability bands tightened

Primary source: E. J. Allen (2018), “Approximate ballistics formulas for spherical pellets in free flight”, Defence Technology 14(1), 1–11, DOI 10.1016/j.dt.2017.11.004.

Primary indexed source confirms:

- realistic sphere drag represented by a continuous three-segment piecewise-linear approximation versus Mach number;
- exact analytical velocity-versus-distance and flight-time-versus-distance expressions after scaling;
- formulas intended for spherical pellets/round balls over atmospheric conditions;
- explicit non-interacting/free-sphere assumption.

A later peer-reviewed application of Allen’s formulas (ballistic analysis of English Civil War musket balls) exposes the Allen regime boundaries used for the analytical solution:

- high-speed segment above Mach 1.2;
- transonic segment Mach 1.2 to Mach 0.7;
- lower-speed segment below Mach 0.7, with the cited Allen formulas used down to about Mach 0.2 in that application.

That application reproduces Allen-derived relationships including:

- distance to Mach 1.2 for an initial Mach above 1.2: `x1 = 1.44298 kz ln((0.80417 M0)/(0.92 + 0.0375 M0))`;
- transonic-segment accumulated distance: `x2 = x1 + 1.05173 kz`;
- a lower-speed velocity-distance relation of the form `v = (0.2926 vs)/(0.495 exp(0.3135 (x-x2)/kz) - 0.077)`.

These are useful **secondary verification of Allen’s published analytical structure**, but ShotSight must still extract Allen’s own definition of `kz`, complete scaling variables, all segment equations, and flight-time equations from the primary paper before implementation.

Status:

- regime structure / free-sphere assumption: **VERIFIED_FACT**;
- reproduced equations above: **SECONDARY PEER-REVIEWED REPRODUCTION / NOT YET IMPLEMENTATION AUTHORITY**;
- complete Allen implementation: **HOLD pending primary full equation extraction**.

## 3. Dense shot-cloud interaction — free-sphere limitation is physically material

Source: Joanna Szmelter & David Leeming (2006), “Factors Affecting The Dispersion Of Shotgun Pellets In Short-Range Combat”, Journal of Battlefield Technology 9(1).

The study explicitly investigates aerodynamic interaction between shotgun pellets. Its reported model/evidence establishes:

- pellet-cloud aerodynamic interaction is concentrated especially at short range where pellet separation is small;
- trailing pellets can experience reduced drag inside the wake of leading pellets;
- this can draw a trailing pellet into/cause collision with a leading pellet;
- aerodynamic interaction can therefore have a cohesive effect before collisions and other mechanisms promote dispersion;
- non-sphericity and pellet spin are additional dispersion mechanisms not resolved by a simple free-sphere model;
- the authors treat early/transonic interaction as significant enough that an independent-pellet assumption is not a complete cloud model.

The paper notes a typical shotgun muzzle velocity near `400 m/s` declining to roughly Mach 0.5 by a representative 40 m useful range in its example context; **this is not authorised as a universal ShotSight cartridge input**.

### Consequence for ShotSight

Allen remains a valuable baseline for pellet/central free-sphere TOF, but P4 must label it explicitly as a **free-pellet approximation**. Until measured sporting-load data or a validated interacting-cloud correction is available, ShotSight must not claim that Allen alone predicts the dense shot cloud’s exact longitudinal centre or shot string at clay-shooting precision.

For first intercept-model architecture, this means:

1. implement a ballistic-provider interface capable of returning TOF with provenance/uncertainty;
2. allow `FREE_SPHERE_ALLEN` as a model mode only after primary equations are extracted;
3. expose a model-uncertainty term rather than hiding dense-cloud effects;
4. do not yet use a pattern/shot-string model to claim hit probability.

## 4. Method-source permission audit — current repository evidence

Repository evidence confirms two important permissions without supplying numerical kinematics:

- `CPSA_S3`: pull-away, swing-through and maintained lead are recognised methods and are presented as alternative methods rather than a single universal solution;
- `NSCA_LONG_CROSSER` / Don Currie: the certified long-crosser material supports a pull-away sequence involving a useful runway, leading-edge focus, speed match and smooth separation.

Classification:

- names/qualitative ordering above: **DIRECT within source mapping already certified by ShotSight**;
- exact angular speed-match tolerance: **UNKNOWN / PARAMETER_TO_CALIBRATE**;
- exact insertion angle/lead magnitude: **UNKNOWN / must derive from physical intercept + validated method implementation**;
- exact gun angular acceleration profile: **UNKNOWN / PARAMETER_TO_CALIBRATE**.

P6 must therefore encode state semantics and invariants before numerical coaching timing is added. For example, `MATCH` may not be displayed unless relative angular velocity is within a documented tolerance, but that tolerance is not yet known and must not be chosen for visual convenience.

## 5. P1 exit-matrix draft

| P2 input family | P1 classification now | P2 treatment |
|---|---|---|
| world coordinates / rigid-body state structure | VERIFIED precedent + engineering definition needed | define explicitly in P2 |
| standard clay diameter/mass | VERIFIED | parameter with ISSF/Andert provenance |
| Andert reference area/inertia | VERIFIED for source target | reference-case parameter only |
| lift/drag/moment equation structure | VERIFIED clay-specific precedent | authorised architecture |
| clay aerodynamic coefficients | EXTRACTION_REQUIRED / PARAMETER_TO_CALIBRATE | parameterise; no defaults yet |
| release spin | UNKNOWN / PARAMETER_TO_CALIBRATE | required launch-state parameter; no generic default |
| trap setting → launch state | UNKNOWN / PARAMETER_TO_CALIBRATE | interface only |
| gravity / SI units | VERIFIED physical constant/convention | authorised |
| air density | measured/environmental input; Andert default known | parameterise |
| pellet sphere-drag architecture | VERIFIED peer-reviewed precedent | authorised architecture after primary formula extraction |
| complete Allen formulas/scales | EXTRACTION_REQUIRED | no P4 coding from secondary reproduction alone |
| dense cloud correction | HOLD / research-calibration required | uncertainty/provider boundary |
| physical intercept concept | DERIVED from target + ballistic states | define solver contract in P2 |
| camera projection geometry | VERIFIED standard projective geometry; ShotKam parallax boundary verified | define in P2 |
| camera-to-bore calibration | PARAMETER_TO_CALIBRATE | explicit transform/uncertainty |
| pull-away/swing-through/maintained-lead vocabulary | DIRECT source permission | state-machine architecture allowed |
| numerical method tolerances/gun acceleration profiles | UNKNOWN / PARAMETER_TO_CALIBRATE | do not prescribe in P2 |
| rabbit ground dynamics | HOLD | exclude from P2 canonical flight engine |

## 6. Remaining P1 work before exit

P1 remains **IN_PROGRESS**. Before P1 can close:

1. obtain Allen primary-paper definitions/scaling and complete velocity + flight-time equations, or leave a formal `EXTRACTION_REQUIRED` interface boundary if primary extraction is technically inaccessible;
2. make one more targeted attempt to extract Andert’s numerical aerodynamic coefficient set/model-fit details without inferring from plots;
3. search for quantitative clay release-spin / launch-state measurements; if none are credible, convert the blank into an explicit calibration requirement rather than blocking P2 architecture;
4. complete the P1 exit matrix and decide which unknowns are legitimate P2 parameters versus true blockers;
5. verify that P2 can be written as a specification without smuggling in unverified defaults.

No production simulator is authorised by this tranche.
