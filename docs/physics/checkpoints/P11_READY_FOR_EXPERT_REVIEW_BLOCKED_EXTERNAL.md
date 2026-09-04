# P11 — Expert Validation Pack / Go-No-Go — READY_FOR_EXPERT_REVIEW / BLOCKED_EXTERNAL

## Status
- Stage: P11 — Expert Validation Pack / Go-No-Go
- Status: **BLOCKED_EXTERNAL / READY_FOR_EXPERT_REVIEW**
- Branch: `physics-engine-v1`
- Review-pack head: `131648a9795146ecf46ff0e9909509effb562693`
- Full physics CI run at review-pack head: `33914161190` — **SUCCESS**

## Completed autonomously
- `docs/physics/EXPERT_VALIDATION_PACK_v1.md` assembles the canonical flat-crosser, quarterer, gravity-only looper and gravity-only strong-vertical/teal engineering cases.
- The pack requires slow-motion, scrub and frame-step review plus explicit interrogation of geometry, projection, ballistics, gun/method labelling, narrative and uncertainty disclosure.
- It states the current scientific boundaries and explicitly excludes rabbit and unsupported realistic clay/teal/dense-cloud claims.
- It defines a structured adversarial feedback log with severity/category/frame/evidence fields.
- The complete P3–P10 regression suite remains green at the pack head.

## P11 go/no-go status
No external expert review evidence exists in the durable repository state. The programme explicitly forbids self-awarding expert approval. Therefore P11 cannot progress to expert-reviewed PASS autonomously.

## Exact external dependency
Obtain adversarial review from one or more suitably experienced clay-shooting experts/coaches of the four canonical debug cases in `docs/physics/EXPERT_VALIDATION_PACK_v1.md`, using the browser debug views and frame-by-frame telemetry. The returned review must identify any BLOCKER/MAJOR geometry, timing, projection, method or narrative errors and distinguish observation/experience/source evidence where possible.

At minimum the reviewer must assess:
- flat crosser engineering intercept and apparent lead relationship;
- quarterer changing-range/apparent-speed behaviour;
- looper rise/apex/descent geometry under its explicitly gravity-only scope;
- strong-vertical/teal engineering geometry under its explicitly gravity-only/powered-rise-HOLD scope;
- whether any displayed bore behaviour could be mistaken for a source-supported coaching method that is not numerically implemented;
- shot versus pellet-arrival/break timing and any frame-level contradiction.

## Parallel real-data dependency retained from P10
Realistic clay aerodynamic validation still additionally requires a provenance-complete capture campaign meeting `docs/physics/REAL_DATA_CALIBRATION_PROTOCOL_v1.md` with fit/held-out validation separation. That absence does not prevent expert review of the bounded engineering proofs, but it does prevent promotion of those proofs to realistic-clay certification.

## Downstream impact
- P12 Controlled Playbook Migration: **NOT AUTHORISED** until P11 expert review is returned and resolved.
- P13 Coaching-Video Interpretation Integration: not authorised as a validated product interpretation layer.
- P14 final release audit: not reachable.

## Recovery instruction
When expert feedback becomes durably available, resume at P11 only. Log each criticism, classify impact, repair and rerun the affected numerical/rendered gates. If BLOCKER/MAJOR issues are resolved or safely held, checkpoint the resulting expert-reviewed P11 outcome before P12.
