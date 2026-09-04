# ShotSight Stage 8 — Controlled Coverage Expansion (COMPLETE)

Date: 2026-09-04
Status: **COMPLETE — three additional evidence-certified presentation branches promoted**

## Recovery baseline

Stages 1–7 were already completed/checkpointed before this gate. Stage 8 did not mass-promote the recovered legacy 54-play catalogue. The Stage 1/2 evidence policy remains binding: unresolved or catalogue-only material stays held rather than being converted into product truth.

## Expansion policy

Stage 8 used a deliberately conservative batch process:

`source permission → lesson writing → diagnostic branch → visual/motion design → automated QA → rendered review`

A new lesson was promoted only where Stage 2 contained sufficient direct source permission for the presentation-specific coaching claim. Product-specific mechanisms, A/B tests and drills remain labelled `SHOTSIGHT_HYPOTHESIS`.

## New certified lessons

### 1. Rising quartering outgoing

- Direct coaching anchor: Don Currie / NSCA `NSCA_RISING_OUTGOING`.
- Direct claim kept presentation-specific: vertical intercept toward the inside leading edge to avoid occlusion on the matching rising-quartering-outgoing case.
- Exact hold geometry is not inherited across different angles/handedness.
- Diagnostic A/B test remains a ShotSight hypothesis.

### 2. Fast flat quartering away

- Direct coaching anchor: Don Currie / NSCA `NSCA_ALWAYS_BEHIND`.
- Direct claim covers the reviewed fast-quartering-behind context, quartering move, hold/pickup planning and leading-edge focus.
- The method is explicitly retained as one attributed coaching option, not the only valid quartering method.
- Diagnostic timing/connection decomposition remains a ShotSight hypothesis.

### 3. Teal near the apex

- Direct coaching anchor: James Ross / Orvis `ORVIS_TEAL`.
- Direct claim covers an apex-based single-teal option.
- The UI explicitly refuses to present apex as the universally best teal break point and keeps this lesson separate from the Don Currie outgoing-under-power teal method.
- Process/timing diagnosis and phase-comparison drill remain ShotSight hypotheses.

## Product integration

The Playbook now contains **11 certified lessons**: the original eight representative lessons plus these three controlled expansions.

All three Stage 8 lessons include:

- canonical presentation selectors and natural-language aliases;
- DIRECT source-attributed coaching content;
- explicit HOLD / do-not-overclaim guardrails;
- hypothesis-labelled diagnostic branches with discriminating question, correction and retest;
- target-geometry schematics marked `SCHEMATIC · NOT TO SCALE`;
- source-attributed conceptual target/gun motion panels;
- search support and Diagnose-engine routing.

## Final Stage 8 QA

Final tested production/test commit: `f1f32900c06ccb92ce1520fd41e6e6a679c5a3c2`.

For that exact commit:

- Playbook + diagnostic browser QA run `33833400998`: **SUCCESS**.
- GitHub Pages deployment run `33833400099`: **SUCCESS**.
- 390×844 mobile and 1280×800 desktop were exercised.
- All 11 certified lessons rendered with schematics.
- Nine lessons rendered source-safe attributed method motion; the two intentionally ambiguous method cases retained explicit no-generic-motion holds.
- Search tests resolved all three new expansion aliases.
- Diagnostic tests verified all three new branches preserve `SHOTSIGHT_HYPOTHESIS` status through the supported-result flow.
- Existing uncertainty and failed-discriminator paths remained passing.
- Browser console/page-error gate remained clear.

## Rendered visual review

The workflow's final screenshot artifact was downloaded and visually inspected for the three new mobile lessons. The rising-quarter, fast-quarter and apex-teal geometries are distinguishable, labelled and readable; the conceptual method panels remain visually separated from the target-geometry schematics. No reason was found to bypass the automated pass.

## Scope boundary / stop rule

Stage 8 is complete because it demonstrates and ships a controlled expansion process, not because all legacy catalogue entries were promoted. The recovered 54-play corpus remains a research/backlog inventory. Specialist or weakly sourced entries such as Helice technique, Rocket technique, generic tower/high-incomer technique, ambiguous `crow`, and unresolved crossing/nested-pair claims remain held until direct evidence is strong enough to pass the same process.

This is intentional accuracy preservation, not a missing-data workaround.

## Stage gate

**Stage 8 status: COMPLETE.**

Next permitted stage: **Stage 9 — Product QA.** Exercise realistic user journeys on mobile and desktop across Today, Train, Diagnose, Playbook and Progress; identify real UX friction, fix it, and retest before the final deployment audit.
