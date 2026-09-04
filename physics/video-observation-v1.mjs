// ShotSight P9A — video observation / provenance contract v1
// Separates image observations, calibrated/derived quantities, model inference and ambiguity.

import {assertFiniteNumber,assertFiniteVec3,norm3,scale3} from './target-engine-v1.mjs';
import {apparentAnglesFromCameraVector} from './projection-gun-v1.mjs';

export const VIDEO_EVIDENCE_CLASS=Object.freeze({
  OBSERVED:'OBSERVED',
  CALIBRATED_DERIVED:'CALIBRATED_DERIVED',
  INFERRED:'INFERRED',
  UNOBSERVABLE_AMBIGUOUS:'UNOBSERVABLE_AMBIGUOUS'
});

export function validatePinholeIntrinsics(intrinsics){
  if(!intrinsics||typeof intrinsics!=='object')throw new Error('intrinsics required');
  for(const k of ['fx_px','fy_px','cx_px','cy_px'])assertFiniteNumber(intrinsics[k],`intrinsics.${k}`);
  if(!(intrinsics.fx_px>0&&intrinsics.fy_px>0))throw new Error('focal lengths must be > 0');
  if(!intrinsics.provenance)throw new Error('intrinsics provenance required');
  return true;
}

export function observedImagePoint({frameIndex,t_s,u_px,v_px,sourceId,trackId='target'}={}){
  if(!Number.isInteger(frameIndex)||frameIndex<0)throw new Error('frameIndex must be integer >=0');
  assertFiniteNumber(t_s,'t_s');assertFiniteNumber(u_px,'u_px');assertFiniteNumber(v_px,'v_px');
  if(t_s<0)throw new Error('t_s must be >=0');if(!sourceId)throw new Error('sourceId required');
  return Object.freeze({evidenceClass:VIDEO_EVIDENCE_CLASS.OBSERVED,observable:'IMAGE_POINT',frameIndex,t_s,u_px,v_px,sourceId,trackId,absoluteRange_m:null,absoluteRangeStatus:VIDEO_EVIDENCE_CLASS.UNOBSERVABLE_AMBIGUOUS});
}

export function pinholePixelsFromCameraVector({vector_C,intrinsics}={}){
  assertFiniteVec3(vector_C,'vector_C');validatePinholeIntrinsics(intrinsics);const [x,y,z]=vector_C;if(!(z>0))throw new Error('point must lie in front of camera');
  return Object.freeze({u_px:intrinsics.fx_px*x/z+intrinsics.cx_px,v_px:intrinsics.fy_px*y/z+intrinsics.cy_px});
}

export function deriveAngularObservation({observation,intrinsics}={}){
  if(observation?.evidenceClass!==VIDEO_EVIDENCE_CLASS.OBSERVED||observation.observable!=='IMAGE_POINT')throw new Error('OBSERVED IMAGE_POINT required');validatePinholeIntrinsics(intrinsics);
  const x=(observation.u_px-intrinsics.cx_px)/intrinsics.fx_px,y=(observation.v_px-intrinsics.cy_px)/intrinsics.fy_px,ray=[x,y,1],rayNorm=norm3(ray),unitRay_C=scale3(ray,1/rayNorm),angles=apparentAnglesFromCameraVector(ray);
  return Object.freeze({evidenceClass:VIDEO_EVIDENCE_CLASS.CALIBRATED_DERIVED,derivedFrom:Object.freeze({sourceId:observation.sourceId,trackId:observation.trackId,frameIndex:observation.frameIndex}),calibrationProvenance:intrinsics.provenance,t_s:observation.t_s,unitRay_C:Object.freeze(unitRay_C),az_rad:angles.az_rad,el_rad:angles.el_rad,absoluteRange_m:null,absoluteRangeStatus:VIDEO_EVIDENCE_CLASS.UNOBSERVABLE_AMBIGUOUS});
}

export function monocularAbsoluteRangeResult({observationOrRay,hasMetricSceneCalibration=false,rangeMeasurement_m=null,rangeProvenance=null}={}){
  if(!observationOrRay)throw new Error('observationOrRay required');
  if(!hasMetricSceneCalibration){return Object.freeze({evidenceClass:VIDEO_EVIDENCE_CLASS.UNOBSERVABLE_AMBIGUOUS,quantity:'ABSOLUTE_RANGE_M',value:null,reason:'UNCALIBRATED_MONOCULAR_DEPTH_NOT_IDENTIFIABLE'});}
  assertFiniteNumber(rangeMeasurement_m,'rangeMeasurement_m');if(!(rangeMeasurement_m>0)||!rangeProvenance)throw new Error('metric range and provenance required when metric calibration is asserted');
  return Object.freeze({evidenceClass:VIDEO_EVIDENCE_CLASS.CALIBRATED_DERIVED,quantity:'ABSOLUTE_RANGE_M',value:rangeMeasurement_m,provenance:rangeProvenance});
}

export function inferredCandidate({quantity,value,modelId,assumptions,confidence=null,derivedFrom=[]}={}){
  if(!quantity||!modelId)throw new Error('quantity and modelId required');if(!Array.isArray(assumptions)||assumptions.length===0)throw new Error('INFERRED output requires explicit assumptions');
  if(confidence!==null){assertFiniteNumber(confidence,'confidence');if(confidence<0||confidence>1)throw new Error('confidence must be in [0,1]');}
  return Object.freeze({evidenceClass:VIDEO_EVIDENCE_CLASS.INFERRED,quantity,value,modelId,assumptions:Object.freeze([...assumptions]),confidence,derivedFrom:Object.freeze([...derivedFrom])});
}

export function syntheticObservationProvenance({generatorId,generatorStatus,realisticClay,scenarioId}={}){
  if(!generatorId||!generatorStatus||!scenarioId)throw new Error('synthetic generator provenance incomplete');if(typeof realisticClay!=='boolean')throw new Error('realisticClay boolean required');
  return Object.freeze({kind:'SYNTHETIC_TEST_DATA',generatorId,generatorStatus,scenarioId,realisticClay,usage:'RECOVERY_TEST_ONLY',warning:realisticClay?'VALIDATE_GENERATOR_PROVENANCE_BEFORE_REAL_WORLD_GENERALISATION':'DO_NOT_TREAT_AS_REAL_CLAY_VIDEO'});
}
