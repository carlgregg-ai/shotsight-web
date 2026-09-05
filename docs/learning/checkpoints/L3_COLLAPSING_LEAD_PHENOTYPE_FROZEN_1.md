# L3 Collapsing Lead / Barrel Checking Phenotype Frozen 1

Date: 2026-09-05
Status: DESIGN FROZEN; EXPERIMENT NOT YET RUN

## Result

The ShotSight Virtual Shooter programme now preserves `COLLAPSING_LEAD_BARREL_CHECKING_V1` as a named novice diagnostic phenotype and future controlled ablation.

The DIRECT coaching phenomenon is supported by ShotKam material: diminishing/collapsing lead is described as occurring when visual attention moves to the barrel / lead is consciously measured, gun movement slows or stops, and the shooter commonly misses behind. ShotKam also uses proprioceptive language in youth coaching.

The deeper causal/neurological model remains `SHOTSIGHT_HYPOTHESIS`. No rule has been added that forces barrel checking to produce a behind miss.

## Architecture decision

The corrected phase-persistent pull-away controller remains the primary controller. Its earlier stateless reconnect behaviour is preserved conceptually as a novice measuring comparator rather than reintroduced as a production bug.

Future Ellis attention architecture will distinguish target-foveal visual evidence from lower-resolution peripheral barrel awareness and imperfect proprioceptive/internal gun-body state. A barrel check may consume target-attention quality; it must never provide exact lead or oracle geometry.

## Required ablation

Same hidden bank:
1. target-focused committed pull-away;
2. novice barrel-checking / measuring phenotype;
3. barrel checking with target-attention cost disabled;
4. later proprioception ON/OFF after defensible implementation.

Measure separation collapse, gun velocity change, jerk, visual quality, trigger, break result, and oracle-only post-hoc miss direction. Do not tune for a desired behind-miss result.

## Programme ordering

This design does not interrupt the immediate existential gate. First re-establish binary reward support under Human Vision + committed pull-away. Then run the collapsing-lead comparator as a diagnostic/attention ablation.

## Durable files

- `docs/learning/COLLAPSING_LEAD_BARREL_CHECKING_V1.md`
- `data/playbook-collapsing-lead-v1.json`

## Evidence sources

- ShotKam Help Center, `Analyzing ShotKam videos: how to improve`, 2024-07-16.
- ShotKam UK, `Ultimate Guide to Skeet Shooting: Breaking Station 4`.
- ShotKam, `8 Tips on How to Improve Your Shooting Scores with ShotKam`.
- ShotKam youth coaching, `Elevating Youth Shooters: Techniques for Developing Future Champions`.

## Claim discipline

This checkpoint freezes a diagnostic hypothesis and evidence classification only. It does not claim that Ellis currently exhibits collapsing lead, that the ablation has passed, or that this mechanism has improved break rate.