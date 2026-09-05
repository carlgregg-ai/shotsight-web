# ShotSight Product Strategy

**Status:** Controlling product-strategy reference  
**Established:** 5 September 2026

## North-star positioning

> **ShotSight doesn’t just show you where you missed. It learns why you miss — and teaches you how to fix it.**

ShotSight is not primarily a clay-target simulator. Simulation, sensing, physics, animation and shot replay are enabling technologies for a higher-value objective: **understand the shooter well enough to diagnose why performance succeeds or fails, prescribe an appropriate intervention, and verify whether it worked.**

## Product hierarchy

### 1. ShotSight App — Understand shooting

The app is the accessible entry point, remote/in-field coaching companion, and principal brand/trust builder.

**Basic experience**
- High-quality ShotSight-style animations showing how different clay presentations can be approached.
- Visualisation of target line, hold point, visual pickup, gun insertion/pick-up, gun path, connection, lead development, break region and follow-through where appropriate.
- Animations of common mistakes and their consequences.
- Clear shooter-native language rather than unnecessarily scientific coaching language.

The basic app should answer: **“How can I approach this target, and what commonly goes wrong?”**

### 2. ShotSight App + Sense — Understand your shooting

The advanced app applies the ShotSight Knowledge Map and diagnostic tree to an individual shooter. ShotSight Sense provides objective gun-motion evidence where available.

The system should progressively answer: **“Why am I missing this target?”**

Potential measured/derived evidence includes gun-start timing, path, speed, acceleration/deceleration, corrections, movement continuity, timing around the shot, target/gun relationship where observable, and consistency relative to the shooter’s own successful baseline.

The diagnostic system must distinguish:
- **SYMPTOM** — what the shooter reports;
- **OBSERVABLE BEHAVIOUR** — what the sensors/simulation show;
- **MECHANISM** — plausible underlying cause;
- **DIAGNOSTIC** — evidence/test that discriminates competing mechanisms;
- **INTERVENTION** — targeted drill/coaching response;
- **OUTCOME** — what happened;
- **VERIFY** — whether the intervention changed the relevant signature and transferred to better performance.

It must not treat an observation such as “stopping the gun” as a diagnosis by itself.

Sense should be considered a bridge product between the app and the home system: **App → Advanced App → Sense → ShotSight Home.**

### 3. ShotSight Home — Diagnose, train and verify

**Hero product:** home diagnostic shooting/coaching system using a PC, digital projector, ShotSight Sense and ShotSight software/intelligence.

The simulator creates a controlled perceptual environment in which ShotSight can present realistic clay targets, measure the shooter, deliberately discriminate between competing diagnostic hypotheses, prescribe training and retest.

The intended loop is:

**PRESENT → MEASURE → INTERPRET → DIAGNOSE → INTERVENE → RETEST → VERIFY → TRANSFER**

A future diagnostic session should be capable of selecting target presentations because they are diagnostically useful, not merely entertaining. When two mechanisms could explain the same miss, the system should choose an additional presentation/test capable of separating them.

## The core asset: ShotSight Intelligence

The strategically important IP is the accumulated intelligence connecting shooter behaviour to plausible mechanisms and useful interventions:

- ShotSight Knowledge Map and diagnostic tree;
- academic visual/perceptual/visuomotor and motor-learning evidence;
- coaching corpus and coaching-lineage/source-independence analysis;
- Shooter Voice / Experience of Shooting corpus and shooter-language lexicon;
- Ellis human-like virtual-shooter experiments;
- Argus oracle/reference-shooter comparisons;
- Chiron virtual-coach interpretation layer when implemented;
- validated diagnostic signatures;
- intervention/drill library;
- individual-shooter baselines and longitudinal response to training;
- controlled retest and live-clay transfer evidence.

Hardware and simulation fidelity are necessary. **Diagnostic understanding is the intended moat.**

## Ellis, Argus and Chiron

**Ellis** is the human-like learning virtual shooter. Ellis should perceive incomplete/noisy target information, form and update estimates from the live target, select/move/connect/execute using human-like constraints, and be deliberately given specific faults or behavioural perturbations.

Ellis experiments can generate hypotheses about what measurable signatures different mechanisms produce. Several mechanisms may produce the same apparent miss, so Ellis should be used to develop discriminating tests rather than simplistic miss→cause rules.

**Argus** is the oracle/reference shooter and provides a ground-truth/reference capability unavailable to Ellis.

**Chiron** is the reserved name for the future virtual-coach layer: the intelligence that interprets evidence and communicates useful coaching to the shooter.

## What is a good shot?

ShotSight must not equate outcome with quality.

A hit can result from poor, non-repeatable behaviour. A technically strong shot can occasionally miss because of target/environmental variation or probabilistic shot-pattern effects.

Maintain distinct concepts for:
- **Outcome quality** — hit/miss/break characteristics;
- **Movement quality** — gun behaviour;
- **Visual/process quality** — acquisition, tracking, prediction and attention where inferable/measurable;
- **Decision quality** — selected method/regions/timing;
- **Execution quality** — trigger timing and continuation/follow-through;
- **Shot quality** — integrated judgement with explicit uncertainty.

ShotSight should eventually be capable of telling a shooter that a target broke but the movement should not necessarily be reinforced, or that a miss does not by itself prove the underlying process was poor.

## Diagnostic domains

Use the established mechanism domains:

**SEE → TRACK → PREDICT → SELECT → MOVE → CONNECT → EXECUTE**

with **MENTAL/PROCESS** operating across the sequence.

Diagnostics should be probabilistic and evidence-aware. When available evidence cannot distinguish mechanisms, say so and select a discriminating test rather than manufacture certainty.

## Coaching loop

A high-quality ShotSight diagnosis should ideally communicate:

1. What happened.
2. What behaviour was observed.
3. The most plausible mechanism(s).
4. Why ShotSight thinks this.
5. Confidence/uncertainty and alternatives.
6. What the shooter should try.
7. A specific drill/intervention.
8. What ShotSight will measure during the retest.
9. Whether the relevant behaviour actually improved.
10. Whether improvement transfers to live clays where validation is required.

## Competitive strategy

Treat TrueClays and other high-end simulators as important technical/product benchmarks rather than products to clone.

Benchmark at least:
- clay-flight realism;
- latency and visual timing;
- gun/barrel tracking precision;
- shot-string/pattern/ballistic modelling;
- hit/break modelling;
- target/discipline breadth;
- replay/analysis;
- coaching workflow;
- reliability and setup;
- UX;
- price/total cost of ownership.

ShotSight’s goal is to achieve **better or equivalent gun tracking, clay-flight simulation and shot-string modelling at materially lower cost where feasible**, while differentiating at the intelligence layer.

Competitive claims must be verified rather than assumed. Public competitor specifications are benchmarks, not ground truth; reproduce/measure performance independently before claiming superiority.

The strategic distinction is:

**Conventional analysis:** What happened?  
**ShotSight:** Why did it happen, what should the shooter do about it, and did the fix work?

## Commercial funnel

The product family should form a coherent progression rather than disconnected SKUs:

**ShotSight App**  
Understand shooting and establish brand credibility.

↓

**Advanced App**  
Apply the diagnostic model interactively in the field.

↓

**ShotSight Sense**  
Add objective measurement of the individual shooter.

↓

**ShotSight Home**  
Controlled diagnostic simulation, targeted training and verification.

User knowledge should travel through the product family where consent and privacy design permit: difficulties, target types, interventions, Sense history, preferred methods, successful signatures and longitudinal progress should contribute to an evolving shooter model rather than forcing the user to start again at each tier.

## Product-development rule

Every major proposed feature should now be tested against the north star:

> **Does this materially improve ShotSight’s ability to understand what the shooter did, determine why it happened, teach an appropriate correction, verify improvement, or make that capability accessible and trustworthy?**

If not, it requires a strong independent product reason to receive priority.

## Roadmap implication

The existing 24-month roadmap should be revised rather than discarded. Preserve completed work, but reprioritise future work around the diagnostic loop and the product hierarchy above.

Physics, simulation, Sense, animations, Capture/video analysis, Knowledge Map research, Ellis experiments, games and coaching content should be evaluated by their contribution to the diagnostic/coaching system.

The immediate strategic programme is therefore:

1. Establish reliable physical/simulation ground truth.
2. Establish reliable Sense measurement and measurable shot features.
3. Expand the Knowledge Map into discriminating mechanism→signature→diagnostic→intervention→verify branches.
4. Use Ellis/Argus experiments to generate and challenge diagnostic signatures.
5. Build the app’s target-presentation/common-fault animation library as the accessible expression of the same intelligence.
6. Prototype diagnosis from controlled simulated shots before claiming field diagnosis.
7. Validate diagnoses and interventions against expert coaching, controlled tests and live-clay transfer.
8. Integrate these capabilities into ShotSight Home as the hero diagnostic product.

---

## Elevator pitch

> **ShotSight doesn’t just show you where you missed. It learns why you miss — and teaches you how to fix it.**
