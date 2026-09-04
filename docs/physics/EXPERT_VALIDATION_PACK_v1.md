# ShotSight Expert Validation Pack v1

## Review purpose
This pack is for adversarial expert shooter/coach review of the current canonical engineering proofs. The question is not “does it look plausible?” but: **where is the model, geometry, method labelling, timing, projection or narrative wrong?**

Nothing in this pack certifies realistic clay aerodynamics, realistic dense shot-cloud ballistics or expert-method kinematics that remain on HOLD.

## Canonical review cases
Review these browser debug surfaces from `physics-engine-v1`:

1. **Flat crosser** — `p7-debug.html`
   - Engineering intercept reference only.
   - Coaching method entries may be source references; unimplemented method kinematics remain HOLD.
   - Inspect start, pre-shot, shot, pellet-arrival and follow-through.
2. **Quarterer** — `p8-quarterer-debug.html`
   - Changing range and apparent angular speed are geometry-derived.
   - Inspect near/far evolution and mirror behaviour.
3. **Chandelle/looper** — `p8-looper-debug.html`
   - Gravity-only curved engineering proof, not realistic clay aerodynamics.
   - Inspect rise, apex and descent phase geometry.
4. **Teal/strong vertical case** — `p8-teal-debug.html`
   - Gravity-only strong-vertical engineering proof.
   - Trap-powered rise/launch physics remain HOLD.

Rabbit is deliberately excluded because validated ground-contact dynamics do not yet exist.

## How to review each case
Use play/pause, 0.25×/0.5× slow motion, frame stepping and timeline scrub. For each critical frame compare:
- target world position, range, speed and projected/angular position;
- gun/bore angular position and angular rate where exposed;
- target↔gun relative angular separation;
- physical intercept and apparent/angular lead;
- shot time, pellet TOF and pellet-arrival ordering;
- active engineering strategy vs any source-reference coaching method;
- narrative/event labels against what the numerical state is actually doing;
- whether any HOLD/uncertainty has been visually hidden.

## Required adversarial questions
For every case record:
- Is the target moving in a way an experienced clay shooter would reject for the stated limited model?
- Does apparent target speed change correctly with range/geometry?
- Does the displayed bore line correspond to the labelled strategy, or could it be mistaken for a coaching method that is not numerically implemented?
- Is the shot timing physically coherent with the shown intercept and pellet arrival?
- Is apparent lead visually consistent with the shooter/camera origin rather than shot origin?
- Does any frame imply a break before pellet arrival?
- Are rise/apex/descent or incoming/passing/outgoing phases described correctly?
- Is there any discontinuity, phase drift, impossible gun acceleration or unexplained sign change?
- Would the normal-speed view teach a relationship that the frame-by-frame debug data contradict?

## Current scientific disclosure
### Verified engineering architecture
- one master simulation clock for target, gun, shot and narrative;
- deterministic target state generation for the canonical bounded models;
- provider-based pellet TOF/intercept infrastructure;
- world-space physical lead and shooter/camera apparent lead kept distinct;
- documented 3-D-to-image projection conventions;
- bore-orientation/angular-kinematics representation;
- source-attributed method registry with fail-closed unimplemented thresholds;
- rendered QA gates and CI regression coverage for P3–P10.

### Explicit non-certifications / HOLDs
- realistic standard-clay aerodynamic coefficients and held-out real-flight validation;
- target release spin and trap-setting-to-launch-state mapping;
- realistic teal powered-rise launch behaviour;
- rabbit rolling/slipping/bounce/ground interaction;
- dense shot-cloud correction, shot string and sporting-load empirical validation;
- camera-to-bore transform uncertainty for real gun-mounted footage;
- numerical expert-method transition tolerances and real expert gun angular kinematics;
- broad Playbook migration.

## Evidence/provenance rule for feedback
Please distinguish:
- direct observation from the debug case;
- coaching-method/source disagreement;
- real-world shooting experience;
- measured/recorded evidence that can be supplied;
- hypothesis or preference.

A criticism does not need a formal citation to be useful, but if it implies a physical parameter or universal behaviour, ShotSight will not convert it into a model constant without measurement/source support.

## Feedback log format
For each issue capture:
- case and timestamp/frame;
- severity: `BLOCKER`, `MAJOR`, `MINOR`, `QUESTION`;
- category: `PHYSICS`, `PROJECTION`, `BALLISTICS`, `GUN_KINEMATICS`, `METHOD`, `NARRATIVE`, `RENDERING`, `UNCERTAINTY_DISCLOSURE`;
- what looks/reads wrong;
- what an expert expects instead;
- evidence/source/experience basis;
- whether the issue changes the break/intercept truth or only presentation;
- suggested measurement/video/source if the correction is not currently identifiable.

## Go/no-go rule
One important geometry, timing, method or narrative contradiction is sufficient to fail the affected canonical case. Expert approval must not be inferred from silence or from internal automated QA. Controlled Playbook migration remains blocked until external expert review is returned and every BLOCKER/MAJOR issue is resolved or explicitly held with safe presentation.
