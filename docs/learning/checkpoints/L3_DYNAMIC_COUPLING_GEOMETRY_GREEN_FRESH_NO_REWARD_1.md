# L3 — Dynamic coupling geometry/time alignment verified; fresh reward support still absent

Status: **VERIFIED GREEN GEOMETRY / NEGATIVE BINARY REWARD SUPPORT**

## Governing axiom

**GOOD SHOOTING IS CONTINUOUS PERCEPTUAL COUPLING BETWEEN TARGET AND GUN: READ THE LINE -> MATCH THE SPEED -> APPLY THE METHOD -> TRIGGER -> FOLLOW THROUGH.**

## Verified geometry/time-alignment gate

The learner-side dynamic coupling correction introduced in `L3_DYNAMIC_COUPLING_GEOMETRY_TIME_ALIGNMENT_FIX_PENDING_CI.md` is now fully verified.

Workflow run `33959396469` on head `f8bd06bdda2a346e60686e44791919b485f2a6d0` completed successfully, including the explicit line-tangent / line-normal geometry audit and the full L0->L3 regression suite.

The correction remains semantic rather than reward-seeking:
- tangent follows perceived target travel in both directions;
- line normal is orthogonal and deterministic;
- command, speed-match and relationship assessment use the same learner-visible basis;
- each perception frame is assessed against the gun state at the same timestamp;
- the finite plant's separate 120 ms visual-motor delay remains intact;
- no oracle outcome or miss geometry enters the controller or process calibration.

## Fresh post-fix binary reward-support diagnostic

A dedicated fresh, non-sealed diagnostic was added at `tests/virtual-shooter-dynamic-coupling-fresh-reward-v2.mjs`.

Population:
- reward bank seed base: `351000`;
- 12 fresh crossers;
- 55 predeclared shooter-visible tangent/normal relationship actions;
- 660 attempts;
- same hidden bank across actions;
- distinct from process-only calibration and from prior reward-support bank;
- engineering centreline/disc proxy unchanged at 55 mm radius;
- oracle scoring post-trigger only.

Workflow run `33961889245` on head `27417098e11e135211472106c6483ee6037ad3bd` completed successfully. The diagnostic asserted that physical trigger opportunities and post-trigger continuation were present. Its explicit CI outcome marker was:

**NO BINARY REWARD SUPPORT**

The alternative `binary reward support discovered` marker was skipped. Therefore the fresh corrected test produced **0 engineering-proxy hits in 660 attempts**.

## Scientific interpretation

The 16.7 ms alignment defect was real and needed correction, but correcting it did **not** manufacture a hit. This is a useful negative finding.

The present maintained-lead representation remains a constant shooter-visible target-line relationship chosen from a coarse predeclared grid. Zero binary reward across that grid does not yet prove that dynamic perceptual coupling is wrong. It may mean the action representation is too discretised to discover a narrow successful relationship by sparse hit/miss feedback.

A human shooter is not restricted to 0.01-rad lead increments or five line-normal values. Before rejecting the coupling model, the next experiment should remove this artificial quantisation while preserving the information boundary.

## Anti-cheat

**PASS.**

No controller access to range, future path, exact intercept, pellet TOF, metric lead, target seed, oracle miss vector or post-shot miss-distance gradient was introduced. The 55 mm engineering proxy was not widened. The fresh bank is not a sealed final test.

## Next exact operation

Execute `L3_CONTINUOUS_RELATIONSHIP_EXPLORATION_REWARD_SUPPORT_V1`:

1. Preserve the corrected tangent/normal coupling controller and current finite gun plant unchanged.
2. Replace the coarse 55-point relationship grid **for the diagnostic only** with a deterministic, predeclared low-discrepancy / quasi-continuous sampling of the same existing shooter-visible relationship bounds.
3. Define the samples without consulting oracle miss distances, required lead, target range or intercept geometry.
4. Use a fresh non-sealed target bank, identical across sampled actions.
5. Score only post-trigger binary engineering-proxy outcomes; retain miss distance for researcher-side reporting only, never action selection or learning.
6. Include the coarse grid as a negative baseline.
7. If binary support appears, freeze the sampling design and proceed to actual hit/miss learning rather than tuning around the rewarded point.
8. If binary support remains absent, investigate whether a constant maintained-lead relationship is insufficient and move to shooter-visible relationship trajectories / phase-dependent coupling before any 100k scaling.

Do not widen the hit proxy, feed miss gradients, expose oracle lead, or scale to 100k at this stage.
