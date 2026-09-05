# ShotSight Virtual Shooter — L3 Shooter-Visible Binary Reward Support Green 1

## Gate status

**VERIFIED SCIENTIFIC GATE: BINARY ENGINEERING-PROXY REWARD SUPPORT EXISTS IN THE CURRENT SHOOTER-VISIBLE DYNAMIC COUPLING ARCHITECTURE.**

This is **not** yet evidence that Ellis has learned to shoot, and it is **not** real-world clay-break validation. It establishes the prerequisite that the perception-limited controller + finite gun plant + shooter-visible action representation can produce sparse post-trigger success under the fixed engineering scorer without receiving an oracle intercept solution.

## Authoritative verification

- Branch: `virtual-shooter-v1`
- Verified code/workflow HEAD: `317c2b4162e102e3ee6c9f01522bd22c1e6cb6c8`
- Workflow: `ShotSight virtual shooter`
- Authoritative CI run: `33965136396`
- CI conclusion: `success`
- Full L0 -> L3 regression/containment suite: GREEN
- Score status: `ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY`
- Engineering target proxy radius: **0.055 m**

## Immediately preceding negative control

The same authoritative CI run first reproduced the prior quasi-continuous constant-relationship result on a fresh non-sealed bank:

- bank seed base: `361000`
- crossers: 8
- low-discrepancy constant shooter-visible relationships: 128
- attempts: 1024
- physical triggers: 26
- follow-through triggers: 26
- engineering-proxy hits: **0**

The accompanying coarse constant grid also remained at 0 hits (440 attempts, 11 triggers). This preserves the previous negative finding: simply making a constant lead-picture grid finer did not guarantee reward support on that population.

## New phase-dependent diagnostic

A new predeclared representation allowed the desired target-gun relationship to change linearly between the shooter's already-planned connection region and intended break region. The trajectory was indexed only by **shooter-visible presentation progress** and target-line coordinates.

Representation: `SHOOTER_VISIBLE_RELATIONSHIP_TRAJECTORY_V1`

The action definition did **not** use:

- oracle outcome,
- referee miss distance,
- true range,
- exact future target path,
- intercept,
- pellet time of flight,
- required metric lead,
- target seed.

Fresh non-sealed diagnostic population:

- bank seed base: `371000`
- crossers: 8
- identical hidden bank for phase-dependent and constant action sets
- process-trigger calibration remained on a distinct non-oracle population

### Phase-dependent relationship trajectories

- predeclared actions: 128
- attempts: 1024
- physical triggers: 102
- follow-through triggers: 102
- engineering-proxy hits: **4**
- rewarded actions: 4

### Constant-relationship control on the same hidden bank

- predeclared low-discrepancy actions: 128
- attempts: 1024
- physical triggers: 90
- follow-through triggers: 90
- engineering-proxy hits: **5**
- rewarded actions: 5

## Scientific interpretation

The important positive result is **not** that phase-dependent maintained lead is superior. It is not: in this sparse support diagnostic the constant-relationship control produced 5 proxy hits versus 4 for the phase-dependent representation.

Therefore the current evidence supports these narrower conclusions:

1. **Binary reward support exists.** The current perception-limited controller and finite gun plant can physically produce post-trigger engineering-proxy hits from shooter-visible actions without an oracle intercept solution.
2. **Phase dependence is not established as beneficial.** The specific linear connection-to-break trajectory hypothesis did not outperform the constant control on this bank and must not be promoted as a shooting law.
3. **Reward is sparse and population-sensitive.** The immediately preceding fresh bank produced 0/1024 under the constant representation, while the new bank produced 5/1024. A learner therefore needs genuine exploration, memory and transfer testing rather than a post-hoc lookup of the rewarded samples.
4. **Do not tune around the successful action identities.** The identities of rewarded actions are researcher/referee observations only. They must not be converted into an oracle-derived lead table or privileged correction.
5. The fixed 55 mm centreline-disc proxy remains an engineering scorer only. These counts are not real clay-break probabilities.

## Anti-cheat gate

**PASS.**

The authoritative diagnostic reports:

`PASS_PREDECLARED_PHASE_TRAJECTORIES_USE_ONLY_SHOOTER_VISIBLE_PRESENTATION_PROGRESS_AND_TARGET_LINE_RELATIONSHIP; NO_ORACLE_OUTCOME_MISS_DISTANCE_RANGE_INTERCEPT_PELLET_TOF_REQUIRED_LEAD_OR_SEED_USED_TO_DEFINE_ACTIONS`

The oracle remains downstream of trigger choice and scores the resulting shot only after the action. No referee miss vector or exact ballistic solution is passed back into the shooter controller, action generator or memory.

## Next verified operation

Freeze the current action generators and scorer before learning. Implement **genuine hit/miss-only learning and memory** over the shooter-visible relationship representations, with explicit training/calibration/held-out separation and no target-seed memorisation.

The next experiment must compare at least:

- constant low-discrepancy relationship representation,
- phase-dependent relationship-trajectory representation,
- memory vs no-memory.

The learner update receives only the permitted post-shot binary outcome in the first condition. Do not feed referee miss distance, exact range, intercept, pellet ToF or action-correction direction into policy or memory. Preserve the constant-vs-phase result as a representation ablation rather than assuming the new representation is better.

Do **not** scale to the 100k existential bank merely because sparse support now exists. First demonstrate that a learner can use binary outcomes to improve on an untouched held-out population and that the result reproduces across seeds. If learning cannot rise above sparse chance support, diagnose exploration/generalisation/memory before adding compute.
