# L2 Held-Out Planning Adaptation — Green Checkpoint 1

Date: 2026-09-05
Branch: `virtual-shooter-v1`
Status: GREEN — PERCEPTION-SENSITIVE, METHOD-DISTINCT PLANNING REPRESENTATION; NOT YET A SHOOTING-SUCCESS GATE

## Governing question

Can the perception-limited shooter turn an uncertain target belief into explicit pickup / hold / connection / break planning that changes sensibly with information quality, while remaining distinct across the three method families and without seeing oracle intercept/lead?

## Verification

GitHub Actions run `33945907666` completed **SUCCESS**. All existing L0/L1 safeguards passed, followed by:
- `virtual-shooter-shot-plan-v1`: PASS
- `virtual-shooter-planning-evaluation-v1`: PASS

## Held-out benchmark

Partitions:
- family-prototype training: 270 presentations;
- held-out crosser bank: 120 presentations;
- three method plans per crosser = 360 plans per observation condition.

The planner consumed real `MULTIFAMILY_BELIEF_V1` outputs created from shooter observations. Oracle truth was not used to construct or score the plan.

### Information quality

- CLEAR mean belief confidence: **0.4997**
- POOR mean belief confidence: **0.1535**
- CLEAR mean changing-path evidence: **0.2688**
- POOR mean changing-path evidence: **0.7666**

The poorer visual condition therefore arrived at L2 with appropriately weaker/more unstable beliefs rather than hidden oracle certainty.

### Source-informed planning coordinates

These are normalised SHOTSIGHT_HYPOTHESIS planning coordinates, not physical distances, human timing prescriptions or lead values.

| Method | Clear hold | Clear connection | Clear break | Poor hold | Poor connection | Poor break |
|---|---:|---:|---:|---:|---:|---:|
| Swing-through | 0.2377 | 0.5408 | 0.9161 | 0.2531 | 0.5815 | 0.9635 |
| Pull-away | 0.3377 | 0.6408 | 0.9361 | 0.3531 | 0.6815 | 0.9686 |
| Maintained lead | 0.4577 | 0.7008 | 0.9361 | 0.4731 | 0.7415 | 0.9686 |

The source-informed representation therefore responds to degraded perception by delaying commitment/connection and retains method-distinct plan geometry. The blank-slate control remains at 0.25 / 0.50 / 0.75 and method-agnostic by design.

## Important negative findings

### 1. The internal structure proxy must NOT be treated as a success score

The neutral blank-slate control scores **0.6831** on the current structure-only control proxy, while the source-informed plans score lower (clear: Swing 0.6677, Pull-away 0.6536, Maintained 0.6192). This is useful evidence that the proxy is only a bookkeeping/structure measure. It is not evidence that blank-slate shooting is superior, and it must not be optimised as a surrogate for breaks.

The programme must preserve this result rather than altering the proxy to make coaching priors look better.

### 2. Low uncertainty confidence currently drives the planned break excessively late

Under the poor visual condition, the source-informed break coordinate moves to about **0.9635–0.9686**. That may leave insufficient remaining opportunity once a finite gun/motor model is introduced. The current rule "uncertain -> delay connection/break" is therefore incomplete: a real shooter must trade information gain against available runway and break opportunity.

### 3. The present L2 coordinate system is too local for a true pre-call shooting plan

`shot-plan-v1` currently maps pickup/hold/connection/break onto the belief model's short **0.12 s prediction horizon**. This is adequate to prove the anti-leakage representation, but scientifically weak as a model of how a human plans a whole presentation before calling for the target. A shooter can know broad launch region/direction and intended break area before the target appears; pickup/hold/break should therefore live in a presentation-level shooter-visible context, not merely a local 120 ms extrapolation.

This limitation is now a required repair before motor/trigger learning. Do not cosmetically proceed into L3 with the local-horizon plan.

## Decision

**L2 foundation is green, but L2 is NOT complete.**

The planner passes containment, topology, held-out adaptation and method-distinction gates. However, its coordinate frame must be upgraded from short-horizon local prediction to a shooter-visible presentation-level plan that can explicitly price information versus remaining opportunity.

## Next action

Implement `SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1` and a presentation-level planning coordinate that may contain only things a shooter could plausibly know before/during the target: coarse expected launch/visual-pickup region, expected direction/family prior if demonstrated, coarse usable flight-line/runway, intended break-zone prior, and current elapsed/remaining opportunity estimate derived from visible context. It must NOT expose exact range, hidden XYZ, true future target path, pellet TOF, metric lead or oracle intercept.

Then rerun held-out source-prior vs blank-slate experiments and explicitly test the value-of-information versus remaining-runway tradeoff. Only after that gate is green should L2 hand plans to the finite motor model.
