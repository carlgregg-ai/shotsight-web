# ShotSight Virtual Shooter — L3 Ellis Human Visual Acquisition Green 1

## Gate status

**VERIFIED PERCEPTION-CONTAINMENT GATE: ELLIS NOW HAS AN EXECUTABLE HUMAN-ANALOGOUS VISUAL ACQUISITION FRONT END BEFORE GENUINE PULL-AWAY LEARNING.**

This gate does **not** claim that the provisional timing parameters reproduce any particular human shooter, nor that the simulated clay aerodynamics or dense shotgun cloud are real-world validated. It establishes a stricter learner-side information representation in which a newly released fast target is not automatically presented to Ellis as a clean, continuously resolved point.

## Authoritative verification

- Branch: `virtual-shooter-v1`
- Verified code/workflow HEAD: `fc9572ca6d435757fe36390a1cbe9795097ac371`
- Workflow: `ShotSight virtual shooter`
- Authoritative CI run: `33973239021`
- CI conclusion: `success`
- Full L0 -> L3 chained regression: GREEN
- New CI step: `Run L3 Ellis human-analogous visual acquisition gate`
- New executable learner module: `learning/human-visual-acquisition-v1.mjs`
- New test: `tests/virtual-shooter-human-vision-v1.mjs`
- Controlling design note: `docs/learning/ELLIS_HUMAN_VISUAL_ACQUISITION_V1.md`

## Research basis and evidence discipline

The implementation is constrained by credible human-vision evidence, but numerical clay-specific limits are deliberately not asserted as established facts.

### DIRECT / general human-vision evidence

1. **Motion streaks / temporal integration** — Geisler (1999), *Nature*, PMID 10403249, and Apthorp et al. (2013), *Proceedings of the Royal Society B*, PMID 23222445. Fast image motion can create spatially oriented motion-streak information through temporal integration in human vision. This supports representing the first useful evidence from a fast clay as an uncertain moving region/streak rather than an exact instantaneous centre.
2. **Moving-image temporal integration** — Burr (1981), *Proceedings of the Royal Society B*, PMID 6111803. Human visual processing temporally sums moving visual information. This supports an integration window as a model component, but not a universal clay-specific millisecond threshold.
3. **Motion perception and smooth pursuit** — Spering & Montagnini (2011), *Vision Research*, PMID 20965208. Motion perception and pursuit share early motion processing but remain noisy and are not equivalent to perfect state measurement.
4. **Shotgun-specific gaze evidence** — Causer et al. (2010), *Medicine & Science in Sports & Exercise*, PMID 20139787. Elite shotgun shooters showed earlier onset and longer quiet-eye tracking than subelite shooters; successful trials also showed earlier/longer quiet-eye behaviour. This supports acquisition/tracking quality as a meaningful shooting variable, not an oracle-perfect target trace.

### SHOTSIGHT_HYPOTHESIS / provisional numerics

The first executable defaults are intentionally provisional and parameterised:

- temporal integration: `0.045 s`
- acquisition evidence scale: `0.16 s`
- pursuit latency control: `0.10 s`
- tracking-quality threshold: `0.58`
- base angular uncertainty: `0.002 rad`
- retained visual history: `0.35 s`

These are **not certified human constants** and must be calibrated/sensitivity-tested against eye tracking, high-speed video and later Sense-aligned human data. They may be varied by experimental condition.

## Executable perception states

`ELLIS_VISUAL_EVIDENCE_V1` now represents:

1. `EXPECTED_RELEASE`
   - attention can be directed toward a known/expected launch region;
   - no target point exists before visible evidence.

2. `FLASH_STREAK`
   - motion is detected;
   - Ellis receives coarse direction/speed band plus a broad angular region;
   - uncertainty is deliberately anisotropic, normally greater along the motion direction;
   - **no resolved target centre is exposed.**

3. `ACQUIRING`
   - successive evidence improves acquisition confidence;
   - target remains unsuitable for precise connection while the acquisition gate is not met;
   - **no resolved target centre is exposed.**

4. `TRACKING`
   - only after sufficient delayed/noisy evidence and acquisition quality does Ellis receive a resolved-but-uncertain angular estimate and apparent rates;
   - this remains derived from `SHOOTER_OBSERVATION_V1`, not true XYZ/range/future path.

5. `REACQUIRING`
   - occlusion/loss of current visibility removes the policy-ready resolved target estimate;
   - Ellis must reacquire rather than continuing on hidden oracle coordinates.

## Factors represented

The acquisition score can vary with learner-visible/perceptual conditions including:

- duration of useful evidence;
- apparent angular motion;
- source observation quality;
- contrast;
- visual clutter;
- attention allocation;
- occlusion.

Faster apparent motion increases the provisional smear/uncertainty and does not automatically make acquisition easier. Poor contrast/clutter reduce acquisition quality. These functional relationships remain `SHOTSIGHT_HYPOTHESIS` until calibrated.

## Anti-oracle containment

**PASS.**

The module imports only the existing learner observation boundary. It imports no target physics, ballistics, intercept solver or referee code.

The gate verifies that:

- unresolved phases cannot expose `resolved` target coordinates;
- the early streak representation exposes only a region, not a pseudo-centre coordinate;
- privileged aliases such as true range are rejected recursively even if hidden inside context;
- target/scenario seed, miss geometry, exact future path, intercept, pellet ToF, required lead and direct/oracle corrections remain forbidden;
- occlusion removes a resolved target estimate rather than allowing invisible perfect tracking.

## Tests passed

The CI test demonstrates:

1. an early fast observation history produces `FLASH_STREAK`, not a clean target point;
2. sufficiently long/high-quality evidence can progress to `TRACKING`;
3. higher apparent angular speed produces greater streak uncertainty and lower first-pass acquisition score under matched conditions;
4. clutter/poor contrast reduce acquisition quality;
5. occlusion after tracking causes `REACQUIRING` and removes policy-ready coordinates;
6. privileged range information injected into context fails the leakage boundary.

## Scientific interpretation

The important change is conceptual as well as technical:

`ORACLE WORLD -> delayed/noisy observation -> temporal/motion integration -> detection/streak -> acquisition -> tracking/reacquisition -> belief -> plan -> action`

rather than:

`ORACLE WORLD -> clean noisy target point every visible frame -> belief -> action`.

Ellis's perceptual expertise may improve through better expectation, attention, interpretation and prediction, but the sensory front end must not become superhuman merely because Ellis accumulates experience.

## Pull-away consequence

This is now a prerequisite for the primary pull-away learning condition. The intended process becomes:

`EXPECT -> DETECT/STREAK -> ACQUIRE -> READ LINE -> CONNECT -> MATCH SPEED -> DEVELOP SEPARATION -> TRIGGER -> FOLLOW THROUGH -> OBSERVE -> DIAGNOSE -> REMEMBER`

Ellis must not begin precise connection from `FLASH_STREAK` or `ACQUIRING`. The learner may decide that additional observation is worth the consumed runway, creating a genuine information-versus-time trade-off.

## Chiron / apprenticeship consequence

Future `ELLIS_EXPERIENCE_RECORD_V1` episodes should preserve visual-acquisition state alongside the existing belief/intention/movement/outcome record, including at minimum:

- acquisition phase at gun movement / connection / trigger;
- acquisition score/confidence;
- streak-vs-resolved status;
- observation span;
- contrast/clutter/occlusion condition;
- whether Ellis waited for more visual information;
- whether loss/reacquisition preceded the shot.

This allows future Chiron research to distinguish a poor solution from a shot that was compromised earlier by weak target acquisition.

## Required ablations before retaining as useful learning architecture

- legacy clean-point observation vs human-analogous acquisition;
- short vs longer acquisition opportunities;
- high contrast vs clutter/low contrast;
- selective wait ON vs OFF;
- memory ON vs OFF;
- Satisfaction ON vs OFF;
- later eye-tracking-calibrated parameters vs provisional ranges.

Human-analogous vision survives as a scientific model only if it produces credible learning/calibration/robustness behaviour rather than merely making the task harder.

## Next operation

Route the **primary L3 pull-away learner** through `ELLIS_VISUAL_EVIDENCE_V1` rather than allowing the policy to consume raw clean-point `SHOOTER_OBSERVATION_V1` directly. Add an explicit policy-boundary test that fails if the pull-away learner receives raw unresolved az/el coordinates. Extend `ELLIS_EXPERIENCE_RECORD_V1` with acquisition-state fields, then begin genuine hit/miss learning on explicit train/calibration/held-out populations with memory ON/OFF and Satisfaction ON/OFF controls.

Do not scale to the 100k existential bank until reproducible held-out learning is demonstrated under this human-analogous perception constraint.
