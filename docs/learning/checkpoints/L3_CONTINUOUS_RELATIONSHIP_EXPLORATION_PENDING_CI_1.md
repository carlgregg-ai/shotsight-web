# L3 — Quasi-continuous maintained-lead relationship exploration

Status: **IMPLEMENTED — CI VERIFICATION PENDING**

## Why this experiment exists

The corrected dynamic-coupling geometry is green, but a fresh post-fix diagnostic still produced zero engineering-proxy hits across 660 attempts. The previous action representation explored only a coarse 55-point grid: forward target-gun relationships in 0.01-rad increments and five line-normal offsets.

That quantisation is artificial. A human shooter is not constrained to those discrete visual pictures. Before concluding that a constant maintained-lead relationship is fundamentally insufficient, this experiment tests whether binary reward support lies between the coarse samples.

## Scientific constraint

This is **not** oracle-guided optimisation.

`learning/dynamic-continuous-relationship-evaluation-v1.mjs` predeclares 128 deterministic Halton low-discrepancy samples across exactly the controller's already-existing shooter-visible bounds:
- forward relationship: 0 to 0.12 rad;
- line-normal relationship: -0.04 to +0.04 rad.

The sample locations are generated solely from Halton indices (bases 2 and 3). They are not selected from miss distance, target range, intercept geometry, pellet time-of-flight, target seed or required lead.

## Experiment

Fresh non-sealed reward bank:
- seed base `361000`;
- 8 crossers;
- identical hidden bank across all relationship samples;
- 128 quasi-continuous actions = 1,024 attempts;
- same-bank coarse 55-action baseline = 440 attempts;
- unchanged 55 mm engineering centreline/disc proxy;
- process-only trigger feasibility calibration remains distinct and uses no oracle scoring;
- oracle scores only after a physical trigger;
- follow-through is required by the test.

## Interpretation rule fixed before outcome

If the low-discrepancy samples produce one or more binary proxy hits:
- treat that only as evidence that the maintained-lead relationship representation has binary reward support;
- freeze the sampling design;
- do not tune around the rewarded action using miss distance;
- move to genuine hit/miss learning and memory.

If they produce zero binary proxy hits:
- retain the coarse and quasi-continuous searches as negative findings;
- do not widen the target proxy or expose oracle correction;
- next test a shooter-visible **phase-dependent relationship trajectory** rather than a constant relationship, because a competent maintained-lead shot may require the relationship to be formed and stabilised dynamically rather than represented by one constant pair.

## Current CI

Workflow run `33962139776`, head `dd9e3aabaa943bc3c1ae2e8dd78e4766e4df3b75`, is executing the complete L0->L3 regression suite followed by the new quasi-continuous diagnostic.

Do not promote this checkpoint to VERIFIED until that workflow completes and the explicit continuous-relationship outcome marker is known.
