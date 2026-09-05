# L2 Presentation-Level Planning — Complete Architecture Gate

Date: 2026-09-05
Stage: L2 — pickup / hold / connection / break planning
Status: COMPLETE_GREEN_PRESENTATION_LEVEL_PLANNING_ARCHITECTURE_NOT_SHOOTING_SUCCESS
Verified CI run: 33949190178
Verified branch SHA: dc05296156016a25b3769d663d81526bdeb93efe

## Gate conclusion

L2 is complete as a planning-architecture gate. Ellis can now form pickup / gun-hold / connection / intended-break plans on a whole shooter-visible presentation coordinate rather than incorrectly mapping the entire target onto the 0.12 s local belief prediction horizon.

The learner runtime boundary remains intact: planning consumes only delayed/noisy shooter observations, `MULTIFAMILY_BELIEF_V1`, coarse stand/demonstration knowledge and cumulative shooter-visible presentation context. Exact target XYZ, exact velocity magnitude, hidden range, future trajectory, pellet time-of-flight, metric lead and oracle intercept remain unavailable to Ellis.

This gate does NOT establish that any source-informed plan breaks a clay. No gun is moving and no shot outcome is used to choose the plan here. Source-informed CPSA/Husthwaite/Currie values remain testable priors and the blank-slate plan remains an essential control.

## Whole-presentation representation

`SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1` preserves two distinct kinds of memory:
1. a short recent working window used for target belief; and
2. cumulative observed angular travel since a nominal first-clear-sight epoch, used to estimate how much of the presentation has already been consumed.

This separation prevents the rolling belief window from erasing the shooter's memory of presentation progress. Remaining runway is derived only from observed angular travel relative to a coarse demonstrated presentation span, never from oracle time-to-intercept.

Current stand/presentation constants — first-clear-sight epoch, expected presentation duration, demonstrated angular span, break-window coordinates and runway costs — remain explicit `SHOTSIGHT_HYPOTHESIS` engineering parameters pending real video/Sense calibration.

## Value of more visual information

The first wait-value model used scalar confidence gain and was rejected. It selected +50 ms almost universally on early poor reads and produced only 18.75% held-out family-reading accuracy versus 43.125% for a fixed +100 ms observation. This exposed that confidence gain is not equivalent to decision-quality gain.

The accepted calibration-only model instead estimates expected reduction in multiclass Brier loss from another 50/100/150 ms of observation. Runtime receives only current belief confidence and shooter-visible runway; held-out labels and oracle actions never enter the runtime decision.

On 160 held-out crossers under the poor early-read condition:
- immediate family-reading accuracy: 16.25%
- runway-aware accuracy: 51.25%
- fixed +100 ms accuracy: 43.125%
- early wait rate: 100%
- early mean wait: 144.7 ms

With the same poor belief quality later in the observed presentation:
- wait rate fell to 73.125%
- mean wait fell to 94.4 ms

Thus the same uncertainty can produce different behaviour depending on remembered available runway. This is an architecture result only; these timing values are not human prescriptions.

## Whole-presentation shot-plan behaviour

`PRESENTATION_LEVEL_SHOT_PLAN_V1` anchors the source-informed plan on the whole presentation:
- swing-through: hold 0.22, planned connection 0.50, intended break 0.86
- pull-away: hold 0.32, planned connection 0.60, intended break 0.88
- maintained lead: hold 0.44, planned connection 0.66, intended break 0.88
- blank-slate control: hold 0.25, planned connection 0.50, intended break 0.75

These coordinates are `SHOTSIGHT_HYPOTHESIS` planning priors, not proven good shooting values.

Crucially, low confidence no longer pushes the intended break later. Instead, low confidence can create an explicit need for more information while sufficient runway exists. If the observed target has already passed the planned connection region, the planner reports `connectionAlreadyPassed` and may force only the effective live connection later; it does not rewrite the original plan or fabricate a later ideal break point.

Example pull-away synthetic gate:
- early poor state at progress 0.34: planned connection 0.60, intended break 0.88, remaining pre-break runway 0.54, information need = `CONSIDER_MORE_OBSERVATION`.
- genuinely compressed state at progress 0.76: original planned connection remains 0.60, effective connection becomes 0.775 because the planned connection is already lost, intended break remains 0.88, remaining runway 0.12, information need becomes `COMMIT_OR_REPLAN_WITH_CURRENT_INFORMATION`.

## Held-out population gate

Population: 270 family-training presentations and 180 held-out crossers. Each condition generated 540 plans across the three methods.

Early clear condition:
- mean confidence: 0.5167
- mean current progress: 0.3517
- source intended breaks remain 0.86 / 0.88 / 0.88
- information-need rate: 0 for all three methods

Early poor condition:
- mean confidence: 0.14985
- mean current progress: 0.35147
- intended breaks remain exactly 0.86 / 0.88 / 0.88 despite low confidence
- information-need rate: 1.0 for all three methods
- no presentation compression yet

Later poor condition:
- mean confidence: 0.15075
- mean current progress: 0.49010
- intended breaks still remain exactly 0.86 / 0.88 / 0.88
- observed progress increasingly consumes planned connection runway:
  - swing-through connection-passed rate: 43.33%; mean effective connection 0.5463
  - pull-away connection-passed rate: 15.56%; mean effective connection 0.6138
  - maintained-lead connection-passed rate: 7.78%; mean effective connection 0.6657
- compressed/critical runway appears in 5–6.1% of cases and begins suppressing indefinite information seeking.

This demonstrates the required qualitative distinction: uncertainty changes whether Ellis wants more information; elapsed presentation changes whether he still has the opportunity to obtain it and execute the original plan.

## Negative findings preserved

1. The original L2 planner's 0.12 s local planning coordinate was conceptually wrong for pre-call sporting target planning.
2. A rolling 220 ms context window erased remembered presentation progress and was rejected.
3. Scalar confidence gain was a misleading surrogate for information value and was rejected in favour of calibration Brier-loss improvement.
4. An early test incorrectly demanded mixed WAIT/COMMIT behaviour even when every poor-read target rationally justified waiting; the test was corrected rather than tuning behaviour to pass.
5. A later unit probe incorrectly called 21% remaining runway 'compressed'; the probe was moved to a genuinely compressed presentation rather than modifying the model to satisfy an inconsistent assertion.
6. The old internal plan-structure proxy favoured the blank-slate plan over source priors. It remains bookkeeping only and is prohibited as a success objective.
7. No Brett Winstanley hold/pickup/break claim has been promoted without a recovered primary instructional source.

## L2 completion boundary

L2 is green because the representation and decision boundaries are now scientifically coherent enough to hand a plan to a motor model. It is not green because source-informed plans have been shown superior, and it is not evidence that Ellis can break clays.

The next gate is the first physically constrained gun stage: implement a finite-latency, finite-angular-velocity, finite-angular-acceleration and finite-jerk gun/shooter plant driven only by Ellis's plan and live apparent-angle state. The plant must make missed connection/runway visible rather than teleporting to the plan. No ballistic intercept may be used by the motor controller. Initial motor constants are provisional until video/Sense calibrates them.
