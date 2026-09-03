# ShotSight Stage 3 — Target Taxonomy and Content Model (COMPLETE)

Date: 2026-09-03
Status: **COMPLETE**
Stage 4 started: No at checkpoint creation.

## 1. Recovery and evidence guardrails

Stage 2 is the binding evidence baseline. DIRECT / SYNTHESIS / SHOTSIGHT_HYPOTHESIS / HOLD_DEMOTE remain mandatory. Unresolved legacy S## references cannot certify technical claims; catalogue/rule/manufacturer/research material retains the limited permissions assigned in Stage 2.

The repository was re-read before this checkpoint. The production browser prototype was unchanged from the Stage 2 baseline before these documentation/data additions.

## 2. Taxonomy decision

The recovered 54-play v1.2 inventory remains useful as a **shooter-facing content inventory**, but it must not be treated as 54 equal physical target families. ShotSight now separates:

1. physical presentation geometry;
2. trajectory modifiers;
3. physical target type;
4. visibility/occlusion;
5. sequence/pair context;
6. discipline/context;
7. coach-specific method options;
8. symptom/diagnostic state.

This prevents a named target or context label from silently importing technique from a different geometry.

## 3. Canonical presentation axes

- `flight_family`: crossing, quartering, incoming, outgoing, rising, falling_driven, looping_chandelle, ground_rabbit, vertical_teal, specialty
- `direction`: left_to_right, right_to_left, toward, away, overhead_toward, overhead_away, vertical_up, vertical_down, mixed, unknown
- `elevation`: low, level, high, overhead, unknown
- `speed`: slow, medium, fast, changing, unknown
- `angle`: shallow, moderate, broadside, steep, near_vertical, unknown
- `phase`: rising, apex, descending, powered, slowing, bouncing_ground, stable, mixed, unknown
- `target_type`: standard, midi, mini_70, supermini_60, battue, rabbit, rocket, flash, helice_zz, other, unknown
- `visibility`: open, occluded, edge_on, changing_face, intermittent, unknown
- `sequence_context`: single, report_pair_first, report_pair_second, true_pair, following_pair, rafale, nested_pair, unknown
- `discipline`: sporting, fitasc, sportrap_compak, skeet, trap_dtl, abt, olympic_trap, universal_trench, helice, generic

Unknown is a valid value. The product must not guess.

## 4. Object model

- `presentation_family`: reusable geometry explanation only.
- `play`: useful shooter-facing combination of geometry + modifiers.
- `variant`: modifier of a play; does not automatically become a new technique.
- `method_option`: attributed coaching method with claim/evidence references.
- `diagnostic_context`: symptom + presentation selector + observations/self-report.
- `evidence_claim`: DIRECT / SYNTHESIS / SHOTSIGHT_HYPOTHESIS / HOLD_DEMOTE plus source keys and attribution.
- `drill_link`: intervention relationship with validation state separate from coaching evidence.

Evidence does **not** automatically inherit from family to variant. Geometry definitions may inherit; technical method claims inherit only when the reviewed source covers the relevant variant.

## 5. High-risk naming corrections

- **Driven ≠ overhead.** Driven is incoming from height/toward or past the shooter; overhead is a spatial relationship that can include incoming or passing/away phases.
- **Tower/high incomer** is too broad for one technique record. Tower is launch/context; resolve actual trajectory first.
- **Crow** is retained as a search alias/named presentation only until trajectory is described; no universal crow technique.
- **Crossing/nested pair** remains a context/search phrase, not a canonical physical family; resolve each bird separately.
- **Rabbit** is a physical target + ground-contact family; crossing, quartering and speed variants remain explicit.
- **Teal** requires phase/context. Near-peak and outgoing-under-power versions can demand different methods.
- **Chandelle/looper** requires rising/apex/descending phase and break-zone context.
- Pair labels belong primarily to `sequence_context`; each bird retains independent geometry.
- Discipline entries such as DTL/ABT/FITASC/Sportrap are contexts, not fixed single trajectories.

## 6. Search and alias model

Search parses ordinary shooter language into canonical axes plus symptom intent. Ranking order:

1. exact alias/name match;
2. canonical family + matching modifiers;
3. canonical family alone;
4. related presentation/context.

Symptom language routes into Diagnose while retaining target context.

Verified interpretation examples:

- `low fast incomer` → incoming + low + fast; rank cutoff/transition variant only when wording/context indicates transition/drop/cut.
- `high looper` → looping_chandelle + high; rank apex/descending lessons if no phase is supplied, with phase choice exposed.
- `rabbit going away` → ground_rabbit + away/quartering-away.
- `slow quartering bird` → quartering + slow; direction remains unresolved until supplied/observed.
- `behind on a crosser` → crossing + symptom `behind` → Diagnose.
- `keep missing underneath teal` → vertical_teal + symptom `below`; rank rising-under-power only when the actual trajectory supports it.
- `tower bird` → tower context alias; require/derive direction + phase before technical advice.
- `crow` → named alias with geometry-required warning.

## 7. Collision policy

Aliases may collide. Do not force one winner when the phrase is physically ambiguous. Important collision terms:

- `incomer` — straight incoming vs quartering incoming vs low-fast cutoff/transition
- `overhead` — driven incoming vs passing/away overhead
- `teal` — rising, apex, descending, angled/outgoing-under-power
- `looper` — rising/apex/descending chandelle family
- `tower bird` — high crosser, high incomer/driven, or other tower-launched path
- `rabbit` — crossing, shallow quartering, slow/close, bouncing/irregular ground path
- `pair` — report, true/simultaneous, following, rafale
- `high bird` — elevation only; geometry unresolved

The UI should ask one discriminating target-geometry question rather than inventing a technique.

## 8. Diagnostic data contract

A diagnostic record is keyed by context, not target name alone:

`presentation_selector -> symptom -> observations/self-report -> candidate_mechanisms -> discriminating_questions -> observable_signatures -> correction -> drill -> retest -> uncertainty -> evidence`

It preserves the existing Knowledge Map sequence:

**SYMPTOM → CONTEXT → MECHANISM → SIGNATURE → DIAGNOSTIC → INTERVENTION → VERIFY**

A symptom such as “behind” or “stopped gun” is never itself the diagnosis.

## 9. Migration rule for recovered v1.2 inventory

The exact standalone v1.2 54-play data file could not be re-surfaced in this execution environment despite Library searches. Stage 1 already certified the 54-play file and its cross-reference integrity, so Stage 3 does not invent a replacement list.

When the v1.2 data is next available, each existing entry is migrated by rule:

- trajectory-defined entry → `play` under a canonical `presentation_family`;
- speed/elevation/distance/target-size-only entry → `variant` unless it materially changes the task;
- pair/discipline entry → `sequence_context` / `discipline` lesson linked to independently classified birds;
- ambiguous named presentation → alias + geometry-required state;
- coach technique → `method_option`, never a taxonomy family;
- legacy claims → rebind to Stage 2 evidence permissions; unresolved technical claims remain HOLD.

No recovered shooter-facing entry is deleted merely because it is reclassified.

## 10. Stage 3 exit criteria

- [x] Physical geometry separated from modifiers/context/method.
- [x] Canonical presentation axes defined.
- [x] Search/alias normalisation defined.
- [x] Ambiguous-name/collision policy defined.
- [x] Driven/overhead, tower, crow, teal, chandelle, rabbit and pair conflations resolved architecturally.
- [x] Diagnostic data contract defined.
- [x] Evidence inheritance rule defined.
- [x] Migration strategy preserves the recovered 54-play inventory without inventing missing data.
- [x] Representative search phrases tested against the model.

**Stage 3 status: COMPLETE.**

Next permitted stage: **Stage 4 — Representative Target Lessons.**
