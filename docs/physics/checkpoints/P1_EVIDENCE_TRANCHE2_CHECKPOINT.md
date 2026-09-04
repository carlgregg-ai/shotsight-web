# ShotSight P1 — Evidence / Parameter Register — Tranche 2 Checkpoint

Date: 2026-09-04
Status: **IN_PROGRESS — tranche 2 verified and persisted**
Branch: `physics-engine-v1`

## Recovery basis

Latest previously completed programme stage remains **P0**. `PROGRAMME_STATE.json` correctly identified P1 as the active stage. No completed stage was repeated.

## Work completed in this tranche

The evidence register was expanded and re-read after commit to add four high-value evidence families:

1. **Clay-specific flight-dynamics precedent** — Andert, Freudenthal & Levedag (VISAPP 2016, DOI 10.5220/0005674602950302), directly modelling rotating pigeon clays using rigid-body/aerodynamic equations and stereo 3-D observations. Extracted and recorded the source’s lift, drag and aerodynamic-moment equation structure, its 32 m stereo baseline, and its stated ~3 m impact-estimation performance/boundaries. This supersedes Frisbee literature as the primary structural precedent wherever the clay paper applies.
2. **Shotgun pellet drag / TOF source** — E. J. Allen (Defence Technology 2018, DOI 10.1016/j.dt.2017.11.004), a peer-reviewed free-spherical-pellet model using velocity-dependent sphere drag and analytical velocity/flight-time expressions after nondimensionalisation. Its non-interacting-pellet limitation is explicitly preserved; it is not promoted to a full shot-cloud model.
3. **ShotKam projection/calibration evidence** — manufacturer field-of-view/frame-rate data plus explicit reticle/bore convergence and close-range parallax guidance. This establishes that camera-reticle position cannot be treated as an exact bore ray at every finite range without camera-to-bore calibration.
4. **Competition trajectory sanity constraints and trap spin mechanism** — ISSF Skeet/Trap throw constraints are recorded as validation outputs rather than generic sporting initial conditions; trap patent evidence confirms mechanical imparting of target spin but supplies no universal spin rate.

The register also records the existing ShotSight coaching-source permission boundary: recognised methods and source-specific qualitative transitions exist, but numerical method tolerances do not yet exist and remain calibration/model work.

## Verification

- Updated `docs/physics/EVIDENCE_PARAMETER_REGISTER_v0.1.md` was committed and fetched back from `physics-engine-v1`.
- Persisted content includes explicit `VERIFIED`, `SYNTHESIS`, `UNKNOWN/HOLD` and use-boundary language.
- No production simulator has been authorised.
- No aerodynamic coefficient, spin rate, launch speed, pellet TOF number, lead value or method tolerance was invented.

## Important new architectural consequence

The Andert et al. paper materially strengthens the programme: there is a directly relevant published clay-target rigid-body/aerodynamic + stereo-identification precedent. P2 should therefore begin from that model structure after the remaining coefficient/parameter extraction, rather than from generic Frisbee equations.

## Remaining P1 blockers / next exact work

P1 is **not complete**. Next tranche must:

1. extract the Andert paper’s numerical clay geometry/mass/inertia assumptions, coefficients/fit parameters, measured trajectories and integration/fit method;
2. extract Allen’s exact drag-curve segments, nondimensional scales, velocity/TOF formulas and worked validation values;
3. inspect the 2024 interacting-pellet study and older experimental shot-cloud work to bound the free-pellet approximation for centre TOF;
4. audit source-by-source method-state permissions from the ShotSight evidence registry;
5. continue searching for measured clay release speed/spin and quantitative trap kinematics;
6. build the P1 exit matrix mapping every P2 input to `VERIFIED`, `DERIVED`, `PARAMETER_TO_CALIBRATE` or `HOLD`.

If full-text extraction of a source is technically inaccessible in a run, preserve that item as `EXTRACTION_REQUIRED`; do not infer the missing coefficients from snippets or secondary sites.
