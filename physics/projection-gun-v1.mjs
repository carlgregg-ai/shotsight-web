// ShotSight P5 — Shooter Projection & Gun Kinematics v1
// Normative conventions after P5 handedness correction:
// world +X shooter-right, +Y forward, +Z up;
// camera +X raster-right, +Y raster-down, +Z optical-forward;
// both frames right-handed.

import {sub3,cross3,dot3,norm3,unit3,assertFiniteNumber,assertFiniteVec3} from './target-engine-v1.mjs';

function assertMat3(R,name='R'){
  if(!Array.isArray(R)||R.length!==3||R.some(r=>!Array.isArray(r)||r.length!==3))throw new Error(`${name} must be 3x3`);
  for(const row of R)for(const v of row)assertFiniteNumber(v,name);
}

export function determinant3(R){
  assertMat3(R,'R');
  return R[0][0]*(R[1][1]*R[2][2]-R[1][2]*R[2][1])
    -R[0][1]*(R[1][0]*R[2][2]-R[1][2]*R[2][0])
    +R[0][2]*(R[1][0]*R[2][1]-R[1][1]*R[2][0]);
}

export function assertProperRotationMatrix(R,{tolerance=1e-10,name='R'}={}){
  assertMat3(R,name);assertFiniteNumber(tolerance,'tolerance');if(!(tolerance>0))throw new Error('tolerance must be > 0');
  for(let i=0;i<3;i++){
    if(Math.abs(dot3(R[i],R[i])-1)>tolerance)throw new Error(`${name} rows must be unit length (proper rotation required)`);
    for(let j=i+1;j<3;j++)if(Math.abs(dot3(R[i],R[j]))>tolerance)throw new Error(`${name} rows must be orthogonal (proper rotation required)`);
  }
  const det=determinant3(R);
  if(Math.abs(det-1)>tolerance)throw new Error(`${name} determinant must be +1 (reflection/scaling prohibited)`);
  return true;
}

export function mulMat3Vec3(R,v){
  assertMat3(R);assertFiniteVec3(v,'v');
  return [dot3(R[0],v),dot3(R[1],v),dot3(R[2],v)];
}

export function worldPointToCamera({point_W,cameraOrigin_W,R_CW}){
  assertFiniteVec3(point_W,'point_W');assertFiniteVec3(cameraOrigin_W,'cameraOrigin_W');assertProperRotationMatrix(R_CW,{name:'R_CW'});
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
  return Object.freeze({visible:true,u_px:fx_px*(X/Z)+cx_px,v_px:fy_px*(Y/Z)+cy_px,depth_m:Z,point_C:[...point_C]});
}

export function apparentAnglesFromCameraVector(v_C){
  assertFiniteVec3(v_C,'v_C');
  const [X,Y,Z]=v_C;
  if(!(norm3(v_C)>0))throw new Error('camera vector must be non-zero');
  return Object.freeze({
    az_rad:Math.atan2(X,Z),
    // Preserve shooter-intuitive positive-up elevation despite camera +Y being raster-down.
    el_rad:Math.atan2(-Y,Math.hypot(X,Z))
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

export function boreAngularRateBetweenSamples({b0_W,b1_W,dt_s}){
  assertFiniteVec3(b0_W,'b0_W');assertFiniteVec3(b1_W,'b1_W');assertFiniteNumber(dt_s,'dt_s');if(!(dt_s>0))throw new Error('dt_s must be > 0');
  const b0=unit3(b0_W),b1=unit3(b1_W);
  const c=cross3(b0,b1),cMag=norm3(c),d=Math.max(-1,Math.min(1,dot3(b0,b1)));
  const angle=Math.atan2(cMag,d);
  const axis=cMag>1e-14?c.map(x=>x/cMag):[0,0,0];
  return Object.freeze({angle_rad:angle,angularSpeed_radps:angle/dt_s,axis_W:axis,dt_s});
}

export function validateBoreHistory(samples,{maxAngularSpeed_radps=null}={}){
  if(!Array.isArray(samples)||samples.length<2)throw new Error('at least two bore samples required');
  if(maxAngularSpeed_radps!==null){assertFiniteNumber(maxAngularSpeed_radps,'maxAngularSpeed_radps');if(!(maxAngularSpeed_radps>0))throw new Error('maxAngularSpeed_radps must be > 0');}
  const rates=[];
  for(let i=1;i<samples.length;i++){
    const a=samples[i-1],b=samples[i];
    assertFiniteNumber(a.t_s,'sample.t_s');assertFiniteNumber(b.t_s,'sample.t_s');
    const dt=b.t_s-a.t_s;if(!(dt>0))throw new Error('bore sample times must be strictly increasing');
    const rate=boreAngularRateBetweenSamples({b0_W:a.bore_W,b1_W:b.bore_W,dt_s:dt});
    if(maxAngularSpeed_radps!==null&&rate.angularSpeed_radps>maxAngularSpeed_radps)throw new Error('bore angular speed exceeds supplied scenario validation bound');
    rates.push(rate);
  }
  return Object.freeze(rates);
}

export const P5_PROJECTION_GUN_STATUS=Object.freeze({
  status:'INFRASTRUCTURE_VALIDATION_ONLY',
  cameraHandedness:'RIGHT_HANDED_X_RIGHT_Y_DOWN_Z_FORWARD',
  cameraToBoreCalibration:'HOLD_FOR_REAL_VIDEO',
  eyeCameraCoincidence:'NOT_ASSUMED',
  boreRoll:'OUTSIDE_MINIMUM_P5_CONTRACT',
  humanGunSpeedBound:'NOT_INVENTED_REQUIRES_SCENARIO_OR_EMPIRICAL_PROVENANCE'
});
