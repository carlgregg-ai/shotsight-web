// ShotSight P5 — Shooter Projection & Gun Kinematics v1
// Implements the normative P2 conventions:
// world +X shooter-right, +Y forward, +Z up;
// camera +X image-right, +Y camera-up, +Z optical-forward;
// raster v increases downward.

import {sub3,cross3,dot3,norm3,unit3,assertFiniteNumber,assertFiniteVec3} from './target-engine-v1.mjs';

function assertMat3(R,name='R'){
  if(!Array.isArray(R)||R.length!==3||R.some(r=>!Array.isArray(r)||r.length!==3))throw new Error(`${name} must be 3x3`);
  for(const row of R)for(const v of row)assertFiniteNumber(v,name);
}

export function mulMat3Vec3(R,v){
  assertMat3(R);assertFiniteVec3(v,'v');
  return [dot3(R[0],v),dot3(R[1],v),dot3(R[2],v)];
}

export function worldPointToCamera({point_W,cameraOrigin_W,R_CW}){
  assertFiniteVec3(point_W,'point_W');assertFiniteVec3(cameraOrigin_W,'cameraOrigin_W');assertMat3(R_CW,'R_CW');
  return mulMat3Vec3(R_CW,sub3(point_W,cameraOrigin_W));
}

export function intrinsicsFromHorizontalFov({width_px,height_px,hfov_rad,cx_px=width_px/2,cy_px=height_px/2}){
  for(const [k,v] of Object.entries({width_px,height_px,hfov_rad,cx_px,cy_px}))assertFiniteNumber(v,k);
  if(!(width_px>0&&height_px>0&&hfov_rad>0&&hfov_rad<Math.PI))throw new Error('invalid image size or horizontal FOV');
  const fx=width_px/(2*Math.tan(hfov_rad/2));
  return Object.freeze({fx_px:fx,fy_px:fx,cx_px,cy_px,width_px,height_px,source:'HORIZONTAL_FOV_ASSUMED_SQUARE_PIXELS'});
}

export function projectCameraPointPinhole({point_C,fx_px,fy_px,cx_px,cy_px}){
  assertFiniteVec3(point_C,'point_C');
  for(const [k,v] of Object.entries({fx_px,fy_px,cx_px,cy_px}))assertFiniteNumber(v,k);
  const [X,Y,Z]=point_C;
  if(!(Z>0))return Object.freeze({visible:false,reason:'BEHIND_OR_ON_CAMERA_PLANE',point_C:[...point_C]});
  return Object.freeze({visible:true,u_px:fx_px*(X/Z)+cx_px,v_px:cy_px-fy_px*(Y/Z),depth_m:Z,point_C:[...point_C]});
}

export function apparentAnglesFromCameraVector(v_C){
  assertFiniteVec3(v_C,'v_C');
  const [X,Y,Z]=v_C;
  if(!(norm3(v_C)>0))throw new Error('camera vector must be non-zero');
  return Object.freeze({
    az_rad:Math.atan2(X,Z),
    el_rad:Math.atan2(Y,Math.hypot(X,Z))
  });
}

export function losAngularVelocityVector(r_W,vRel_W){
  assertFiniteVec3(r_W,'r_W');assertFiniteVec3(vRel_W,'vRel_W');
  const r2=dot3(r_W,r_W);if(!(r2>0))throw new Error('relative position must be non-zero');
  const c=cross3(r_W,vRel_W);
  return c.map(x=>x/r2);
}

export function boreAngularVelocityPerp(b_W,bDot_W){
  assertFiniteVec3(b_W,'b_W');assertFiniteVec3(bDot_W,'bDot_W');
  const b=unit3(b_W);
  // For a unit bore vector, omega_perp = b x b_dot. Require b_dot to be
  // effectively tangent to the unit sphere; a radial derivative signals misuse.
  const radial=dot3(b,bDot_W);
  if(Math.abs(radial)>1e-8*Math.max(1,norm3(bDot_W)))throw new Error('bDot_W must be tangent to the unit bore direction');
  return cross3(b,bDot_W);
}

export function finiteDifferenceApparentRates({r0_C,r1_C,dt_s}){
  assertFiniteVec3(r0_C,'r0_C');assertFiniteVec3(r1_C,'r1_C');assertFiniteNumber(dt_s,'dt_s');
  if(!(dt_s>0))throw new Error('dt_s must be > 0');
  const a0=apparentAnglesFromCameraVector(r0_C),a1=apparentAnglesFromCameraVector(r1_C);
  return Object.freeze({az_dot_radps:(a1.az_rad-a0.az_rad)/dt_s,el_dot_radps:(a1.el_rad-a0.el_rad)/dt_s});
}

export const P5_PROJECTION_GUN_STATUS=Object.freeze({
  status:'INFRASTRUCTURE_VALIDATION_ONLY',
  cameraToBoreCalibration:'HOLD_FOR_REAL_VIDEO',
  eyeCameraCoincidence:'NOT_ASSUMED',
  boreRoll:'OUTSIDE_MINIMUM_P5_CONTRACT'
});
