# ShotSight P1 — Evidence / Parameter Register — Tranche 3 Checkpoint

Date: 2026-09-04
Status: **IN_PROGRESS — tranche 3 verified and persisted**
Branch: `physics-engine-v1`

## Recovery basis

Latest completed stage remains **P0**. P1 remained the active stage and was resumed from `P1_EVIDENCE_TRANCHE2_CHECKPOINT.md`; completed work was not repeated.

## Verified work completed

1. Extracted additional **primary clay-target numerical constants** from Andert/Freudenthal/Levedag 2016: reference area 0.0095 m², diameter 0.11 m, mass 0.105 kg, inertia tensor diag(1.33,1.33,2.57)×10^-4 kg m², plus the paper’s stated default gravity and air density.
2. Reconfirmed the clay-specific lift/drag/pitch/yaw moment equation architecture and preserved the explicit hold on unavailable numerical aerodynamic coefficient values.
3. Tightened Allen 2018 scope using peer-reviewed secondary reproduction of the analytical regime boundaries (Mach >1.2, 1.2→0.7, lower-speed branch) and several reproduced distance/velocity equations. These remain secondary corroboration; complete primary Allen scaling/TOF equations are still required before implementation.
4. Added shot-cloud interaction evidence from Szmelter & Leeming 2006 showing that close pellet wakes/collisions make the free-sphere assumption physically incomplete, especially early in flight. This establishes a required uncertainty/provider boundary for P4 rather than invalidating Allen as a baseline.
5. Audited currently certified ShotSight method permissions: CPSA recognition of pull-away/swing-through/maintained lead and NSCA/Don Currie qualitative long-crosser pull-away sequence are permitted; numerical speed-match tolerances and gun acceleration profiles remain unknown/calibration work.
6. Drafted a P1 exit matrix separating VERIFIED architecture, PARAMETER_TO_CALIBRATE, EXTRACTION_REQUIRED and HOLD items.

## Durable output

Created and persisted:

`docs/physics/EVIDENCE_PARAMETER_REGISTER_P1_TRANCHE3.md`

No production simulator code was added or authorised.

## Verification / source boundaries

- Primary clay numerical constants came from the indexed full text of the Andert source.
- Allen segment equations quoted in tranche 3 are explicitly marked as peer-reviewed secondary reproduction, not implementation authority.
- No aerodynamic coefficient, release spin, generic launch speed, lead value or method tolerance was invented.
- Dense shot-cloud interaction is recorded as a model limitation/uncertainty, not replaced with an unverified correction factor.

## Remaining exact work

P1 is **not complete**. Next tranche must:

1. attempt complete primary extraction of Allen’s scale definitions and all velocity/flight-time formulas;
2. make a final targeted extraction/search for Andert numerical aerodynamic coefficient values and fit details;
3. search quantitative clay release-spin / launch-state measurements or trap instrumentation;
4. finish the P1 exit matrix and determine whether remaining unknowns can safely become explicit P2 parameters rather than blockers;
5. only if that matrix passes, checkpoint P1 COMPLETE and begin P2 immediately.

If source extraction remains technically inaccessible, preserve `EXTRACTION_REQUIRED`; do not infer missing constants from plots or generic sphere/disc literature.
