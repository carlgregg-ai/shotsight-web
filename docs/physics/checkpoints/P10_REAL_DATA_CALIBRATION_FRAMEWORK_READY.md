# P10 — Real-Data Calibration Framework — READY_FOR_REAL_DATA

## Status
- Stage: P10 — Real-Data Calibration Framework
- Status: **READY_FOR_REAL_DATA**
- Branch: `physics-engine-v1`
- Verification head for executable contract: `da512bd26e92b00223b6c404f59c1ca474feec10`
- GitHub Actions run: `33913909908` — **SUCCESS**

## Implemented framework
- `physics/real-data-calibration-v1.mjs` validates a versioned capture/calibration manifest.
- `tests/physics-real-data-calibration-v1.mjs` exercises the contract.
- `docs/physics/REAL_DATA_CALIBRATION_PROTOCOL_v1.md` defines capture, calibration, fit/held-out validation and reproducibility requirements.

## Fail-closed rules verified
The contract rejects or holds:
- missing target/trap/camera/geometry provenance;
- missing measured atmosphere fields required by the manifest;
- fewer than the minimum observation samples;
- invalid observation provenance classes;
- absent FIT/VALIDATION split;
- leakage of a throw into both fit and validation;
- model-fit outputs not labelled `INFERRED`;
- missing held-out validation residuals;
- any attempt for a P10 result to self-certify `realisticClay`.

## Validation approach
Real calibration must freeze fitted parameters/model version before evaluation on held-out throws. The protocol requires raw-media hashes, camera calibration ids, measured geometry, observation tracks, split declaration, code/model version, fitted parameters, uncertainty/residuals, failed/excluded cases and an explicit scope boundary.

## Real-data finding
No provenance-complete measured real target/gun capture dataset meeting this protocol is durably available in the repository state inspected for this stage. Therefore no aerodynamic coefficients, launch-state mapping, expert gun kinematics, real pellet-cloud performance or held-out real-flight residuals have been fabricated.

## Exit result
The P10 framework is reproducible and CI-verified. Because suitable real capture data are not yet available, the master-programme-authorised exit is **READY_FOR_REAL_DATA** rather than a false empirical PASS.

## Holds preserved
- realistic clay aerodynamics and held-out real-flight validation;
- target release spin and trap-setting-to-launch-state mapping;
- camera-to-bore transform uncertainty;
- expert-method numerical tolerances;
- dense shot-cloud/shot-string and sporting-load validation;
- teal powered-rise and rabbit ground interaction.

## Exact next action
Proceed to P11 and assemble the expert validation/go-no-go package from the current canonical debug cases, scientific disclosures and explicit HOLD boundaries. Do not self-award expert approval. If the pack is complete, checkpoint `READY_FOR_EXPERT_REVIEW`; external expert review is then a genuine dependency before controlled Playbook migration.
