# ShotSight Virtual Shooter — Learn to Shoot Master Programme

Status: ACTIVE EXPERIMENTAL PROGRAMME
Branch: `virtual-shooter-v1`
Parent physics state: `physics-engine-v1`

## Governing objective

Build a virtual clay shooter that **learns to break clays from incomplete, delayed, noisy, human-like observations and remembered experience**, while a separate hidden oracle simulator supplies only the ground truth needed to generate the world and score whether the shot actually intersected the target.

The goal is not to create a numerical intercept calculator wearing a shooting-method label. The goal is to create a learner that develops a usable analogue of shooting intuition: it sees enough of a target to form a probabilistic belief about what kind of presentation it is, chooses a sensible visual pickup / hold / break plan, joins the gun to the target path using a method, commits to the shot, receives imperfect outcome feedback, remembers what happened, and improves on future related presentations.

**ORACLE KNOWS. SHOOTER PERCEIVES, BELIEVES, ACTS, REMEMBERS AND LEARNS.**

## Non-negotiable anti-cheating rule

The virtual shooter MUST NOT receive any privileged quantity that a human shooter could not plausibly know at shot time.

Hidden from the shooter unless a later experimental condition explicitly authorises it:
- exact target XYZ position or velocity vector;
- exact future trajectory;
- exact range/depth from an uncalibrated monocular view;
- exact aerodynamic parameters;
- exact trap launch state;
- exact pellet time of flight;
- exact mathematical intercept point;
- exact required metric lead;
- post-shot miss vector before the shot;
- oracle target classification when the visual evidence is genuinely ambiguous.

The oracle may use those values to simulate reality and score outcomes. The learner may only receive a constrained observation stream.

Every experiment must include an automated information-leakage audit. Any accidental privileged-state access invalidates the run.

## Research-informed shot-planning priors

These are priors / evidence constraints, not hard-coded perfect answers.

### CPSA
CPSA Sporting guidance describes the visual pickup as where the target is first clearly seen; the gun hold point should lie between visual pickup and break/hit area and should be neither so close to the trap that the target beats the barrels nor so far out that the gun runs out of useful movement before the intended hit point. The CPSA handbook similarly treats hold point, target pickup and creation of lead as sequential elements and notes that pickup may be on, ahead of, or behind the target depending on method. These concepts should become explicit planning variables rather than decorative labels.

### Ben Husthwaite
Ben Husthwaite's published coaching material treats a shot plan as including feet, hold point, kill point, method, speed and lead, and explicitly notes that changing hold point changes gun speed. His training advice encourages deliberately varying hold points and methods, learning through misses as well as hits, and treating lead as something the shooter learns through bad judgement and trial/error rather than something an instructor simply supplies numerically. This directly supports a learner that explores and remembers outcomes rather than receiving an oracle lead answer.

### NSCA / Don Currie
NSCA / Don Currie material treats pickup, hold and break point as a pre-shot plan, with the precise hold point dependent on presentation and method. For a flat crosser, two-thirds back from break point towards trap/pickup is presented as a starting heuristic, not a universal law; sustained/maintained lead may need less runway than pull-away. Break-point commitment matters because target character changes along its flight. This should be represented as a planning prior and adaptive variable, not a fixed rule across all clays.

### Brett Winstanley
The programme must deliberately research Brett Winstanley's available instructional / explanatory videos and extract useful hold-point, visual-pickup, break-point, method-selection and target-reading concepts. Do not attribute claims to him unless the actual source is recovered. Log exact video/source, timestamp where possible, claim, evidence class and whether it changes the simulator.

## Scientific learning principles to use

1. **Partial observability:** model the shooter as operating from a belief state over likely target futures, not a known trajectory.
2. **Perception-action coupling:** the learner should choose movement from what it currently sees/believes, not from retrospective oracle reconstruction.
3. **Exploration after failure:** misses should increase targeted exploration in task-relevant dimensions; repeated success should increase exploitation, without collapsing adaptability.
4. **Curriculum:** learn stable, legible presentations before increasingly ambiguous, noisy and transitioning ones.
5. **Domain randomisation:** vary target, environment, perception and gun dynamics enough to prevent memorisation while avoiding such extreme ranges that the learner becomes unrealistically conservative.
6. **Sparse + graded feedback:** primary reward is break/no-break; graded post-shot information may be supplied in controlled experimental variants, but never as continuous perfect aim correction during the move.
7. **Held-out transfer:** performance must be measured on unseen target combinations and deliberately withheld parameter regions, not only random samples from the training distribution.
8. **Memory:** preserve episodic records of similar target presentations and outcomes, plus slower-changing skill priors.
9. **Confidence calibration:** the learner must know when its belief is uncertain. High confidence with poor calibration is a failure even if average hit rate looks good.
10. **No silent coaching truth:** source coaching and learned behaviour must remain separable. Learned behaviour may agree with a coach, differ, or expose a simulator weakness.

## System architecture

### A. ORACLE WORLD — hidden truth
Responsible only for creating and adjudicating reality.

Contains:
- exact target dynamics and orientation where modelled;
- trap/launch variation;
- gravity/aerodynamics where scientifically authorised;
- wind/environment variation where authorised;
- exact shooter/gun rigid-body state;
- shot/pellet model and target intersection;
- exact break/no-break event;
- hidden miss vector / timing error used for evaluation and optional delayed coaching feedback.

The oracle never directly chooses the shooter action.

### B. HUMAN-LIKE OBSERVATION PIPELINE
Generate observations that a shooter could plausibly have:
- angular target location in visual field;
- short temporal history of apparent motion;
- angular velocity estimate with noise and latency;
- apparent rise/fall/curvature;
- target apparent size/orientation cues only when visible;
- contrast, clutter and temporary occlusion;
- first-clear-sight event;
- rough launch region / trap visibility if scene permits;
- background landmarks and parallax cues where physically available;
- target family probabilities rather than perfect class labels;
- optional contextual priors such as visible fragments / landing area from earlier misses, but only when such evidence would genuinely be visible to a human.

Randomise latency, observation noise, contrast and acquisition quality within evidence-based/plausible bounds. Keep provenance for each parameter.

### C. BELIEF / TARGET-READING MODEL
Maintain a probability distribution over plausible target families and future apparent trajectories.

It should answer things such as:
- likely crosser vs quarterer vs looper vs teal;
- likely stable vs transitioning phase;
- likely direction and apparent-speed band;
- plausible future angular track cloud;
- confidence / entropy of the belief;
- whether more observation is worth delaying the shot.

It must never collapse uncertainty merely because the oracle knows the answer.

### D. PRE-SHOT PLAN
For each target, choose or revise:
- visual pickup region;
- gun hold point;
- intended break point / break zone;
- method;
- initial gun state;
- expected target line;
- expected move tempo;
- trigger commitment criteria.

Pickup/hold/break points are learned/adaptive planning variables. Heuristics from CPSA/NSCA/Husthwaite are priors and initialisation aids, not oracle answers.

### E. METHOD CONTROLLERS
Start with:
- swing-through;
- pull-away;
- maintained/sustained lead.

All operate from observations/belief, not oracle lead.

Required qualitative constraints:
- Swing-through: gun relationship originates behind, develops sufficient relative speed to pass through the target relationship, and creates a forward relationship before trigger.
- Pull-away: gun acquires/connects with target movement, establishes useful speed relationship, then separates smoothly to a learned forward picture before trigger.
- Maintained lead: gun establishes a forward relationship early and preserves a useful visual relationship while target and gun move together into trigger.

Do not hard-code the correct final lead. The learner must discover usable visual relationships through experience. Method parameters such as connection tolerance, relative-speed profile and phase timing remain `SHOTSIGHT_HYPOTHESIS` or `PROVISIONAL_METHOD_KINEMATICS` until measured/validated.

### F. GUN / SHOOTER MOTOR MODEL
Use realistic movement constraints rather than a massless pointing ray:
- gun mass, dimensions and approximate inertia;
- shoulder / torso driven rotation;
- finite angular velocity and acceleration;
- jerk/smoothness constraints;
- mount dynamics where applicable;
- visual-motor reaction delay;
- continuation/follow-through;
- noise / small motor variability.

Do not assume gun mass alone defines human movement. Treat human motor limits as calibration targets for future Sense/video data.

### G. TRIGGER POLICY
Trigger is a learned decision under uncertainty, not an oracle event.

It may depend on:
- confidence target path is understood;
- method phase;
- perceived target-gun relationship;
- proximity to planned break zone;
- stability of target focus / belief;
- learned timing window;
- remaining useful engagement window.

The policy must be penalised for indecision / barrel dragging when it routinely misses a planned break zone, but must also learn when waiting for more target information improves expected success.

### H. MEMORY AND INTUITION
Maintain two complementary memories:

1. **Episodic memory** — presentations, observation histories, plan, method, movement signature, trigger picture, outcome and post-shot diagnosis.
2. **Generalised skill memory** — learned priors such as useful hold-point regions, likely break zones, method suitability and visual separation patterns for families of presentations.

Similarity retrieval must use only features available to the shooter at decision time.

The learner should be able to express a compact post-shot internal account such as:
- 'looked like a fast shallow crosser; confidence medium';
- 'held too close to launch, target beat the barrels';
- 'pull-away connection felt late / gun speed high';
- 'missed behind; increase runway or earlier connection next similar target';
without pretending those labels are proven when evidence is ambiguous.

### I. PLAYBOOK COACH / SELF-DIAGNOSIS LAYER
When learning stalls or repeated miss signatures appear, query the ShotSight coaching Playbook instead of blindly increasing compute.

Process:
1. classify repeated symptom from available evidence;
2. retrieve relevant Playbook candidate mechanisms and diagnostic questions;
3. choose one falsifiable adjustment at a time — e.g. hold point, break point, method, pickup, gun speed, focus timing;
4. run an A/B or blocked experiment;
5. retain the change only if held-out performance and method quality improve;
6. record negative findings.

Do not let the Playbook directly reveal oracle lead.

### J. AFFECTIVE / METACOGNITIVE SHOOTER STATE
ShotSight may model an **affect-like performance state**, not claim subjective consciousness.

Track explicit variables such as:
- calibrated confidence;
- uncertainty;
- frustration/stagnation index after repeated unexplained misses;
- composure / stability under streaks and pressure;
- curiosity / exploration drive;
- commitment / decisiveness;
- trust in current method and plan;
- overconfidence risk;
- recent-success expectancy.

These variables may influence exploration rate, willingness to change a plan, break-point commitment, method persistence and attention allocation. They must not alter physics or fabricate perceptual evidence.

The aim is functional emotional intelligence about shooting: recognising patterns like 'I am repeatedly failing with a plan I am overconfident in; test a different hold point' or 'one miss after a stable run should not trigger a wholesale method change.'

This state must be evaluated for calibration and usefulness. If it adds narrative without improving decisions, remove it.

## Training curriculum

### Stage L0 — Containment and baselines
- create branch-local durable state/checkpoints;
- freeze anti-cheat boundary;
- build an oracle agent with privileged state as theoretical ceiling only;
- build a naive human-observation baseline;
- prove oracle and shooter observations are structurally separated.

### Stage L1 — Perception-only target reading
No gun yet. Show short observation windows and train target-family / apparent-path belief estimates.
- stable crossers first;
- then speed/distance/angle variation;
- then quarterers and simple loopers;
- quantify calibration, not just classification accuracy.

### Stage L2 — Pickup / hold / break planning
Train the learner to choose pickup, hold and break regions from observation and prior experience.
- seed with source-derived heuristics;
- randomise presentation;
- score control, acquisition, useful runway and break-zone consistency;
- preserve alternatives rather than one universal hold point.

### Stage L3 — Single-method crosser learning
Train maintained lead first or whichever method provides the cleanest experimental baseline. Learner must discover a useful target-gun relationship without receiving required lead.

### Stage L4 — Three-method crosser learning
Train swing-through, pull-away and maintained lead on the same target distribution.
- identical hidden targets across agents;
- method-specific constraints;
- compare learning speed, hit rate, robustness and movement economy.

### Stage L5 — 100k crosser experiment
Generate 100,000 **meaningfully varied** crosser presentations, not trivial clones.
Suggested split:
- 70k train;
- 10k tuning/calibration;
- 20k sealed held-out test.

Also hold out structured regions: combinations of speed/range/angle/visual quality not seen in training.

Use the same hidden presentation bank for all three methods plus oracle and naive baselines.

Do not stop at 100k if the learning curve is still materially improving. Do not scale to millions if architecture is demonstrably wrong.

### Stage L6 — Adaptive curriculum / mixed presentations
Expand to quarterers, loopers/chandelles, teal, driven and later rabbits only when the oracle world model for that family is adequate for the question being asked.

Use blocked learning first, then interleaving, then random mixtures.

### Stage L7 — Ambiguity and fuzziness
Increase:
- shorter observation windows;
- uncertain target family;
- launch variation;
- imperfect visual acquisition;
- clutter/contrast changes;
- target-speed variation;
- modest wind/model variability where authorised;
- occasional misleading contextual priors.

The virtual shooter should sometimes be uncertain and still choose a robust action.

### Stage L8 — Pressure / state robustness
Introduce score/streak/competition contexts and test whether the affective/metacognitive state improves rather than destabilises performance.

### Stage L9 — Coaching self-repair
Deliberately create failure clusters. Require the learner to search the Playbook, form a diagnostic hypothesis, test one change, and either keep or reject it.

### Stage L10 — Sim-to-real bridge
When Sense/video data become available:
- compare real gun angular velocity/acceleration/jerk with simulated learned moves;
- estimate human movement envelopes;
- calibrate observation/reaction delays;
- compare successful vs missed shot signatures;
- use held-out real shots for validation, not merely fitting.

## Reward / objective design

Primary reward:
- actual oracle-scored target break / valid intersection.

Secondary objectives must be modest and should prevent simulator exploits rather than replace the task:
- smooth finite movement;
- plausible acceleration / jerk;
- method topology compliance;
- trigger within useful window;
- target visual continuity / no impossible occlusion behaviour;
- economy of unnecessary gun movement;
- confidence calibration.

Do NOT reward closeness to oracle lead directly during the shot. That would turn learning back into oracle imitation.

Avoid a reward function so dense that the agent solves the shaping terms instead of learning to break clays.

## Feedback schedule experiments

Compare at least:
A. hit/miss only;
B. hit/miss + delayed coarse miss category (behind/ahead/high/low where genuinely inferable);
C. hit/miss + richer post-shot diagnosis;
D. Playbook-guided targeted experiments after repeated failure.

Never provide continuous exact miss vector / perfect lead during movement.

Track retention and transfer, not just acquisition speed.

## Metrics that matter

### Outcome
- hit rate;
- oracle-normalised hit rate;
- first-shot hit rate on unseen targets;
- performance after 1, 2, 5 and 10 prior exposures to a related target family;
- robustness to observation noise / latency.

### Learning
- learning curve and sample efficiency;
- exploration after failure;
- retention after target-family switches;
- catastrophic forgetting;
- generalisation to withheld parameter regions.

### Perception / belief
- target-family calibration;
- predicted path uncertainty calibration;
- confidence vs actual hit probability;
- time needed before a stable belief forms.

### Shooting process
- pickup-to-connection time;
- hold-point usefulness;
- break-point adherence;
- target-bore angular separation history;
- gun angular velocity, acceleration and jerk;
- method phase topology;
- trigger timing distribution;
- follow-through.

### Anti-cheat
- privileged-field access = 0;
- exact oracle-lead correlation must arise only through learned observation/action, never direct state access;
- ablation test removing memory should reduce performance if intuition/memory is genuinely useful;
- shuffled-outcome control should destroy learning.

## Required benchmark experiments

1. Oracle vs perception-limited shooter.
2. Memory vs no-memory shooter.
3. Three methods on identical hidden crosser bank.
4. Source heuristics initialised vs blank-slate learner.
5. Hit/miss-only vs graded delayed feedback.
6. Playbook self-repair vs unguided continued training after a deliberate plateau.
7. Affective/metacognitive state enabled vs disabled.
8. 200–300 ms observation-window challenge.
9. Structured out-of-distribution target test.
10. Simulated learnt movement vs future Sense human movement.

## Success criteria for the first existential test

The programme may claim **VIRTUAL_SHOOTER_CROSSER_LEARNING_PROOF** only if:
- anti-cheat audit passes;
- shooter never receives exact future trajectory/intercept/lead;
- learning improves materially over naive baseline;
- performance transfers to sealed unseen crosser presentations;
- all three methods can produce method-consistent successful movement families;
- memory demonstrably improves future decisions;
- confidence is meaningfully calibrated;
- the learner can recover from a miss cluster through exploration or Playbook-guided diagnosis;
- oracle remains a clearly separated ceiling/reference;
- results are reproducible from fixed seeds;
- negative results and failure modes are preserved.

Do not choose an arbitrary success percentage in advance and then tune the simulator to reach it. Report achieved hit rates honestly and compare them to baselines and oracle ceiling.

## Scaling decision after 100k

After the first 100k presentation bank:
- if held-out performance is still rising materially, expand to 300k / 1M while preserving sealed tests;
- if training rises but held-out stalls, fix generalisation before more compute;
- if both stall low, investigate architecture/perception/reward before scaling;
- if performance is high only with easy/noisy settings disabled, the proof fails;
- if method topology collapses into one generic exploit, redesign the method constraints;
- if the shooter requires oracle-derived feedback, the proof fails.

## Rendering / human review

Render selected learned shots in the ShotSight Visual Style & Animation Bible using the same exact learner/oracle state.

Required review clips:
- early novice attempt;
- first successful learned attempt;
- mature successful swing-through;
- mature successful pull-away;
- mature successful maintained lead;
- representative miss and subsequent correction;
- held-out unseen target success;
- one case where confidence is low but a robust shot succeeds;
- one case where Playbook diagnosis changes the plan.

These videos are evidence views of the model, never hand-authored demonstrations.

## Durable checkpoint protocol

Create/update `docs/learning/VIRTUAL_SHOOTER_STATE.json` and bounded checkpoints under `docs/learning/checkpoints/`.

At every run:
1. read this master programme;
2. read state and latest checkpoint;
3. inspect branch HEAD/CI;
4. resume the first incomplete verified operation;
5. validate locally/scratch where possible;
6. persist coherent expected-green changes;
7. record results, failures and next action;
8. continue while execution budget allows.

If interrupted, resume from checkpoint. Never restart the full experiment.

If a genuine scientific or external blocker exists, record `BLOCKED_EXTERNAL` or `BLOCKED_SCIENTIFIC` with the exact reason. Do not fabricate success.

## Relationship to the existing method-render programme

The existing three-method and CPSA video reconstruction work remains valuable and may continue independently on `physics-engine-v1`. This virtual-shooter branch must consume validated physics interfaces but should not write to the same branch during scheduled runs. Where the method-render programme produces useful evidence, merge/rebase deliberately only after verifying compatibility.

## Final principle

A successful ShotSight shooter should not behave like a calculator that happens to point a gun. It should behave like an increasingly experienced shooter: perceive imperfectly, recognise families of targets, plan pickup/hold/break points, join the gun to the clay, create a learned visual relationship, commit, miss sometimes, diagnose, remember, adapt, and become better because of accumulated experience.
