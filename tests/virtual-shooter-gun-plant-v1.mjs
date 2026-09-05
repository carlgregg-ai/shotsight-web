import assert from 'node:assert/strict';
import {createGunPlantState,perceivedAngularCommand,runFiniteGunPlant,PROVISIONAL_GUN_PLANT_LIMITS_V1} from '../learning/gun-plant-v1.mjs';

const dt=PROVISIONAL_GUN_PLANT_LIMITS_V1.dt_s;
const cmds=Array.from({length:120},(_,i)=>perceivedAngularCommand({t_s:i*dt,desiredAz_rad:0.6,desiredEl_rad:0.1}));
const trace=runFiniteGunPlant({initialState:createGunPlantState(),commands:cmds});
assert.equal(trace.schema,'FINITE_GUN_PLANT_TRACE_V1');
const s=trace.states;
assert.ok(Math.abs(s[1].az_rad)<1e-12,'plant must not teleport on first step');
const delaySteps=trace.delaySteps;
for(let i=1;i<=delaySteps;i++)assert.ok(Math.abs(s[i].az_rad)<1e-12,'plant must remain still during visual-motor delay');
assert.ok(Math.abs(s[delaySteps+1].az_rad)>0,'plant should begin responding after visual-motor delay');
let maxV=0,maxA=0,maxJ=0;
for(let i=1;i<s.length;i++){
  maxV=Math.max(maxV,Math.abs(s[i].azRate_radps),Math.abs(s[i].elRate_radps));
  maxA=Math.max(maxA,Math.abs(s[i].azAccel_radps2),Math.abs(s[i].elAccel_radps2));
  if(i>1)maxJ=Math.max(maxJ,Math.abs((s[i].azAccel_radps2-s[i-1].azAccel_radps2)/dt),Math.abs((s[i].elAccel_radps2-s[i-1].elAccel_radps2)/dt));
}
assert.ok(maxV<=PROVISIONAL_GUN_PLANT_LIMITS_V1.maxAngularVelocity_radps+1e-10);
assert.ok(maxA<=PROVISIONAL_GUN_PLANT_LIMITS_V1.maxAngularAcceleration_radps2+1e-10);
assert.ok(maxJ<=PROVISIONAL_GUN_PLANT_LIMITS_V1.maxAngularJerk_radps3+1e-8);
assert.ok(s.at(-1).az_rad>0.25,'plant should make substantial finite progress toward command');
assert.ok(s.at(-1).az_rad<0.65,'plant should not grossly overshoot steady command');
assert.throws(()=>runFiniteGunPlant({initialState:createGunPlantState(),commands:[{schema:'PERCEIVED_ANGULAR_GUN_COMMAND_V1',t_s:0,desiredAz_rad:0.1,desiredEl_rad:0,requiredLead:2}]}),/PRIVILEGED_STATE_LEAK|requiredLead/);
console.log(JSON.stringify({status:'PASS',delaySteps,maxV,maxA,maxJ,finalAz:s.at(-1).az_rad,firstStepAz:s[1].az_rad},null,2));
