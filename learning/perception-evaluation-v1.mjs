// ShotSight Virtual Shooter L1 — referee-side perception evaluation.
// Oracle truth is used only after the learner belief is formed.

import {simulateCanonicalFlatCrosser} from '../physics/canonical-flat-crosser-v1.mjs';
import {createShooterObservation,auditShooterBoundary} from './virtual-shooter-boundary-v1.mjs';
import {buildStableCrosserBelief} from './crosser-belief-v1.mjs';
import {createL0HiddenCrosserBank,buildHiddenOracleFrames} from './oracle-evaluation-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function mean(xs){return xs.reduce((a,b)=>a+b,0)/xs.length;}

export function runStableCrosserPerceptionEpisode({scenario,evalTime_s=0.62,window_s=0.30,latency_s=0.08,angleNoiseSd_rad=0.0015,rateNoiseSd_radps=0.02,acquisitionQuality=0.9,seed=1,predictionHorizon_s=0.12}={}){
  const frames=buildHiddenOracleFrames(scenario,{duration_s:1.0,frameRate_hz:120});const observations=[];let k=0;
  const start=Math.max(0,evalTime_s-window_s);
  for(let t=start;t<=evalTime_s+1e-12;t+=1/60)observations.push(createShooterObservation({oracleFrames:frames,now_s:t,latency_s,angleNoiseSd_rad,rateNoiseSd_radps,acquisitionQuality,seed:seed+k++,context:{trapRegionKnown:true,experiment:'L1_STABLE_CROSSER_READING'}}));
  const belief=buildStableCrosserBelief(observations,{predictionHorizon_s,maxHistory_s:window_s});
  auditShooterBoundary({observations,beliefs:[belief]});
  if(!belief.prediction)return freezePlain({status:'INSUFFICIENT_HISTORY',belief,metrics:null});
  const truthTime=belief.prediction.fromObservationTime_s+belief.prediction.horizon_s;
  const truth=simulateCanonicalFlatCrosser(scenario,truthTime).target;
  const prev=simulateCanonicalFlatCrosser(scenario,Math.max(0,truthTime-1/120)).target;
  const trueDirection=truth.az_rad>=prev.az_rad?'RIGHT':'LEFT';const pTrue=belief.directionProb[trueDirection];
  const azError=belief.prediction.azMean_rad-truth.az_rad,elError=belief.prediction.elMean_rad-truth.el_rad;
  return freezePlain({status:'L1_PERCEPTION_EPISODE',belief,metrics:{trueDirection,directionCorrect:(belief.directionProb.RIGHT>=0.5?'RIGHT':'LEFT')===trueDirection,directionBrier:(1-pTrue)*(1-pTrue),azPredictionError_rad:azError,elPredictionError_rad:elError,azCovered2Sd:Math.abs(azError)<=2*belief.prediction.azSd_rad,elCovered2Sd:Math.abs(elError)<=2*belief.prediction.elSd_rad}});
}

export function runL1StableCrosserBenchmark({seedBase=5000}={}){
  const bank=createL0HiddenCrosserBank();
  const conditions=Object.freeze({
    CLEAR:{window_s:0.30,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.9},
    SHORT:{window_s:0.11,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.9},
    NOISY:{window_s:0.30,angleNoiseSd_rad:0.006,rateNoiseSd_radps:0.08,acquisitionQuality:0.55}
  });
  const out={};let c=0;
  for(const [name,condition] of Object.entries(conditions)){
    const episodes=bank.map((scenario,i)=>runStableCrosserPerceptionEpisode({scenario,...condition,seed:seedBase+c*10000+i*100}));c++;
    const valid=episodes.filter(e=>e.metrics);const confidence=valid.map(e=>e.belief.confidence);
    out[name]=freezePlain({n:episodes.length,validN:valid.length,directionAccuracy:valid.filter(e=>e.metrics.directionCorrect).length/valid.length,directionBrier:mean(valid.map(e=>e.metrics.directionBrier)),azRmse_rad:Math.sqrt(mean(valid.map(e=>e.metrics.azPredictionError_rad**2))),elRmse_rad:Math.sqrt(mean(valid.map(e=>e.metrics.elPredictionError_rad**2))),azCoverage2Sd:valid.filter(e=>e.metrics.azCovered2Sd).length/valid.length,elCoverage2Sd:valid.filter(e=>e.metrics.elCovered2Sd).length/valid.length,meanConfidence:mean(confidence)});
  }
  return freezePlain({status:'L1_STABLE_CROSSER_BENCHMARK_V1',conditions:out,interpretation:'Gun-free perception test. Beliefs are formed solely from ShooterObservation; oracle is consulted only afterward for scoring.'});
}
