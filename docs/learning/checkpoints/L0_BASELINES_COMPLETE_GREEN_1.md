# L0 Containment and Baselines — Complete Green Checkpoint 1

Date: 2026-09-05
Branch: `virtual-shooter-v1`
Status: VERIFIED GREEN

## Governing rule

**ORACLE KNOWS. SHOOTER PERCEIVES, BELIEVES, ACTS, REMEMBERS AND LEARNS.**

## Completed

- Preserved the hard ShooterObservation allow-list and recursive privileged-state leak guard.
- Added `learning/naive-shooter-v1.mjs` as a learner-facing no-learning baseline with **no physics/oracle imports**.
- The naive shooter consumes only delayed/noisy angular observations and public camera orientation, extrapolates apparent motion to a fixed public L0 decision time, and points at that apparent target location. It receives no ballistic lead, intercept, range or pellet timing.
- Added `learning/oracle-evaluation-v1.mjs` as a referee-side-only evaluation facade.
- Added an exact linear closest-approach centreline evaluator for the inherited constant-speed pellet / constant-velocity target engineering world.
- Added a privileged oracle ceiling action that uses the inherited engineering intercept only as hidden theoretical reference.
- Added a 12-presentation hidden crosser baseline bank spanning both directions, multiple ranges/heights and target speeds.
- Added structural source guard proving the learner-facing naive policy does not import `../physics/` or the oracle evaluator.
- Added `tests/virtual-shooter-baselines-v1.mjs` and required it in the virtual-shooter CI workflow.

## CI verification

Workflow: `ShotSight virtual shooter`
Run: `33934626898`
Head: `46af642274e93e5c21e3bf790c33e4450d73cf76`
Job: `containment-and-baselines`
Conclusion: **SUCCESS**

Both suites passed:
- L0 oracle/shooter information boundary;
- L0 oracle ceiling and naive shooter baselines.

## Baseline result

Scoring status is deliberately named:
`ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY`

Target sensitivity radius: `0.055 m` (half of the 110 mm standard clay diameter; geometric disc proxy only).

### Privileged oracle ceiling
- n = 12
- proxy hits = 12 / 12
- proxy hit rate = 1.000
- mean centreline miss distance = `6.89e-10 m`
- max centreline miss distance = `1.02e-9 m`

### Naive perception-limited no-learning shooter
- n = 12
- proxy hits = 0 / 12
- proxy hit rate = 0.000
- mean centreline miss distance = `1.4875 m`
- max centreline miss distance = `2.3632 m`

## Scientific interpretation

This is a useful baseline, not a failure. The untrained shooter is very far below the privileged ceiling when it simply points at an extrapolated apparent target location. This demonstrates that the current boundary has not trivially leaked the ballistic solution and leaves a large measurable learning problem for later stages.

The L0 55 mm radius is only a sensitivity proxy. ISSF technical specifications give standard clay diameter as 110 mm ±1 mm, but the current evaluator does **not** model target orientation, pellet cloud density, pellet energy or breakability. Therefore proxy-hit must not be described as real break probability.

## Safeguards retained

- `oracle-evaluation-v1.mjs` is referee-side only.
- learner-facing policy modules may not import physics/oracle modules.
- no direct reward for oracle lead or miss-vector closeness during action selection.
- no real-world clay-flight certification claim.
- no real-world shot-cloud/breakability claim.
- fixed public L0 decision time is an experimental isolation device, not a learned break-point policy.

## L0 gate status

Stage L0 requirements are satisfied:
- branch-local durable state/checkpoints: PASS
- anti-cheat boundary frozen/tested: PASS
- privileged oracle ceiling: PASS
- naive human-observation baseline: PASS
- structural oracle/shooter separation: PASS
- quantitative baseline gap established: PASS

## Next verified action

Advance to **L1 — Perception-only target reading**.

First L1 tranche should keep the gun absent and train/evaluate a belief over stable crossers from short delayed/noisy observation windows. It must predict apparent direction/speed/path uncertainty from shooter-safe evidence, report calibration rather than classification accuracy alone, and include information-reduction probes (shorter windows/noisier observations) so performance degrades plausibly rather than revealing a hidden oracle leak.
