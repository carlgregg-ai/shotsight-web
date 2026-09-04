import assert from 'node:assert/strict';
import {validateRealDataCalibrationManifest,realDataCalibrationReadiness,validateCalibrationResult} from '../physics/real-data-calibration-v1.mjs';

const base={schemaVersion:'SHOTSIGHT_REAL_DATA_CALIBRATION_V1',sessionId:'synthetic-contract-test',capture:{date:'2026-09-04',location:'TEST_FIXTURE_NOT_REAL_CAPTURE'},target:{type:'STANDARD_TEST',provenance:'TEST_FIXTURE'},trap:{identity:'TEST_TRAP',provenance:'TEST_FIXTURE'},camera:{identity:'TEST_CAMERA',calibration:{id:'TEST_CAL',provenance:'TEST_FIXTURE'}},geometry:{referenceFrame:'W',provenance:'TEST_FIXTURE'},environment:{temperature_C:15,pressure_Pa:101325},throws:[{id:'fit-1',role:'FIT',observations:[0,1,2].map(i=>({t_s:i/100,evidenceClass:'OBSERVED',u_px:i,v_px:i}))},{id:'val-1',role:'VALIDATION',observations:[0,1,2].map(i=>({t_s:i/100,evidenceClass:'OBSERVED',u_px:i+1,v_px:i+1}))}]};

assert.equal(validateRealDataCalibrationManifest(base).ok,true);
assert.equal(realDataCalibrationReadiness(base).status,'READY_TO_FIT_AND_HELD_OUT_VALIDATE');
const noSplit=structuredClone(base); noSplit.throws[1].role='FIT'; assert.equal(validateRealDataCalibrationManifest(noSplit).code,'HELD_OUT_SPLIT_REQUIRED');
const noCal=structuredClone(base); delete noCal.camera.calibration; assert.equal(realDataCalibrationReadiness(noCal).status,'READY_FOR_REAL_DATA');
const leakage=structuredClone(base); leakage.modelFit={fitThrowIds:['fit-1'],validationThrowIds:['fit-1']}; assert.equal(validateRealDataCalibrationManifest(leakage).code,'DATA_LEAKAGE');
const result={evidenceClass:'INFERRED',modelId:'TEST_MODEL',fitThrowIds:['fit-1'],validationThrowIds:['val-1'],validationMetrics:{angularRms_rad:0.001},realisticClayCertified:false}; assert.equal(validateCalibrationResult(result,base).ok,true);
const selfCert={...result,realisticClayCertified:true}; assert.equal(validateCalibrationResult(selfCert,base).code,'CERTIFICATION_FORBIDDEN');

console.log(JSON.stringify({suite:'ShotSight P10 real-data calibration contract v1',status:'PASS'}));
