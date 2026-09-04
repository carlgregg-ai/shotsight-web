import assert from 'node:assert/strict';
import {
  worldPointToCamera,intrinsicsFromHorizontalFov,projectCameraPointPinhole,
  apparentAnglesFromCameraVector,losAngularVelocityVector,boreAngularVelocityPerp,
  finiteDifferenceApparentRates,assertProperRotationMatrix,boreAngularRateBetweenSamples,
  validateBoreHistory,P5_PROJECTION_GUN_STATUS
} from '../physics/projection-gun-v1.mjs';

const near=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: expected ${b}, got ${a}, tol ${tol}`);
const nearVec=(a,b,tol,msg)=>a.forEach((v,i)=>near(v,b[i],tol,`${msg}[${i}]`));

// Corrected right-handed world->camera convention:
// world X right -> camera X right; world Z up -> camera -Y (raster up);
// world Y forward -> camera +Z optical-forward.
const R_CW=[[1,0,0],[0,0,-1],[0,1,0]];
assert.equal(assertProperRotationMatrix(R_CW),true);
nearVec(worldPointToCamera({point_W:[2,10,3],cameraOrigin_W:[0,0,1],R_CW}),[2,-2,10],1e-14,'world-camera mapping');
assert.throws(()=>worldPointToCamera({point_W:[0,10,0],cameraOrigin_W:[0,0,0],R_CW:[[2,0,0],[0,0,-1],[0,1,0]]}),/unit length|proper rotation/);
assert.throws(()=>assertProperRotationMatrix([[-1,0,0],[0,0,-1],[0,1,0]]),/determinant.*\+1/);

const intr=intrinsicsFromHorizontalFov({width_px:1000,height_px:500,hfov_rad:Math.PI/2});
near(intr.fx_px,500,1e-12,'90deg horizontal FOV fx');
near(intr.fy_px,500,1e-12,'square-pixel fy');
const centre=projectCameraPointPinhole({point_C:[0,0,10],...intr});
assert.equal(centre.visible,true);near(centre.u_px,500,1e-12,'centre u');near(centre.v_px,250,1e-12,'centre v');
const upRight=projectCameraPointPinhole({point_C:[1,-2,10],...intr});
near(upRight.u_px,550,1e-12,'right increases raster u');near(upRight.v_px,150,1e-12,'camera negative-Y/up decreases raster v');
assert.equal(projectCameraPointPinhole({point_C:[0,0,-1],...intr}).visible,false);

const ang=apparentAnglesFromCameraVector([1,0,1]);
near(ang.az_rad,Math.PI/4,1e-15,'apparent azimuth');near(ang.el_rad,0,1e-15,'apparent elevation');
const elev=apparentAnglesFromCameraVector([0,-1,1]);
near(elev.el_rad,Math.PI/4,1e-15,'apparent elevation positive-up');

// Eye/camera origins must remain separate: a finite 0.1m right-offset camera viewing a
// point 10m forward produces a non-zero parallax angle.
const targetW=[0,10,0];
const eyeC=worldPointToCamera({point_W:targetW,cameraOrigin_W:[0,0,0],R_CW});
const offsetC=worldPointToCamera({point_W:targetW,cameraOrigin_W:[0.1,0,0],R_CW});
near(apparentAnglesFromCameraVector(eyeC).az_rad,0,1e-15,'eye centred azimuth');
near(apparentAnglesFromCameraVector(offsetC).az_rad,Math.atan2(-0.1,10),1e-15,'finite-origin parallax');

// LOS angular velocity vector for a target 40m forward moving 20m/s shooter-right.
nearVec(losAngularVelocityVector([0,40,0],[20,0,0]),[0,0,-0.5],1e-14,'LOS omega world sign/magnitude');

// Finite-difference apparent rate must converge to v/r = 0.5 rad/s at centre.
for(const dt of [1e-2,1e-3,1e-4]){
  const r0_C=[0,0,40],r1_C=[20*dt,0,40];
  const rate=finiteDifferenceApparentRates({r0_C,r1_C,dt_s:dt});
  assert.ok(Math.abs(rate.az_dot_radps-0.5)<0.003,'apparent azimuth rate matches analytic small-step case');
  near(rate.el_dot_radps,0,1e-12,'zero elevation rate');
}

// Bore minimum angular velocity: b forward (+Y_W), yawing right with bdot +X_W at 0.5/s
// gives omega_perp -Z_W at 0.5 rad/s under right-handed world convention.
nearVec(boreAngularVelocityPerp([0,1,0],[0.5,0,0]),[0,0,-0.5],1e-14,'bore angular velocity');
assert.throws(()=>boreAngularVelocityPerp([0,1,0],[0,0.1,0]),/tangent/);

const b1=[Math.sin(0.05),Math.cos(0.05),0];
const sampleRate=boreAngularRateBetweenSamples({b0_W:[0,1,0],b1_W:b1,dt_s:0.1});
near(sampleRate.angle_rad,0.05,1e-14,'bore sample angular displacement');
near(sampleRate.angularSpeed_radps,0.5,1e-13,'bore sample angular speed');
const hist=validateBoreHistory([{t_s:0,bore_W:[0,1,0]},{t_s:0.1,bore_W:b1}],{maxAngularSpeed_radps:0.6});
near(hist[0].angularSpeed_radps,0.5,1e-13,'bore history accepted under explicit scenario bound');
assert.throws(()=>validateBoreHistory([{t_s:0,bore_W:[0,1,0]},{t_s:0.1,bore_W:b1}],{maxAngularSpeed_radps:0.4}),/exceeds supplied scenario validation bound/);
assert.throws(()=>validateBoreHistory([{t_s:0.1,bore_W:[0,1,0]},{t_s:0.1,bore_W:b1}]),/strictly increasing/);

assert.equal(P5_PROJECTION_GUN_STATUS.cameraHandedness,'RIGHT_HANDED_X_RIGHT_Y_DOWN_Z_FORWARD');
assert.equal(P5_PROJECTION_GUN_STATUS.cameraToBoreCalibration,'HOLD_FOR_REAL_VIDEO');
assert.equal(P5_PROJECTION_GUN_STATUS.eyeCameraCoincidence,'NOT_ASSUMED');
assert.match(P5_PROJECTION_GUN_STATUS.humanGunSpeedBound,/NOT_INVENTED/);

console.log(JSON.stringify({suite:'ShotSight P5 projection/gun kinematics v1',status:'PASS',tests:{properRotationValidation:true,reflectionGuard:true,frameMapping:true,pinholeProjection:true,rasterSign:true,frontPlaneGuard:true,apparentAngles:true,finiteOriginParallax:true,losAngularVelocity:true,finiteDifferenceRates:true,boreAngularVelocity:true,boreHistoryContinuity:true,explicitBounds:true,frameSeparationHold:true}},null,2));
