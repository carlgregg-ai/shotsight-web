// ShotSight Virtual Shooter L1 — perception-only multi-family belief model.
// Learner-side runtime consumes ShooterObservation histories only. No physics/oracle imports.

import {validateShooterObservation,assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

const FAMILIES=Object.freeze(['CROSSER','QUARTERER','LOOPER']);
function clamp(v,lo,hi){return Math.min(hi,Math.max(lo,v));}
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function mean(xs){return xs.reduce((a,b)=>a+b,0)/xs.length;}
function solve3(A,b){
  const m=A.map((r,i)=>[...r,b[i]]);
  for(let c=0;c<3;c++){
    let p=c;for(let r=c+1;r<3;r++)if(Math.abs(m[r][c])>Math.abs(m[p][c]))p=r;
    if(Math.abs(m[p][c])<1e-12)return null;[m[c],m[p]]=[m[p],m[c]];
    const q=m[c][c];for(let j=c;j<4;j++)m[c][j]/=q;
    for(let r=0;r<3;r++)if(r!==c){const f=m[r][c];for(let j=c;j<4;j++)m[r][j]-=f*m[c][j];}
  }
  return [m[0][3],m[1][3],m[2][3]];
}
function fitQuadratic(points,key){
  const n=points.length;if(n<5)return null;const tEnd=points.at(-1).observationTime_s;
  let s0=n,s1=0,s2=0,s3=0,s4=0,y0=0,y1=0,y2=0;
  for(const p of points){const t=p.observationTime_s-tEnd,y=p[key],t2=t*t;s1+=t;s2+=t2;s3+=t2*t;s4+=t2*t2;y0+=y;y1+=y*t;y2+=y*t2;}
  const beta=solve3([[s0,s1,s2],[s1,s2,s3],[s2,s3,s4]],[y0,y1,y2]);if(!beta)return null;
  let sse=0;for(const p of points){const t=p.observationTime_s-tEnd,r=p[key]-(beta[0]+beta[1]*t+beta[2]*t*t);sse+=r*r;}
  return {value:beta[0],rate:beta[1],accel:2*beta[2],residualSd:Math.sqrt(sse/Math.max(1,n-3)),span_s:points.at(-1).observationTime_s-points[0].observationTime_s,n};
}

export function extractMultiFamilyFeatures(observationHistory,{maxHistory_s=0.35}={}){
  if(!Array.isArray(observationHistory)||!observationHistory.length)throw new Error('observationHistory required');observationHistory.forEach(validateShooterObservation);
  const visible=observationHistory.filter(o=>o.visible);if(visible.length<5)return null;
  const end=visible.at(-1).observationTime_s,recent=visible.filter(o=>o.observationTime_s>=end-maxHistory_s-1e-12);
  if(recent.length<5)return null;const az=fitQuadratic(recent,'az_rad'),el=fitQuadratic(recent,'el_rad');if(!az||!el)return null;
  const quality=mean(recent.map(o=>o.acquisitionQuality));
  const featureVector=[Math.abs(az.rate),Math.abs(az.accel)/(Math.abs(az.rate)+0.05),Math.abs(el.rate),Math.abs(el.accel)];
  return freezePlain({schema:'MULTIFAMILY_FEATURES_V1',featureVector,az,el,quality,span_s:Math.min(az.span_s,el.span_s),samples:recent.length,lastObservationTime_s:end});
}

// Training helper. Family labels are allowed only in the labelled calibration/training partition.
// Runtime classification receives only the resulting statistical prototypes plus ShooterObservation.
export function fitFamilyPrototypeModel(labelledExamples){
  if(!Array.isArray(labelledExamples)||!labelledExamples.length)throw new Error('labelledExamples required');
  const groups=Object.fromEntries(FAMILIES.map(f=>[f,[]]));
  for(const ex of labelledExamples){if(!groups[ex.family])throw new Error(`unsupported family ${ex.family}`);const f=extractMultiFamilyFeatures(ex.observationHistory);if(f)groups[ex.family].push(f.featureVector);}
  const floors=[0.03,0.04,0.01,0.03],prototypes={};
  for(const family of FAMILIES){const xs=groups[family];if(xs.length<12)throw new Error(`insufficient training examples for ${family}`);const mu=xs[0].map((_,j)=>mean(xs.map(x=>x[j])));const sd=mu.map((m,j)=>Math.max(floors[j],Math.sqrt(mean(xs.map(x=>(x[j]-m)**2)))));prototypes[family]={mean:mu,sd,n:xs.length};}
  const model=freezePlain({schema:'MULTIFAMILY_PROTOTYPE_MODEL_V1',families:FAMILIES,features:['ABS_AZ_RATE','NORMALISED_ABS_AZ_ACCEL','ABS_EL_RATE','ABS_EL_ACCEL'],prototypes,trainingBoundary:'LABELS_USED_ONLY_TO_FIT_PROTOTYPES; RUNTIME_INPUT_IS_SHOOTER_OBSERVATION_ONLY'});
  assertNoPrivilegedShooterData(model,{path:'familyModel'});return model;
}

function familyProbabilities(features,model){
  if(!model||model.schema!=='MULTIFAMILY_PROTOTYPE_MODEL_V1')throw new Error('multi-family prototype model required');
  const x=features.featureVector,scores={};
  for(const family of FAMILIES){const p=model.prototypes[family];let d=0,logScale=0;for(let j=0;j<x.length;j++){const z=(x[j]-p.mean[j])/p.sd[j];d+=z*z;logScale+=Math.log(p.sd[j]);}scores[family]=-0.5*d-logScale;}
  const max=Math.max(...Object.values(scores)),raw={};let denom=0;for(const family of FAMILIES){raw[family]=Math.exp((scores[family]-max)/1.7);denom+=raw[family];}
  const timeReliability=clamp(features.span_s/0.28,0,1),sampleReliability=clamp((features.samples-4)/10,0,1),fitNoise=features.az.residualSd+features.el.residualSd;
  const fitReliability=1/(1+80*fitNoise),reliability=clamp(features.quality*timeReliability*(0.45+0.55*sampleReliability)*fitReliability,0,0.96);
  const out={};for(const family of FAMILIES)out[family]=reliability*(raw[family]/denom)+(1-reliability)/FAMILIES.length;
  return {probabilities:out,reliability};
}

export function buildMultiFamilyBelief(observationHistory,{model,predictionHorizon_s=0.12,maxHistory_s=0.35}={}){
  if(!(Number.isFinite(predictionHorizon_s)&&predictionHorizon_s>=0))throw new Error('invalid predictionHorizon_s');
  const features=extractMultiFamilyFeatures(observationHistory,{maxHistory_s});
  if(!features)return freezePlain({schema:'MULTIFAMILY_BELIEF_V1',status:'INSUFFICIENT_VISUAL_HISTORY',confidence:0,familyProb:{CROSSER:1/3,QUARTERER:1/3,LOOPER:1/3},prediction:null});
  const fp=familyProbabilities(features,model),familyProb=fp.probabilities;
  const dt=predictionHorizon_s,azMean=features.az.value+features.az.rate*dt+0.5*features.az.accel*dt*dt,elMean=features.el.value+features.el.rate*dt+0.5*features.el.accel*dt*dt;
  const qualityPenalty=1/Math.max(0.2,features.quality),spanPenalty=1+Math.max(0,0.28-features.span_s)*5;
  const azSd=Math.max(0.002,qualityPenalty*spanPenalty*(features.az.residualSd+0.0025+0.04*Math.abs(features.az.accel)*dt*dt));
  const elSd=Math.max(0.002,qualityPenalty*spanPenalty*(features.el.residualSd+0.0025+0.04*Math.abs(features.el.accel)*dt*dt));
  const sorted=Object.values(familyProb).sort((a,b)=>b-a),margin=sorted[0]-sorted[1],confidence=clamp(fp.reliability*(0.45+0.55*margin),0,0.98);
  const changingEvidence=clamp(Math.abs(features.el.accel)/0.35+Math.abs(features.az.accel)/(Math.abs(features.az.rate)+0.1)*0.25,0,1);
  const belief=freezePlain({schema:'MULTIFAMILY_BELIEF_V1',status:'TARGET_FAMILY_AND_PATH_BELIEF',confidence,familyProb,motionPhaseProb:{STABLE:1-changingEvidence,CHANGING:changingEvidence},apparentMotion:{azRateMean_radps:features.az.rate,azAccelMean_radps2:features.az.accel,elRateMean_radps:features.el.rate,elAccelMean_radps2:features.el.accel,observationSpan_s:features.span_s,samples:features.samples},prediction:{fromObservationTime_s:features.lastObservationTime_s,horizon_s:dt,azMean_rad:azMean,elMean_rad:elMean,azSd_rad:azSd,elSd_rad:elSd},uncertainty:{class:'PERCEPTUAL_MULTIFAMILY_BELIEF_NOT_ORACLE',reliability:fp.reliability}});
  assertNoPrivilegedShooterData(belief,{path:'multiFamilyBelief'});return belief;
}
