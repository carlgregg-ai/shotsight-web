# ShotSight Physics Evidence / Parameter Register v0.1

Date: 2026-09-04
Status: **P1 IN PROGRESS — evidence tranche 2**

This register separates source-supported inputs from analogues, assumptions and unknowns. No value in this file is authorised for production simulation unless its applicability is explicit.

## A. Standard competition clay — VERIFIED FACT

Source: ISSF Rule Book 2026, General Technical Rules 6.3.6 / 6.3.6.1 (effective 1 July 2026)
Source URL: https://backoffice.issf-sports.org/getfile.aspx?file=ISSF-Rule-Book-2026-Edition-2025-Second-Print-07-2026-Effective-1-July-2026.pdf&inst=455&mod=docf&pane=1

Verified specification:

- diameter: 110 mm ±1 mm;
- total height: 25–26 mm;
- mass: 105 g ±5 g;
- base/ring geometry includes 110 mm base, rotating ring and stated sub-heights in the ISSF drawing/specification;
- ISSF states that dome shape is engineered for aerodynamic design and flight stability;
- breakability test context requires targets to withstand trap launch to 80–90 m and break under normal Skeet/Trap cartridges within normal shooting distance.

Use boundary: these values define an ISSF-standard target envelope. They do **not** provide aerodynamic coefficients, moment of inertia, trap release speed or spin rate.

## B. Special target dimensions/masses — VERIFIED MANUFACTURER FACT

Source: Laporte “Specials Targets”
Source URL: https://www.laporte.biz/en/our-target/specials-targets/

Verified published values:

- MIDI 90: diameter 90 mm; mass 80 g;
- MINI 70: diameter 70 mm; mass 45 g;
- MINI 60: diameter 60 mm; mass 38 g;
- AUTO RABBIT: diameter 110 mm; mass 118 g;
- SLIM RABBIT: diameter 108 mm; mass 110 g;
- BATTUE: diameter 108 mm; mass 80 g.

Use boundary: manufacturer dimensions/mass only. No aerodynamic coefficient, inertia, bounce coefficient or launch-spin value is inferred from these entries.

## C. Trap capability evidence — VERIFIED MANUFACTURER FACT, NOT GENERIC INITIAL CONDITION

Promatic sources:

- Super Sporter Series: https://promatic.co.uk/products/super-sporter-series
  - published throwing distance 100 m, 130 m with double spring;
  - max elevation up to 70°;
  - standard/midi/battue/downhill and DTL/ABT variants exist.
- Peregrine Manual / Auto:
  - https://promatic.co.uk/products/peregrine-manual
  - https://promatic.co.uk/products/peregrine-auto
  - published clay speed in excess of 100 mph on full spring for these machines;
  - adjustable direction/elevation for the relevant machine.
- Promatic trap-operation explainer: https://promatic.co.uk/blogs/useful-content/how-modern-clay-traps-work-a-plain-english-guide
  - manufacturer states stored spring energy is released through a rotating throwing arm;
  - spring tension, throwing-arm design and trap orientation affect launch speed/distance/trajectory.

Use boundary: machine-specific performance/capability. Do not convert maximum throw distance into release velocity without a validated model/measurement. Do not use “>100 mph” as a universal sporting-clay speed.

## D. Competition throw geometry — VERIFIED SANITY/VALIDATION CONSTRAINTS, NOT GENERIC SPORTING INITIAL CONDITIONS

ISSF shotgun rules provide reproducible target-flight constraints useful for validation.

Verified examples from ISSF rules:

- Skeet targets in calm conditions carry 68.00 m ±1.00 m from the face of the house.
- Skeet high/low targets must pass through a 0.90–0.95 m diameter circle centred 4.60 m ±0.05 m above the centre point; source rules also specify high- and low-house emergence positions/heights.
- Trap target setting requires height at 10 m in the range 1.5–3.0 m according to the selected setting table, target angle according to the setting table (with rule tolerance), and target distance 76.0 m ±1.0 m from the front edge of the pit roof in the cited rule edition.

Sources:

- ISSF Shotgun Rules (rule sections 9.8.2.3 / 9.10.3 in available official editions): https://backoffice.issf-sports.org/getfile.aspx?file=ISSF_Shotgun-Rules_Book_2023_Approved_Version.pdf&inst=462&mod=docf&pane=1
- Current 2026 rules must be checked again before final canonical competition validation because the 2026 rulebook has been updated during the year.

Use boundary: these are competition-setting outputs/constraints. They do not uniquely identify release speed, spin, lift/drag coefficients or sporting-clay presentation parameters.

## E. Clay-target-specific flight dynamics — PEER-REVIEWED / DIRECTLY RELEVANT MODEL SOURCE

Source: Franz Andert, Simon Freudenthal, Stefan Levedag (2016), “Visual Target Tracking in Clay Pigeon Shooting Sports: Estimation of Flight Parameters and Throwing Range”, VISAPP 2016, DOI 10.5220/0005674602950302.

Primary publication page: https://www.scitepress.org/PublishedPapers/2016/56746/
PDF: https://www.scitepress.org/papers/2016/56746/56746.pdf
DLR record: https://elib.dlr.de/103330/

This is the highest-value clay-specific source identified so far because it models **actual rotating clay targets**, not Frisbees by analogy, and validates trajectory estimation against stereo-camera measurements.

Verified/modelled structure extracted from the paper:

- wide-baseline stereo cameras (32 m baseline) measure 3-D clay positions;
- flight parameters are identified using aerodynamic + rigid-body kinematic considerations;
- lift force uses `F_L = 0.5 * C_L * A * rho * v_a^2`;
- within its considered angle-of-attack range (-10° < alpha < 30°), lift coefficient is approximated `C_L ≈ C_L0 + C_Lalpha * alpha`;
- drag force uses `F_D = 0.5 * C_D * A * rho * v_a^2`;
- drag coefficient is approximated `C_D ≈ C_D0 + K * C_L^2`;
- pitch aerodynamic moment is represented using a moment coefficient `C_M ≈ C_M0 + C_Malpha * alpha`;
- yaw/spin-related moment includes disc inertia, spin rate, area, air density, aerodynamic speed and characteristic diameter;
- the authors neglect/minimise a roll moment term in their cited formulation because of precession assumptions;
- the paper states its estimated impact position was about 3 m accurate using only the measured beginning portion of flight in its demonstrated setup;
- the authors explicitly identify wind modelling and spin damping as areas for further accuracy improvement.

Critical use boundary:

The **equation structure is directly relevant and may inform P2**. The numerical aerodynamic coefficients and inertia/parameter choices must still be extracted from the full paper tables/text and checked for the target geometry used in the experiment before being used. A 3 m impact-range result is useful evidence that model-fitting works, but is not sufficient accuracy by itself for ShotSight’s shot-window animation requirement.

Evidence classification:

- equation/model structure: **VERIFIED_FACT / DIRECTLY RELEVANT MODEL SOURCE**;
- any coefficient not explicitly extracted and provenance-checked: **UNKNOWN / HOLD**;
- use of stereo trajectory fitting as ShotSight calibration method: **SYNTHESIS strongly supported by direct clay-target precedent**.

## F. Trap spin-generation mechanism — VERIFIED MECHANISM, QUANTITATIVE SPIN STILL UNKNOWN

Patent source: EP2446217B1, “Launching device for clay targets”
URL: https://patents.google.com/patent/EP2446217B1/en

Verified qualitative mechanism:

- a clay is launched by a trap and rotates about its central axis for airborne stability;
- common traps use a stored-energy spring and swinging/rotating throwing arm;
- the throwing-arm interaction imparts rotating motion to the target.

Use boundary: this confirms that target spin is a mechanically generated launch state and should be represented in the physics architecture. It does **not** establish a universal spin rate or a spring-setting-to-spin mapping.

## G. Shotgun exterior ballistics — PEER-REVIEWED DIRECTLY RELEVANT SOURCE

Primary source:

E. J. Allen (2018), “Approximate ballistics formulas for spherical pellets in free flight”, Defence Technology 14, 1–11. DOI: 10.1016/j.dt.2017.11.004.

Open full-text source: https://www.sciengine.com/cfs/files/pdfs/view/2214-9147/0570DFC6D3BD4F9AA354165836D2A2D1.pdf
Texas Tech repository copy: https://ttu-ir.tdl.org/server/api/core/bitstreams/ca021217-30df-49a2-846d-92e5c315d855/content

Verified scope and model properties:

- treats spherical shot pellets/round balls in free flight;
- uses realistic velocity-dependent sphere drag data;
- builds a continuous piecewise-linear approximation to an S-shaped drag-coefficient curve as a function of Mach number;
- nondimensionalises the equations and derives analytical velocity-vs-distance and flight-time-vs-distance solutions;
- intended to apply to spherical pellets of different materials and atmospheric states through the scaling formulation;
- critically assumes pellets are not interacting during flight.

The paper itself states that the non-interacting-pellet assumption makes the formulas particularly appropriate for single balls, larger shot, and small shot fired from open chokes. Therefore this source is a strong baseline for **single-pellet/shot-cloud-centre TOF**, but ShotSight must not silently claim that it captures dense early shot-cloud interaction or full pattern/shot-string behaviour.

Status for P2/P4:

- governing drag/TOF formulation: **PEER-REVIEWED CANDIDATE / extraction-authorised**;
- exact piecewise coefficients, nondimensional scales and formula implementation: **EXTRACTION_REQUIRED before coding**;
- use as complete shot-cloud model: **HOLD / NOT AUTHORISED**.

Secondary source previously identified:

S. Deng et al. (2024), exterior ballistics of shotgun using a discrete/particle modelling approach, ScienceDirect article identifier S0168874X24000295. This remains **RESEARCH_REQUIRED** and may help quantify interacting-pellet/shot-cloud effects beyond Allen’s free-sphere approximation.

## H. Clay-flight measurement / video architecture — DIRECT PRECEDENT

The Andert/Freudenthal/Levedag clay paper provides a direct precedent for ShotSight’s proposed calibration architecture:

- calibrated stereo rather than uncalibrated monocular inference;
- known visual landmarks / camera calibration;
- triangulated 3-D clay positions;
- fit uncertain aerodynamic/kinematic parameters from the observed initial path;
- extrapolate only after model fitting.

This strongly supports keeping **OBSERVED → CALIBRATED/DERIVED → INFERRED → UNOBSERVABLE** separated in the future video-analysis system.

A single uncalibrated coaching camera must not be treated as equivalent to their 32 m-baseline stereo setup.

## I. ShotKam camera/bore relationship — VERIFIED MANUFACTURER FACT + IMPORTANT CALIBRATION BOUNDARY

ShotKam Gen 4 manufacturer specifications:

- 4K 60 fps and several 120 fps modes;
- selectable fields of view 44°, 30°, 18°, 11°;
- barrel-mounted camera; calibrated reticle intended to represent point of aim.

Source: https://shotkam.com/pages/tech-specs
UK source: https://uk.shotkam.com/pages/tech-specs

Manufacturer calibration guidance:

- attach the camera several inches/roughly 10–20 cm behind the muzzle depending on setup;
- calibrate reticle at long distance (manufacturer guidance about 30+ yd / 30+ m depending regional page) using a stable gun and preferably a laser bore reference;
- manufacturer explicitly explains that close-range reticle offset occurs because camera and bore centres are physically separated (parallax/convergence geometry), whereas the offset becomes small at long range.

Source: https://shotkam.com/blogs/blog-collections/a-practical-guide-to-calibrating-your-shotkam-reticle
UK: https://uk.shotkam.com/blogs/blog-collections/a-practical-guide-to-calibrating-your-shotkam-reticle

Implication for ShotSight:

A ShotKam reticle can provide strong **gun angular-motion evidence only after camera-to-bore calibration is modelled**. Treating image centre/reticle as an exact bore ray at every finite range is incorrect because of physical offset and calibration convergence.

## J. Coaching method evidence already present in repository — DIRECT SOURCE MAPPING EXISTS, PHYSICS TOLERANCES DO NOT

Existing certified Playbook evidence already records, among other items:

- CPSA source `CPSA_S3`: pull-away, swing-through and maintained lead are recognised methods and are presented as options rather than one universal answer;
- `NSCA_LONG_CROSSER` / Don Currie: long-crosser pull-away protocol includes a useful runway, leading-edge focus, speed match and smooth separation.

These records authorise a **source-attributed method vocabulary** for P2/P6. They do not yet provide numerical tolerances for “speed match”, transition duration, gun angular acceleration or exact lead separation. Those quantities remain model/calibration work.

## K. Spinning-disc aerodynamics — ANALOGUE ONLY WHERE CLAY-SPECIFIC SOURCE IS SILENT

Crowther & Potts (2007), “Simulation of a spin-stabilised sports disc”, and related Frisbee literature may inform general rigid-disc modelling, spin stability, parameter-identification methodology and numerical architecture.

However, the Andert et al. clay-specific paper now takes precedence wherever applicable. Frisbee coefficients must not be transplanted onto clay targets.

Status: **ANALOGUE / METHOD REFERENCE ONLY**.

## L. High-priority unknowns / holds after tranche 2

The following remain explicitly UNKNOWN/HOLD and must not be invented:

1. exact clay-target aerodynamic coefficient values/applicability from the Andert experiment until fully extracted and checked;
2. coefficient variation across standard/midi/mini/battue target geometries;
3. wind effects and spin damping at ShotSight-required accuracy;
4. typical and trap-specific target spin rate at release;
5. mapping from trap spring setting/arm geometry to release speed, attitude and spin;
6. validated moment of inertia for each clay type unless derived from verified geometry/mass distribution;
7. real release speed/spin for canonical sporting presentations;
8. exact Allen piecewise drag coefficients/formula implementation and validation calculations for clay-cartridge shot sizes;
9. degree to which dense early shot-cloud interaction changes centre TOF for the required distances/chokes;
10. shot-cloud longitudinal string/pattern model if later needed for hit probability;
11. camera-to-bore calibration uncertainty for individual ShotKam setups;
12. numerical tolerances for “speed match”, method transitions and intercept acceptance;
13. authoritative quantitative gun angular acceleration/velocity envelopes for expert method execution.

## M. P1 next research tranche

1. Fully extract the Andert clay paper’s target mass/geometry, inertia assumptions, aerodynamic coefficients/fit parameters, measured trajectories and numerical method.
2. Fully extract Allen 2018 drag/TOF equations, piecewise coefficients, scaling variables and worked validation values.
3. Deep-search the 2024 interacting-pellet/shot-cloud study and older experimental shotgun exterior-ballistics work for centre-TOF correction / shot-string limits.
4. Audit existing ShotSight coaching-source register source-by-source for method-state permissions and contraindications without creating numerical behaviour not present in the evidence.
5. Locate any measured clay release-speed/spin datasets, trap instrumentation studies, patents with quantitative arm/target kinematics, or manufacturer service/test data.
6. Search target-manufacturer patents/technical literature for standard versus battue/midi aerodynamic design claims that can be separated from marketing language.
7. Define P1 exit table: every P2 input must be `VERIFIED`, `DERIVED`, `PARAMETER_TO_CALIBRATE`, or `HOLD`; no silent blanks.

No production simulator is authorised by v0.1 of this register.
