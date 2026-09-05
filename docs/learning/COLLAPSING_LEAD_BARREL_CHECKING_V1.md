# Collapsing Lead / Barrel Checking V1

Status: ACTIVE EXPERIMENT DESIGN
Date: 2026-09-05

## Purpose

Preserve a recognised clay-shooting coaching phenomenon as a named diagnostic phenotype without hard-coding its outcome into Ellis.

## DIRECT coaching evidence

ShotKam's own instructional material explicitly describes diminishing/collapsing lead as a pre-trigger reduction in forward relationship associated with the shooter's eyes moving to the barrel, slowing/stopping the gun and commonly missing behind. ShotKam's Station 4 guidance separately warns that consciously measuring lead with the eyes slows gun movement and produces diminishing lead. ShotKam youth-coaching material describes collapsing lead when a shooter becomes barrel-aware and explicitly discusses proprioceptive awareness.

Sources recovered 2026-09-05:
- ShotKam Help Center, `Analyzing ShotKam videos: how to improve` (published 2024-07-16): https://support.shotkam.com/hc/en-us/articles/360046398031-Analyzing-ShotKam-videos-how-to-improve
- ShotKam UK, `Ultimate Guide to Skeet Shooting: Breaking Station 4`: https://uk.shotkam.com/blogs/blog-collections/ultimate-guide-to-skeet-shooting-breaking-station-4
- ShotKam, `8 Tips on How to Improve Your Shooting Scores with ShotKam`: https://shotkam.com/blogs/blog-collections/how-to-improve-using-your-shotkam-videos
- ShotKam youth coaching article, `Elevating Youth Shooters: Techniques for Developing Future Champions`: https://eu.shotkam.com/de/blogs/blog-collections/youth-coaching-with-shotkam

Evidence label for the coaching phenomenon: DIRECT / manufacturer coaching material.

## Important evidence boundary

The deeper causal model remains partly `SHOTSIGHT_HYPOTHESIS`. ShotKam coaching supports the observable/coaching chain, but it does not by itself prove a complete neurological mechanism or establish universal quantitative thresholds for gaze switching, proprioception, gun-speed loss or miss direction.

Do not encode `barrel check => behind miss` as an outcome rule. The oracle must still score the physical shot. The experiment asks whether the phenotype increases collapsing separation, gun deceleration and behind misses under the simulator.

## Named phenotype

`COLLAPSING_LEAD_BARREL_CHECKING_V1`

Candidate observable sequence:

`TARGET_ACQUIRED -> CONNECTED -> SEPARATION_DEVELOPS -> BARREL_CHECK / LEAD_MEASURING -> TARGET_VISUAL_QUALITY_DEGRADES -> GUN_SPEED_DECELERATES -> FORWARD_RELATIONSHIP_COLLAPSES -> TRIGGER`

The first three stages are method state. The latter causal transitions are hypotheses to test, not guaranteed consequences.

## Attention / sensory architecture hypothesis

Ellis should not perceive clay and barrel as two equally precise foveal point targets.

Proposed future sensory split:
- target: foveal/attentional visual evidence, subject to Human Vision V1 acquisition and tracking limits;
- barrel/gun: lower-resolution peripheral visual awareness plus imperfect proprioceptive/internal motor state;
- body/gun system: proprioceptive state rather than repeated visual measurement of exact barrel-to-clay gap.

A `BARREL_CHECK` action reallocates visual attention toward the barrel/relationship. It may reduce current target-tracking quality for that interval. It must never reveal oracle lead, exact miss geometry, exact target XYZ/range or a perfect barrel-target separation measurement.

The user/coaching analogy to preserve for Chiron language is: a person catching a ball does not stare at their hand; target vision guides the task while the body/hand is controlled substantially through learned motor/proprioceptive awareness. Treat this as coaching language, not a literal neuroscience proof.

## Novice measuring phenotype

Preserve the previously discovered stateless pull-away failure as an experimental novice phenotype rather than restoring it to the primary controller.

Primary committed pull-away remains:
`ACQUIRE -> CONNECT -> MATCH_SPEED -> COMMIT_SEPARATION -> TRIGGER -> FOLLOW_THROUGH`.

Novice measuring comparator:
`ACQUIRE -> CONNECT -> START_SEPARATION -> UNCERTAINTY/TRUST_FAILURE -> BARREL_CHECK -> RECONNECT/MEASURE -> POSSIBLE_SPEED_LOSS -> TRIGGER`.

The comparator must operate only from learner-visible information. It may choose to check/reconnect; it may not know whether its lead is objectively correct.

## Required measurements

Record, without oracle leakage into policy:
- target-attention allocation over time;
- barrel-check events and duration;
- target visual confidence/quality before, during and after checking;
- gun angular velocity and pre-trigger velocity change;
- gun acceleration/jerk;
- learner-visible forward relationship history;
- separation-collapse magnitude/rate before trigger;
- trigger timing and method phase;
- break/no-break;
- oracle-only post-hoc miss direction for research evaluation, structurally inaccessible to Ellis;
- confidence/trust state and reason for checking;
- Experience Record self-diagnosis before intervention.

## Experimental ablation

On the SAME hidden non-sealed crosser bank compare:
1. `TARGET_FOCUS_COMMITTED_PULL_AWAY` — no deliberate barrel check after separation commitment;
2. `NOVICE_BARREL_CHECKING` — checking probability increases when uncertainty is high / trust is low;
3. `BARREL_CHECKING_NO_TARGET_ATTENTION_COST` — control to test whether any degradation comes specifically from attention loss rather than the mere action label;
4. later `PROPRIOCEPTION_ON/OFF` once a defensible proprioceptive model exists.

Predeclare outcomes before running. Do not tune a behind-miss result into existence.

Expected hypothesis, not success criterion: barrel checking should increase pre-trigger separation collapse and gun deceleration; if the physical scorer then produces more behind misses, that is convergent evidence. If it does not, preserve the negative result and inspect the model.

## Chiron diagnostic candidate

Internal quantitative label: `COLLAPSING_LEAD / BARREL_CHECKING`.

Human-facing coaching language may be approximately:
`Your lead is collapsing just before the shot. The move starts correctly, then the gun slows as you begin checking the barrel relationship. Keep your visual attention on the clay and trust the move.`

Chiron must express uncertainty when gaze is not directly measured. Without eye tracking, infer barrel checking only probabilistically from the combined target-tracking and gun-motion signature.

## Integration rule

This phenotype is now part of the L3/L9 research programme but MUST NOT delay the immediate existential gate: first re-establish binary reward support for the green Human Vision + committed pull-away controller. Then use the barrel-checking phenotype as a controlled comparator/diagnostic ablation. It must not be used to inject a correct lead or to manufacture a behind miss.