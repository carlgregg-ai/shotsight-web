// ShotSight Virtual Shooter L1 — referee-side multi-family perception evaluation.
// Oracle family and trajectory are used to build hidden worlds and score AFTER belief formation.

import {createCanonicalFlatCrosserScenario,simulateCanonicalFlatCrosser} from '../physics/canonical-flat-crosser-v1.mjs';
import {createCanonicalQuartererScenario,simulateCanonicalQuarterer} from '../physics/canonical-quarterer-v1.mjs';
import {createCanonicalLooperGravityScenario,simulateCanonicalLooperGravity} from '../physics/canonical-looper-gravity-v1.mjs';
import {createShooterObservation,auditShooterBoundary} from './virtual-shooter-boundary-v1.mjs';
import {fitFamilyPrototypeModel,buildMultiFamilyBelief} from './multifamily-belief-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function mean(xs){return xs.reduce((a,b)=>a+b,0)/xs.length;}
function rng(seed){let x=(seed|0)||0x6d2b79f5;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return ((x>>>0)+0.5)/4294967296;};}
function uniform(r,a,b){return a+(b-a)*r();}
function choice(r,xs){return xs[Math.min(xs.length-1,Math.floor(r()*xs.length))];}

function createScenario(family,seed){
  const r=rng(seed),side=r()<0.5?-1:1;
  if(family==='CROSSER')return createCanonicalFlatCrosserScenario({targetInitial_W:[-side*uniform(r,3,8),uniform(r,24,45),uniform(r,1.2,2.2)],targetVelocity_W:[side*uniform(r,9,18),uniform(r,-0.5,0.5),uniform(r,-0.3,0.3)],shotTime_s:0.8});
  if(family==='QUARTERER')return createCanonicalQuartererScenario({targetInitial_W:[-side*uniform(r,3,8),uniform(r,20,38),uniform(r,1.2,2.2)],targetVelocity_W:[side*uniform(r,9,16),choice(r,[-1,1])*uniform(r,3,8),uniform(r,-0.3,0.3)],shotTime_s:0.8});
  if(family==='LOOPER')return createCanonicalLooperGravityScenario({targetInitial_W:[-side*uniform(r,2,6),uniform(r,18,30),uniform(r,1.0,2.0)],targetInitialVelocity_W:[side*uniform(r,7,13),uniform(r,1,5),uniform(r,7,13)],shotTime_s:1.0});
  throw new Error(`unsupported family ${family}`);
}
function simulateRecord(record,t){if(record.family==='CROSSER')return simulateCanonicalFlatCrosser(record.scenario,t);if(record.family==='QUARTERER')return simulateCanonicalQuarterer(record.scenario,t);return simulateCanonicalLooperGravity(record.scenario,t);}
function hiddenFrames(record,{duration_s=1.05,frameRate_hz=120}={}){const out=[];for(let i=0;i<=Math.round(duration_s*frameRate_hz);i++){const t=i/frameRate_hz;const s=simulateRecord(record,t);out.push(Object.freeze({t_s:t,target:Object.freeze({az_rad:s.target.az_rad,el_rad:s.target.el_rad})}));}return Object.freeze(out);}

export function createL1MultiFamilyBank({nPerFamily=90,seedBase=41000}={}){
  const records=[];for(const family of ['CROSSER','QUARTERER','LOOPER'])for(let i=0;i<nPerFamily;i++)records.push(freezePlain({id:`${family}_${i}`,family,scenario:createScenario(family,seedBase+i+(family==='CROSSER'?0:family==='QUARTERER'?10000:20000))}));return Object.freeze(records);
}

function observationHistory(record,{evalTime_s=0.62,window_s=0.30,latency_s=0.08,angleNoiseSd_rad=0.0015,rateNoiseSd_radps=0.02,acquisitionQuality=0.9,seed=1}={}){
  const frames=hiddenFrames(record),obs=[];let k=0;const start=Math.max(0,evalTime_s-window_s);
  for(let t=start;t<=evalTime_s+1e-12;t+=1/60)obs.push(createShooterObservation({oracleFrames:frames,now_s:t,latency_s,angleNoiseSd_rad,rateNoiseSd_radps,acquisitionQuality,seed:seed+k++,context:{trapRegionKnown:true,experiment:'L1_MULTIFAMILY_READING'}}));
  return Object.freeze(obs);
}

export function trainL1FamilyPrototypeModel({nPerFamily=90,seedBase=41000}={}){
  const bank=createL1MultiFamilyBank({nPerFamily,seedBase});
  const examples=bank.map((record,i)=>({family:record.family,observationHistory:observationHistory(record,{window_s:0.30,seed:seedBase*3+i*100})}));
  return fitFamilyPrototypeModel(examples);
}

function argmax(obj){return Object.entries(obj).sort((a,b)=>b[1]-a[1])[0][0];}
function truthAngles(record,t){const s=simulateRecord(record,t);return {az:s.target.az_rad,el:s.target.el_rad};}
function evaluateCondition({bank,model,condition,seedBase}){
  const episodes=[];
  for(let i=0;i<bank.length;i++){
    const record=bank[i],history=observationHistory(record,{...condition,seed:seedBase+i*100});const belief=buildMultiFamilyBelief(history,{model,predictionHorizon_s:0.12,maxHistory_s:condition.window_s});auditShooterBoundary({observations:history,beliefs:[belief]});
    if(!belief.prediction){episodes.push({family:record.family,belief,valid:false});continue;}
    const truth=truthAngles(record,belief.prediction.fromObservationTime_s+belief.prediction.horizon_s),pred=argmax(belief.familyProb);let brier=0;for(const f of ['CROSSER','QUARTERER','LOOPER'])brier+=(belief.familyProb[f]-(f===record.family?1:0))**2;
    episodes.push({family:record.family,pred,belief,valid:true,correct:pred===record.family,brier,azError:belief.prediction.azMean_rad-truth.az,elError:belief.prediction.elMean_rad-truth.el});
  }
  const valid=episodes.filter(e=>e.valid),byFamily={};for(const f of ['CROSSER','QUARTERER','LOOPER']){const xs=valid.filter(e=>e.family===f);byFamily[f]={n:xs.length,recall:xs.filter(e=>e.correct).length/xs.length,meanTrueProbability:mean(xs.map(e=>e.belief.familyProb[f]))};}
  const cq=valid.filter(e=>e.family!=='LOOPER');
  return freezePlain({n:episodes.length,validN:valid.length,accuracy:valid.filter(e=>e.correct).length/valid.length,multiclassBrier:mean(valid.map(e=>e.brier)),meanConfidence:mean(valid.map(e=>e.belief.confidence)),azRmse_rad:Math.sqrt(mean(valid.map(e=>e.azError**2))),elRmse_rad:Math.sqrt(mean(valid.map(e=>e.elError**2))),crosserQuartererAccuracy:cq.filter(e=>e.correct).length/cq.length,byFamily});
}

export function runL1MultiFamilyBenchmark({trainNPerFamily=90,heldoutNPerFamily=180,trainSeedBase=41000,heldoutSeedBase=81000}={}){
  const model=trainL1FamilyPrototypeModel({nPerFamily:trainNPerFamily,seedBase:trainSeedBase}),heldout=createL1MultiFamilyBank({nPerFamily:heldoutNPerFamily,seedBase:heldoutSeedBase});
  const conditions={FULL_300MS:{window_s:0.30,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.9},SHORT_240MS:{window_s:0.24,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.75},PARTIAL_220MS:{window_s:0.22,angleNoiseSd_rad:0.0030,rateNoiseSd_radps:0.05,acquisitionQuality:0.45}};
  const out={};let c=0;for(const [name,condition] of Object.entries(conditions))out[name]=evaluateCondition({bank:heldout,model,condition,seedBase:heldoutSeedBase*5+c++*100000});
  return freezePlain({status:'L1_MULTIFAMILY_HELDOUT_BENCHMARK_V1',training:{nPerFamily:trainNPerFamily,total:trainNPerFamily*3},heldout:{nPerFamily:heldoutNPerFamily,total:heldoutNPerFamily*3},model,conditions:out,interpretation:'Gun-free family/path belief test. Oracle family is used only for training labels and post-belief scoring; held-out runtime input is ShooterObservation only.'});
}
