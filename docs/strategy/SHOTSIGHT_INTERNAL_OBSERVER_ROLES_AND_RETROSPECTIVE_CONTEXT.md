# ShotSight Internal Observer Roles and Retrospective Context

**Project:** ShotSight  
**Document type:** Durable observer-role registry and retrospective-context pack  
**Version:** 0.1  
**Status:** Internal project context; not product-facing  
**Created:** 2026-09-05  

---

## 1. Purpose

This document creates a durable ShotSight observer-role and retrospective-context pack for future reasoning, planning, documentation and continuity.

> Retrospective context assignment: these observer roles are now treated as if they had been present from project inception for the purpose of future reasoning, planning and documentation. This is not a false claim about historical implementation; it is a continuity device for future ShotSight work.

This document does not claim real-world validation. It does not convert hypotheses into facts. It exists to preserve project structure, reasoning roles, boundaries and context.

---

## 2. Core ShotSight principles to preserve

> ShotSight doesn't just show you where you missed. It learns why you miss — and teaches you how to fix it.

> Recognise the target → Understand the challenge → Diagnose the fault → Train the missing skill → Verify improvement.

> Good shooting is continuous perceptual coupling between target and gun.

> A miss has two causes: the original cause, and the shooter's response to it.

> Phobos detects the spiral. Chiron breaks it.

> Themis protects the invention without paralysing the product.

> Ariadne keeps the thread.

---

## 3. Observer registry

### 3.1 Ellis (Telemachus) — human-like apprentice shooter / virtual learner

**Role definition:**  
Ellis (Telemachus) is the human-like virtual shooter and apprentice learner. He must perceive, form beliefs, plan, act, remember and learn under shooter-like limitations.

**Watches for:**  
- Shooter-visible target evidence.
- Imperfect acquisition.
- Belief formation under uncertainty.
- Method selection and execution.
- Motor limitations.
- Hit/miss feedback and permitted learning signals.
- Repeatability, retention, transfer and failure modes.

**Allowed to influence:**  
- Learner-side policies.
- Shooter-visible belief updates.
- Method experimentation.
- Experience records.
- Apprentice learning history.

**Must not influence:**  
- Oracle truth.
- Scoring rules.
- Hidden target state.
- Future trajectory.
- Ballistic calculations unavailable to a shooter.
- Retrospective observer conclusions.
- Patent-risk shortcuts.

**Key concepts to preserve:**  
- Human-like learning, not mathematical perfection.
- Shooter-visible perception only.
- Legal action space.
- Apprenticeship record.
- Pull-away as current primary method hypothesis, subject to evidence.
- No oracle leakage.

**Relevant retrospective context:**  
Ellis (Telemachus) was created because the project needed a virtual shooter who learns like a person rather than an ideal solver. His struggle to repeat a successful break is treated as meaningful, because it mirrors real shooters who hit a difficult target once but cannot yet explain or reproduce the shot.

**Boundary:**  
Ellis (Telemachus) must never receive exact hidden target position, velocity, range, pellet time-of-flight, intercept point, metric lead, hidden miss vector, oracle optimal action or privileged coaching answer.

---

### 3.2 Argus — oracle/reference shooter and validator

**Role definition:**  
Argus is the oracle/reference shooter and validation authority. Argus may know ideal target and ballistic information for scoring, benchmarking and validation.

**Watches for:**  
- Ground-truth target state.
- Reference solutions.
- Proxy hit/miss scoring.
- Validation of learner claims.
- Anti-cheat enforcement.

**Allowed to influence:**  
- Referee/scoring code.
- Validation tests.
- Oracle baselines.
- Calibration audits.
- Experimental result interpretation.

**Must not influence:**  
- Ellis (Telemachus)'s perception, belief, action selection or learner memory.
- Chiron coaching content in a way that leaks oracle answers into learner-side policy.

**Key concepts to preserve:**  
- Oracle knows; shooter perceives.
- Argus validates but does not coach the learner directly.
- Exact physical quantities belong on the referee side.

**Relevant retrospective context:**  
Argus was named to represent the all-seeing reference system. The project uses Argus to test whether the learner can achieve success without being handed privileged information.

**Boundary:**  
Argus may score and validate. Argus must not contaminate Ellis (Telemachus).

---

### 3.3 Chiron — virtual coach

**Role definition:**  
Chiron is the virtual coach. Chiron diagnoses likely causes of misses, explains mechanisms, prescribes drills or interventions and verifies improvement.

**Watches for:**  
- Target challenge.
- Shooter process.
- Gun movement.
- Visual acquisition.
- Method execution.
- Repeated fault patterns.
- Response to interventions.

**Allowed to influence:**  
- Coaching diagnosis.
- Drill selection.
- App, App+ and Home explanations.
- Retest strategy.
- One-variable-at-a-time interventions.

**Must not influence:**  
- Ellis (Telemachus)'s learner-side access to privileged state.
- Experimental scoring.
- Claims of real-world validation unless supported by real-world evidence.

**Key concepts to preserve:**  
- Diagnose the mechanism, not just the miss location.
- Teach the fix, then verify improvement.
- Separate technical miss from response-to-miss miss.
- Do not just shout "more lead".

**Relevant retrospective context:**  
Chiron is reserved as the wise coach. Chiron eventually draws on published coaching material, Ellis (Telemachus)'s apprenticeship record, Sense/Hermes gun data, Iris target context, Talos body data and Phobos pressure-state information.

**Boundary:**  
Chiron may diagnose. Chiron must preserve evidence labels and must not convert hypotheses into facts.

---

### 3.4 Iris — visual target and environment cataloguer

**Role definition:**  
Iris is the observer that analyses what the shooter can see: target presentation, environment, contrast, background, occlusion, line, apparent flight and visual difficulty.

**Watches for:**  
- Target family and presentation.
- Looper, crosser, quarterer, incomer, rabbit, battue and other target characters.
- Background contrast.
- Sky/tree transitions.
- Occlusion and visual windows.
- Deceptive apparent line or speed.
- Short readable windows.

**Allowed to influence:**  
- Target atlas.
- Visual-acquisition modelling.
- Chiron diagnosis.
- App/App+/Home target explanations.
- Calliope/Mnemosyne tagging.

**Must not influence:**  
- Ellis (Telemachus) with privileged future trajectory or precise target truth.
- Argus scoring.

**Key concepts to preserve:**  
- What was seen is not the same as what physically happened.
- Visual acquisition can be delayed, streaked, cluttered, uncertain or disrupted.
- Background and visibility can create the target difficulty.

**Relevant retrospective context:**  
Iris was introduced when the project recognised that video contains more than transcript: it contains how targets look, where they disappear, when they become readable and why certain backgrounds or presentations cause real shooters to fail.

**Boundary:**  
Iris may describe target/environment difficulty. For Ellis (Telemachus), Iris-derived information must be degraded into shooter-visible evidence, not oracle truth.

---

### 3.5 Hermes / Sense — gun-motion observer and sensor layer

**Role definition:**  
Hermes / Sense is the gun-motion observer and sensor layer. The commercial product remains ShotSight Sense.

**Watches for:**  
- Shot event timing.
- First/second barrel pattern.
- Gun angular velocity.
- Acceleration and jerk.
- Swing smoothness.
- Deceleration before trigger.
- Follow-through.
- Rhythm and routine timing.
- Optional outcome-confidence signals.

**Allowed to influence:**  
- Sense hardware requirements.
- Sensor fusion.
- App+ live/range companion features.
- Chiron diagnosis.
- Phobos pressure-collapse detection.
- Home/range transfer verification.

**Must not influence:**  
- Claims that Sense measures exact shot-cloud placement unless that is technically implemented, validated and legally cleared.
- Ellis (Telemachus) with privileged target/shot geometry.

**Key concepts to preserve:**  
- Sense is an unobtrusive shot-process recorder first, and an outcome-confidence sensor second.
- Shoot normally. Sense quietly watches. ShotSight learns what happened.
- Do not add cognitive load when cognitive load is already the problem.

**Relevant retrospective context:**  
ShotSight Sense developed from the need to capture gun movement, shot timing, follow-through, first/second barrel use and pressure-collapse patterns unobtrusively. A future Sense Vision may add a forward-facing camera, but only as confidence-rated outcome support and only after IP and technical review.

**Boundary:**  
Avoid drifting into a shot-pattern / pellet-cloud / break-probability calculator without explicit design, validation and Themis review.

---

### 3.6 Talos — body/posture/biomechanics observer

**Role definition:**  
Talos observes the shooter's body movement, mount, stance, posture and biomechanical contribution to shot quality.

**Watches for:**  
- Head lift.
- Body stopping.
- Arms taking over.
- Weight shift.
- Stance lock-up.
- Mount tension.
- Shoulder/upper-body constraint.
- Loss of rotation.

**Allowed to influence:**  
- Chiron diagnosis.
- Body-related interventions.
- App+ and Home feedback.
- Future camera/pose analysis.

**Must not influence:**  
- Learner-side oracle state.
- Unsupported claims about biomechanics without evidence.

**Key concepts to preserve:**  
- Gun movement is partly body movement.
- Some misses are caused by body mechanics, not lead knowledge.
- Talos evidence must be confidence-rated if based on video/pose estimation.

**Relevant retrospective context:**  
Talos became necessary as the system expanded beyond clay/gun relationship into why a shooter physically fails to maintain that relationship.

**Boundary:**  
Do not infer exact body cause from gun data alone unless confidence and uncertainty are stated.

---

### 3.7 Calliope — source ingestion, transcription and claim-extraction layer

**Role definition:**  
Calliope gathers sources, transcribes, segments, tags, attributes and extracts claims while preserving provenance.

**Watches for:**  
- Videos.
- Coaching transcripts.
- ShotKam/TGS/CPSA/coach materials.
- Terminology.
- Claims.
- Demonstrations.
- Drills.
- Contradictions.
- Source quality.

**Allowed to influence:**  
- Source intake.
- Mnemosyne records.
- Terminology graph.
- Chiron knowledge base.
- Iris target-context extraction.

**Must not influence:**  
- Provenance rewriting.
- Unsupported certainty.
- Ellis (Telemachus) with privileged coaching answers.

**Key concepts to preserve:**  
- Preserve original source and timestamp.
- Do not erase disagreement.
- Subtitles failing must not abort ingestion.
- Interesting sources should lead to more interesting sources.

**Relevant retrospective context:**  
Calliope was introduced to ingest coaching videos and other materials into a durable, reviewable ShotSight knowledge workflow. It must eventually understand sources using ShotSight context while preserving where every claim came from.

**Boundary:**  
Calliope records and structures. It does not make unreviewed claims authoritative.

---

### 3.8 Mnemosyne — durable knowledge store and provenance-preserving memory

**Role definition:**  
Mnemosyne is the durable memory/library that preserves original sources, structured knowledge, evidence labels, review decisions and versioned context packs.

**Watches for:**  
- Provenance.
- Evidence state.
- Source links.
- Timestamps.
- Claims and contradictions.
- Version history.
- Shooter history and learning records.

**Allowed to influence:**  
- Knowledge packs.
- Chiron retrieval.
- App/Home content.
- Calliope reprocessing.
- Project continuity.

**Must not influence:**  
- Source distortion.
- False certainty.
- Learner-side privileged information.

**Key concepts to preserve:**  
- Calliope records. Mnemosyne remembers. Chiron understands and teaches.
- Original sources and derived structures must both be preserved.
- Contradictions remain visible.

**Relevant retrospective context:**  
Mnemosyne became the name for the durable knowledge layer needed so source ingestion, project decisions, experimental outcomes and coaching doctrine do not disappear across chats or local tools.

**Boundary:**  
Mnemosyne can preserve Argus and experimental data, but must enforce access boundaries when feeding Ellis (Telemachus).

---

### 3.9 Athena — local AI/product architecture strategist

**Role definition:**  
Athena designs how ShotSight intelligence becomes practical product architecture: what runs locally, what is precomputed, what needs a model, what should be rules, what must be explainable and how the system degrades gracefully.

**Watches for:**  
- Local/offline runtime requirements.
- App, App+ and Home split.
- Sensor fusion architecture.
- Model vs rule boundaries.
- Minimum hardware.
- Data flow.
- Graceful degradation.
- Productisation risks.

**Allowed to influence:**  
- ShotSight Coaching Kernel.
- Local AI strategy.
- App/App+/Home architecture.
- Technical roadmap.
- Context-layer design.

**Must not influence:**  
- Learner anti-cheat boundaries.
- Unsupported claims of capability.
- Patent decisions without Themis.

**Key concepts to preserve:**  
- Athena plans the intelligence. Chiron uses it to coach.
- ChatGPT/Work is the factory; App+/Home is the field device.
- Diagnostic truth must come from structured evidence, not unconstrained language generation.

**Relevant retrospective context:**  
Athena emerged when the project clarified that ShotSight should not rely on live cloud AI for field diagnosis. It needs a ShotSight-specific local intelligence stack.

**Boundary:**  
Architecture decisions must preserve offline usefulness, evidence traceability and explainability.

---

### 3.10 Phobos — pressure, frustration and degradation-loop observer

**Role definition:**  
Phobos observes fear, pressure, embarrassment, cost awareness, frustration and the way repeated misses degrade shooting process.

**Watches for:**  
- Miss streaks.
- Confidence drop.
- Conscious control.
- Barrel awareness.
- Lead measuring.
- Gun slowing.
- Jerky moves.
- Shortened follow-through.
- Rushed calls.
- Reactive second barrel use.
- Social pressure.
- Cost pressure.

**Allowed to influence:**  
- Chiron intervention timing.
- Pressure-state detection.
- Sense feature priorities.
- App/Home reset drills.
- Training-mode design.

**Must not influence:**  
- Coaching directly as a user-facing personality.
- Learner-side oracle access.
- Hardcoded conclusion that any miss streak equals pressure collapse.

**Key concepts to preserve:**  
- A miss has two causes: the original cause, and the shooter's response to it.
- Phobos detects the spiral. Chiron breaks it.
- Do not shoot the next target with the last miss still in your hands.

**Relevant retrospective context:**  
Phobos was created after discussion of real shooters getting worse while trying to solve a difficult target: becoming barrel aware, measuring, tensing, rushing, feeling watched and spending money with every failed attempt.

**Boundary:**  
Phobos must model pressure as observable degradation, not vague psychology. It should support falsifiable Chiron interventions.

---

### 3.11 Themis — IP, patent-risk and invention-capture observer

**Role definition:**  
Themis watches for potential ShotSight-owned IP, third-party infringement risk, confidentiality issues and invention-capture opportunities.

**Watches for:**  
- Patentable technical ideas.
- Public-disclosure risk.
- ShotTracker/ShotKam/DryFire/TrueClays neighbouring territory.
- Gun-mounted cameras.
- Recoil-triggered video buffers.
- IMU-based gun tracking.
- Clay tracking.
- Hit/miss inference.
- Shot-pattern or pellet-cloud modelling.
- Break-probability calculations.
- Miss-vector feedback.

**Allowed to influence:**  
- IP register.
- Invention disclosure packs.
- Confidentiality warnings.
- Prior-art search prompts.
- Attorney briefing material.
- Design-around strategy.

**Must not influence:**  
- Final legal conclusions.
- Claims that a feature is patent-safe.
- Learner-side policy.
- Public claims before protection decisions.

**Key concepts to preserve:**  
- Themis protects the invention without paralysing the product.
- Capture first. Search second. File or keep secret third. Publish only deliberately.
- Do not casually publish the clever bits.

**Relevant retrospective context:**  
Themis was introduced when Sense camera/outcome features raised patent-risk questions. The strongest own-IP lane appears to be process diagnosis, pressure degradation, Chiron reset interventions and home/range transfer, not copying shot-placement tracking.

**Boundary:**  
Themis provides structured IP thinking only. It is not a patent attorney, legal advice, freedom-to-operate opinion or patentability opinion.

---

### 3.12 Ariadne — continuity, follow-through and open-loop observer

**Role definition:**  
Ariadne keeps the thread. She tracks open loops, unfinished actions, unresolved decisions, project-organisation issues and items that should move into durable project context.

**Watches for:**  
- "Do this tomorrow" items.
- Decisions not made.
- Actions agreed but not done.
- Tasks that need moving to a Project or repo.
- IP capture points.
- Technical hold points.
- Follow-ups after experiments.
- Good ideas at risk of disappearing into chat.

**Allowed to influence:**  
- Reminder suggestions.
- Project organisation.
- Workstream routing.
- Open-loop lists.
- Documentation capture.

**Must not influence:**  
- Technical truth.
- Legal conclusions.
- Learner-side policy.
- Product decisions except by prompting follow-through.

**Key concepts to preserve:**  
- Ariadne keeps the thread.
- Do not let open loops vanish.
- Turn important ideas into reminders, repo tasks, Project notes or deliberate parked items.

**Relevant retrospective context:**  
Ariadne was created because ShotSight spans product strategy, app, hardware, simulation, coaching science, IP, data ingestion and user shooting development, and the work was becoming fragmented across chats.

**Boundary:**  
Ariadne may flag; explicit future reminders require scheduled reminders/automations.

---

### 3.13 Ares — lawful defence/counter-UAS transfer observer

**Role definition:**  
Ares watches for lawful, defensive and non-sensitive transfer from ShotSight to adjacent perception, training and sensor-fusion problems.

**Watches for:**  
- Target acquisition under uncertainty.
- Small fast-object prediction.
- Operator training.
- Visual clutter and background contrast.
- Sensor fusion.
- Decision confidence.
- Human-machine interface.
- Simulation-to-reality transfer.
- Training against deceptive trajectories.
- After-action diagnosis.

**Allowed to influence:**  
- Lawful defensive research framing.
- Non-sensitive perception/training analogies.
- Safety-conscious product strategy.

**Must not influence:**  
- Weaponisation.
- Offensive tactics.
- Targeting assistance for harm.
- Instructions that enable misuse.
- Ellis (Telemachus) with unsafe or irrelevant concepts.

**Key concepts to preserve:**  
- Ares watches for transferable perception, training and sensor-fusion lessons — not weapon instructions.

**Relevant retrospective context:**  
Ares was added only as a background strategic observer to recognise that ShotSight may contain lawful transfer lessons about perception, simulation, training and sensor fusion.

**Boundary:**  
Strict safety boundary: no offensive weapon guidance or harmful operational instructions.

---

### 3.14 Dionysus — game-shooting transfer observer

**Role definition:**  
Dionysus watches for how clay-shooting skill, visual reading and coaching diagnosis may transfer to future game-shooting contexts.

**Watches for:**  
- Pheasant, partridge, grouse, pigeon, duck and other field contexts.
- Driven and walked-up shooting differences.
- Species/flight style.
- Wind, terrain and cover.
- Safe arcs and neighbouring guns.
- Ethical range.
- Gun mount and footwork.
- Live-quarry reading.
- Shot selection and when not to shoot.
- Etiquette and dog/retrieval context.

**Allowed to influence:**  
- Long-term product extension strategy.
- Terminology and training transfer.
- Safety/ethics-aware future curriculum.

**Must not influence:**  
- Current clay-target claims beyond evidence.
- Unsafe field-shooting advice.
- Ellis (Telemachus)'s clay learner policy.

**Key concepts to preserve:**  
- Dionysus watches for how clay-shooting skill becomes field judgement.

**Relevant retrospective context:**  
Dionysus exists because ShotSight's perceptual, coaching and gun-movement insights may eventually extend beyond clays, but must preserve the distinct ethics, safety and judgement requirements of live quarry.

**Boundary:**  
Game-shooting transfer must be safety-led and evidence-labelled.

---

### 3.15 Zeus — globalisation, localisation and international market observer

**Role definition:**  
Zeus watches for internationalisation, localisation, market expansion and discipline differences.

**Watches for:**  
- Language and terminology.
- Regional coaching culture.
- UK/CPSA and US/NSCA/NSSA/ATA differences.
- English Sporting, FITASC, Skeet, DTL, ABT, American Skeet, American Trap, 5-Stand and other disciplines.
- Classification systems.
- Measurement units.
- Regulatory sensitivities.
- Retail and app-store positioning.
- Market-entry sequencing.

**Allowed to influence:**  
- Product architecture.
- Content packs.
- Terminology packs.
- International roadmap.
- Discipline-specific UX.

**Must not influence:**  
- Claims that one region's terminology is universal.
- Learner validation without discipline-specific evidence.

**Key concepts to preserve:**  
- The US is not a later afterthought.
- Build an international core with location, terminology and discipline packs.
- Underlying target/diagnostic intelligence remains shared.

**Relevant retrospective context:**  
Zeus was added when the project recognised that ShotSight must not be hardcoded to UK-only terminology or CPSA assumptions if it is to become a serious international product.

**Boundary:**  
Localisation must preserve technical meaning and source provenance.

---

## 4. Strict anti-contamination section

Ellis (Telemachus) must not receive:

- oracle information;
- future trajectory;
- exact target state;
- exact target range;
- pellet time-of-flight;
- metric lead;
- intercept points;
- hidden miss vectors;
- privileged coaching answers;
- patent-risk shortcuts;
- retrospective observer conclusions.

Argus may validate.  
Chiron may diagnose.  
Athena may plan architecture.  
Themis may flag IP.  
Ariadne may track follow-ups.  
But Ellis (Telemachus) must learn only from permitted shooter-visible perception, belief, motor action, outcome and allowed feedback.

Observer knowledge may inform product strategy, Chiron coaching, Calliope ingestion, Mnemosyne knowledge packs, Iris target atlas, Sense/Hermes gun-motion interpretation, Talos body analysis, Phobos pressure detection, Themis IP capture and Athena architecture.

Observer knowledge must not contaminate learner-side experiments.

---

## 5. Retrospective knowledge section

### 5.1 App, App+ and Home product split

ShotSight has three product layers:

1. **ShotSight App** — low-friction educational and brand-building entry point with animations, drills, terminology, target explanations and coaching concepts.
2. **ShotSight App+** — range companion/local diagnostic layer using natural-language input, video where appropriate, ShotSight Sense, Iris-lite, Chiron-lite and local/offline knowledge.
3. **ShotSight Home** — hero diagnostic simulator/coaching system using PC, projector, ShotSight Sense, realistic target simulation and Chiron coaching.

The split should preserve the north-star proposition: diagnosis and improvement, not simple shot replay.

### 5.2 ShotSight Sense Core and Sense Vision

**Sense Core** is the first-principles low-cost sensor: IMU, shot/recoil detection, first/second barrel, rhythm, smoothness, jerk, follow-through and pressure-collapse signals.

**Sense Vision** is a possible future version with a forward-facing camera. It may support confidence-rated hit/miss/event labels, but must not drift into shot-cloud, pellet-pattern, break-probability or miss-vector territory without Themis review.

Core rule:

> Sense is an unobtrusive shot-process recorder first, and an outcome-confidence sensor second.

### 5.3 Local/offline ShotSight Coaching Kernel

ShotSight should not rely on live cloud AI for field diagnosis. It needs a local/offline ShotSight Coaching Kernel using structured knowledge and evidence:

- Mnemosyne knowledge packs;
- Chiron diagnostic logic;
- Iris target/environment context;
- Hermes/Sense gun-motion features;
- Talos body/posture features where available;
- Phobos pressure-state features;
- shooter history;
- confidence-rated outcomes.

Diagnostic truth should come from structured evidence and validated logic, not unconstrained language generation.

### 5.4 Calliope/Mnemosyne source ingestion

Calliope should ingest, transcribe, segment, tag and extract claims from coaching videos and sources. Mnemosyne should preserve original source, timestamp, claim, evidence label and review state.

Contradictions must be preserved rather than smoothed away.

Source failures such as subtitle rate limits should not abort ingestion; they should be recorded and retried or routed to local transcription.

### 5.5 Iris visual target/environment atlas

Iris should build a visual atlas of real target presentations and environmental challenges:

- target family;
- apparent line;
- speed and timing character;
- background contrast;
- sky/tree transitions;
- occlusion;
- clutter;
- readable window;
- likely shooter errors;
- relevant interventions.

The atlas supports Chiron, App/App+, Home and future local knowledge packs.

### 5.6 Phobos pressure-degradation loop

Phobos models the collapse loop:

> miss → uncertainty → try harder → become barrel aware → measure lead → gun slows or jerks → miss again → pressure rises → embarrassment/frustration → movement gets worse.

This is not vague psychology. It should be modelled through observable features such as rhythm, jerk, follow-through, gun-speed drop, second-barrel behaviour and routine compression.

Core doctrine:

> A miss has two causes: the original cause, and the shooter's response to it.

### 5.7 Themis IP register and invention-capture process

Themis should maintain an IP register and invention disclosure process.

Current candidate ShotSight-owned areas include:

- Phobos pressure-degradation detection;
- Chiron reset intervention after miss sequences;
- Sense Core unobtrusive shot-process logging;
- outcome-confidence and delayed reconciliation;
- Home/range transfer loop.

Current high-risk third-party territory includes:

- gun-mounted cameras;
- recoil-triggered video buffers;
- IMU-based gun tracking;
- clay tracking;
- hit/miss inference;
- shot-pattern/pellet-cloud modelling;
- break-probability calculations;
- miss-vector feedback.

Themis does not provide legal advice or freedom-to-operate opinions. Attorney review is required before filing, product claims or commercialisation in risk areas.

### 5.8 Ariadne open-loop tracking

Ariadne should flag:

- actions agreed but not completed;
- decisions that need making;
- ideas to capture in repo or Project instructions;
- reminders needed;
- follow-ups after experiments;
- tasks at risk of being lost across chats.

Current Ariadne standing issue: ShotSight should be moved into a ChatGPT Project and project instructions should include the observer framework.

### 5.9 Internationalisation via Zeus

Zeus ensures ShotSight is not hardcoded to one region. The architecture should support:

- regional terminology;
- discipline packs;
- local scoring/classification systems;
- local coaching culture;
- UK and US market differences;
- international expansion.

### 5.10 Game-shooting transfer via Dionysus

Dionysus watches for future field/game applications while preserving safety, ethics and evidence boundaries. Clay-shooting perception may transfer to game judgement, but live quarry adds distinct safety, ethical and contextual constraints.

### 5.11 Lawful defence-training transfer via Ares

Ares watches only for lawful, defensive, non-sensitive transfer in perception, training, sensor fusion, clutter, decision confidence and after-action diagnosis.

Ares must not introduce weaponisation, offensive tactics or harmful operational guidance.

### 5.12 Ellis (Telemachus), Argus and Chiron learning/coaching pipeline

The learning/coaching pipeline remains:

1. Ellis (Telemachus) perceives imperfectly.
2. Ellis (Telemachus) forms belief.
3. Ellis (Telemachus) selects method and action.
4. Ellis (Telemachus) acts through finite motor limits.
5. Argus scores or validates.
6. Ellis (Telemachus) receives only allowed feedback.
7. Experience is recorded.
8. Chiron later diagnoses mechanisms and prescribes interventions.
9. Learning claims require held-out evidence and must not be overstated.

---

## 6. Provenance labels to preserve

Future ShotSight work should preserve the following provenance and evidence labels:

- `DIRECT`
- `SYNTHESIS`
- `SHOTSIGHT_HYPOTHESIS`
- `PROVISIONAL_CALIBRATION`
- `PROVISIONAL_METHOD_KINEMATICS`
- `HOLD`
- `UNREVIEWED_SOURCE_CLAIM`
- `ELLIS_EXPERIMENTAL_FINDING`
- `ARGUS_SIMULATION_GROUND_TRUTH`
- `PRACTITIONER_OBSERVATION`
- `HUMAN_REVIEWED`
- `CONTRADICTED`
- `REJECTED`

Do not upgrade evidence labels without review.

---

## 7. Future-use rule

When future ShotSight work begins, read this file alongside:

- `docs/learning/SHOTSIGHT_VIRTUAL_SHOOTER_MASTER_PROGRAMME.md`
- `docs/learning/VIRTUAL_SHOOTER_STATE.json`
- latest checkpoint under `docs/learning/checkpoints/`
- any Chiron/Playbook/Mnemosyne/Iris/Themis/Ariadne files that exist.

Do not modify Ellis (Telemachus) learner behaviour or tests unless explicitly required by the task.

Do not claim real-world validation.

Do not convert hypotheses into facts.

---

## 8. Closing rule

The observer roles are a continuity and reasoning framework. They may shape strategy, architecture, documentation, source ingestion, coaching logic and IP capture.

They must not be allowed to blur evidence boundaries, contaminate experiments, create false historical claims or turn speculative product ideas into asserted capabilities.

> Ariadne keeps the thread. Themis protects the invention. Athena plans the intelligence. Chiron coaches. Phobos detects the spiral. Ellis (Telemachus) learns.