// ShotSight Virtual Shooter L3 — finite angular gun/shooter plant.
// Learner-side only. No physics/oracle imports. Commands are perceived angular aims,
// not ballistic intercepts. All limits are provisional calibration parameters.

import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const finite=(v,n)=>{if(!Number.isFinite(v))throw new Error(`${n} must be finite`);return v;};
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}

export const PROVISIONAL_GUN_PLANT_LIMITS_V1=freezePlain({
  evidenceClass:'PROVISIONAL_METHOD_KINEMATICS',
  dt_s:1/120,
  visualMotorDelay_s:0.12,
  maxAngularVelocity_radps:2.4,
  maxAngularAcceleration_radps2:12,
  maxAngularJerk_radps3:120,
  motorNoiseSd_radps2:0.0
});

function rng01(seed){let x=(seed|0)||0x6d2b79f5;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)+0.5)/4294967296;};}
function gaussian(rand){const u=Math.max(1e-12,rand()),v=Math.max(1e-12,rand());return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}

export function createGunPlantState({t_s=0,az_rad=0,el_rad=0,azRate_radps=0,elRate_radps=0,azAccel_radps2=0,elAccel_radps2=0}={}){
  [t_s,az_rad,el_rad,azRate_radps,elRate_radps,azAccel_radps2,elAccel_radps2].forEach((v,i)=>finite(v,['t_s','az_rad','el_rad','azRate','elRate','azAccel','elAccel'][i]));
  return freezePlain({schema:'FINITE_GUN_PLANT_STATE_V1',t_s,az_rad,el_rad,azRate_radps,elRate_radps,azAccel_radps2,elAccel_radps2});
}

function validateCommand(command){
  if(!command||command.schema!=='PERCEIVED_ANGULAR_GUN_COMMAND_V1')throw new Error('PERCEIVED_ANGULAR_GUN_COMMAND_V1 required');
  finite(command.t_s,'command.t_s');finite(command.desiredAz_rad,'desiredAz_rad');finite(command.desiredEl_rad,'desiredEl_rad');
  assertNoPrivilegedShooterData(command,{path:'gunCommand'});
}

function desiredRate(error,limits){
  return clamp(error/Math.max(limits.visualMotorDelay_s,limits.dt_s),-limits.maxAngularVelocity_radps,limits.maxAngularVelocity_radps);
}

function axisStep(pos,rate,accel,desiredPos,limits,noiseAccel){
  const targetRate=desiredRate(desiredPos-pos,limits);
  const rawAccel=clamp((targetRate-rate)/limits.dt_s,-limits.maxAngularAcceleration_radps2,limits.maxAngularAcceleration_radps2)+noiseAccel;
  const maxDeltaA=limits.maxAngularJerk_radps3*limits.dt_s;
  const nextAccel=clamp(accel+clamp(rawAccel-accel,-maxDeltaA,maxDeltaA),-limits.maxAngularAcceleration_radps2,limits.maxAngularAcceleration_radps2);
  const nextRate=clamp(rate+nextAccel*limits.dt_s,-limits.maxAngularVelocity_radps,limits.maxAngularVelocity_radps);
  const nextPos=pos+nextRate*limits.dt_s;
  return {pos:nextPos,rate:nextRate,accel:nextAccel};
}

export function stepFiniteGunPlant(state,command,{limits=PROVISIONAL_GUN_PLANT_LIMITS_V1,seed=1}={}){
  if(!state||state.schema!=='FINITE_GUN_PLANT_STATE_V1')throw new Error('FINITE_GUN_PLANT_STATE_V1 required');
  validateCommand(command);assertNoPrivilegedShooterData(state,{path:'gunState'});assertNoPrivilegedShooterData(limits,{path:'gunLimits'});
  for(const k of ['dt_s','visualMotorDelay_s','maxAngularVelocity_radps','maxAngularAcceleration_radps2','maxAngularJerk_radps3','motorNoiseSd_radps2'])finite(limits[k],k);
  if(limits.dt_s<=0||limits.visualMotorDelay_s<0||limits.maxAngularVelocity_radps<=0||limits.maxAngularAcceleration_radps2<=0||limits.maxAngularJerk_radps3<=0||limits.motorNoiseSd_radps2<0)throw new Error('invalid gun plant limits');
  const rand=rng01(seed);
  const az=axisStep(state.az_rad,state.azRate_radps,state.azAccel_radps2,command.desiredAz_rad,limits,gaussian(rand)*limits.motorNoiseSd_radps2);
  const el=axisStep(state.el_rad,state.elRate_radps,state.elAccel_radps2,command.desiredEl_rad,limits,gaussian(rand)*limits.motorNoiseSd_radps2);
  const out=freezePlain({schema:'FINITE_GUN_PLANT_STATE_V1',t_s:state.t_s+limits.dt_s,az_rad:az.pos,el_rad:el.pos,azRate_radps:az.rate,elRate_radps:el.rate,azAccel_radps2:az.accel,elAccel_radps2:el.accel});
  assertNoPrivilegedShooterData(out,{path:'gunState'});return out;
}

export function runFiniteGunPlant({initialState,commands,limits=PROVISIONAL_GUN_PLANT_LIMITS_V1,seed=1}={}){
  if(!Array.isArray(commands)||!commands.length)throw new Error('commands required');
  commands.forEach(validateCommand);
  let state=initialState??createGunPlantState();const states=[state];
  const delaySteps=Math.max(0,Math.round(limits.visualMotorDelay_s/limits.dt_s));
  const hold=perceivedAngularCommand({t_s:state.t_s,desiredAz_rad:state.az_rad,desiredEl_rad:state.el_rad,source:'VISUAL_MOTOR_DELAY_HOLD'});
  for(let i=0;i<commands.length;i++){
    const delayedIndex=i-delaySteps;
    const applied=delayedIndex>=0?commands[delayedIndex]:hold;
    state=stepFiniteGunPlant(state,applied,{limits,seed:seed+i*7919});states.push(state);
  }
  const result=freezePlain({schema:'FINITE_GUN_PLANT_TRACE_V1',limits,delaySteps,states});
  assertNoPrivilegedShooterData(result,{path:'gunTrace'});return result;
}

export function perceivedAngularCommand({t_s,desiredAz_rad,desiredEl_rad=0,source='LEARNER_PERCEPTION_PLAN'}={}){
  const cmd=freezePlain({schema:'PERCEIVED_ANGULAR_GUN_COMMAND_V1',t_s,desiredAz_rad,desiredEl_rad,source});
  validateCommand(cmd);return cmd;
}
