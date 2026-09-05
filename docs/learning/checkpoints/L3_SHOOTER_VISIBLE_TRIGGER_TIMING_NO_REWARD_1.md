# L3 — Shooter-visible trigger timing: no binary reward support (checkpoint 1)

Status: **VERIFIED NEGATIVE RESULT — CI GREEN**

## Governing shooting axiom

**GOOD SHOOTING IS CONTINUOUS PERCEPTUAL COUPLING BETWEEN TARGET AND GUN:**

**READ THE LINE -> MATCH THE SPEED -> APPLY THE METHOD -> TRIGGER -> FOLLOW THROUGH.**

This gate tests only whether the missing ingredient after dynamic coupling was *where, inside the shooter-visible planned break region, the shooter commits to the trigger*. It does not use pellet time-of-flight, exact intercept timing, range, metric lead or referee miss geometry to choose the action.

## Repository / CI

- Branch: `virtual-shooter-v1`
- Verified HEAD for this gate: `a374f7e070011ca75f2fe1ecc993461239b34680`
- Workflow: `ShotSight virtual shooter`
- Workflow run: `33956510699`
- Conclusion: **success**
- Full L0 -> L3 regression suite passed, including the new shooter-visible trigger-timing diagnostic.

## New learner-side capability

Added `learning/dynamic-trigger-timing-v1.mjs`.

The trigger commitment is represented as a dimensionless offset inside the shooter's already-planned break window. Runtime inputs remain shooter-visible only:

- `MULTIFAMILY_BELIEF_V1`
- `PRESENTATION_LEVEL_SHOT_PLAN_V1`
- `FINITE_GUN_PLANT_STATE_V1`
- shooter-visible presentation progress
- current dynamic target-line / gun relationship and speed-match state

The learner controller contains no oracle or physics-scoring import. The offset is deliberately **not** seconds-to-intercept, pellet TOF or a hidden ballistic correction.

Follow-through remains mandatory after every physical trigger.

## Diagnostic design

Fresh non-sealed crosser bank:

- seed base: `341000`
- crossers: `12`
- same hidden targets used across all actions
- untouched sealed final-test banks remain untouched

Exploratory learner-safe action grid:

- forward visual relationships: `0, 0.02, 0.04, 0.06, 0.08, 0.10 rad`
- line-normal relationships: `-0.01, 0, +0.01 rad`
- shooter-visible commitment offsets: `-0.12, -0.08, -0.04, 0, +0.04, +0.08, +0.12` normalised presentation progress
- total action combinations: `126`

The dynamic-coupling relationship tolerance was frozen from a **process-only, no-oracle-score** calibration partition before this reward diagnostic.

## Verified result

Across `1,512` attempted episodes:

- physical triggers: **100**
- proxy hits: **0**
- post-trigger continued-motion / follow-through episodes: **100 / 100**
- fixed-timing hits: **0**
- timing-variant hits: **0**

Result code:

`L3_TRIGGER_TIMING_NO_BINARY_REWARD_SUPPORT_V1`

The current scoring remains:

`ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY`

Therefore this is neither real-world shooting validation nor a claim about real break probability.

## Anti-cheat result

**PASS**

- trigger timing is normalised shooter-visible break-window progress only;
- dynamic learner controller has no oracle or physics-scoring import;
- oracle scoring occurs only after a physical trigger;
- miss distance, miss vector, exact range, future trajectory, exact intercept, pellet TOF, target seed and metric lead are not passed into the learner controller or memory.

## Scientific interpretation

The hypothesis that *the existing dynamic coupling was sound but Ellis was simply committing at the wrong place inside the break window* is **not supported by this diagnostic**.

Allowing earlier and later shooter-visible commitment materially increased the number of valid shots relative to the preceding dynamic-coupling gate, but did not create even one binary reward event. This negative finding must be preserved.

Do **not** respond by widening the hit proxy, reading the referee miss vector, deriving a correction from closest-approach distance, or sweeping arbitrary numerical ranges until a hit appears. That would convert the experiment into simulator fitting.

## Next verified incomplete operation

Inspect the **expressivity and geometry of the dynamic perceptual coupling itself** before further reward learning:

1. verify the apparent target-line tangent / line-normal basis and their sign/orientation across left-to-right and right-to-left targets;
2. verify that the finite gun controller can actually establish and maintain the requested along-line and line-normal visual relationship through the intended engagement interval rather than merely satisfying loose process gates;
3. verify that target/gun speed matching is computed in the same line-relative coordinate system used to command the gun;
4. construct a process-only geometry/expressivity diagnostic using shooter-visible state only, with no oracle outcome used to tune commands;
5. only after that passes, repeat a fresh non-sealed binary reward-support test.

Preserve the static scalar policy, the first dynamic coupling policy and this trigger-timing policy as negative baselines.

The conceptual target remains: Ellis should learn a live visual relationship to *this particular clay*, not memorise a demonstration trajectory or receive a mathematical intercept answer.
