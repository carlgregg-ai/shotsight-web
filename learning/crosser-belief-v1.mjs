// ShotSight Virtual Shooter L1 — perception-only stable-crosser belief model.
// Learner-side: consumes ShooterObservation only. No physics/oracle imports.

import {validateShooterObservation,assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function clamp(v,lo,hi){return Math.min(hi,Math.max(lo,v));}
function normalCdf(x){const t=1/(1+0.2316419*Math.abs(x));const d=0.3989422804014327*Math.exp(-x*x/2);const p=1-d*t*(0.319381530-0.356563782*t+1.781478*t*t-1.821256*t*t*t+1.330274*t*t*t*t);return x>=0?p:1-p;}

function fitLine(points,valueKey){
  const n=points.length;if(n<2)return null;
  const t0=points[0].observationTime_s;const xs=points.map(p=>p.observationTime_s-t0),ys=points.map(p=>p[valueKey]);
  const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;
  let sxx=0,sxy=0;for(let i=0;i<n;i++){const dx=xs[i]-mx;sxx+=dx*dx;sxy+=dx*(ys[i]-my);}if(!(sxx>0))return null;
  const slope=sxy/sxx,intercept=my-slope*mx;let sse=0;for(let i=0;i<n;i++){const r=ys[i]-(intercept+slope*xs[i]);sse+=r*r;}
  const residualSd=Math.sqrt(sse/Math.max(1,n-2));const span=xs.at(-1)-xs[0];
  // Conservative uncertainty floor for short/noiseless-looking windows. This is a perception model, not oracle certainty.
  const slopeSe=Math.max(0.003, residualSd/Math.sqrt(Math.max(sxx,1e-12)));
  return {t0,n,span,slope,intercept,residualSd,slopeSe,lastTime_s:points.at(-1).observationTime_s,lastValue:ys.at(-1)};
}

export function buildStableCrosserBelief(observationHistory,{predictionHorizon_s=0.12,maxHistory_s=0.35}={}){
  if(!Array.isArray(observationHistory)||!observationHistory.length)throw new Error('observationHistory required');
  observationHistory.forEach(validateShooterObservation);
  if(!(Number.isFinite(predictionHorizon_s)&&predictionHorizon_s>=0&&Number.isFinite(maxHistory_s)&&maxHistory_s>0))throw new Error('invalid belief controls');
  const visible=observationHistory.filter(o=>o.visible);
  if(visible.length<2)return freezePlain({schema:'CROSSER_BELIEF_V1',status:'INSUFFICIENT_VISUAL_HISTORY',confidence:0,directionProb:{LEFT:0.5,RIGHT:0.5},prediction:null,uncertainty:{reason:'NEED_AT_LEAST_TWO_VISIBLE_OBSERVATIONS'}});
  const end=visible.at(-1).observationTime_s,start=end-maxHistory_s,recent=visible.filter(o=>o.observationTime_s>=start-1e-12);
  const azFit=fitLine(recent,'az_rad'),elFit=fitLine(recent,'el_rad');if(!azFit||!elFit)throw new Error('belief line fit failed');
  const z=azFit.slope/azFit.slopeSe;const pRight=clamp(normalCdf(z),0.001,0.999),pLeft=1-pRight;
  const futureDt=predictionHorizon_s;
  const predAz=azFit.lastValue+azFit.slope*futureDt,predEl=elFit.lastValue+elFit.slope*futureDt;
  const timeFactor=clamp(azFit.span/0.20,0,1),quality=recent.reduce((a,o)=>a+o.acquisitionQuality,0)/recent.length;
  const rateSignal=Math.abs(azFit.slope)/(Math.abs(azFit.slope)+azFit.slopeSe+1e-12);
  const confidence=clamp(timeFactor*quality*rateSignal,0,0.995);
  const pathSdAz=Math.max(0.0015,azFit.residualSd+futureDt*azFit.slopeSe);
  const pathSdEl=Math.max(0.0015,elFit.residualSd+futureDt*elFit.slopeSe);
  const belief=freezePlain({schema:'CROSSER_BELIEF_V1',status:'STABLE_CROSSER_BELIEF',confidence,directionProb:{LEFT:pLeft,RIGHT:pRight},apparentMotion:{azRateMean_radps:azFit.slope,azRateSd_radps:azFit.slopeSe,elRateMean_radps:elFit.slope,elRateSd_radps:elFit.slopeSe,observationSpan_s:azFit.span,samples:azFit.n},prediction:{fromObservationTime_s:end,horizon_s:futureDt,azMean_rad:predAz,elMean_rad:predEl,azSd_rad:pathSdAz,elSd_rad:pathSdEl},uncertainty:{class:'PERCEPTUAL_BELIEF_NOT_ORACLE',historyWindow_s:maxHistory_s}});
  assertNoPrivilegedShooterData(belief,{path:'belief'});return belief;
}
