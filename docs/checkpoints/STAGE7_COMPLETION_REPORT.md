# ShotSight Stage 7 — Diagnostic Engine (COMPLETE)

Date: 2026-09-04
Status: **COMPLETE — representative diagnostic decision process certified**

## Recovery

Stages 1–6 were already complete or checkpointed before this stage. Stage 7 did not rewrite earlier evidence, taxonomy, lesson or visual work.

## Objective

Replace the former symptom-led / hard-coded diagnosis flow with a meaningful discriminating process that begins with presentation, preserves competing explanations and can stop with uncertainty instead of forcing a diagnosis.

The implemented sequence is:

`presentation → observed result → what was seen/felt → discriminating test → candidate mechanism(s) → correction → retest`

## Implementation

`shooter-diagnosis.js` now loads the certified representative Playbook data rather than maintaining a separate overconfident hard-coded diagnosis bank.

For each of the eight representative lessons it:

1. asks the shooter to classify the presentation first;
2. captures the repeatable observed result;
3. checks whether the certified branch actually describes the reported context;
4. presents the lesson's discriminating question/test;
5. reduces confidence when the discriminator points away;
6. issues a correction only when the branch is supported;
7. carries the Stage 4 retest into the result;
8. can route directly to the selected Playbook lesson.

## Uncertainty and evidence behaviour

- Unsupported presentation/symptom combinations return **UNCERTAINTY RETAINED / Insufficient evidence** rather than borrowing a fix from a nearby branch.
- An unclassified presentation stops the engine instead of guessing geometry.
- An unrun discriminator stops before prescription.
- A discriminator that points away produces **BRANCH NOT CONFIRMED** and keeps candidate mechanisms open.
- A supported branch is labelled **SUPPORTED COACHING HYPOTHESIS / Branch supported — not proven**.
- The old `Strong match` / `Likely diagnosis` language has been removed from the representative flow.
- Candidate mechanisms, interpretation, correction and retest are taken from the certified Stage 4 lesson data; no new mechanism or coaching protocol is invented by the engine.
- Sense remains future corroborating/challenging evidence, not automatic confirmation.

## Representative compatibility gate

The current engine only activates diagnostic branches where the certified representative lesson contains a compatible observed-result family. This is intentionally conservative. Missing combinations are Stage 8 coverage gaps, not permission to generalise.

## QA

Final tested Stage 7 commit: `2998a1a2d4f8d5a5870f8184b872e17b0d362738`.

For that exact commit:

- Playbook + diagnostic browser QA run `33832553091`: **SUCCESS**.
- GitHub Pages deployment run `33832552233`: **SUCCESS**.
- Both 390×844 mobile and 1280×800 desktop were exercised.
- Automated Stage 7 journeys verified:
  - flat/long crosser + behind + branch fit + supporting discriminator → supported hypothesis with mechanisms, correction and retest;
  - flat/long crosser + unsupported `ahead` result → uncertainty retained and no borrowed fix;
  - chandelle vertical branch + discriminator pointing away → branch not confirmed and confidence reduced.
- Existing Stage 5/6 Playbook/visual browser gates remained passing in the same workflow.

## Scope boundary

Stage 7 certifies the **decision-engine architecture and representative eight-lesson diagnostic set**. It does not claim that all recovered 54 plays / 111 legacy branches have been re-certified. Migrating additional presentations and branches through the same evidence standard is Stage 8.

## Stage gate

**Stage 7 status: COMPLETE.**

Next permitted stage: **Stage 8 — Expand coverage**, using controlled `source → write → diagnose → visualise → QA` batches. Weak or unresolved legacy branches must remain held rather than being promoted merely to increase catalogue size.
