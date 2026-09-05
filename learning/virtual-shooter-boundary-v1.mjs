// ShotSight Virtual Shooter L0 — oracle/shooter information boundary v1
// ORACLE KNOWS. SHOOTER PERCEIVES, BELIEVES, ACTS, REMEMBERS AND LEARNS.
// This module is deliberately small and auditable. The learner receives only
// frozen ShooterObservation objects; exact physics/intercept fields remain oracle-only.

const FORBIDDEN_SHOOTER_KEYS=Object.freeze([
  'position_W','velocity_W','range_m','targetInitial_W','targetVelocity_W','shotOrigin_W',
  'currentIntercept','shotIntercept','pelletTOF_s','pelletArrival_s','physicalLead_m',
  'ballisticShotOriginLeadAngle_rad','exactIntercept','interceptPoint_W','requiredLead',
  'missVector_W','oracleAction','oracleTargetClass','provider','providerId','providerStatus',
  // Apprenticeship/memory aliases: explicitly block common renamings so privileged truth
  // cannot enter Experience Records, diagnoses or interventions under a friendlier key.
  'targetSeed','scenarioSeed','missDistance','missDistance_m','trueRange_m',
  'requiredLead_rad','requiredLead_m','futureTrajectory','exactFuturePath',
  'oracleCorrection','correctionDirection','directCorrection','exactTargetState'
]);

export const SHOOTER_OBSERVATION_SCHEMA=Object.freeze({
  version:'SHOOTER_OBSERVATION_V1',
  allowed:Object.freeze([
    'schema','observationTime_s','latency_s','visible','az_rad','el_rad',
    'apparentAzRate_radps','apparentElRate_radps','acquisitionQuality',
    'targetFamilyBelief','motionPhaseBelief','context'
  ]),
  forbidden:FORBIDDEN_SHOOTER_KEYS
});

function assertFinite(v,name){if(!Number.isFinite(v))throw new Error(`${name} must be finite`);return v;}
function clamp(v,lo,hi){return Math.min(hi,Math.max(lo,v));}
function freezePlain(value){
  if(Array.isArray(value))return Object.freeze(value.map(freezePlain));
  if(value&&typeof value==='object'){
    const out={};for(const [k,v] of Object.entries(value))out[k]=freezePlain(v);return Object.freeze(out);
  }
  return value;
}

// Small deterministic PRNG so perception tests are reproducible without exposing scenario seed to the learner.
function rng01(seed){
  let x=(seed|0)||0x6d2b79f5;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return ((x>>>0)+0.5)/4294967296;};
}
function gaussian(rand){
  const u=Math.max(1e-12,rand()),v=Math.max(1e-12,rand());
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}

export function assertNoPrivilegedShooterData(value,{path='observation'}={}){
  const seen=new Set();
  function walk(v,p){
    if(!v||typeof v!=='object'||seen.has(v))return;seen.add(v);
    for(const [k,child] of Object.entries(v)){
      if(FORBIDDEN_SHOOTER_KEYS.includes(k))throw new Error(`PRIVILEGED_STATE_LEAK:${p}.${k}`);
      walk(child,`${p}.${k}`);
    }
  }
  walk(value,path);return true;
}

export function validateShooterObservation(obs){
  if(!obs||obs.schema!=='SHOOTER_OBSERVATION_V1')throw new Error('ShooterObservation v1 required');
  for(const k of Object.keys(obs))if(!SHOOTER_OBSERVATION_SCHEMA.allowed.includes(k))throw new Error(`UNAUTHORISED_SHOOTER_FIELD:${k}`);
  assertFinite(obs.observationTime_s,'observationTime_s');assertFinite(obs.latency_s,'latency_s');
  if(obs.visible){
    assertFinite(obs.az_rad,'az_rad');assertFinite(obs.el_rad,'el_rad');
    if(obs.apparentAzRate_radps!==null)assertFinite(obs.apparentAzRate_radps,'apparentAzRate_radps');
    if(obs.apparentElRate_radps!==null)assertFinite(obs.apparentElRate_radps,'apparentElRate_radps');
  }
  assertFinite(obs.acquisitionQuality,'acquisitionQuality');
  if(obs.acquisitionQuality<0||obs.acquisitionQuality>1)throw new Error('acquisitionQuality outside [0,1]');
  assertNoPrivilegedShooterData(obs);return true;
}

// Boundary adapter. It may inspect oracle frames, but it emits only delayed/noisy angular evidence.
// `oracleFrames` must be chronological frames from the hidden world.
export function createShooterObservation({oracleFrames,now_s,latency_s=0.08,angleNoiseSd_rad=0.0015,rateNoiseSd_radps=0.02,acquisitionQuality=0.9,seed=1,context={expectedDirection:'UNKNOWN',trapRegionKnown:false}}={}){
  if(!Array.isArray(oracleFrames)||oracleFrames.length<1)throw new Error('oracleFrames required');
  for(const [k,v] of Object.entries({now_s,latency_s,angleNoiseSd_rad,rateNoiseSd_radps,acquisitionQuality}))assertFinite(v,k);
  if(latency_s<0||angleNoiseSd_rad<0||rateNoiseSd_radps<0)throw new Error('perception parameters must be non-negative');
  const visibleTime=now_s-latency_s;
  const eligible=oracleFrames.filter(f=>f&&Number.isFinite(f.t_s)&&f.t_s<=visibleTime+1e-12);
  const rand=rng01(seed);
  if(!eligible.length){
    const obs=freezePlain({schema:'SHOOTER_OBSERVATION_V1',observationTime_s:visibleTime,latency_s,visible:false,az_rad:null,el_rad:null,apparentAzRate_radps:null,apparentElRate_radps:null,acquisitionQuality:0,targetFamilyBelief:{CROSSER:0.25,QUARTERER:0.25,LOOPER:0.25,OTHER:0.25},motionPhaseBelief:{STABLE:0.5,CHANGING:0.5},context});
    validateShooterObservation(obs);return obs;
  }
  const cur=eligible.at(-1),prev=eligible.length>1?eligible.at(-2):null;
  const az=cur.target.az_rad+gaussian(rand)*angleNoiseSd_rad;
  const el=cur.target.el_rad+gaussian(rand)*angleNoiseSd_rad;
  let azRate=null,elRate=null;
  if(prev&&cur.t_s>prev.t_s){
    const dt=cur.t_s-prev.t_s;
    azRate=(cur.target.az_rad-prev.target.az_rad)/dt+gaussian(rand)*rateNoiseSd_radps;
    elRate=(cur.target.el_rad-prev.target.el_rad)/dt+gaussian(rand)*rateNoiseSd_radps;
  }
  const q=clamp(acquisitionQuality,0,1);
  // L0 uses deliberately broad class probabilities: the oracle scenario identity is NOT copied through.
  const lateralEvidence=azRate===null?0:Math.min(1,Math.abs(azRate)/0.15);
  const crosserP=0.25+0.6*lateralEvidence*q;
  const remainder=Math.max(0,1-crosserP);
  const obs=freezePlain({
    schema:'SHOOTER_OBSERVATION_V1',observationTime_s:cur.t_s,latency_s,visible:true,
    az_rad:az,el_rad:el,apparentAzRate_radps:azRate,apparentElRate_radps:elRate,
    acquisitionQuality:q,
    targetFamilyBelief:{CROSSER:crosserP,QUARTERER:remainder*0.42,LOOPER:remainder*0.33,OTHER:remainder*0.25},
    motionPhaseBelief:{STABLE:0.7*q+0.15,CHANGING:1-(0.7*q+0.15)},
    context
  });
  validateShooterObservation(obs);return obs;
}

export function naiveAngularBelief(observationHistory){
  if(!Array.isArray(observationHistory)||observationHistory.length<1)throw new Error('observationHistory required');
  observationHistory.forEach(validateShooterObservation);
  const visible=observationHistory.filter(o=>o.visible);
  if(!visible.length)return freezePlain({status:'NO_VISUAL_ACQUISITION',confidence:0,family:'UNKNOWN',direction:'UNKNOWN',apparentSpeedBand:'UNKNOWN'});
  const o=visible.at(-1),rate=o.apparentAzRate_radps;
  const family=Object.entries(o.targetFamilyBelief).sort((a,b)=>b[1]-a[1])[0][0];
  const direction=rate===null?'UNKNOWN':rate>0?'RIGHT':rate<0?'LEFT':'STATIONARY';
  const mag=rate===null?null:Math.abs(rate);
  const apparentSpeedBand=mag===null?'UNKNOWN':mag<0.12?'SLOW':mag<0.35?'MEDIUM':'FAST';
  const confidence=clamp(o.acquisitionQuality*(o.targetFamilyBelief[family]||0),0,1);
  return freezePlain({status:'NAIVE_PERCEPTION_BASELINE',confidence,family,direction,apparentSpeedBand,lastObservedAz_rad:o.az_rad,lastObservedEl_rad:o.el_rad,lastObservedAzRate_radps:rate});
}

export function auditShooterBoundary({observations,beliefs=[]}={}){
  if(!Array.isArray(observations))throw new Error('observations array required');
  observations.forEach(validateShooterObservation);
  for(const b of beliefs)assertNoPrivilegedShooterData(b,{path:'belief'});
  return freezePlain({status:'PASS',schema:'ANTI_CHEAT_AUDIT_V1',observationsChecked:observations.length,beliefsChecked:beliefs.length,privilegedFieldAccess:0});
}
