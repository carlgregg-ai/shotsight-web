# L3 maintained-lead no-learning baseline — GREEN 1

Date: 2026-09-05
Programme stage: L3 — Single-method crosser learning
Gate: perception -> presentation plan -> finite gun plant -> shooter-visible trigger -> post-action oracle referee

## Result

The first maintained-lead no-learning crosser baseline is GREEN as an architecture/scientific-containment gate. This is **not** evidence that the shooter can yet learn to break a clay and is **not** real-world shooting validation.

Latest verified CI for the repaired gate:
- workflow: `ShotSight virtual shooter`
- run: `33954406860`
- head: `5e05a698edefab3cc44635ce24acab669d73b4cc`
- conclusion: success
- all earlier L0, L1, L2 and finite-gun L3 tests also remained green.

## Anti-cheat boundary

Learner-side module `learning/maintained-lead-baseline-v1.mjs` imports no oracle or physics module. Static test rejects learner-source references to oracle evaluation, physics, physical lead, pellet TOF, required lead and exact intercept. Runtime input is delayed/noisy angular belief, whole-presentation plan, finite gun state and a static exploratory angular visual-picture parameter. Oracle evaluation occurs only after the learner has triggered.

The static angular separation is explicitly a target-gun **visual relationship**, not a metric/ballistic lead answer. Motor-delay feed-forward uses only perceived angular rate multiplied by the plant's known provisional visual-motor delay. It does not use range, target XYZ, pellet timing or intercept.

## Observation-only presentation calibration

The earlier fixed demonstration span was invalid for this end-to-end population: on diagnostic seed bank `131000`, mean maximum shooter-visible presentation progress was only ~0.678 and only 4/24 episodes reached the maintained-lead commit window. That bank has therefore been **retired from held-out status** and retained as a negative diagnostic result.

A replacement stand prior is now fit on a separate calibration bank using delayed/noisy angular observations only:
- calibration seed base: `151000`
- calibration crossers: 30 in CI gate
- median demonstrated angular span: `0.4136418192551735 rad`
- median observed presentation duration: `0.9333333333333333 s`
- no range, hidden trajectory, lead, intercept, hit or miss enters this fit.

The repaired gate was then evaluated on a new untouched diagnostic held-out bank:
- held-out seed base: `181000`
- 24 crossers
- same hidden bank used for every static separation condition.

## Trigger definition repair

The first trigger implementation also failed because it compared the delayed finite gun against the **current prospective servo command**. In the rare episodes that reached the commit region, that command error was ~0.14-0.21 rad, so no shot fired. That was the wrong quantity for maintained-lead topology.

The repaired trigger judges the achieved shooter-visible picture:
- perceived target direction;
- actual gun-versus-believed-target angular separation;
- error from the requested exploratory visual separation;
- elevation picture error;
- belief confidence;
- whole-presentation commit window.

The prospective servo-command error remains diagnostic only. The finite plant still retains its visual-motor delay, velocity, acceleration and jerk limits.

## Static no-learning results

Predeclared separation grid: `0, 0.015, 0.030, 0.045, 0.060, 0.075 rad`.
These values were not selected from oracle lead and are not promoted as correct lead values.

On the 24 untouched crossers:

| visual separation rad | trigger rate | proxy hits | mean referee miss, triggered shots |
|---:|---:|---:|---:|
| 0.000 | 8/24 (33.3%) | 0 | 1.962 m |
| 0.015 | 3/24 (12.5%) | 0 | 1.243 m |
| 0.030 | 4/24 (16.7%) | 0 | 1.773 m |
| 0.045 | 4/24 (16.7%) | 0 | 1.278 m |
| 0.060 | 6/24 (25.0%) | 0 | 1.979 m |
| 0.075 | 5/24 (20.8%) | 0 | 1.564 m |

Score status remains `ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY` with the 55 mm centreline-disc proxy.

This is an important **negative result**: the complete perception-limited maintained-lead action path now fires valid finite-gun shots, but none of the initial static visual pictures broke the engineering proxy on this untouched bank. The programme must not tune this away or treat post-shot referee miss distance as learner feedback in the hit/miss-only condition.

## Poor-observation leak probe

At the predeclared `0.045 rad` visual separation under poor observations:
- 0/24 triggers;
- 0 proxy hits;
- mean maximum confidence `0.18081679033537115`;
- no episode met the confidence gate.

This is currently desirable anti-cheat behaviour: reducing perceptual information reduces commitment rather than preserving implausibly high performance.

## Scientific interpretation

The gate proves only that the full learner-side perception/plan/motor/trigger route and post-action scoring route are structurally executable without privileged state. It deliberately does **not** prove a useful lead picture, useful trigger policy, or learned shooting capability.

The fact that all initial static pictures miss creates the correct next existential test: can a learner explore broader shooter-visible angular relationships and, using **hit/miss feedback only**, discover a region that produces breaks and retain/generalise it without ever seeing the referee miss distance or mathematical intercept?

## Next verified operation

`L3_MAINTAINED_LEAD_HIT_MISS_LEARNING_V1`

Build a simple interpretable learner before RL/neural policies:
1. broader predeclared angular visual-picture action grid within the existing learner-safe bounds;
2. training/calibration/held-out partitions remain separate;
3. learner receives only `HIT_MISS_ONLY_FEEDBACK_V1` after a trigger; no miss distance/vector or oracle correction;
4. episodic/general memory must not contain target seeds;
5. establish whether the action space contains any reward at all and whether sequential memory improves later unseen-target proxy-hit rate versus a no-memory control;
6. preserve the no-hit result if learning cannot get traction; diagnose perception/motor/action-space failure before adding compute or richer feedback.
