# L2 Presentation Context / Runway — Green Checkpoint 1

Date: 2026-09-05
Stage: L2 — pickup / hold / connection / break planning
Status: PARTIAL L2 GATE GREEN; L2 NOT COMPLETE
Verified CI run: 33948921738
Verified branch SHA: 517181462b062ffbdf904cd4d367f92a2ef81b70

## What is now implemented

`SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1` separates a short recent belief window from remembered whole-presentation progress. The learner may retain a coarse stand/demonstration prior (broad direction, demonstrated family distribution, approximate presentation duration/angular span and a fuzzy intended break window) plus cumulative ShooterObservation history. Current-target XYZ, velocity magnitude, range, future trajectory, pellet time-of-flight, metric lead and intercept remain hidden.

Whole-presentation progress is inferred from angular travel that Ellis has actually observed since a fixed nominal first-clear-sight epoch, relative to the coarse demonstrated span. This is deliberately not oracle time-to-intercept. The current 0.20 s first-clear epoch, 0.95 s presentation duration, 0.62 rad demonstrated span, 0.70–0.90 break-window coordinates and all runway cost constants are `SHOTSIGHT_HYPOTHESIS` engineering values, not human prescriptions.

A calibration-only `WAIT_INFORMATION_MODEL_V1` estimates the expected decision-quality benefit of seeing another 50/100/150 ms. Runtime waiting receives only current belief confidence plus shooter-visible estimated runway. Calibration labels may teach the expected value of additional observation, but held-out outcomes and oracle actions are unavailable at runtime.

## Important failed attempts / negative findings retained

The first CI version failed because it artificially required the early policy to both WAIT and COMMIT. On genuinely poor early reads, waiting can rationally dominate. The scientific gate was corrected to require waiting to be suppressed as the observed presentation consumes runway rather than forcing an arbitrary early action mixture.

More importantly, the first whole-presentation implementation used the same rolling 220 ms observation window for both target belief and presentation progress. That caused Ellis to forget how much target travel had already passed. This was repaired by preserving cumulative visible progress from the first-clear-sight epoch while allowing the belief estimator itself to retain a short recent working window.

A second, deeper negative finding came from the first green version: expected confidence gain was a poor proxy for information value. It selected a 50 ms wait on every early target and achieved only 18.75% held-out family accuracy, while a fixed 100 ms wait achieved 43.125%. The reason is that additional observation can substantially improve classification even when the model's scalar confidence barely increases. The policy was therefore redesigned to value expected reduction in multiclass Brier loss learned on calibration targets. This is the accepted model going forward.

## Final verified held-out benchmark

Partitions: 270 family-training presentations; 100 calibration crossers for value-of-information fitting; 160 untouched held-out crossers.

Calibration expected decision-quality gain for the low-confidence bin:
- +50 ms: 0.06611 Brier-loss improvement
- +100 ms: 0.16008
- +150 ms: 0.20613

Early poor-read held-out condition:
- immediate family-reading accuracy: 0.1625
- runway-aware accuracy: 0.5125
- fixed +100 ms accuracy: 0.43125
- wait rate: 1.0
- mean wait: 0.14469 s
- mean initial confidence: 0.15062
- mean selected confidence: 0.18286
- mean remaining progress to break-window start: 0.34996
- mean remaining progress to break-window end: 0.54996

Later same-quality-read probe:
- wait rate: 0.73125
- mean wait: 0.09438 s
- mean remaining progress to break-window start: 0.21166
- mean remaining progress to break-window end: 0.40973
- mean confidence: 0.15160

Thus the same low-confidence state is treated differently depending on remembered presentation progress: more observation is bought early when runway is available, while information seeking is suppressed later as the intended break opportunity approaches. This is the intended architecture-level behaviour.

## Scientific interpretation

This is NOT evidence that Ellis can shoot, and it is not evidence that any particular wait time is a correct human value. No gun is moving and no break is being scored in this gate. It demonstrates only that a perception-limited agent can represent a fuzzy whole presentation and trade expected information quality against diminishing opportunity without access to oracle trajectory/intercept information.

The value model is currently fitted only on crosser calibration presentations because the existential experiment begins with crossers. It must later be expanded/validated for mixed target families. The current stand prior is an engineering proxy for what a shooter learns from seeing a demonstration/knowing the stand; later Sense/video data should calibrate its actual structure.

## Next required gate

L2 remains open. Integrate `SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1` into the actual pickup/hold/connection/break planner so its planning coordinates describe the whole shooter-visible presentation, not the local 0.12 s belief prediction horizon. Preserve source-informed CPSA/Husthwaite/Currie priors as testable priors versus blank-slate controls. Then run a held-out benchmark showing that the planner respects consumed runway and does not move break points absurdly late merely because uncertainty is high. Only after that presentation-level planner is green may L2 hand off to the finite motor/gun stage.
