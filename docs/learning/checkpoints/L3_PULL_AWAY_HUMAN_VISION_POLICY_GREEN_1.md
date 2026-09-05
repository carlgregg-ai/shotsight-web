# ShotSight Virtual Shooter — L3 Pull-Away Human Vision Policy Green 1

## Gate status

**VERIFIED L3 POLICY-CONTAINMENT GATE: THE PRIMARY PULL-AWAY POLICY CAN NOW OPERATE ONLY AFTER ELLIS HUMAN VISION V1 HAS ACQUIRED A RESOLVED-BUT-UNCERTAIN TARGET.**

This is an architecture/containment gate. It is **not** evidence that Ellis has learned pull-away, that any provisional separation value is correct, or that the engineering centreline-disc proxy represents real-world clay-break probability.

## Authoritative verification

- Branch: `virtual-shooter-v1`
- Verified code/workflow HEAD: `2cb55609bf84cc039c2909af7ca47c9a65bb6ea6`
- Workflow: `ShotSight virtual shooter`
- Authoritative CI run: `33976459019`
- CI conclusion: `success`
- Full L0 -> L3 chained regression: GREEN
- New CI step: `Run L3 pull-away human-vision policy boundary gate`

## Implemented learner-side policy boundary

`learning/pull-away-human-vision-policy-v1.mjs` now provides an explicit downstream policy boundary:

1. It accepts only `ELLIS_VISUAL_EVIDENCE_V1` plus the finite gun/shooter state.
2. Passing raw `SHOOTER_OBSERVATION_V1` directly to the pull-away policy fails with `PULL_AWAY_POLICY_RAW_OBSERVATION_BYPASS_FORBIDDEN`.
3. `FLASH_STREAK`, `ACQUIRING` and `REACQUIRING` cannot provide a resolved target centre to the policy.
4. Before `TRACKING`, the policy can choose to wait/hold but cannot manufacture a precise target-point gun command from the streak.
5. Once `TRACKING` exists, the policy may use only the resolved-but-uncertain learner-visible angular estimate and apparent motion to progress through the qualitative pull-away topology:
   `CONNECT -> MATCH_SPEED -> DEVELOP_SEPARATION -> TRIGGER_READY`.
6. The chosen forward visual relationship is an exploratory learner parameter, not oracle lead, range, pellet time-of-flight or intercept geometry.
7. The module imports no target physics, ballistics, intercept solver or referee code.

## Experience / Chiron corpus extension

`learning/ellis-experience-v1.mjs` now includes `ELLIS_ACQUISITION_EXPERIENCE_V1` and allows it to be embedded in immutable `ELLIS_EXPERIENCE_RECORD_V1` episodes.

The acquisition record preserves only learner-visible human-analogous information:

- acquisition phase;
- acquisition score;
- observation span;
- contrast and clutter condition;
- occlusion state;
- whether Ellis waited for additional evidence;
- whether reacquisition occurred;
- whether the available representation was streak / resolved / none.

It explicitly prevents unresolved phases from being retrospectively recorded as if they had a resolved visual target. This is intended to let future Chiron research distinguish failures caused by weak acquisition from failures later in connection, speed match, separation, trigger or follow-through.

## Provisional method parameters

The first policy values remain `SHOTSIGHT_HYPOTHESIS` / `PROVISIONAL_METHOD_KINEMATICS`, including connection tolerance, speed-match tolerance, minimum track confidence, exploratory separation target and trigger-separation fraction. They are not certified human constants and must be ablated/calibrated rather than defended because they currently make the simulator work.

## Coaching compatibility

The representative flat/long-crosser Playbook remains compatible with this topology: pull-away is represented as one recognised method, with the Don Currie/NSCA long-crosser material supporting useful runway, target focus, speed match and smooth separation. That evidence is a prior/constraint, not a universal numerical solution and does not provide Ellis a lead value.

## Ballistics / score boundary retained

The inherited ballistics remain fail-closed for instructional realism:

- the Allen free-sphere provider is research-validation only;
- the analytic constant-speed intercept is test/reference infrastructure only;
- dense realistic shotgun-cloud behaviour remains unvalidated;
- the current 55 mm centreline-disc scorer remains an engineering proxy.

The pull-away learner must never import or consume those oracle calculations. Oracle scoring remains post-trigger only.

## Tests passed

The new CI gate verifies that:

- raw upstream ShooterObservation input is rejected at the pull-away policy boundary;
- early `FLASH_STREAK` evidence results in `WAIT_FOR_ACQUISITION`, trigger false, and a gun-hold command rather than target-point aiming;
- sufficiently strong `TRACKING` evidence can permit `DEVELOP_SEPARATION`;
- a learner-visible developed forward relationship can become `TRIGGER_READY` without oracle state;
- acquisition experience records are valid and immutable;
- an unresolved acquisition phase cannot be marked `RESOLVED`;
- privileged aliases such as true range still fail recursively.

## Scientific interpretation

The first executable pull-away chain is now constrained to:

`EXPECT -> STREAK -> ACQUIRE -> TRACK -> CONNECT -> MATCH SPEED -> DEVELOP SEPARATION -> TRIGGER`

rather than allowing the shooting policy to operate in parallel with the human-vision front end.

This is a necessary condition for the existential experiment, but it does not yet establish learning.

## Next operation

Build the first genuine **human-vision-constrained pull-away episode/evaluation runner** on explicit non-sealed train/calibration/held-out crosser populations.

Requirements for that runner:

1. Build Human Vision V1 evidence incrementally from delayed/noisy observation history.
2. Run the finite gun/shooter plant under `PULL_AWAY_HUMAN_VISION_POLICY_STATE_V1`.
3. Oracle-score only after a learner-generated trigger.
4. Feed back hit/miss only in the first condition; never miss distance or oracle correction.
5. Persist `ELLIS_EXPERIENCE_RECORD_V1` including acquisition context for each meaningful episode.
6. Use an interpretable exploratory separation policy/memory first; do not initialise from identities or oracle geometry of previously observed successful diagnostic actions.
7. Establish that binary reward support exists under Human Vision V1 before large-scale learning.
8. Then compare memory ON/OFF and Satisfaction ON/OFF on distinct train/calibration/held-out populations.
9. Do not scale to the 100k existential bank until held-out pull-away learning is reproducible.
