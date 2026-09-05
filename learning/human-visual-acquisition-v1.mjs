// ShotSight Virtual Shooter — Ellis Human-Analogous Visual Acquisition V1
// Learner-side perceptual front end. Consumes only already-degraded ShooterObservation V1.
// It never imports physics, target truth, ballistics or intercept code.
//
// Evidence classes:
// - GENERAL HUMAN-VISION CONSTRAINT: rapid motion can be spatially/temporally smeared;
//   smooth pursuit requires acquisition rather than appearing instantaneously.
// - SHOTSIGHT_HYPOTHESIS: all numerical defaults below until calibrated against
//   eye-tracking / high-speed video / Sense-aligned human data.

import {validateShooterObservation,assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function clamp(v,lo,hi){return Math.min(hi,Math.max(lo,v));}
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function finite(v,name){if(!Number.isFinite(v))throw new Error(`${name} must be finite`);return v;}

export const HUMAN_VISUAL_ACQUISITION_DEFAULTS=Object.freeze({
  // Provisional distributions/controls; NOT clay-specific human constants.
  temporalIntegration_s:0.045,
  acquisitionEvidence_s:0.16,
  pursuitLatency_s:0.10,
  minimumTrackingQuality:0.58,
  baseAngularUncertainty_rad:0.002,
  maxHistory_s:0.35
});

function speedBand(rate){
  if(!Number.isFinite(rate))return 'UNKNOWN';
  const m=Math.abs(rate);return m<0.12?'SLOW':m<0.35?'MEDIUM':'FAST';
}
function direction(rate){return !Number.isFinite(rate)?'UNKNOWN':rate>0?'RIGHT':rate<0?'LEFT':'STATIONARY';}

function recentVisible(history,maxHistory_s){
  const visible=history.filter(o=>o.visible);
  if(!visible.length)return [];
  const end=visible.at(-1).observationTime_s;
  return visible.filter(o=>o.observationTime_s>=end-maxHistory_s-1e-12);
}

function spanOf(points){return points.length<2?0:Math.max(0,points.at(-1).observationTime_s-points[0].observationTime_s);}

export function buildEllisHumanVisualEvidence(observationHistory,options={}){
  if(!Array.isArray(observationHistory)||!observationHistory.length)throw new Error('observationHistory required');
  observationHistory.forEach(validateShooterObservation);
  const cfg={...HUMAN_VISUAL_ACQUISITION_DEFAULTS,...options};
  for(const k of ['temporalIntegration_s','acquisitionEvidence_s','pursuitLatency_s','minimumTrackingQuality','baseAngularUncertainty_rad','maxHistory_s'])finite(cfg[k],k);
  if(cfg.temporalIntegration_s<=0||cfg.acquisitionEvidence_s<=0||cfg.pursuitLatency_s<0||cfg.baseAngularUncertainty_rad<=0||cfg.maxHistory_s<=0)throw new Error('invalid human-vision controls');
  if(cfg.minimumTrackingQuality<=0||cfg.minimumTrackingQuality>=1)throw new Error('minimumTrackingQuality must be in (0,1)');

  const contrast=clamp(Number.isFinite(options.contrast)?options.contrast:0.8,0,1);
  const clutter=clamp(Number.isFinite(options.clutter)?options.clutter:0.2,0,1);
  const attention=clamp(Number.isFinite(options.attention)?options.attention:0.85,0,1);
  const occluded=options.occluded===true;
  const recent=recentVisible(observationHistory,cfg.maxHistory_s);
  const latestInput=observationHistory.at(-1);
  const latest=recent.at(-1)||null;

  if(!latest){
    const out=freezePlain({schema:'ELLIS_VISUAL_EVIDENCE_V1',phase:'EXPECTED_RELEASE',detected:false,usableForConnection:false,acquisitionScore:0,confidence:0,motion:{direction:'UNKNOWN',speedBand:'UNKNOWN'},streak:null,resolved:null,uncertainty:{class:'HUMAN_ANALOGOUS_PERCEPTUAL_UNCERTAINTY',reason:'NO_VISIBLE_TARGET'},provenance:{numerics:'SHOTSIGHT_HYPOTHESIS'}});
    assertNoPrivilegedShooterData(out,{path:'humanVision'});return out;
  }

  const span_s=spanOf(recent);
  const rate=latest.apparentAzRate_radps;
  const elRate=latest.apparentElRate_radps;
  const angularSpeed=Math.hypot(Number.isFinite(rate)?rate:0,Number.isFinite(elRate)?elRate:0);
  const motionSmear_rad=Math.max(cfg.baseAngularUncertainty_rad,angularSpeed*cfg.temporalIntegration_s);

  // More observation, contrast and attention improve resolution. High retinal/image speed,
  // clutter and low source acquisition quality slow it. This is a perceptual hypothesis,
  // not a hidden range/speed lookup.
  const durationEvidence=clamp(span_s/cfg.acquisitionEvidence_s,0,1);
  const sourceQuality=clamp(recent.reduce((a,o)=>a+o.acquisitionQuality,0)/recent.length,0,1);
  const speedPenalty=1/(1+Math.max(0,angularSpeed)*0.55);
  const acquisitionScore=clamp(durationEvidence*(0.35+0.65*contrast)*(0.4+0.6*attention)*(1-0.55*clutter)*sourceQuality*speedPenalty,0,1);
  const pursuitReady=span_s>=cfg.pursuitLatency_s && acquisitionScore>=cfg.minimumTrackingQuality;

  const alongSd=Math.max(cfg.baseAngularUncertainty_rad,motionSmear_rad*(1.15+1.8*(1-acquisitionScore)));
  const normalSd=Math.max(cfg.baseAngularUncertainty_rad,motionSmear_rad*(0.45+0.65*(1-acquisitionScore)));
  const halfAlong=2*alongSd,halfNormal=2*normalSd;
  const streak=freezePlain({
    orientation:direction(rate),
    angularRegion_rad:{azMin:latest.az_rad-halfAlong,azMax:latest.az_rad+halfAlong,elMin:latest.el_rad-halfNormal,elMax:latest.el_rad+halfNormal},
    uncertaintyAlongMotionSd_rad:alongSd,
    uncertaintyNormalSd_rad:normalSd,
    temporalIntegration_s:cfg.temporalIntegration_s
  });

  let phase='FLASH_STREAK';
  if(occluded||!latestInput.visible)phase=recent.length>=2?'REACQUIRING':'EXPECTED_RELEASE';
  else if(pursuitReady)phase='TRACKING';
  else if(span_s>=cfg.temporalIntegration_s)phase='ACQUIRING';

  // Crucial anti-oracle property: FLASH/STREAK and ACQUIRING do not expose a precise
  // instantaneous target centre. Only a broad angular region + coarse motion are
  // available until the acquisition gate passes.
  const resolved=phase==='TRACKING'?freezePlain({
    az_rad:latest.az_rad,
    el_rad:latest.el_rad,
    apparentAzRate_radps:rate,
    apparentElRate_radps:elRate,
    positionSd_rad:Math.max(cfg.baseAngularUncertainty_rad,normalSd),
    rateConfidence:clamp(acquisitionScore,0,0.98),
    observationTime_s:latest.observationTime_s
  }):null;

  const out=freezePlain({
    schema:'ELLIS_VISUAL_EVIDENCE_V1',phase,detected:phase!=='EXPECTED_RELEASE',
    usableForConnection:phase==='TRACKING',acquisitionScore,confidence:clamp(acquisitionScore*(phase==='TRACKING'?1:0.65),0,0.98),
    motion:{direction:direction(rate),speedBand:speedBand(rate)},
    streak:phase==='EXPECTED_RELEASE'?null:streak,resolved,
    uncertainty:{class:'HUMAN_ANALOGOUS_PERCEPTUAL_UNCERTAINTY',alongMotionSd_rad:alongSd,normalSd_rad:normalSd,observationSpan_s:span_s,contrast,clutter,attention,occluded},
    provenance:{numerics:'SHOTSIGHT_HYPOTHESIS',source:'SHOOTER_OBSERVATION_V1_ONLY',oracleAccess:false}
  });
  assertNoPrivilegedShooterData(out,{path:'humanVision'});return out;
}

export function auditHumanVisualEvidence(evidence){
  if(!evidence||evidence.schema!=='ELLIS_VISUAL_EVIDENCE_V1')throw new Error('ELLIS_VISUAL_EVIDENCE_V1 required');
  assertNoPrivilegedShooterData(evidence,{path:'humanVision'});
  if(['FLASH_STREAK','ACQUIRING','REACQUIRING'].includes(evidence.phase)&&evidence.resolved!==null)throw new Error('HUMAN_VISION_LEAK:unresolved phase exposed precise centre');
  if(evidence.phase==='TRACKING'&&!evidence.resolved)throw new Error('TRACKING requires resolved estimate');
  if(evidence.streak&&!(evidence.streak.uncertaintyAlongMotionSd_rad>=evidence.streak.uncertaintyNormalSd_rad))throw new Error('streak anisotropy invalid');
  return freezePlain({schema:'ELLIS_HUMAN_VISION_AUDIT_V1',status:'PASS',privilegedFieldAccess:0});
}
