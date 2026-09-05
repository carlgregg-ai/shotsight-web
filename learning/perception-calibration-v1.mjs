// ShotSight Virtual Shooter L1 — referee-side uncertainty calibration and held-out evaluation.
// IMPORTANT: this module may consult oracle truth only to FIT global calibration parameters
// on the calibration partition and to SCORE frozen beliefs on held-out partitions.
// The learner-side crosser belief module remains physics/oracle-free.

import {createCanonicalFlatCrosserScenario,simulateCanonicalFlatCrosser} from '../physics/canonical-flat-crosser-v1.mjs';
import {runStableCrosserPerceptionEpisode} from './perception-evaluation-v1.mjs';
import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function mulberry32(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function quantile(xs,q){if(!xs.length)throw new Error('quantile requires data');const a=[...xs].sort((x,y)=>x-y);const p=(a.length-1)*q,lo=Math.floor(p),hi=Math.ceil(p);return lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(p-lo);}
function mean(xs){return xs.reduce((a,b)=>a+b,0)/xs.length;}
function rmse(xs){return Math.sqrt(mean(xs.map(x=>x*x)));}
function gaussianNll(error,sd){const s=Math.max(1e-9,sd);return Math.log(s)+0.5*(error/s)**2;}

export function createL1PartitionedCrosserBank({seed=20260905,calibrationN=120,heldoutN=240}={}){
  if(!(Number.isInteger(calibrationN)&&calibrationN>20&&Number.isInteger(heldoutN)&&heldoutN>40))throw new Error('bank partitions too small');
  const rng=mulberry32(seed);const make=(partition,n)=>Array.from({length:n},(_,i)=>{
    const direction=rng()<0.5?-1:1;
    const range=24+22*rng();
    const speed=8+14*rng();
    const elevation=0.9+2.2*rng();
    const initialAlong=(-0.42+0.84*rng())*range;
    const scenario=createCanonicalFlatCrosserScenario({targetInitial_W:[initialAlong,range,elevation],targetVelocity_W:[direction*speed,0,0],shotTime_s:0.8});
    return freezePlain({partition,index:i,scenario});
  });
  return freezePlain({schema:'L1_PARTITIONED_CROSSER_BANK_V1',seed,calibration:make('CALIBRATION',calibrationN),heldout:make('HELDOUT',heldoutN)});
}

const CONDITIONS=Object.freeze({
  CLEAR:Object.freeze({window_s:0.30,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.90}),
  SHORT:Object.freeze({window_s:0.10,angleNoiseSd_rad:0.0020,rateNoiseSd_radps:0.03,acquisitionQuality:0.78}),
  NOISY:Object.freeze({window_s:0.26,angleNoiseSd_rad:0.0060,rateNoiseSd_radps:0.08,acquisitionQuality:0.55}),
  PARTIAL:Object.freeze({window_s:0.075,angleNoiseSd_rad:0.0045,rateNoiseSd_radps:0.07,acquisitionQuality:0.42})
});

function runPartition(entries,{seedBase,conditionName}){
  const condition=CONDITIONS[conditionName];if(!condition)throw new Error(`unknown condition ${conditionName}`);
  return entries.map((entry,i)=>runStableCrosserPerceptionEpisode({scenario:entry.scenario,...condition,seed:seedBase+i*97,predictionHorizon_s:0.12})).filter(e=>e.metrics&&e.belief?.prediction);
}

export function fitL1UncertaintyCalibration({bank=createL1PartitionedCrosserBank(),seedBase=710000}={}){
  const scales={};
  for(const [ci,name] of Object.keys(CONDITIONS).entries()){
    const episodes=runPartition(bank.calibration,{seedBase:seedBase+ci*100000,conditionName:name});
    const azZ=episodes.map(e=>Math.abs(e.metrics.azPredictionError_rad)/e.belief.prediction.azSd_rad);
    const elZ=episodes.map(e=>Math.abs(e.metrics.elPredictionError_rad)/e.belief.prediction.elSd_rad);
    // Scale each raw sigma so ~95% of CALIBRATION absolute residuals fit inside 1.96 calibrated sigma.
    // These are global learned parameters, never current-target oracle state.
    scales[name]=freezePlain({azScale:Math.max(0.5,quantile(azZ,0.95)/1.96),elScale:Math.max(0.5,quantile(elZ,0.95)/1.96),calibrationN:episodes.length});
  }
  const calibration=freezePlain({schema:'L1_UNCERTAINTY_CALIBRATION_V1',targetCoverage:0.95,scales,provenance:'FIT_ON_CALIBRATION_PARTITION_ONLY_GLOBAL_PARAMETERS'});
  assertNoPrivilegedShooterData(calibration,{path:'uncertaintyCalibration'});
  return calibration;
}

export function evaluateL1HeldoutCalibration({bank=createL1PartitionedCrosserBank(),calibration=fitL1UncertaintyCalibration({bank}),seedBase=910000}={}){
  const out={};
  for(const [ci,name] of Object.keys(CONDITIONS).entries()){
    const episodes=runPartition(bank.heldout,{seedBase:seedBase+ci*100000,conditionName:name});
    const scale=calibration.scales[name];
    const azErr=episodes.map(e=>e.metrics.azPredictionError_rad),elErr=episodes.map(e=>e.metrics.elPredictionError_rad);
    const rawAzSd=episodes.map(e=>e.belief.prediction.azSd_rad),rawElSd=episodes.map(e=>e.belief.prediction.elSd_rad);
    const calAzSd=rawAzSd.map(x=>x*scale.azScale),calElSd=rawElSd.map(x=>x*scale.elScale);
    const rawAzCoverage=mean(azErr.map((e,i)=>Math.abs(e)<=1.96*rawAzSd[i]?1:0));
    const calAzCoverage=mean(azErr.map((e,i)=>Math.abs(e)<=1.96*calAzSd[i]?1:0));
    const rawElCoverage=mean(elErr.map((e,i)=>Math.abs(e)<=1.96*rawElSd[i]?1:0));
    const calElCoverage=mean(elErr.map((e,i)=>Math.abs(e)<=1.96*calElSd[i]?1:0));
    out[name]=freezePlain({n:episodes.length,azRmse_rad:rmse(azErr),elRmse_rad:rmse(elErr),rawAzCoverage95:rawAzCoverage,calibratedAzCoverage95:calAzCoverage,rawElCoverage95:rawElCoverage,calibratedElCoverage95:calElCoverage,rawAzMeanNll:mean(azErr.map((e,i)=>gaussianNll(e,rawAzSd[i]))),calibratedAzMeanNll:mean(azErr.map((e,i)=>gaussianNll(e,calAzSd[i]))),rawElMeanNll:mean(elErr.map((e,i)=>gaussianNll(e,rawElSd[i]))),calibratedElMeanNll:mean(elErr.map((e,i)=>gaussianNll(e,calElSd[i]))),meanConfidence:mean(episodes.map(e=>e.belief.confidence)),azScale:scale.azScale,elScale:scale.elScale});
  }
  return freezePlain({status:'L1_HELDOUT_CALIBRATION_EVALUATION_V1',bank:{seed:bank.seed,calibrationN:bank.calibration.length,heldoutN:bank.heldout.length},calibration,out,interpretation:'Calibration scales are fit only on calibration targets; all reported coverage/NLL here is on untouched held-out target scenarios with independent observation-noise seeds.'});
}
