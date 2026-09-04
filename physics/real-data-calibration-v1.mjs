const REQUIRED_CLASSES = new Set(['OBSERVED','CALIBRATED_DERIVED','INFERRED','UNOBSERVABLE_AMBIGUOUS']);

function fail(code, message, details={}) { return {ok:false, code, message, ...details}; }
function finitePositive(x){ return Number.isFinite(x) && x>0; }
function nonEmpty(x){ return typeof x==='string' && x.trim().length>0; }

export function validateRealDataCalibrationManifest(m){
  if(!m || typeof m!=='object') return fail('MANIFEST_REQUIRED','Calibration manifest is required.');
  if(m.schemaVersion!=='SHOTSIGHT_REAL_DATA_CALIBRATION_V1') return fail('SCHEMA_VERSION','Unsupported calibration schema.');
  if(!nonEmpty(m.sessionId)) return fail('SESSION_ID_REQUIRED','sessionId is required.');
  if(!m.capture || !nonEmpty(m.capture.date) || !nonEmpty(m.capture.location)) return fail('CAPTURE_CONTEXT_REQUIRED','Capture date and location are required.');
  if(!m.target || !nonEmpty(m.target.type) || !nonEmpty(m.target.provenance)) return fail('TARGET_PROVENANCE_REQUIRED','Target type and provenance are required.');
  if(!m.trap || !nonEmpty(m.trap.identity) || !nonEmpty(m.trap.provenance)) return fail('TRAP_PROVENANCE_REQUIRED','Trap identity and provenance are required.');
  if(!m.camera || !nonEmpty(m.camera.identity)) return fail('CAMERA_ID_REQUIRED','Camera identity is required.');
  if(!m.camera.calibration || !nonEmpty(m.camera.calibration.id) || !nonEmpty(m.camera.calibration.provenance)) return fail('CAMERA_CALIBRATION_REQUIRED','A provenance-backed camera calibration is required.');
  if(!m.geometry || !nonEmpty(m.geometry.referenceFrame) || !nonEmpty(m.geometry.provenance)) return fail('GEOMETRY_REQUIRED','Measured capture geometry and provenance are required.');
  if(!m.environment || !Number.isFinite(m.environment.temperature_C) || !Number.isFinite(m.environment.pressure_Pa)) return fail('ENVIRONMENT_REQUIRED','Measured atmospheric temperature and pressure are required.');
  if(!Array.isArray(m.throws) || m.throws.length<2) return fail('THROWS_REQUIRED','At least two throws are required so fit/validation can be separated.');
  const ids=new Set(); const fit=[]; const validation=[];
  for(const t of m.throws){
    if(!nonEmpty(t.id) || ids.has(t.id)) return fail('THROW_ID_INVALID','Throw ids must be unique non-empty strings.');
    ids.add(t.id);
    if(!['FIT','VALIDATION','EXCLUDED'].includes(t.role)) return fail('THROW_ROLE_INVALID','Throw role must be FIT, VALIDATION or EXCLUDED.',{throwId:t.id});
    if(!Array.isArray(t.observations) || t.observations.length<3) return fail('OBSERVATIONS_INSUFFICIENT','Each non-excluded throw needs at least three observations.',{throwId:t.id});
    for(const o of t.observations){
      if(!Number.isFinite(o.t_s)) return fail('OBSERVATION_TIME_INVALID','Observation time must be finite.',{throwId:t.id});
      if(!REQUIRED_CLASSES.has(o.evidenceClass)) return fail('OBSERVATION_CLASS_INVALID','Observation evidence class is invalid.',{throwId:t.id});
      if(o.evidenceClass==='OBSERVED' && !(Number.isFinite(o.u_px)&&Number.isFinite(o.v_px))) return fail('OBSERVED_PIXEL_REQUIRED','OBSERVED image points require u_px and v_px.',{throwId:t.id});
    }
    if(t.role==='FIT') fit.push(t.id); if(t.role==='VALIDATION') validation.push(t.id);
  }
  if(fit.length===0 || validation.length===0) return fail('HELD_OUT_SPLIT_REQUIRED','At least one FIT and one held-out VALIDATION throw are required.');
  if(m.modelFit && m.modelFit.validationThrowIds){
    const fitSet=new Set(m.modelFit.fitThrowIds||[]);
    for(const id of m.modelFit.validationThrowIds) if(fitSet.has(id)) return fail('DATA_LEAKAGE','A throw cannot be used for both fitting and held-out validation.',{throwId:id});
  }
  return {ok:true,status:'READY_FOR_REPRODUCIBLE_CALIBRATION',fitThrowIds:fit,validationThrowIds:validation,realisticClayCertified:false};
}

export function realDataCalibrationReadiness(m){
  const v=validateRealDataCalibrationManifest(m);
  if(!v.ok) return {status:'READY_FOR_REAL_DATA',realisticClayCertified:false,blockingRequirement:v};
  return {status:'READY_TO_FIT_AND_HELD_OUT_VALIDATE',realisticClayCertified:false,fitThrowIds:v.fitThrowIds,validationThrowIds:v.validationThrowIds};
}

export function validateCalibrationResult(result, manifest){
  const m=validateRealDataCalibrationManifest(manifest); if(!m.ok) return m;
  if(!result || result.evidenceClass!=='INFERRED') return fail('RESULT_CLASS','Model-fit outputs must remain INFERRED.');
  if(!nonEmpty(result.modelId)) return fail('MODEL_ID_REQUIRED','modelId is required.');
  if(!Array.isArray(result.fitThrowIds)||!Array.isArray(result.validationThrowIds)) return fail('SPLIT_REQUIRED','Fit and validation throw ids are required.');
  const fit=new Set(result.fitThrowIds); for(const id of result.validationThrowIds) if(fit.has(id)) return fail('DATA_LEAKAGE','Fit and validation sets overlap.',{throwId:id});
  if(!finitePositive(result.validationMetrics?.angularRms_rad)) return fail('VALIDATION_METRIC_REQUIRED','Positive held-out angular RMS residual is required.');
  if(result.realisticClayCertified===true) return fail('CERTIFICATION_FORBIDDEN','P10 calibration results cannot self-certify realistic clay without the programme release gates.');
  return {ok:true,status:'HELD_OUT_VALIDATION_RECORDED',realisticClayCertified:false};
}
