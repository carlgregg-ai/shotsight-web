# ShotSight Physics & Kinematics Specification v1

Date: 2026-09-04
Stage: **P2 — IN PROGRESS**
Status: architecture specification; production simulator remains unauthorised until P2 exit review passes.

## 1. Purpose

This specification defines the mathematical contracts from which ShotSight target, gun, ballistic, narrative and rendering state will be generated. It intentionally carries unresolved physical quantities as explicit inputs with provenance/uncertainty rather than assigning visually convenient defaults.

The core invariant is:

> **The model creates the animation. The animation never creates the model.**

No renderer may create an independent physical path, lead value, shot time or gun-target timing relationship.

---

## 2. Units and numerical conventions

### 2.1 Internal units

All physics-engine internal values use SI:

- length: metres (`m`)
- time: seconds (`s`)
- mass: kilograms (`kg`)
- velocity: metres/second (`m/s`)
- acceleration: metres/second² (`m/s²`)
- force: newtons (`N`)
- moment/torque: newton-metres (`N·m`)
- angles used by solvers: radians (`rad`)
- angular velocity: radians/second (`rad/s`)
- angular acceleration: radians/second² (`rad/s²`)
- density: kilograms/metre³ (`kg/m³`)

UI may display yards, feet, mph, fps or degrees, but conversion occurs at the presentation boundary only.

### 2.2 Numeric type

Reference implementation uses IEEE-754 double precision (`Number` in JavaScript) unless later evidence shows a precision need. All state values must be finite; NaN/Infinity is a hard simulation failure.

### 2.3 Time

There is one monotonically increasing simulation time `t` in seconds. Every state consumer receives the same `t`.

---

## 3. World frame

### 3.1 Right-handed Cartesian world

Use a right-handed shooter-centric frame `W`:

- origin `O_W`: nominal shooter eye position projected to the world reference origin for a scenario;
- `+X_W`: shooter’s right;
- `+Y_W`: forward/downrange along the scenario reference heading;
- `+Z_W`: vertically upward.

Thus `X × Y = Z` under the chosen basis orientation after formal implementation check. If implementation math libraries use a different handedness, an explicit transform is mandatory; silent axis reinterpretation is forbidden.

### 3.2 Positions and vectors

World position: `r_W = [x,y,z]^T` in metres.

World translational velocity: `v_W = dr_W/dt`.

World acceleration: `a_W = dv_W/dt`.

Gravity:

`g_W = [0, 0, -g]^T`, with `g = 9.80665 m/s²` as standard gravity unless a scenario intentionally supplies another documented value.

### 3.3 Scenario heading

Sporting labels such as left-to-right crosser are metadata derived relative to the shooter/world frame. They do not alter the coordinate system.

---

## 4. Reference frames

### 4.1 Target body frame `B_T`

Origin at target centre of mass. Body axes must be documented per target geometry. For axisymmetric disc targets:

- `z_T`: nominal symmetry/spin axis;
- `x_T`,`y_T`: orthogonal axes in the target plane.

Attitude is represented internally by a unit quaternion `q_WT` mapping target-body vectors to world vectors. Euler angles may be displayed but are not solver state because of singularities.

Angular velocity `omega_T` is stored in target body frame unless an implementation function explicitly says otherwise.

### 4.2 Shooter eye/camera frame `C`

A camera/eye frame is a rigid transform from world:

`T_CW = {R_CW, p_CW}`.

Camera optical convention is defined at the projection module boundary. The module must explicitly document which axis is optical forward and the image-axis directions; no renderer may assume world X/Y equals screen X/Y.

### 4.3 Gun/bore frame `G`

The gun is represented minimally by:

- bore origin `p_G_W(t)`;
- unit bore direction `b_W(t)`.

A complete rigid gun attitude may be added later, but the canonical P5 contract requires at least a continuous unit bore vector and its angular derivatives.

Camera-to-bore calibration is an explicit transform with uncertainty; camera centre/reticle is not automatically identical to the bore ray.

---

## 5. Scenario definition

A scenario is immutable configuration plus provenance:

```text
Scenario {
  id
  targetDefinition
  launchState
  environment
  shooterFrame
  cameraCalibration
  ballisticProviderConfig
  methodConfig
  shotPolicy
  provenance[]
  uncertainty
}
```

No hidden global physics constants other than universally documented mathematical/physical constants are allowed.

---

## 6. Provenance schema

Every nontrivial physical parameter carries:

```text
Parameter<T> {
  value: T | null
  unit
  classification:
    VERIFIED_FACT |
    DERIVED_VALUE |
    CALIBRATED_PARAMETER |
    MODEL_ASSUMPTION |
    SHOTSIGHT_HYPOTHESIS |
    UNKNOWN |
    HOLD
  sourceId | null
  applicability
  uncertainty | null
  notes
}
```

A required numeric parameter with `UNKNOWN` or `HOLD` cannot be silently coerced to a number. Simulation entry must either reject the scenario or use an explicitly named toy/test provider that cannot be shown as realistic instruction.

---

## 7. Target definition and state

### 7.1 Definition

```text
TargetDefinition {
  type
  manufacturer/model if known
  mass_kg
  referenceArea_m2
  diameter_m
  inertiaTensor_B_kgm2 (optional unless rotational model enabled)
  geometry
  aeroModelId
  aeroParameters
  provenance
}
```

### 7.2 Dynamic state

Minimum translational state:

`X_T = {r_W, v_W}`.

Rotationally enabled state:

`X_T6 = {r_W, v_W, q_WT, omega_T}`.

Derived values include speed `|v|`, range from eye/camera, line-of-sight unit vector, azimuth/elevation, apparent angular velocity and target phase metadata.

### 7.3 Launch state

```text
LaunchState {
  t0
  r0_W
  v0_W
  q0_WT (if rotational model)
  omega0_T (if rotational model)
}
```

Launch spin and velocity are independent inputs. A generic “trap power” is not sufficient physical state and cannot directly drive the solver without a calibrated mapping provider.

---

## 8. Environment

```text
Environment {
  gravity_W
  airDensity
  airVelocity_W
  temperature optional
  pressure optional
  humidity optional
  groundPlane optional
}
```

Relative air velocity:

`v_air_W = v_target_W - v_wind_W`.

Atmospheric simplification must be documented per scenario. Air density may be measured, computed by a later atmosphere provider, or use a clearly labelled standard test value; it may not masquerade as measured local conditions.

---

## 9. Target equations of motion

### 9.1 Translation

General form:

`m dv_W/dt = F_gravity_W + F_aero_W + F_other_W`

`dr_W/dt = v_W`.

For test-only ballistic/no-aero target cases:

`F_aero = 0` is allowed only as `TOY_GRAVITY_ONLY`, never as a realistic clay model.

### 9.2 Rotation

When rotational model is enabled:

`I domega/dt + omega × (I omega) = M_aero + M_other`

and quaternion derivative follows the documented body/world angular-velocity convention. Quaternion normalisation drift must be controlled and tested.

### 9.3 Clay aerodynamic contract

P2 authorises a clay-specific provider architecture based on verified precedent, not numerical coefficients:

```text
TargetAeroProvider.evaluate(state, environment, parameters)
 -> {force_W_N, moment_B_Nm, diagnostics}
```

The initial Andert-family provider may support structures equivalent to:

- lift magnitude proportional to `0.5 * rho * A * |v_air|² * C_L`;
- drag magnitude proportional to `0.5 * rho * A * |v_air|² * C_D`;
- `C_L` as an angle-of-attack relation within the validated source range;
- `C_D` as a lift-dependent relation;
- pitch/yaw moments where supplied by verified/calibrated coefficients.

All coefficient values remain required inputs until P3 obtains valid values. The provider must refuse `REALISTIC_CLAY` mode if those required parameters are absent.

---

## 10. Numerical integration contract

### 10.1 Reference integrator

P3 should begin with deterministic fixed-step classical RK4 for transparent convergence testing. Adaptive integration may be added later after parity tests.

Reason: RK4 is sufficiently understandable for engineering audit and allows straightforward step-halving convergence checks without hiding behaviour behind library defaults.

### 10.2 Step policy

The production timestep is **not specified yet**. P3 must determine an adequate step from convergence/error tests. No timestep may be selected solely for animation smoothness.

Render frames interpolate computed physical state; the render framerate never dictates physics timestep.

### 10.3 Required convergence test

For every canonical scenario compare relevant outputs under `dt`, `dt/2`, `dt/4`. Required metrics include position, velocity, attitude where enabled, shot/intercept time and projected angular quantities. P3/P4 must define acceptance tolerance from numerical/error needs rather than choose a percentage to make tests pass.

---

## 11. Shooter-view geometry

For eye/camera origin `p_C_W`, target line of sight:

`l_W(t) = normalize(r_target_W(t) - p_C_W)`.

Range:

`R(t) = |r_target_W(t) - p_C_W|`.

Angular position may be expressed as camera-frame azimuth/elevation after rotation into `C`.

For a target point in camera coordinates `[x_c,y_c,z_c]` under the selected optical convention, perspective projection uses calibrated intrinsics. Canonical pinhole form after convention mapping:

`u = f_x * X/Z + c_x`

`v = f_y * Y/Z + c_y`.

FOV-derived focal length may be used only when sensor/image dimension and FOV convention (horizontal/vertical/diagonal) are known.

Lens distortion is an optional calibrated layer, never guessed.

---

## 12. Apparent angular velocity

The primary shooter-relevant target motion is angular, not pixel speed.

For line-of-sight unit vector `l(t)`, angular velocity can be derived from successive states or analytically from relative position/velocity. A robust vector relation for transverse line-of-sight motion is based on:

`omega_LOS_vector = (r_rel × v_rel) / |r_rel|²`

with magnitude equal to instantaneous angular rate perpendicular to the line of sight under the point-target model.

Implementation must test this against analytic constant-range transverse-motion cases and projection finite differences.

---

## 13. Gun kinematic state

```text
GunState(t) {
  p_bore_W
  b_W            // unit vector
  omega_gun_W
  alpha_gun_W
  methodState
}
```

Bore direction must remain normalised. Angular velocity/acceleration must be derived consistently from orientation/bore state and one master clock.

Screen-space muzzle/aim reference is a projection of the bore ray or a calibrated gun-camera representation; it is not an independently animated point.

---

## 14. Ballistics provider contract

P2 defines architecture but does not authorise incomplete Allen equations.

```text
BallisticProvider {
  id
  provenance
  validDomain
  stateAtTime(shotState, tau, environment)
  timeToRange(shotState, range, environment)
  trajectory(...)
  uncertainty(...)
}
```

`shotState` minimally contains shot origin, bore direction, muzzle speed and pellet physical definition.

Provider modes may include:

- `ANALYTIC_CONSTANT_SPEED_TEST_ONLY` — unit/solver tests only, cannot appear as realistic instruction;
- `FREE_SPHERE_ALLEN` — HOLD until complete primary formula extraction/verification;
- later measured/calibrated sporting-load providers.

Dense-cloud/string effects are separate from the free-sphere provider and must not be implied by its output.

---

## 15. Intercept solver contract

Given candidate shot time `t_s`, the solver finds pellet flight time `tau > 0` and intersection geometry between shot trajectory and target future state at `t_s + tau`.

Conceptually solve residual:

`e(tau) = r_pellet(tau; t_s) - r_target(t_s + tau)`.

For a point-centre canonical solver minimise/root the appropriate transverse/3-D residual under provider constraints. Later target geometry/shot-cloud envelope may define finite intersection tolerance.

The solver returns:

```text
InterceptResult {
  valid
  shotTime
  pelletTOF
  arrivalTime
  targetAtArrival
  pelletAtArrival
  missVector_W
  physicalLeadVector_W
  apparentLeadAngle
  solverResidual
  provider/model provenance
  uncertainty
}
```

A displayed `BREAK` is forbidden unless the active hit model considers the result an intersection/hit.

---

## 16. Physical versus apparent lead

At shot time:

- physical lead is a world-space spatial/vector relationship associated with the target’s future intercept position versus current position/line of sight;
- apparent lead is an angular relationship between target line of sight and bore/intercept line as seen from the shooter.

The canonical angular separation between target LOS `l_T` and bore/intercept direction `b` is:

`theta = atan2(|l_T × b|, l_T · b)`.

Signed lead for a 2-D display requires a documented screen/tangent-plane basis; sign cannot come from arbitrary SVG X direction.

---

## 17. Method-provider contract

A shooting method does not alter target physics or pellet physics. It supplies a desired/controlled gun orientation history that reaches a physically valid shot/intercept relationship.

```text
MethodProvider {
  id
  sourcePermission
  applicability
  initialise(scenario)
  desiredGunState(t, targetState, interceptState, priorState)
  eventState(...)
  invariants(...)
}
```

Initial P6 qualitative state families:

- pull-away;
- swing-through;
- maintained lead;
- source-specific variants only after evidence permission.

Numerical timing, acceleration and tolerance parameters are required/calibrated inputs unless independently verified. The renderer cannot invent them.

---

## 18. Event/narrative state

All events are defined against the same simulation time. Candidate event types:

`RELEASE`, `TARGET_VISIBLE`, `VISUAL_PICKUP`, `GUN_START`, `INSERTION`, `CONNECTION`, `SPEED_MATCH`, `PASS_THROUGH`, `SEPARATION_BUILD`, `BREAK_WINDOW`, `SHOT`, `PELLET_ARRIVAL`, `HIT`, `BREAK`, `FOLLOW_THROUGH`.

Events have machine-verifiable predicates where physical meaning exists.

Examples:

- `SPEED_MATCH`: requires `|omega_gun - omega_target_LOS|` within a method-specific validated tolerance; tolerance currently unresolved.
- `SEPARATION_BUILD`: signed apparent separation derivative has the required positive direction for the selected method.
- `PASS_THROUGH`: signed relative angular coordinate crosses zero under the selected presentation basis.
- `PELLET_ARRIVAL`: `t = shotTime + TOF`.
- `BREAK`: cannot precede `PELLET_ARRIVAL` and requires active hit-model success.

If a predicate cannot yet be quantified because tolerance is unknown, the event remains non-production/HOLD rather than using an arbitrary threshold.

---

## 19. Master simulation state

Single call contract:

```text
SimulationState simulate(t)
```

returns:

```text
{
  t,
  target,
  targetDerived,
  gun,
  ballistic,
  intercept,
  narrative,
  projection,
  diagnostics,
  provenance,
  uncertainty
}
```

The Playbook renderer, debug view and eventual video-fitting code consume this state. None runs its own clock.

---

## 20. Rendering boundary

Renderer responsibilities:

- map validated projection state to pixels;
- interpolate between simulation samples in a way that preserves the sampled physical path;
- draw target, bore/aim reference, paths, break and debug overlays;
- support play/pause/scrub/slow-motion.

Renderer is forbidden to:

- alter shot time;
- change target/gun relative phase;
- introduce additional lead;
- independently ease target versus gun motion;
- move break point for composition;
- invent target path splines as physical source data.

If visual smoothing is used, target and gun must be evaluated/interpolated at the same simulation time.

---

## 21. Determinism and replay

Given identical scenario, parameter set, solver version and time sequence, simulation outputs must be identical within deterministic floating-point behaviour. Randomness (future pattern/break fragments) requires explicit seed and cannot alter the deterministic centre/intercept state.

---

## 22. Uncertainty architecture

Uncertainty is not cosmetic metadata. At minimum the system distinguishes:

1. input measurement uncertainty;
2. calibrated parameter uncertainty;
3. model-form uncertainty;
4. numerical error;
5. projection/calibration uncertainty;
6. method/coach variability.

P2 does not prescribe a universal propagation algorithm. P3/P4 should initially expose these categories and calculate numerical convergence separately. Monte Carlo/linear propagation may be added only with documented assumptions.

Any displayed precision must not exceed credible model/input precision.

---

## 23. Test architecture required by this specification

### 23.1 Unit/dimensional tests

- SI conversion round trips;
- vector/quaternion normalisation;
- force→acceleration dimensions;
- moment→angular-acceleration dimensions;
- projection unit sanity;
- time relationships.

### 23.2 Analytic toy cases

- stationary target;
- constant-velocity target with no gravity/aero;
- gravity-only projectile target against closed-form parabola;
- constant-speed pellet against stationary/moving target where analytic intercept exists;
- constant-range transverse target angular-rate case;
- mirrored left/right geometry.

Toy providers must be visibly and programmatically marked `TEST_ONLY`.

### 23.3 Numerical tests

- RK4 convergence;
- no state discontinuity;
- no NaN/Infinity;
- quaternion norm control;
- energy trend sanity for gravity-only and drag cases;
- deterministic replay.

### 23.4 Shared-clock tests

At any render timestamp target, gun, narrative and ballistic values must carry identical simulation `t`. Loop restart resets all state; there is no independent animation phase.

---

## 24. Canonical-case data policy

A canonical case is a complete parameter set with provenance. It may be:

- `ANALYTIC_TEST` — constructed to verify math;
- `MEASURED_CALIBRATION` — fitted to measured data;
- `SOURCE_REFERENCE` — uses complete source-backed parameter set;
- `INSTRUCTIONAL_VALIDATED` — has passed physics, method, narrative and expert/product gates.

A case cannot be promoted directly from `ANALYTIC_TEST` to instructional merely because its movement looks realistic.

---

## 25. Deliberate v1 exclusions / holds

The following are not silently approximated in the initial canonical engine:

- rabbit ground contact;
- complete dense-shot-cloud/string model;
- hit probability from choke/pattern;
- generic trap-power→launch-state function;
- generic release-spin default;
- unverified clay aerodynamic coefficients;
- unverified expert gun acceleration/timing distributions;
- monocular video depth recovery without calibration.

---

## 26. P2 dimensional/adversarial review checklist

Before P2 can complete, independently inspect this specification for:

- right-handed frame correctness and cross-product sign;
- body/world quaternion convention ambiguity;
- force and moment units;
- Andert yaw/spin formula transcription boundary (architecture only until source check);
- LOS angular-rate formula convention;
- camera optical-axis convention completeness;
- intercept residual definition for non-straight pellet trajectories;
- distinction between bore direction at shot and target current/future LOS;
- method state not contaminating physical intercept;
- event predicates not using unresolved arbitrary tolerances;
- all realistic providers failing closed when required parameters are unavailable.

Any ambiguity found must be corrected before checkpointing P2 COMPLETE.

## 27. P2 current status

**IN PROGRESS.** Core architecture is now specified. Next action is an adversarial/dimensional review, correction of coordinate/camera/quaternion conventions, then a P2 completion checkpoint if no unresolved specification-level blocker remains. No production simulator code is yet authorised.
