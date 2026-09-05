# L1 Selective Wait Decision — Green Checkpoint 1

Date: 2026-09-05
Branch: `virtual-shooter-v1`
Status: GREEN — CALIBRATED UNCERTAINTY CAN DRIVE USEFUL SELECTIVE WAITING

## Governing question

Can the perception-limited virtual shooter recognise that a short/poor target read is ambiguous and decide to wait for more visual information, without receiving the oracle family, exact trajectory, range, intercept or lead?

## Information boundary

- Runtime family/path beliefs are still formed only from `ShooterObservation` histories.
- The runtime WAIT/COMMIT policy receives only calibrated target-family probabilities derived from that belief.
- Oracle target family and hidden trajectory are used only after the decision for scoring.
- The learner-side `multifamily-belief-v1.mjs` still imports no physics, oracle-evaluation or referee evaluation module.
- Training, calibration and held-out target banks are separate.

## Partitions

- Family-prototype training: 270 presentations (90/family).
- Probability/policy calibration: 360 presentations (120/family).
- Untouched held-out evaluation: 720 presentations (240/family).

The difficult starting condition deliberately uses a 220 ms observation window with degraded angular noise/acquisition quality. Those numerical conditions remain `SHOTSIGHT_HYPOTHESIS`, not claims about universal human visual timing.

## Family probability calibration

A single temperature parameter was fitted on the separate calibration partition only.

- fitted temperature: **1.90**
- calibration ECE: **0.0131**
- held-out initial ECE: **0.0336**
- held-out initial accuracy: **0.4514**
- held-out initial mean confidence: **0.4178**

This is a useful calibration result: on the deliberately poor 220 ms view the model is weak, and its confidence remains correspondingly modest rather than pretending certainty.

## Value of additional information on held-out targets

| Observation decision | Overall accuracy | Crosser/quarterer accuracy | Azimuth future-path RMSE | Elevation future-path RMSE |
|---|---:|---:|---:|---:|
| Commit immediately | 0.4514 | 0.1792 | 0.01025 rad | 0.01254 rad |
| Wait 50 ms | 0.5083 | 0.2625 | 0.00887 rad | 0.00905 rad |
| Wait 100 ms | 0.7667 | 0.6521 | 0.00860 rad | 0.00325 rad |
| Wait 150 ms | 0.7736 | 0.6625 | 0.00773 rad | 0.00281 rad |

The main information gain occurs by roughly +100 ms in this provisional target/observation world. The extra 50 ms from +100 to +150 ms adds comparatively little family-recognition benefit. This is an experimental result, NOT a prescription that a human shooter should always wait 100 ms.

## Selective WAIT_FOR_MORE_INFORMATION policy

The first unconstrained policy exposed a genuine failure: it learned to wait on every held-out target. That is information-seeking but not selective behaviour, and CI correctly rejected it.

The policy-fitting gate was then strengthened rather than weakened. A candidate policy must now satisfy:
- mean calibration wait <= 105 ms;
- calibration wait rate between 15% and 85%;
- maximise calibration accuracy subject to those constraints;
- ties favour less waiting.

The fitted policy used:
- first calibrated-confidence threshold: **0.42**;
- second threshold after the first wait: **0.46**;
- maximum wait: **150 ms**;
- runtime inputs: calibrated family probabilities only.

On the untouched held-out bank:
- overall accuracy: **0.5375** vs 0.4514 immediate;
- crosser/quarterer accuracy: **0.3063** vs 0.1792 immediate;
- wait rate: **0.3278**;
- mean wait across all targets: **0.0492 s**;
- accuracy on targets the policy chose to wait for: **0.7076**;
- azimuth future-path RMSE: **0.00786 rad** vs 0.01025 immediate;
- multiclass Brier: **0.6197** vs 0.6466 immediate.

Therefore the belief can identify a subset of low-information presentations for which delaying commitment is disproportionately valuable. This is the first useful evidence of an active-perception behaviour: uncertainty changes what the shooter does next.

## CI verification

Workflow: `ShotSight virtual shooter`
Run: `33943317943`
Head: `e1030268d0b65cfe097488dcf32bc9994827c24c`
Conclusion: **SUCCESS**

All prior L0/L1 gates and the new calibrated selective-wait gate passed.

## Negative findings / limits

1. The unconstrained first wait-policy attempt degenerated into WAIT-ALL and failed CI. This is preserved as a negative finding rather than erased.
2. Always waiting 100 ms currently beats the selective policy on pure classification accuracy. The selective policy matters because later shooting stages must trade information gain against loss of useful engagement time; L1 cannot yet establish the optimal shooting-time tradeoff.
3. Temperature scaling is a global calibration repair, not a rich heteroscedastic target-family belief model.
4. Initial probabilities on the poor-acquisition condition remain tightly clustered around modest confidence. Low ECE means honesty about current ability, not strong discrimination.
5. The 220/50/100/150 ms timings and noise levels are provisional experimental conditions. They are not evidence-backed human reaction prescriptions.
6. The looper world remains an easy gravity-only engineering toy. Real-clay looper understanding is not established.
7. The inherited physics programme still explicitly holds realistic-clay aerodynamics, dense shot-cloud realism and expert method kinematics pending external/real-data validation.

## L1 decision

**CLOSE L1 as a perception architecture gate.**

Reason: the system now (a) forms multi-family beliefs from observation only, (b) exposes genuine ambiguity, (c) calibrates its uncertainty on a separate partition, (d) transfers that calibration to held-out targets, and (e) uses uncertainty to make a useful held-out WAIT/COMMIT decision without oracle access.

This does NOT mean the shooter understands real clay flight. It means the perception/belief architecture is sufficiently honest and useful to begin L2 planning experiments.

## Next action — L2

Begin `L2_SOURCE_PRIORS_AND_PLAN_VARIABLES_FOUNDATION`.

Implement explicit learner-side planning variables for:
- visual pickup region;
- gun hold region;
- target/barrel pickup or connection region;
- intended break region;
- expected target line / move tempo;
- chosen method as a planning option only where appropriate.

Seed those variables with evidence-labelled CPSA / Ben Husthwaite / Don Currie priors, while retaining blank-slate controls and coach-specific alternatives. The first L2 test must evaluate whether a plan creates useful acquisition/runway/control from the perception-limited belief, not whether it matches an oracle intercept. No exact lead or hidden future trajectory may enter the learner plan.
