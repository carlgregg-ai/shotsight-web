// ShotSight Virtual Shooter L0 — naive perception-limited no-learning shooter.
// IMPORTANT: this module MUST NOT import physics/oracle modules.
// It consumes only validated ShooterObservation objects and public experiment geometry.

import {validateShooterObservation,assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function assertFinite(v,name){if(!Number.isFinite(v))throw new Error(`${name} must be finite`);return v;}
function clamp(v,lo,hi){return Math.min(hi,Math.max(lo,v));}
function norm3(v){return Math.hypot(v[0],v[1],v[2]);}
function unit3(v){const n=norm3(v);if(!(n>0))throw new Error('zero vector');return v.map(x=>x/n);}
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}

// Public camera convention matching the engineering review camera orientation, but containing no target depth/range.
// R_CW maps world vectors to camera vectors. This inverse uses transpose because R is orthonormal.
export const L0_PUBLIC_CAMERA_R_CW=Object.freeze([
  Object.freeze([1,0,0]),
  Object.freeze([0,0,-1]),
  Object.freeze([0,1,0])
]);

function transpose3(R){return [[R[0][0],R[1][0],R[2][0]],[R[0][1],R[1][1],R[2][1]],[R[0][2],R[1][2],R[2][2]]];}
function mul3(R,v){return [R[0][0]*v[0]+R[0][1]*v[1]+R[0][2]*v[2],R[1][0]*v[0]+R[1][1]*v[1]+R[1][2]*v[2],R[2][0]*v[0]+R[2][1]*v[1]+R[2][2]*v[2]];}

export function apparentAnglesToWorldUnit({az_rad,el_rad,R_CW=L0_PUBLIC_CAMERA_R_CW}={}){
  assertFinite(az_rad,'az_rad');assertFinite(el_rad,'el_rad');
  const ce=Math.cos(el_rad);
  // Projection contract is camera +Y raster-down while apparent elevation is
  // shooter-intuitive positive-up: el = atan2(-Y, hypot(X,Z)). Therefore the
  // exact inverse MUST reconstruct camera Y as -sin(el), not +sin(el).
  const cameraUnit=[Math.sin(az_rad)*ce,-Math.sin(el_rad),Math.cos(az_rad)*ce];
  return Object.freeze(unit3(mul3(transpose3(R_CW),cameraUnit)));
}

// Deliberately weak L0 baseline: extrapolate the last apparent target motion to a fixed public decision time,
// then point at that apparent target location. It does NOT invent or receive ballistic lead.
export function createNaiveNoLearningAction(observationHistory,{decisionTime_s,R_CW=L0_PUBLIC_CAMERA_R_CW,maxExtrapolation_s=0.35}={}){
  if(!Array.isArray(observationHistory)||!observationHistory.length)throw new Error('observationHistory required');
  observationHistory.forEach(validateShooterObservation);
  assertFinite(decisionTime_s,'decisionTime_s');assertFinite(maxExtrapolation_s,'maxExtrapolation_s');if(maxExtrapolation_s<0)throw new Error('maxExtrapolation_s must be >= 0');
  const visible=observationHistory.filter(o=>o.visible);
  if(!visible.length)return freezePlain({schema:'SHOOTER_ACTION_V1',status:'NO_SHOT_NO_VISUAL',decisionTime_s,trigger:false,actionBore_W:null,source:'NAIVE_NO_LEARNING'});
  const o=visible.at(-1);
  const dt=clamp(decisionTime_s-o.observationTime_s,0,maxExtrapolation_s);
  const az=o.az_rad+(o.apparentAzRate_radps??0)*dt;
  const el=o.el_rad+(o.apparentElRate_radps??0)*dt;
  const action=freezePlain({schema:'SHOOTER_ACTION_V1',status:'TRIGGER',decisionTime_s,trigger:true,actionBore_W:apparentAnglesToWorldUnit({az_rad:az,el_rad:el,R_CW}),source:'NAIVE_NO_LEARNING',perceptualBasis:{lastObservationTime_s:o.observationTime_s,extrapolation_s:dt,acquisitionQuality:o.acquisitionQuality}});
  assertNoPrivilegedShooterData(action,{path:'action'});
  return action;
}
