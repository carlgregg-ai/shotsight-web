# Ellis Human-Analogous Visual Acquisition V1

Status: REQUIRED PERCEPTION CONSTRAINT BEFORE L3 PULL-AWAY LEARNING
Branch: `virtual-shooter-v1`
Evidence class: practitioner observation + literature-supported human vision constraint; numerical parameters remain SHOTSIGHT_HYPOTHESIS until calibrated.

## Core rule

The oracle may know the clay's exact launch state and continuous trajectory from the instant of release. Ellis must not.

A human shooter may watch the trap and anticipate release, but the first visible target information is not a clean geometric point moving along a perfectly known path. At high retinal/image speed the target may initially be perceived as a flash, streak, blur or coarse direction-of-motion cue. Useful shape, line, speed and orientation information should emerge only after sufficient visual evidence accumulates.

Therefore Ellis's observation pipeline must represent **acquisition as a transition from detection to resolved tracking**, not as perfect path observation plus Gaussian noise.

## Required perceptual phases

### 1. EXPECTED RELEASE / SOFT ATTENTION
Before release Ellis may know a rough trap/launch region, demonstrated target family and expected direction where appropriate. This is prior knowledge only. It must not contain the live target's exact launch state.

### 2. FLASH / STREAK DETECTION
Immediately after the target becomes visible, Ellis may receive only coarse evidence such as:
- detection that a moving object has appeared;
- broad direction of travel;
- streak/elongation orientation or coarse motion axis where visually plausible;
- approximate angular region;
- low-confidence apparent speed band;
- no precise instantaneous target centre if motion/contrast makes that implausible;
- no exact line curvature, range, future trajectory or target orientation.

The observation representation should allow uncertainty along the direction of motion to be substantially larger than uncertainty normal to it when the target is perceived as a streak.

### 3. ACQUISITION / RESOLUTION
With additional temporal evidence the target transitions from streak-like detection toward a trackable object. Position, apparent speed, line and target-family estimates become more informative, but remain delayed/noisy and probabilistic.

The transition must depend on factors such as apparent angular speed, contrast/background, observation duration, occlusion, target apparent size/orientation and gaze/attention state. Do not use one fixed 'first clear frame' time as a universal human constant.

### 4. TRACK / COUPLE
Only after acquisition may Ellis form the higher-confidence live target-line and speed relationship used for connection, pull-away, trigger and follow-through. Even here the target remains imperfectly observed and live variation must be re-read continuously.

## Anti-cheat requirements

The streak/acquisition model must be generated from the human observation side of the boundary. It must not leak:
- exact target XYZ;
- exact launch velocity;
- exact future path;
- true range where not visually recoverable;
- oracle target family;
- intercept, pellet ToF or required lead;
- seed/scenario identity.

If streak observations are derived from oracle rendering, only the degraded perceptual product may cross into Ellis. The underlying oracle samples remain inaccessible to policy, memory, diagnosis and Satisfaction.

## Learning implications

1. Ellis should sometimes move from the first flash before he can describe the clay precisely, analogous to a human beginning to orient to motion.
2. He should sometimes wait for better resolution when uncertainty is too high and runway permits it.
3. Pickup point now has a perceptual meaning: the region where the target becomes usable enough to establish a controlled target-gun relationship, not merely a geometric waypoint.
4. Pull-away is particularly compatible with this architecture: detect/resolve the clay, connect, match, then deliberately develop separation.
5. Experience records must preserve acquisition quality, streak-vs-resolved state, confidence at connection, and whether poor early visual resolution contributed to the attempted diagnosis.

## Required ablations

Before scaling:
- perfect-point observation vs human-analogous streak/acquisition observation;
- short vs longer acquisition windows;
- high-contrast vs clutter/low-contrast conditions;
- memory ON/OFF under acquisition uncertainty;
- selective waiting ON/OFF;
- later, eye/gaze calibration against human video/eye-tracking evidence if available.

An implausibly high hit rate when Ellis receives only flash/streak-level information is an anti-cheat/perception red flag.

## Evidence notes

- Practitioner observation: a clay leaving the trap can initially be perceived as a streak/flash rather than a crisply resolved object; this is to be treated as a ShotSight hypothesis requiring model calibration, not a universal fixed-duration rule.
- Clay-target coaching material also describes an early 'flash or blur' / soft-focus phase before clear target detail is available; this supports distinguishing initial detection from resolved tracking.
- Human-vision research on motion streaks and motion blur supports the general principle that rapidly moving retinal stimuli can produce temporally extended/streak-like representations; it does not by itself supply clay-specific timing constants.

## Implementation gate

Do not start the main pull-away hit/miss learning run on an observation stream that gives Ellis an exact clean point from the first visible frame. First add a human-analogous acquisition state and verify that confidence/precision improve with visual evidence rather than oracle knowledge.
