// ShotSight Virtual Shooter L0 — hidden oracle evaluation facade.
// This module is REFEREE-SIDE ONLY. Learner-facing policy code must not import it.

import {add3,sub3,scale3,norm3,dot3,unit3} from '../physics/target-engine-v1.mjs';
import {createCanonicalFlatCrosserScenario,simulateCanonicalFlatCrosser} from '../physics/canonical-flat-crosser-v1.mjs';
import {createShooterObservation,auditShooterBoundary} from './virtual-shooter-boundary-v1.mjs';
import {createNaiveNoLearningAction,L0_PUBLIC_CAMERA_R_CW} from './naive-shooter-v1.mjs';

function assertFinite(v,name){if(!Number.isFinite(v))throw new Error(`${name} must be finite`);return v;}
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}

export const L0_DISC_PROXY_RADIUS_M=0.055; // 110 mm standard-target diameter / 2. Orientation and shot cloud are NOT modelled here.
export const L0_SCORE_STATUS='ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY';

function targetPositionAtShot(scenario,shotTime_s){return add3(scenario.targetInitial_W,scale3(scenario.targetVelocity_W,shotTime_s));}

// Exact closest approach between a point target moving linearly and a pellet centreline moving at constant speed.
// This is an engineering referee metric only. It does not model pellet cloud density, clay orientation or breakability.
export function evaluateOracleShot({scenario,shotTime_s,bore_W,targetProxyRadius_m=L0_DISC_PROXY_RADIUS_M,maxFlight_s=2}={}){
  if(!scenario||scenario.status!=='ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION')throw new Error('canonical hidden scenario required');
  assertFinite(shotTime_s,'shotTime_s');assertFinite(targetProxyRadius_m,'targetProxyRadius_m');assertFinite(maxFlight_s,'maxFlight_s');
  if(!(targetProxyRadius_m>0&&maxFlight_s>0))throw new Error('invalid scoring bounds');
  const bore=unit3(bore_W);const pelletSpeed_mps=scenario.provider.speed_mps;
  const r0=sub3(targetPositionAtShot(scenario,shotTime_s),scenario.shotOrigin_W);
  const relativeVelocity=sub3(scenario.targetVelocity_W,scale3(bore,pelletSpeed_mps));
  const vv=dot3(relativeVelocity,relativeVelocity);
  let tau_s=vv>0?-dot3(r0,relativeVelocity)/vv:0;tau_s=Math.max(0,Math.min(maxFlight_s,tau_s));
  const closestVector_W=add3(r0,scale3(relativeVelocity,tau_s));
  const missDistance_m=norm3(closestVector_W);
  return freezePlain({status:L0_SCORE_STATUS,shotTime_s,closestApproachTau_s:tau_s,missDistance_m,proxyHit:missDistance_m<=targetProxyRadius_m,targetProxyRadius_m,limitations:['single pellet centreline proxy','110 mm disc-radius sensitivity only','no clay orientation','no shot cloud','no breakability model','current target dynamics remain engineering/provisional']});
}

export function createOracleCeilingAction({scenario,shotTime_s}={}){
  const state=simulateCanonicalFlatCrosser(scenario,shotTime_s);
  return freezePlain({schema:'ORACLE_ACTION_V1',status:'PRIVILEGED_REFERENCE_ONLY',shotTime_s,actionBore_W:[...state.ballistic.shotIntercept.bore_W]});
}

export function buildHiddenOracleFrames(scenario,{duration_s=1,frameRate_hz=120}={}){
  assertFinite(duration_s,'duration_s');assertFinite(frameRate_hz,'frameRate_hz');if(!(duration_s>=0&&frameRate_hz>0))throw new Error('invalid frame controls');
  const frames=[];const n=Math.round(duration_s*frameRate_hz);for(let i=0;i<=n;i++)frames.push(simulateCanonicalFlatCrosser(scenario,i/frameRate_hz));return Object.freeze(frames);
}

export function runNaiveBaselineEpisode({scenario,decisionTime_s=0.8,observationStart_s=0.18,observationStep_s=1/60,latency_s=0.08,angleNoiseSd_rad=0.0015,rateNoiseSd_radps=0.02,acquisitionQuality=0.9,seed=1,targetProxyRadius_m=L0_DISC_PROXY_RADIUS_M}={}){
  const frames=buildHiddenOracleFrames(scenario,{duration_s:decisionTime_s,frameRate_hz:120});
  const observations=[];let k=0;
  for(let t=observationStart_s;t<=decisionTime_s+1e-12;t+=observationStep_s){observations.push(createShooterObservation({oracleFrames:frames,now_s:Math.min(t,decisionTime_s),latency_s,angleNoiseSd_rad,rateNoiseSd_radps,acquisitionQuality,seed:seed+k++,context:{expectedDirection:'UNKNOWN',trapRegionKnown:true,experiment:'L0_FIXED_PUBLIC_DECISION_TIME'}}));}
  const action=createNaiveNoLearningAction(observations,{decisionTime_s,R_CW:L0_PUBLIC_CAMERA_R_CW});
  const audit=auditShooterBoundary({observations,beliefs:[action]});
  const score=action.trigger?evaluateOracleShot({scenario,shotTime_s:decisionTime_s,bore_W:action.actionBore_W,targetProxyRadius_m}):freezePlain({status:L0_SCORE_STATUS,shotTime_s:decisionTime_s,missDistance_m:null,proxyHit:false,targetProxyRadius_m});
  return freezePlain({status:'L0_NAIVE_BASELINE_EPISODE',decisionTime_s,action,audit,score});
}

export function createL0HiddenCrosserBank(){
  const defs=[
    [-7.0,32,1.45,12.0],[-6.0,35,1.50,15.0],[-5.5,38,1.55,17.0],[-8.0,42,1.60,19.0],
    [7.0,32,1.45,-12.0],[6.0,35,1.50,-15.0],[5.5,38,1.55,-17.0],[8.0,42,1.60,-19.0],
    [-4.0,28,1.35,10.0],[-9.0,45,1.70,20.0],[4.0,28,1.35,-10.0],[9.0,45,1.70,-20.0]
  ];
  return Object.freeze(defs.map(([x,y,z,vx],i)=>createCanonicalFlatCrosserScenario({targetInitial_W:[x,y,z],targetVelocity_W:[vx,0,0],shotTime_s:0.8,methodRegistryId:'NSCA_LONG_CROSSER_PULL_AWAY'})));
}

export function runL0BaselineBenchmark({seedBase=1000,targetProxyRadius_m=L0_DISC_PROXY_RADIUS_M}={}){
  const bank=createL0HiddenCrosserBank();const oracle=[],naive=[];
  for(let i=0;i<bank.length;i++){
    const scenario=bank[i],shotTime_s=0.8;
    const oracleAction=createOracleCeilingAction({scenario,shotTime_s});
    oracle.push(evaluateOracleShot({scenario,shotTime_s,bore_W:oracleAction.actionBore_W,targetProxyRadius_m}));
    naive.push(runNaiveBaselineEpisode({scenario,decisionTime_s:shotTime_s,seed:seedBase+i*100,targetProxyRadius_m}).score);
  }
  const summarise=xs=>{const misses=xs.map(x=>x.missDistance_m).filter(Number.isFinite);const hits=xs.filter(x=>x.proxyHit).length;return freezePlain({n:xs.length,proxyHits:hits,proxyHitRate:hits/xs.length,meanMissDistance_m:misses.reduce((a,b)=>a+b,0)/misses.length,maxMissDistance_m:Math.max(...misses)});};
  return freezePlain({status:'L0_BASELINE_BENCHMARK_V1',scoreStatus:L0_SCORE_STATUS,targetProxyRadius_m,oracle:summarise(oracle),naive:summarise(naive),interpretation:'Oracle is a privileged theoretical ceiling. Naive shooter sees delayed/noisy angular evidence only and points at extrapolated apparent target position with no ballistic lead or learning.'});
}
