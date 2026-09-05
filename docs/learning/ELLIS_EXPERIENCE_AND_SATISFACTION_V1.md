# Ellis Experience Record & Satisfaction Model V1

Status: ACTIVE EXPERIMENT DESIGN
Programme: ShotSight Virtual Shooter — Learn to Shoot
Stage introduced: L3, before genuine hit/miss learning
Evidence class: SHOTSIGHT_HYPOTHESIS unless otherwise stated

## Purpose

Ellis must not merely accumulate actions and binary outcomes. The programme must preserve the **apprenticeship**: what Ellis perceived, believed, intended, tried, experienced, diagnosed and changed, including failed hypotheses and apparently good executions that did not break the clay.

This record is intended to serve two purposes:
1. improve Ellis's own learning without leaking oracle truth;
2. create a future causal training corpus for Chiron, so Chiron can study the difference between what a shooter believed happened, what they changed, and what the hidden referee/oracle says actually occurred.

The governing boundary remains:

**ORACLE KNOWS. SHOOTER PERCEIVES, BELIEVES, PLANS, ACTS, REMEMBERS AND LEARNS.**

## 1. Durable Experience Record

Every meaningful shot/attempt should produce an immutable learner-side Experience Record. The learner-visible record must contain only information available to Ellis before, during or legitimately after the shot.

### A. Before the shot
Record:
- learner-visible presentation descriptor and belief distribution;
- target-family probabilities / ambiguity;
- confidence and uncertainty;
- remembered similar episodes retrieved and why they were considered similar;
- selected method;
- visual pickup plan;
- gun hold plan;
- intended connection/insertion region;
- intended break region;
- intended target-gun relationship or relationship trajectory;
- chosen trigger commitment rule;
- current trust in method/plan;
- exploration vs exploitation state;
- explicit reason for choosing this plan/action.

The reason must be generated from learner-visible state, for example: `recent similar presentations with smooth connection but misses produced higher satisfaction when separation developed slightly earlier`. It must never cite target seed, oracle miss vector, exact range, intercept, pellet time of flight or required lead.

### B. During the shot
Record process traces derived from the learner/gun plant:
- acquisition timing;
- perceived target line and confidence history;
- connection onset and duration;
- target-gun angular relationship history in the shooter-visible tangent/normal frame;
- target apparent angular-rate estimate;
- gun angular velocity / acceleration / jerk;
- speed-match quality as a process measure, not an oracle-correctness measure;
- separation development for pull-away / swing-through;
- trigger commitment time and reason;
- whether the intended break region was reached;
- follow-through duration and continuity;
- any loss of visual continuity / target confidence.

### C. Immediately after the shot
Record two distinct outcomes.

#### Break Quality (BQ)
`BQ` represents what happened to the clay **as Ellis could plausibly observe it**, not oracle-perfect intersection geometry.

Possible evidence channels, introduced only when the simulator/vision model can support them honestly:
- no visible break;
- chip / marginal break;
- ordinary break;
- strong/convincing break;
- visible chip location where resolvable;
- fragment-direction cue where resolvable;
- confidence/ambiguity of the break observation.

For the initial binary condition, BQ may be deliberately reduced to break/no-break. Exact shot-string centre offset must remain hidden.

#### Shot Quality (SQ)
`SQ` represents how well Ellis executed the shot it intended, using learner-visible/process quantities only. It may include:
- quality/confidence of line read;
- connection stability;
- gun/target speed relationship stability;
- smooth, controlled separation development appropriate to the selected method;
- avoidance of unnecessary jerk;
- trigger decisiveness within the intended region;
- continuation/follow-through;
- adherence to the intended method topology.

SQ **must not** reward closeness to oracle lead, exact miss distance, future trajectory or hidden ballistic optimum.

A miss may therefore have high SQ if the movement was coherent and controlled. A lucky hit with poor movement may have low SQ.

### D. Satisfaction Score (SS)

Add a functional, non-conscious `Satisfaction Score` intended to reinforce reproducible good shooting rather than binary outcome alone.

Initial form to test, not assume as truth:

`SS = w_process * SQ + w_outcome * BQ + coherence_bonus - instability_penalty`

Initial weights must be predeclared before outcome experiments and treated as tunable experimental hypotheses. A reasonable first hypothesis is process-weight > outcome-weight (for example 0.60 / 0.40), but this MUST be ablated against binary-only learning and alternative weights rather than accepted because it sounds plausible.

The binary break remains the existential truth signal. Satisfaction is a learning aid and must never redefine a miss as a hit.

Expected behavioural distinction:
- high SQ + high BQ: strongly reinforce the whole experience;
- high SQ + miss: preserve the motor/process pattern, explore one relationship/timing variable rather than changing everything;
- poor SQ + hit: retain the fact that the target broke but do not strongly reinforce the poor process;
- poor SQ + miss: increase targeted exploration / diagnosis.

### E. Self-diagnosis before policy change

After each meaningful miss cluster or informative shot, Ellis should store an explicitly uncertain learner-side account:
- what I think happened;
- what evidence supports that belief;
- confidence in the diagnosis;
- what I will keep unchanged;
- ONE variable I intend to change next;
- why that variable was chosen;
- what outcome would count against the hypothesis.

Example structure only:
`Line confidence high; connection stable; pull-away smooth; outcome miss; execution confidence remains high; solution confidence reduced. Test slightly different separation development while preserving connection and trigger routine.`

Do not encode the direction of change from oracle miss geometry. The direction must arise from prior learner-visible experience, permitted coarse post-shot evidence, Playbook hypothesis, or structured exploration.

### F. Intervention record

Every deliberate change should create an intervention chain:
- parent Experience Record(s);
- hypothesis;
- changed variable;
- fixed variables;
- predeclared comparison window;
- subsequent outcomes;
- retain / weaken / reject decision;
- reason for that decision.

Preserve failed interventions and contradictions.

## 2. Pull-away as primary learning method hypothesis

Practitioner guidance added 2026-09-05 is recorded as a `SHOTSIGHT_HYPOTHESIS` to test, not a universal coaching law:
- pull-away should become the primary/default learner for the next learning experiment;
- maintained lead remains an important comparator and may be useful where target visibility is interrupted, but should not be treated as the primary teaching/learning route;
- pull-away offers a particularly interpretable learning sequence: acquire/read line -> connect -> match speed -> develop separation -> trigger -> follow through;
- shot-to-shot corrections can be made by preserving connection/process while changing separation development based on accumulated imperfect evidence.

The same hidden target banks must still be used for method comparisons.

## 3. Human-plausible post-shot directional evidence

Later feedback conditions may expose imperfect post-shot evidence without exposing oracle truth.

Potential observations:
- coarse front/rear/high/low chip location when visibly resolvable;
- fragment travel direction as a noisy cue to shot-string relationship;
- coach/video/Sense-derived coarse likely behind/in-front/high/low label;
- no usable directional evidence.

These cues must be generated after the shot, carry uncertainty, and may occasionally be ambiguous or incorrect according to a documented observation model. Ellis must learn across repeated evidence rather than trust one cue as perfect truth.

Argus may retain exact hidden geometry for scientific evaluation and later Chiron research, but Ellis's policy/memory may store only the degraded learner-visible observation.

## 4. Chiron research corpus

Maintain a separate research-side linkage that can later compare:

`learner perception -> belief -> intention -> movement -> learner-visible outcome -> self-diagnosis -> intervention -> later outcome`

against hidden oracle/referee truth **offline and outside Ellis's policy boundary**.

This is intended to let Chiron study questions such as:
- when did Ellis correctly diagnose a miss from imperfect evidence?;
- when did a seemingly sensible diagnosis fail?;
- which one-variable interventions reliably improved transfer?;
- when did a lead-like symptom actually arise from gun deceleration, late connection, poor line read or loss of follow-through?;
- which patterns generalise across targets and which are presentation-specific?

The oracle-side fields must be structurally inaccessible to Ellis's retrieval, policy update, reward shaping and self-diagnosis.

## 5. Required ablations

Before retaining Satisfaction as useful, compare at minimum:
1. binary hit/miss only;
2. binary + SQ process score;
3. binary + BQ/SQ-derived Satisfaction;
4. Satisfaction with memory vs no-memory;
5. Satisfaction with self-diagnosis/intervention chain vs undirected exploration.

Keep Satisfaction only if it improves one or more of:
- held-out break rate;
- sample efficiency;
- movement smoothness / method validity without sacrificing hits;
- stability after misses;
- transfer;
- useful self-correction;
- confidence calibration.

If it merely increases a shaped score while real break rate stalls or falls, reject or redesign it.

## 6. First-break preservation

The first verified shooter-visible engineering-proxy breaks already observed at L3 must be preserved as historical milestones, but their successful action identities must NOT be used to initialise or steer the learner.

For future first learned success, preserve the complete Experience Record plus the chain of preceding related attempts and interventions that led to it. This is a scientific record of the transition from inability to successful learned behaviour.

## 7. Anti-cheat additions

Add automated tests ensuring learner Experience Records, Satisfaction, self-diagnosis and intervention memory contain none of:
- target seed;
- exact target XYZ / velocity;
- exact future path;
- true hidden range where not observable;
- oracle miss vector / miss distance;
- intercept;
- pellet time of flight;
- required metric/angular lead supplied by oracle;
- oracle optimal action;
- direct correction derived from hidden geometry.

Any leakage invalidates the learning run.

## 8. Immediate L3 execution change

Before scaling learning:
1. implement the Experience Record schema;
2. preserve the existing binary-only condition as the first baseline;
3. make pull-away the primary learner experiment while retaining maintained-lead and phase/constant representations as controls/ablations;
4. implement learner-visible SQ from process traces only;
5. implement BQ initially at the information level genuinely supported by the current scorer/observation model;
6. implement Satisfaction behind an experimental flag;
7. implement self-diagnosis + one-variable intervention records;
8. run anti-cheat tests over every persisted learner-side field;
9. compare Satisfaction ON/OFF and memory ON/OFF before any claim that Satisfaction improves learning;
10. preserve complete experience chains for first learned successes and diagnostic failures.

No `VIRTUAL_SHOOTER_CROSSER_LEARNING_PROOF` claim is permitted from shaped scores alone. Binary held-out break improvement remains mandatory.