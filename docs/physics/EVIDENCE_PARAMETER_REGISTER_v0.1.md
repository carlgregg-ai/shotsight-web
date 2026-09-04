# ShotSight Physics Evidence / Parameter Register v0.1

Date: 2026-09-04
Status: **P1 IN PROGRESS — first evidence tranche only**

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

## D. Shotgun exterior ballistics — PEER-REVIEWED CANDIDATE, EXTRACTION REQUIRED

Candidate source identified:

S. Deng et al., 2024, “Exterior ballistics analysis of shotgun using discrete ...”, ScienceDirect / journal article identifier S0168874X24000295.
URL: https://www.sciencedirect.com/science/article/abs/pii/S0168874X24000295

Search evidence indicates the study models exterior pellet behaviour including aerodynamic separation/contact effects. Full equations, assumptions, pellet parameters and validation data still require extraction before any production use.

Status: **RESEARCH_REQUIRED**.

## E. Spinning-disc aerodynamics — ANALOGUE ONLY, NOT CLAY PARAMETER SOURCE

A published “Simulation of a spin-stabilised sports disc” / flying-disc literature trail has been identified. This may help identify useful modelling terms and experimental methods, but a Frisbee-like sports disc is not automatically dynamically equivalent to a clay target.

Status: **ANALOGUE / METHOD REFERENCE ONLY** until clay-specific applicability is demonstrated.

## F. High-priority unknowns / holds

The following are explicitly UNKNOWN/HOLD and must not be invented:

1. clay-target drag coefficient as a function of orientation/Reynolds regime;
2. clay-target lift coefficient and whether/how it should be represented for each presentation;
3. aerodynamic moment coefficients / rotational attitude dynamics;
4. typical and trap-specific target spin rate at release;
5. mapping from trap spring setting/arm geometry to release speed and spin;
6. moment of inertia for each clay type unless derived from validated geometry/mass distribution;
7. real release speed for canonical sporting presentations;
8. pellet drag/deceleration law and parameter set for the shot sizes/cartridges used in ShotSight canonical examples;
9. shot-cloud longitudinal string/pattern model if later needed for hit probability;
10. camera-to-bore calibration uncertainty for ShotKam/video reconstruction;
11. numerical tolerances for “speed match”, method transitions and intercept acceptance — these must be tied to model/measurement uncertainty, not convenience.

## G. P1 next research tranche

- Extract current ISSF/technical trap trajectory requirements relevant to known competition throws (use as validation/sanity constraints, not as generic sporting geometry).
- Deep-search clay-target-specific aerodynamic studies/patents/wind-tunnel/free-flight data.
- Extract shotgun pellet drag / time-of-flight equations and validation data from peer-reviewed or authoritative sources.
- Audit existing ShotSight coaching-source register for formal method-state definitions (pull-away, swing-through, maintained lead, intercept/insertion) without promoting coaching prose into physics.
- Locate/calibrate camera projection and ShotKam geometry sources relevant to later video interpretation.

No production simulator is authorised by v0.1 of this register.
