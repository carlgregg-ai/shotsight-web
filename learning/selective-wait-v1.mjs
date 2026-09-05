// ShotSight Virtual Shooter L1 — calibrated family belief + WAIT_FOR_MORE_INFORMATION experiment.
// This module is referee-side for calibration/evaluation. Runtime wait decisions consume belief probabilities only.

import {simulateCanonicalFlatCrosser} from '../physics/canonical-flat-crosser-v1.mjs';
import {simulateCanonicalQuarterer} from '../physics/canonical-quarterer-v1.mjs';
import {simulateCanonicalLooperGravity} from '../physics/canonical-looper-gravity-v1.mjs';
import {buildMultiFamilyBelief} from './multifamily-belief-v1.mjs';
import {auditShooterBoundary} from './virtual-shooter-boundary-v1.mjs';
import {createL1MultiFamilyBank,createL1ObservationHistory,trainL1FamilyPrototypeModel} from './multifamily-evaluation-v1.mjs';

const FAMILIES=Object.freeze(['CROSSER','QUARTERER','LOOPER']);
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function mean(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:NaN;}
function argmax(obj){return Object.entries(obj).sort((a,b)=>b[1]-a[1])[0][0];}
function entropy(p){let h=0;for(const v of Object.values(p))if(v>0)h-=v*Math.log(v);return h/Math.log(FAMILIES.length);}
function nll(prob,trueFamily){return -Math.log(Math.max(1e-12,prob[trueFamily]));}
function brier(prob,trueFamily){let s=0;for(const f of FAMILIES)s+=(prob[f]-(f===trueFamily?1:0))**2;return s;}
function calibrateProb(prob,temperature){let z=0;const q={};for(const f of FAMILIES){q[f]=Math.pow(Math.max(1e-12,prob[f]),1/temperature);z+=q[f];}for(const f of FAMILIES)q[f]/=z;return freezePlain(q);}
function confidence(prob){return Math.max(...Object.values(prob));}
function simulateRecord(record,t){if(record.family==='CROSSER')return simulateCanonicalFlatCrosser(record.scenario,t);if(record.family==='QUARTERER')return simulateCanonicalQuarterer(record.scenario,t);return simulateCanonicalLooperGravity(record.scenario,t);}
function truthAngles(record,t){const s=simulateRecord(record,t);return {az:s.target.az_rad,el:s.target.el_rad};}

function makeBelief(record,model,{wait_s=0,seed=1}={}){
  const baseWindow=0.22,evalTime=0.62+wait_s,window=baseWindow+wait_s;
  const history=createL1ObservationHistory(record,{evalTime_s:evalTime,window_s:window,latency_s:0.08,angleNoiseSd_rad:0.0030,rateNoiseSd_radps:0.05,acquisitionQuality:0.45,seed});
  const belief=buildMultiFamilyBelief(history,{model,predictionHorizon_s:0.12,maxHistory_s:Math.min(0.37,window)});
  auditShooterBoundary({observations:history,beliefs:[belief]});
  return {history,belief};
}

export function fitFamilyTemperature(calibrationEpisodes){
  let best={temperature:1,nll:Infinity};
  for(let t=0.35;t<=3.0001;t+=0.05){const loss=mean(calibrationEpisodes.map(e=>nll(calibrateProb(e.belief.familyProb,t),e.family)));if(loss<best.nll)best={temperature:Number(t.toFixed(2)),nll:loss};}
  return freezePlain({schema:'FAMILY_TEMPERATURE_CALIBRATION_V1',...best,boundary:'FITTED_ON_LABELLED_CALIBRATION_PARTITION_ONLY'});
}

function reliabilityMetrics(episodes,temperature,{bins=10}={}){
  const rows=episodes.map(e=>{const p=calibrateProb(e.belief.familyProb,temperature),c=confidence(p),pred=argmax(p);return {...e,prob:p,confidence:c,correct:pred===e.family,brier:brier(p,e.family)};});
  let ece=0;const reliability=[];
  for(let i=0;i<bins;i++){const lo=i/bins,hi=(i+1)/bins,xs=rows.filter(r=>r.confidence>=lo&&(i===bins-1?r.confidence<=hi:r.confidence<hi));if(!xs.length)continue;const acc=mean(xs.map(x=>x.correct?1:0)),conf=mean(xs.map(x=>x.confidence));ece+=(xs.length/rows.length)*Math.abs(acc-conf);reliability.push({lo,hi,n:xs.length,accuracy:acc,meanConfidence:conf});}
  return freezePlain({n:rows.length,accuracy:mean(rows.map(r=>r.correct?1:0)),meanConfidence:mean(rows.map(r=>r.confidence)),multiclassBrier:mean(rows.map(r=>r.brier)),ece,reliability});
}

function buildEpisodeViews(bank,model,seedBase){
  return bank.map((record,i)=>{
    const stages={};for(const wait_s of [0,0.05,0.10,0.15])stages[wait_s.toFixed(2)]=makeBelief(record,model,{wait_s,seed:seedBase+i*100});
    return {record,family:record.family,stages};
  });
}

function choosePolicy(calibrationViews,temperature){
  const thresholds=[];for(let x=0.38;x<=0.82+1e-9;x+=0.02)thresholds.push(Number(x.toFixed(2)));
  let best=null;
  for(const firstThreshold of thresholds)for(const secondThreshold of thresholds){
    if(secondThreshold>firstThreshold+0.12)continue;
    let correct=0,totalWait=0;
    for(const e of calibrationViews){
      const p0=calibrateProb(e.stages['0.00'].belief.familyProb,temperature);let chosen=e.stages['0.00'],wait=0;
      if(confidence(p0)<firstThreshold){chosen=e.stages['0.10'];wait=0.10;const p1=calibrateProb(chosen.belief.familyProb,temperature);if(confidence(p1)<secondThreshold){chosen=e.stages['0.15'];wait=0.15;}}
      const p=calibrateProb(chosen.belief.familyProb,temperature);if(argmax(p)===e.family)correct++;totalWait+=wait;
    }
    const accuracy=correct/calibrationViews.length,meanWait_s=totalWait/calibrationViews.length;
    if(meanWait_s>0.105)continue;
    const candidate={firstThreshold,secondThreshold,accuracy,meanWait_s};
    if(!best||candidate.accuracy>best.accuracy+1e-12||(Math.abs(candidate.accuracy-best.accuracy)<1e-12&&candidate.meanWait_s<best.meanWait_s))best=candidate;
  }
  if(!best)throw new Error('no selective-wait policy satisfied calibration wait budget');
  return freezePlain({schema:'SELECTIVE_WAIT_POLICY_V1',...best,maxWait_s:0.15,firstWait_s:0.10,secondWait_s:0.05,trainingRule:'MAXIMISE_CALIBRATION_ACCURACY_SUBJECT_TO_MEAN_WAIT_LE_105MS; TIE_BREAK_MIN_WAIT',runtimeInputs:['CALIBRATED_FAMILY_PROBABILITIES']});
}

function evaluateViews(views,temperature,policy){
  const rows=[];
  for(const e of views){
    const initial=e.stages['0.00'];const initialProb=calibrateProb(initial.belief.familyProb,temperature);let chosen=initial,wait_s=0,decision='COMMIT_NOW';
    if(confidence(initialProb)<policy.firstThreshold){chosen=e.stages['0.10'];wait_s=0.10;decision='WAIT_100MS';const p1=calibrateProb(chosen.belief.familyProb,temperature);if(confidence(p1)<policy.secondThreshold){chosen=e.stages['0.15'];wait_s=0.15;decision='WAIT_150MS_TOTAL';}}
    const prob=calibrateProb(chosen.belief.familyProb,temperature),pred=argmax(prob),prediction=chosen.belief.prediction;let azError=NaN,elError=NaN;
    if(prediction){const truth=truthAngles(e.record,prediction.fromObservationTime_s+prediction.horizon_s);azError=prediction.azMean_rad-truth.az;elError=prediction.elMean_rad-truth.el;}
    rows.push({family:e.family,pred,correct:pred===e.family,prob,confidence:confidence(prob),entropy:entropy(prob),wait_s,decision,azError,elError});
  }
  const cq=rows.filter(r=>r.family!=='LOOPER'),waited=rows.filter(r=>r.wait_s>0),validPath=rows.filter(r=>Number.isFinite(r.azError));
  return freezePlain({n:rows.length,accuracy:mean(rows.map(r=>r.correct?1:0)),crosserQuartererAccuracy:mean(cq.map(r=>r.correct?1:0)),meanConfidence:mean(rows.map(r=>r.confidence)),meanEntropy:mean(rows.map(r=>r.entropy)),meanWait_s:mean(rows.map(r=>r.wait_s)),waitRate:waited.length/rows.length,waitedAccuracy:waited.length?mean(waited.map(r=>r.correct?1:0)):NaN,multiclassBrier:mean(rows.map(r=>brier(r.prob,r.family))),azRmse_rad:Math.sqrt(mean(validPath.map(r=>r.azError**2))),elRmse_rad:Math.sqrt(mean(validPath.map(r=>r.elError**2)))});
}

function fixedStageMetrics(views,temperature,key){
  const rows=views.map(e=>{const b=e.stages[key].belief,p=calibrateProb(b.familyProb,temperature),pred=argmax(p);let azError=NaN,elError=NaN;if(b.prediction){const truth=truthAngles(e.record,b.prediction.fromObservationTime_s+b.prediction.horizon_s);azError=b.prediction.azMean_rad-truth.az;elError=b.prediction.elMean_rad-truth.el;}return {family:e.family,correct:pred===e.family,p,conf:confidence(p),azError,elError};});
  const cq=rows.filter(r=>r.family!=='LOOPER');return freezePlain({accuracy:mean(rows.map(r=>r.correct?1:0)),crosserQuartererAccuracy:mean(cq.map(r=>r.correct?1:0)),meanConfidence:mean(rows.map(r=>r.conf)),multiclassBrier:mean(rows.map(r=>brier(r.p,r.family))),azRmse_rad:Math.sqrt(mean(rows.map(r=>r.azError**2))),elRmse_rad:Math.sqrt(mean(rows.map(r=>r.elError**2)))});
}

export function runL1SelectiveWaitBenchmark({trainNPerFamily=90,calibrationNPerFamily=120,heldoutNPerFamily=240,trainSeedBase=41000,calibrationSeedBase=121000,heldoutSeedBase=181000}={}){
  const model=trainL1FamilyPrototypeModel({nPerFamily:trainNPerFamily,seedBase:trainSeedBase});
  const calibrationBank=createL1MultiFamilyBank({nPerFamily:calibrationNPerFamily,seedBase:calibrationSeedBase}),heldoutBank=createL1MultiFamilyBank({nPerFamily:heldoutNPerFamily,seedBase:heldoutSeedBase});
  const calibrationViews=buildEpisodeViews(calibrationBank,model,calibrationSeedBase*7),heldoutViews=buildEpisodeViews(heldoutBank,model,heldoutSeedBase*7);
  const calibrationInitial=calibrationViews.map(e=>({family:e.family,belief:e.stages['0.00'].belief})),temperatureFit=fitFamilyTemperature(calibrationInitial),temperature=temperatureFit.temperature;
  const policy=choosePolicy(calibrationViews,temperature),heldoutInitial=heldoutViews.map(e=>({family:e.family,belief:e.stages['0.00'].belief}));
  const calibrationReliability=reliabilityMetrics(calibrationInitial,temperature),heldoutReliability=reliabilityMetrics(heldoutInitial,temperature);
  const immediate=fixedStageMetrics(heldoutViews,temperature,'0.00'),wait50=fixedStageMetrics(heldoutViews,temperature,'0.05'),wait100=fixedStageMetrics(heldoutViews,temperature,'0.10'),wait150=fixedStageMetrics(heldoutViews,temperature,'0.15'),selective=evaluateViews(heldoutViews,temperature,policy);
  return freezePlain({status:'L1_SELECTIVE_WAIT_HELDOUT_BENCHMARK_V1',partitions:{training:trainNPerFamily*3,calibration:calibrationNPerFamily*3,heldout:heldoutNPerFamily*3},temperatureFit,policy,calibrationReliability,heldoutInitialReliability:heldoutReliability,heldout:{immediate,wait50,wait100,wait150,selective},interpretation:'The policy is fitted on a separate labelled calibration partition, but each runtime COMMIT/WAIT decision uses only calibrated probabilities derived from ShooterObservation history. Oracle family/trajectory are consulted only after a decision for scoring.'});
}
