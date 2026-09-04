# ShotSight Physics & Kinematics Specification v1 — Normative Conventions / Adversarial Review

Date: 2026-09-04
Status: **NORMATIVE ADDENDUM TO v1 SPEC**

This file resolves convention ambiguities identified by the P2 adversarial/dimensional review. Where this addendum is more specific than `SHOTSIGHT_PHYSICS_KINEMATICS_SPEC_v1.md`, this file controls v1 implementation.

## 1. World handedness — verified

World basis:

- `e_X`: shooter right
- `e_Y`: forward/downrange
- `e_Z`: up

is declared right-handed with:

`e_X × e_Y = e_Z`, `e_Y × e_Z = e_X`, `e_Z × e_X = e_Y`.

Gravity is `[0,0,-g]`.

Mirroring a left/right presentation changes geometry, not handedness.

## 2. Quaternion convention — fixed

`q_WT` is the active rotation mapping a target-body vector into world coordinates:

`v_W = R(q_WT) v_T`.

Target angular velocity `omega_T` is expressed in target-body coordinates.

With Hamilton quaternion product and scalar-first storage `[w,x,y,z]`, quaternion kinematics are:

`q_dot_WT = 0.5 * q_WT ⊗ [0, omega_T]`.

After numerical integration the quaternion must be renormalised when drift exceeds a documented numerical tolerance. A unit test must verify a known constant-axis rotation against an analytic rotation matrix before the convention is trusted.

No module may switch to world-expressed angular velocity without an explicitly named conversion.

## 3. Camera convention — fixed

Camera frame `C` is right-handed and uses:

- `+X_C`: image right
- `+Y_C`: camera up
- `+Z_C`: optical forward

A world point is transformed to camera coordinates by:

`p_C = R_CW (p_W - p_camera_W)`.

A point is in front of the camera only if `Z_C > 0`.

Ideal pinhole projection before distortion:

`u = f_x (X_C/Z_C) + c_x`

`v = c_y - f_y (Y_C/Z_C)`

The minus sign in image `v` exists because raster image coordinates increase downward while `+Y_C` is physically upward.

Field-of-view conversion may derive `f_x` from **horizontal** FOV and image width only when the FOV is explicitly known to be horizontal:

`f_x = W_px / (2 tan(FOV_h/2))`.

Likewise vertical FOV uses image height. Diagonal FOV must not be silently used as horizontal FOV.

Lens distortion is an explicit calibrated mapping layered after ideal projection.

## 4. Shooter eye versus camera versus bore

These are three potentially different origins/frames:

- eye frame used for human apparent lead;
- camera frame used for video/image coordinates;
- bore frame used for pellet launch direction.

They may coincide only in a deliberately idealised analytic test.

For real ShotKam/video use, camera-to-bore transform and camera-to-eye interpretation require explicit calibration/assumption status. Finite offset creates range-dependent parallax; therefore image centre/reticle is not treated as a universally exact bore ray.

## 5. LOS angular velocity — vector meaning fixed

Let relative position from observer to target be `r` and relative translational velocity be `v` in the same frame.

Line-of-sight angular-velocity vector:

`omega_LOS = (r × v) / |r|^2`.

This vector is perpendicular to the instantaneous LOS plane and its magnitude is the instantaneous angular rate of LOS rotation.

It is **not** directly the signed horizontal/vertical screen angular velocity.

For signed apparent motion, first transform the LOS into the camera/eye frame and use angular coordinates:

`az = atan2(X_C, Z_C)`

`el = atan2(Y_C, sqrt(X_C^2 + Z_C^2))`.

Signed rates `az_dot`, `el_dot` are obtained analytically or by validated differentiation using the same simulation clock. The finite-difference implementation must be checked against analytic constant-velocity cases.

## 6. Gun angular state

Bore direction `b_W` is a unit vector. A single vector does not encode roll about the bore, which is intentionally outside the minimum P5 contract.

For a differentiable unit bore vector:

`omega_bore_perp = b_W × b_dot_W`

is the minimum angular-velocity vector that produces the changing bore direction (it contains no arbitrary roll about `b`).

This is sufficient for target-line tracking and lead analysis. If later gun roll is required, full gun attitude must be introduced explicitly rather than inferred from `b`.

## 7. Intercept semantics — corrected for curved trajectories

The point-target intercept must not assume the pellet path is a straight ray when drag/gravity providers curve it.

For a fixed candidate shot time `t_s`, integrate/query:

- pellet centre `r_P(tau | t_s)` for `tau >= 0`;
- target centre `r_T(t_s + tau)`.

Define relative miss vector:

`d(tau) = r_P(tau | t_s) - r_T(t_s + tau)`.

Define closest-approach flight time over the provider’s valid horizon:

`tau* = argmin_{tau >= 0} ||d(tau)||`.

The point-centre residual is `||d(tau*)||`.

A physical `HIT` requires a separately defined finite geometry/envelope test (target geometry plus validated shot-cloud model). Until that exists, a point-centre analytic test may use a documented numerical tolerance **only for solver verification**, not instructional hit probability.

The intercept solver may solve a root directly only in special cases where the geometry reduces to a well-defined scalar root or analytic intersection.

## 8. Physical lead definition — tightened

At shot time `t_s`:

- current target LOS: `l_now = normalize(r_T(t_s)-p_eye)`;
- bore/launch direction: `b_shot`;
- target future position at pellet closest/intersection time: `r_T(t_s+tau*)`.

Apparent lead angle at shot is the angular separation between `l_now` and `b_shot` (or the validated effective shot-cloud centre direction where later applicable):

`theta_lead = atan2(||l_now × b_shot||, l_now · b_shot)`.

A signed lead uses a declared local tangent/screen basis. There is no globally meaningful scalar “left/right lead” without presentation/view basis.

Physical lead is not just a scalar distance. Preserve vector quantities, including the displacement from current target position to future target position and the bore/intercept geometry.

## 9. Method versus physics separation — adversarial check

Method providers may request a bore history but cannot modify:

- target state;
- atmosphere;
- pellet drag law;
- pellet TOF;
- future target state;
- physical intercept condition.

A method can choose **when** to shoot and **how** the gun reaches the necessary orientation. It cannot make an incorrect bore direction into a hit by changing a displayed lead label.

## 10. Event predicates — fail closed

Events that require unresolved tolerances must not be asserted in `INSTRUCTIONAL_VALIDATED` mode.

Examples:

- `SPEED_MATCH` remains unavailable until its relative-angular-velocity tolerance has provenance/calibration;
- `CONNECTION` requires an explicit source/method definition rather than visual proximity alone;
- `BREAK` requires a validated hit predicate and occurs no earlier than pellet arrival;
- `SHOT` is an event at the actual method/scenario shot time, not when an animation reaches a decorative marker.

Toy/debug mode may expose candidate events, but they must be labelled `TEST_ONLY` or `HYPOTHESIS`.

## 11. Provider fail-closed rules

A realistic provider declares a schema of required parameters.

Before simulation:

1. every required parameter must be present;
2. value must be finite and dimensionally compatible;
3. classification must be permitted for that mode;
4. source/applicability domain must include the scenario;
5. required uncertainty metadata must be present where specified.

If any check fails, simulation returns a typed configuration error. It must not substitute zero, a previous scenario value, an average value, or a visually plausible default.

`TEST_ONLY` providers are separate provider IDs and are visually/programmatically non-promotable to instructional mode.

## 12. Numerical/dimensional audit results

Reviewed dimensions:

- lift/drag: `rho [kg/m^3] * A [m^2] * v^2 [m^2/s^2] -> kg m/s^2 = N`;
- aerodynamic moment with reference length `d`: force scale `[N] * d [m] -> N m`;
- translational acceleration: `N/kg -> m/s^2`;
- rigid-body angular equation: `I [kg m^2] * omega_dot [1/s^2] -> N m`;
- LOS `r×v / r^2 -> (m*m/s)/m^2 = 1/s`;
- apparent lead is dimensionless angle in radians;
- pellet TOF and master event time remain seconds.

No dimensional contradiction was identified in the authorised architecture.

## 13. Specific risk found and controlled

The original P2 draft described an intercept residual as if a generic vector root might always be solved. That wording could encourage an invalid straight-line/three-equations-one-scalar implementation for a curved pellet trajectory. This addendum replaces it with closest-approach/finite-geometry semantics and reserves root solving for mathematically appropriate special cases.

This is a substantive error-prevention correction, not a cosmetic clarification.

## 14. P2 exit assessment

After the convention fixes above:

- frame handedness: resolved;
- quaternion mapping and angular-velocity expression: resolved;
- camera optical/raster convention: resolved;
- LOS angular-rate meaning/sign basis: resolved;
- camera/eye/bore distinction: resolved;
- curved ballistic intercept semantics: resolved;
- method/physics separation: resolved;
- unresolved event tolerances: fail-closed;
- missing realistic-provider parameters: fail-closed;
- dimensional audit: passed at specification level.

**P2 is ready for completion checkpoint.**

P3 may begin with math primitives, provider/schema validation, deterministic RK4 and analytic toy cases. A realistic clay trajectory remains blocked until the required aerodynamic inputs are verified/calibrated.
