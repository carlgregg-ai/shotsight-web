# SHOTSIGHT — PHYSICS, KINEMATICS, BALLISTICS & VIDEO-UNDERSTANDING MASTER PROGRAMME

**Mission-critical development prompt — accuracy-first, evidence-first, simulation-first, stage-gated, interruption-resistant**

## 0. Mission and failure condition

Continue development of `carlgregg-ai/shotsight-web` from the durable repository state. The current Playbook UI/content architecture is valuable, but the existing instructional target/gun animations have failed expert review: they can be off-line, out of sync, geometrically incoherent and narratively misleading. Their previous visual certification is therefore invalidated.

This programme replaces illustration-first animation with a physics/kinematics system capable of representing clay flight, shotgun external ballistics, physical interception, shooter-relative apparent motion, gun movement, method-specific gun/target relationships, narrative events, and later physics-constrained interpretation of coaching/ShotKam video.

The required standard is not “looks plausible”. The required standard is that an expert shooter/coach can scrub the simulation frame by frame and find the geometry, timing, method and narrative coherent with the underlying physics and the cited coaching method.

If the evidence is insufficient to support a quantity or behaviour, do not invent it. Parameterise it, mark it UNKNOWN/HOLD, design a calibration experiment, or stop that branch. A smaller validated model is preferable to a comprehensive fiction.

## 1. Governing laws

1. **THE MODEL CREATES THE ANIMATION. THE ANIMATION NEVER CREATES THE MODEL.**
2. One world model, one coordinate system, one unit system, one master simulation clock.
3. Target, gun, narrative, shot and break events all read the same simulation state at time `t`.
4. No arbitrary SVG target/gun paths as physical truth. Curves may only render already-computed state samples.
5. No arbitrary pixel lead. Physical and apparent/angular lead must be derived from world geometry and projection.
6. No independent target/gun loop durations. A loop resets the whole state together; phase drift is forbidden.
7. No decorative break point. The break event must correspond to pellet arrival/intersection within the model’s stated approximation.
8. Coaching technique is a source-attributed kinematic/control strategy layered on physical interception. Do not encode one coach’s method as a law of physics.
9. Keep DIRECT / SYNTHESIS / SHOTSIGHT_HYPOTHESIS / HOLD distinctions intact. Add VERIFIED_FACT / DERIVED_VALUE / CALIBRATED_PARAMETER / MODEL_ASSUMPTION / UNKNOWN where useful for engineering provenance.
10. Accuracy overrides completion and catalogue breadth.

## 2. Required repository behaviour and recovery protocol

Before every substantial run:

- inspect repository HEAD, current physics checkpoint and relevant source files;
- determine the latest **verified** stage/substage checkpoint from durable repository state, not from conversational memory;
- do not redo completed work unless verification proves it necessary;
- fetch current file SHA before any update;
- after every write, re-fetch/compare or otherwise verify the durable output;
- make small coherent commits with informative messages;
- never claim a stage complete when a required test/research gate is unverified.

Persist programme state under `docs/physics/` and checkpoints under `docs/physics/checkpoints/`. Maintain a machine-readable status file (for example `docs/physics/PROGRAMME_STATE.json`) containing current stage, status, commit, verified outputs, unresolved holds and exact next action.

### Continuous execution mode

This programme runs as **CONTINUOUS CHAIN WITH HOURLY RECOVERY FALLBACK**.

Within one automation run, finishing and verifying a stage automatically authorises the next permitted stage. Do not wait for manual `CONTINUE`. Keep chaining while execution/tool limits allow safe verified progress.

The hourly trigger is a recovery mechanism. If a run is interrupted or hits an execution limit, the next run must recover from the latest durable checkpoint and resume the exact unfinished operation.

If a true external dependency makes progress impossible (for example a required physical measurement or expert/user video that does not yet exist), save a `BLOCKED_EXTERNAL` checkpoint explaining exactly what is needed. Do not fabricate the missing evidence. Pause/disable the hourly automation rather than rerunning uselessly, and surface the dependency.

When the entire programme’s final release gate passes, verify repository/deployment state and disable the automation that launched this programme.

## 3. Evidence and deep-research standard

Do not rely on memory for critical model constants. Research before implementation. Prefer primary/technical sources where available:

- ISSF, CPSA, FITASC, NSCA/NSSA technical rules and coaching material;
- clay manufacturers (e.g. Laporte, Corsivia, White Flyer) and trap manufacturers (e.g. Laporte, Promatic, MEC) for dimensions, masses, machine/throw parameters;
- CIP/proof/ammunition/manufacturer data where relevant;
- peer-reviewed target/disc aerodynamics, sports projectile aerodynamics, spinning-body dynamics;
- peer-reviewed or technically credible shotgun pellet drag, shot-cloud/string and pattern studies;
- sports biomechanics, motor-control, gaze/quiet-eye and perception research where relevant;
- ShotSight’s existing source/evidence register for coaching methods;
- calibrated high-speed video / ShotKam / measured throws when available.

Search internationally when useful. Track source lineage and avoid treating copied claims as independent confirmation. Record source, claim, parameter, units, uncertainty, applicability and evidence class.

If a coefficient or relationship cannot be found, leave it parameterised and design system identification rather than inventing a number.

## 4. Physics & kinematics specification before simulator coding

Create `SHOTSIGHT_PHYSICS_KINEMATICS_SPEC_v1.md` before production simulator coding. It must define:

- world coordinate system and handedness;
- shooter, trap and camera reference frames;
- SI internal units and explicit conversion boundaries;
- target translational state and, where justified, rotational state;
- gun/bore orientation state;
- camera projection model;
- ballistic state;
- simulation clock and event timeline;
- numerical integration method and step strategy;
- interpolation/render strategy;
- error/uncertainty representation;
- parameter provenance model;
- calibration and validation architecture;
- deliberate simplifications and model boundaries.

No component may create its own conflicting coordinate convention.

## 5. Target database

Create a provenance-backed target database. For each supported target type record only what can be supported, including where available:

- manufacturer/model/type;
- diameter, height, mass, profile/rim geometry/material;
- centre-of-mass and moment-of-inertia derivation/assumption;
- aerodynamic evidence/parameters and valid regime;
- typical launch use and orientation conventions;
- uncertainty and evidence class.

Relevant categories may include standard, midi, mini, battue, rabbit and others, but do not force unsupported target types into the model. Never simulate a battue/rabbit merely by scaling a standard target.

## 6. Trap and launch model

Represent the trap as a generator of initial conditions, with parameters such as launch position, azimuth, elevation, launch speed, initial target attitude, spin, target type, machine/spring state where known, wind and ground plane.

Colloquial labels such as crosser, quarterer, incomer, driven, teal, chandelle and rabbit are user-facing classifications of geometry/context, not substitutes for the state vector.

An underpowered “incomer-ish” throw should be representable through changed initial conditions rather than a different arbitrary animation path.

## 7. Target flight physics

Use the simplest model that survives validation. Candidate components include gravity, drag, orientation-dependent lift/drag, spin-related effects and aerodynamic moments, but do not include terms merely because they exist in generic projectile equations.

For each force/moment term record physical justification, governing equation, parameter provenance and uncertainty. Consider dependencies such as Reynolds number, speed, angle of attack, target orientation, spin rate/parameter and geometry when evidence supports them.

If full 6-DOF modelling is not supported, use a simpler validated model and state its limits. Do not simplify away behaviour that materially controls slowdown, apex, turn, visible face, battue turn, teal phase or rabbit ground behaviour.

## 8. Empirical calibration / system identification

Where aerodynamic parameters are uncertain, ShotSight must support calibration from measured real throws. Define a protocol using known clay type, known trap, measured launch/camera geometry, field reference points, high-frame-rate video (preferably two calibrated viewpoints), repeated throws, environmental conditions and held-out validation throws.

Fit uncertain parameters to measured trajectories. Preserve raw observations, fit procedure, fitted parameter values, confidence/uncertainty, residuals and independent validation error. Do not fit and validate on exactly the same data without disclosure.

## 9. Rabbit-specific model

Rabbit targets require an explicit ground-interaction model if they are to be simulated physically: rolling/slipping, angular velocity, bounce/impact, speed decay, terrain/ground-plane effects and uncertainty. Do not treat a rabbit as an airborne curve near the floor. Keep rabbit simulation on HOLD until credible validation exists.

## 10. Shotgun external ballistics

Build a separate ballistic engine using supported inputs such as muzzle velocity, shot size, pellet diameter/mass/material, atmospheric state, barrel orientation and drag/deceleration model.

Do not hold pellet speed constant. Calculate pellet/shot-cloud centre time-of-flight. Include gravity and other terms when material to the required accuracy. Internal ballistics are out of scope unless needed for a specific validated input.

Distinguish centre-of-shot-cloud trajectory from pattern distribution/shot string. Pattern/choke modelling may be layered later and must use measured/source-supported behaviour rather than universal pattern assumptions.

## 11. Intercept solver and lead

At shot time `ts`, solve a physically coherent future intersection between target state and shot trajectory at `ts + TOF` within the stated shot-cloud approximation.

Lead is therefore an output, not a hard-coded presentation value. It depends on range, target velocity vector, target phase, line of sight, pellet TOF and shot timing.

Maintain explicit distinction:

- **physical lead** — world-space linear separation;
- **apparent/visual lead** — angular separation seen by the shooter/camera.

The UI should communicate shooter-relevant angular/visual relationships while retaining physical values in debug mode. Never make pixels the underlying lead unit.

## 12. Shooter/camera projection

Implement documented 3-D-to-image projection using eye/camera position, orientation and field of view/focal calibration where available. Account for lens distortion only where material and calibratable.

This is the bridge between world physics and what the shooter sees. A given metre separation must project differently at different ranges.

## 13. Gun kinematics

Represent the gun by bore-direction orientation through time, not a free-floating screen dot. Derive angular position, angular velocity, angular acceleration, relative target/gun angle, relative angular velocity and relative angular acceleration.

Add biomechanics (torso/shoulder/translation) only when it materially improves prediction/interpretation and can be supported. Reject impossible discontinuities or instantaneous angular accelerations.

## 14. Shooting-method state machines

Physics determines the required intercept; method determines how the gun arrives there. Build source-attributed method state machines only for methods supported by ShotSight’s evidence register, such as maintained lead, pull-away, swing-through, insertion/intercept and source-specific variants.

Do not flatten coaching disagreement into one universal method. Every implemented method must state applicable presentation conditions and source permission.

Example conceptual states to validate, not blindly copy:

- Pull-away: acquire → gun start → approach/insert → connect → approximately match angular velocity → increase separation → shot at intercept → continue.
- Swing-through: acquire → gun starts behind relative relationship → close → cross → accelerate into positive separation → shot → follow-through.
- Maintained lead: acquire → establish ahead relationship → approximately preserve required angular separation while tracking → shot → follow-through.

The numerical state must agree with the label: “MATCH” requires near-matched angular velocity under an explicit tolerance; “PULL AWAY” requires increasing separation; “CROSS” requires sign change of relative angle; “BREAK” requires valid ballistic interception.

## 15. One master timeline and narrative engine

Use one simulation clock. `state = simulate(t)` supplies target, gun, ballistic and narrative state. Playback speed changes only screen-time mapping, never physical relationships.

Narrative events may include target release, target visible, visual pickup, gun start, insertion, connection, speed match, pass-through, separation development, break window, shot, pellet arrival, target break and follow-through.

Narrative text/labels must be derived from actual event/state transitions. Do not describe a movement the model is not performing.

## 16. Break/miss modelling

A break visual triggers only after a simulated/interpreted hit at pellet arrival. Its visual fragment effect can be stylised, but the event time/location cannot be decorative. For miss demonstrations preserve the actual miss geometry and, where modelled, pattern relationship.

## 17. Engineering/debug view

Every canonical simulator requires a developer mode with play, pause, frame-step, slow motion and timeline scrub. Expose at minimum:

- simulation time;
- target XYZ, range, speed, angular position/velocity;
- gun angular position/velocity/acceleration;
- relative angle/velocity;
- physical and apparent lead/separation;
- shot time, pellet TOF, pellet arrival and intercept state;
- active method state and narrative event;
- source/provenance and uncertainty flags.

The debug display must make wrong geometry obvious rather than hiding it behind polished UI.

## 18. Mathematical/automated QA

Replace “it rendered” tests with scientific tests. Required categories include:

- deterministic replay;
- shared-clock/no-phase-drift tests;
- unit/dimensional checks;
- numerical stability/convergence checks;
- continuity of target and gun state;
- physically plausible speed/acceleration bounds;
- positive and coherent pellet TOF;
- intercept convergence;
- break timing equals pellet-arrival/intersection logic;
- method invariants (maintained-lead tolerance, pull-away increasing separation, swing-through sign crossing, etc.);
- no NaN/Infinity/teleportation;
- projection sanity checks;
- analytic toy-case tests where closed-form results exist;
- property/regression tests across parameter sweeps.

Do not invent tolerances simply to make tests pass. Tie tolerances to numerical resolution, measurement uncertainty, source uncertainty or empirical variation and document them.

## 19. Frame-by-frame visual/narrative QA

For each canonical presentation inspect at least release, visual acquisition, gun start, connection/insertion, method transition, separation development, pre-shot, shot, pellet arrival/break and follow-through.

At every state ask whether target position/speed, apparent movement, gun line, gun speed relationship, method, lead/intercept and narrative are mutually consistent. One important failure means the visual fails.

Do not certify your own first implementation. Perform an adversarial second review specifically looking for reasons an expert shooter would reject it.

## 20. Canonical go/no-go proof set

Do not rebuild the entire Playbook at once. Prove the engine on a small hard set:

1. flat crossing standard target;
2. quartering target with changing range/apparent angular speed;
3. chandelle/looper with phase-dependent geometry;
4. teal or true driven target with strong vertical component;
5. rabbit only after ground-interaction validation is credible.

These are engineering proof cases, not merely demos.

## 21. Canonical Case 1 — flat crosser

Build the flat crosser first. Use documented scenario inputs and several ranges/angles/speeds. Demonstrate the target-only model, pellet TOF/intercept, apparent angular motion and at least two source-supported methods if evidence permits.

The first case must make it possible to answer numerically at every frame: target range/speed/angular speed, bore angle/angular speed, relative angular separation, shot time, pellet arrival, physical intercept and apparent lead.

Compare against simplified analytic calculations where possible before trusting the numerical engine.

## 22. Canonical Case 2 — quarterer

Add changing range and line-of-sight geometry. Verify that apparent angular speed and required apparent lead evolve with geometry rather than remaining a constant screen separation. Validate both left/right mirror behaviour and method applicability.

## 23. Canonical Case 3 — chandelle/looper

Use physically generated curved flight and explicit rise/apex/descent phases. Do not prescribe one break phase as universal. Where a method is selected, the gun’s projected path may legitimately pass under/cross the apparent target arc, but that relationship must come from the selected kinematic strategy and projection, not hand drawing.

## 24. Canonical Case 4 — teal/driven

Keep true driven incoming, passing overhead and outgoing/away phases distinct. For teal, distinguish rise-under-power, apex and descent. Validate vertical/near-vertical projection, angular speed and method state transitions.

## 25. Video-understanding architecture

This physics programme is also the foundation for analysing uploaded coaching/ShotKam video.

Computer vision/deep learning may estimate observations; it does not overrule physics. Build a pipeline that explicitly separates:

- **OBSERVED**: image coordinates, tracks, optical flow, barrel/reticle/camera motion, shot/break frames, visible landmarks;
- **CALIBRATED/DERIVED**: angular positions/velocities, camera orientation, homography/scale where supported;
- **INFERRED**: likely 3-D trajectory/range/method state under a model;
- **UNOBSERVABLE/AMBIGUOUS**: quantities that cannot be recovered from the footage.

Never claim a precise 3-D trajectory from uncalibrated monocular video when depth is not identifiable. Report confidence and alternative fits.

For gun-mounted ShotKam-like footage, exploit the fact that camera motion approximates gun/bore angular movement once camera-to-bore calibration is known; reconstruct target relative angular motion and shot event without pretending that absolute range is known unless calibrated.

## 26. Video analysis methods to research/build

Evaluate appropriate tools such as object detection/segmentation, temporal tracking, optical flow, camera calibration, lens distortion correction, pose/orientation estimation, physics-constrained smoothing/filtering, event detection and model fitting.

Use synthetic data from the simulator to test recovery accuracy. Where ML is used, define training/validation data provenance and failure modes. Do not train on visually plausible but physically wrong synthetic trajectories.

The eventual video system should be capable of statements of the form:

- target geometry/phase and confidence;
- target relative angular velocity through the shot sequence;
- gun relative angular velocity;
- whether gun/target relationship shows approach, match, separation, pass-through or stopping;
- candidate coaching method(s) consistent with observations;
- shot/break timing and apparent lead at the shot;
- what remains unknown from the footage.

## 27. Real-data calibration and expert-reference footage

Define a capture protocol for target and gun ground truth: known trap/target, measured geometry, high-frame-rate viewpoints, field markers, repeated throws, ShotKam/gun sensor where available and expert shooter performing named methods.

Fit/calibrate on one subset and validate on held-out throws/shots. Compare real target ↔ simulated target; real expert gun movement ↔ method model; real break ↔ ballistic intercept.

Do not call a model expert-grade solely because it matches its own synthetic data.

## 28. Expert validation gate

Before replacing Playbook motion broadly, create an expert review pack for the canonical cases with normal speed, slow motion, debug overlays, frame-step and clear parameter/source disclosure.

Invite adversarial review: “Where is this wrong?” rather than “Does this look good?” Log every criticism and map it to physics, projection, method, narrative or rendering.

Do not mass-rollout until canonical cases survive expert review sufficiently to justify it. If expert/physical review is an external dependency that cannot be completed autonomously, stop at a durable `BLOCKED_EXTERNAL / READY_FOR_EXPERT_REVIEW` gate rather than falsely passing it.

## 29. Playbook migration policy

Legacy motion panels are not grandfathered. Replace one presentation at a time only after the new engine’s relevant model/method is validated. Preserve good written content/UI. If no validated visual exists, show an explicit “physics-validated animation pending” hold rather than a misleading motion.

Static schematics must also be checked: if they imply false geometry, revise or hold them.

## 30. Performance and product rendering

Keep physics state separate from rendering. Simulation should output sampled state; UI renders it. Rendering may interpolate between validated samples but must not change the physical relationship.

Support mobile-first performance without degrading truth. If full integration is computationally expensive, precompute deterministic trajectories from parameter sets rather than replacing the model with arbitrary animation.

## 31. Error-correction protocol

Whenever new evidence contradicts an existing parameter/model:

1. identify exactly which previous assumption is invalidated;
2. mark affected simulations/tests/content as stale;
3. trace dependency impact;
4. correct the model/source register;
5. rerun affected tests and canonical scenarios;
6. do not preserve a visually attractive result that no longer has physical support.

Every stage includes a red-team review asking: **What would make this result wrong? What are we assuming? What is not observable? Which numbers were fitted? Which were measured?**

## 32. Stage-gated execution plan

### P0 — Recovery, containment and invalidation
Inspect current repo/head, current motion code/tests and previous checkpoints. Formally invalidate the old motion certification. Decide whether misleading live motion should be suppressed/held during development. Create programme state/checkpoint and a safe development branch if appropriate. **Exit:** durable state identifies exact legacy risks, protected assets and next stage.

### P1 — Evidence/parameter register
Deep-research target specifications, trap/launch data, target aerodynamics, pellet/shot-cloud ballistics, camera projection, gun kinematics and shooting-method definitions. Create parameter/evidence register with unknowns/holds. **Exit:** every planned model input has a provenance class or explicit UNKNOWN/HOLD.

### P2 — Formal Physics & Kinematics Specification v1
Define coordinates, units, state vectors, equations, numerical methods, uncertainty, source contracts and validation plan. Perform independent dimensional/adversarial review. **Exit:** spec passes review; no simulator coding beyond isolated experiments before this gate.

### P3 — Target Physics Engine v1
Implement target-only engine for the standard canonical target with tests and analytic/sanity comparisons. **Exit:** target state is deterministic, stable, provenance-backed and testable; no hand-authored display path.

### P4 — Ballistics & Intercept Engine v1
Implement pellet TOF/deceleration model and intercept solver with unit/analytic tests. **Exit:** physical/apparent lead derives from state/intercept; no hard-coded generic lead.

### P5 — Projection & Gun Kinematics v1
Implement camera/eye projection and bore orientation/angular kinematics. **Exit:** screen motion is derived from world state and calibrated projection; gun motion passes continuity/bounds tests.

### P6 — Method State Machines & Narrative Engine v1
Implement only source-supported methods and event semantics. **Exit:** numerical method invariants and narrative-state tests pass.

### P7 — Canonical Flat-Crosser Integrated Simulator
Combine target, ballistics, projection, gun method and narrative on one clock. Add debug/scrub UI and frame-by-frame test artefacts. **Exit:** all scientific, visual and narrative QA pass for documented scenarios.

### P8 — Canonical Expansion
Add quarterer, chandelle/looper and teal/driven; rabbit only if validated. Work one presentation at a time with its own checkpoint. **Exit:** each case passes the same P7 gate; unsupported behaviours remain held.

### P9 — Video-Understanding Foundation
Implement/calibrate observation pipeline and physics-constrained fitting using synthetic and any available real footage. Explicit observed/derived/inferred/unknown output. **Exit:** quantitative recovery tests exist and failure modes are documented.

### P10 — Real-Data Calibration Framework
Build capture/calibration tools/protocols and, where data already exist, perform held-out calibration/validation. **Exit:** calibration is reproducible; otherwise checkpoint `READY_FOR_REAL_DATA` without inventing results.

### P11 — Expert Validation Pack / Go-No-Go
Create canonical review package with slow motion, scrub, debug overlays and source/parameter disclosure. Incorporate available expert feedback. **Exit:** either `READY_FOR_EXPERT_REVIEW`, `FAILED_NEEDS_REWORK`, or expert-reviewed PASS with evidence. Never self-award expert approval.

### P12 — Controlled Playbook Migration
Replace legacy motion only for validated presentations/methods. Re-run mobile/desktop/product QA. **Exit:** no Playbook motion displayed unless backed by the new engine or an explicit hold.

### P13 — Coaching-Video Interpretation Integration
Connect validated physics/kinematics concepts to uploaded/publicly usable coaching/ShotKam video analysis. Test narrative understanding against known examples. **Exit:** analysis clearly distinguishes observed vs inferred and can explain gun/target relationships without unsupported precision.

### P14 — Final Scientific, Product & Deployment Audit
Run full numerical regression suite, content/evidence audit, mobile/desktop browser QA, hosted parity/deployment QA and stale-legacy scan. **Exit:** repository and deployed state match tested source; all required gates passed or transparently held; no misleading legacy motion remains.

## 33. Stage checkpoint format

At each stage/substage persist a durable checkpoint containing:

- stage and status (`IN_PROGRESS`, `COMPLETE`, `FAILED_NEEDS_REWORK`, `BLOCKED_EXTERNAL`);
- repository commit/branch;
- what was completed;
- evidence/sources added;
- equations/model assumptions added or changed;
- tests run and exact results;
- validation results;
- unresolved unknowns/holds;
- affected downstream components;
- exact next action.

A stage is COMPLETE only when its exit criteria are verified.

## 34. Autonomous continuation rules

After a COMPLETE checkpoint, immediately start the next stage in the same run if tools/time allow. If interrupted, the next hourly run recovers the checkpoint. Never restart P0/P1 just because a run restarts.

Do not repeatedly search the same source or rerun expensive validation without a reason. Maintain durable source registers and test artefacts.

If a stage fails, repair within the same run where possible. If not, persist `FAILED_NEEDS_REWORK` with a precise failure and resume there next run.

If a true external dependency blocks progress, persist `BLOCKED_EXTERNAL`, pause/disable the hourly automation and report the exact dependency. Do not mark the programme COMPLETE.

## 35. Final programme completion criteria

The autonomous programme is COMPLETE only when:

- legacy arbitrary motion is no longer presented as validated instruction;
- the physics/kinematics specification is durable and internally consistent;
- canonical target trajectories are generated by validated/parameterised physics rather than drawn curves;
- pellet TOF/interception produces lead from geometry rather than canned values;
- shooter-view projection is mathematically derived;
- gun movement is method-specific, source-attributed and numerically constrained;
- target, gun, narrative and break events share one clock;
- canonical cases pass mathematical, frame-by-frame and product QA;
- video-understanding architecture distinguishes observation/inference/unknowns and has quantitative tests;
- the Playbook only shows validated engine motion or explicit holds;
- hosted/repository parity passes after final deployment;
- unresolved external validation is not misrepresented as complete.

The highest-level acceptance question is:

**Could an expert shot inspect every moment, understand why the clay and gun are where they are, and find that the physics, technique and narrative agree?**

If not, the relevant gate is not passed.

## 36. Start instruction

Start with **P0 — Recovery, containment and invalidation** immediately. Do not wait for user confirmation. Preserve successful ShotSight work; invalidate only what the new expert review has shown to be unreliable. Persist and verify P0 before chaining into P1.
