# P7 — Canonical Flat-Crosser Integrated Simulator — FAILED_NEEDS_REWORK

Date: 2026-09-04
Branch: `physics-engine-v1`
Recovered prior verified browser/workflow commit: `5c4bdf580e443de80afb36838ff7993d2ee0ba68`
Recovered durable state HEAD before this review: `640079029b495a46854428b5fe8e507544147d28`

## Adversarial rendered/narrative review finding

P7 cannot pass its visual/narrative gate in the current form.

The canonical simulator obtains the displayed bore direction directly from the instantaneous physical intercept solution at every simulation time. In `simulateCanonicalFlatCrosser(...)`, `currentIntercept.bore_W` is projected and exposed as the gun/bore state continuously. At the same time, the scenario attaches the source registry entry `NSCA_LONG_CROSSER_PULL_AWAY`, and the debug telemetry exposes that registry id as `methodId`.

Those two facts are not equivalent. Continuously tracking the instantaneous intercept direction is an engineering reference/intercept-tracking strategy; it is not, by itself, a demonstrated pull-away kinematic state machine. A pull-away method requires the gun/target relationship to perform the source-supported sequence and numerical invariants appropriate to that method. The current P7 proof has not established authorised numerical transition predicates/tolerances for acquisition, connection or speed match, and those states are correctly held elsewhere.

Therefore the current surface can cause an expert reviewer to infer that the displayed gun path is a source-supported pull-away motion when it is not. This violates the master programme rules that coaching technique is a source-attributed kinematic/control strategy layered on physical interception and that narrative/method labels must agree with numerical state.

## What remains valid

The following P7 work remains verified and is not invalidated by this finding:

- one master simulation clock;
- deterministic target/intercept/projection state;
- TEST_ONLY ballistic-provider lock;
- camera-origin apparent lead correction;
- deterministic debug/frame/scrub mapping;
- parameter sweeps and no-phase-drift regression;
- browser engineering controls and telemetry;
- explicit `ENGINEERING PROOF · NOT REALISTIC CLAY CERTIFICATION · NOT INSTRUCTIONAL` lock;
- ACQUISITION / CONNECTION / SPEED_MATCH HOLD rendering;
- no decorative break event.

## Required repair

1. Separate the **engineering intercept-reference gun strategy** from any source-attributed shooting-method identity in the simulation state and UI. The current bore path must not be labelled as pull-away.
2. Add an explicit provenance field distinguishing `ENGINEERING_REFERENCE` / `SHOTSIGHT_HYPOTHESIS` / source-supported method behaviour.
3. Only introduce pull-away, maintained-lead, swing-through or other method-specific gun motion after the numerical behaviour is constructed from source-supported qualitative invariants with every unsourced timing/tolerance exposed as a parameter/assumption rather than asserted as coaching fact.
4. Re-run method/narrative invariants and the browser contract.
5. Perform the visual/frame-by-frame adversarial review again after the correction.

## Gate decision

**P7 = FAILED_NEEDS_REWORK.**

This is an internal method/narrative integrity failure, not a failure of target/intercept mathematics. Do not advance to P8 until repaired and re-reviewed.

Realistic clay flight and instructional dense-shot ballistics remain on their existing HOLDs; no certification status changes here.

## Exact next action

Correct the P7 state contract and debug surface so the present gun path is explicitly identified as an engineering intercept-reference strategy rather than `NSCA_LONG_CROSSER_PULL_AWAY`. Add a regression test that fails if a source coaching `methodId` is presented as the active gun strategy without an authorised method-kinematics implementation. Then re-run P3–P7 CI and repeat rendered QA before considering P7 completion.
