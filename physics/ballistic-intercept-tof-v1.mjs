// ShotSight P4 — provider-based TOF intercept infrastructure.
//
// This solves interception using a ballistic provider's timeToRange(range) contract.
// It is deliberately a STRAIGHT-PATH scalar-distance solver: it does not bend the
// pellet path for gravity or wind. It is useful for validating that lead emerges from
// finite, drag-aware pellet flight time rather than a canned distance. Realistic
// instructional use remains prohibited unless the supplied provider is independently
// authorised and the trajectory assumptions are valid for that use.

import {add3,sub3,scale3,norm3,unit3,assertFiniteNumber,assertFiniteVec3} from './target-engine-v1.mjs';
import {angularSeparationRad} from './ballistics-v1.mjs';

function targetAtConstantVelocity(position_W,velocity_W,tau){
  return add3(position_W,scale3(velocity_W,tau));
}

export function interceptWithTimeToRangeProvider({
  provider,shotOrigin_W,targetPosition_W,targetVelocity_W,maxTau_s=2,tolerance_s=1e-8,maxIterations=100
}){
  if(!provider||typeof provider.timeToRange!=='function')throw new Error('provider.timeToRange(range_m) required');
  assertFiniteVec3(shotOrigin_W,'shotOrigin_W');assertFiniteVec3(targetPosition_W,'targetPosition_W');assertFiniteVec3(targetVelocity_W,'targetVelocity_W');
  assertFiniteNumber(maxTau_s,'maxTau_s');assertFiniteNumber(tolerance_s,'tolerance_s');
  if(!(maxTau_s>0)||!(tolerance_s>0)||!Number.isInteger(maxIterations)||maxIterations<1)throw new Error('invalid root-solver controls');

  const evalF=tau=>{
    const p=targetAtConstantVelocity(targetPosition_W,targetVelocity_W,tau);
    const range=norm3(sub3(p,shotOrigin_W));
    if(!(range>0))return {ok:false,reason:'DEGENERATE_ZERO_RANGE'};
    try{
      const tof=provider.timeToRange(range);
      if(!Number.isFinite(tof)||tof<0)return {ok:false,reason:'INVALID_PROVIDER_TOF'};
      return {ok:true,f:tof-tau,tof,range,targetAtArrival_W:p};
    }catch(error){
      return {ok:false,reason:'PROVIDER_DOMAIN_OR_MODEL_LIMIT',error:String(error)};
    }
  };

  const at0=evalF(0);
  if(!at0.ok)return {valid:false,reason:at0.reason,error:at0.error||null,solver:'TOF_PROVIDER_BISECTION_STRAIGHT_PATH'};
  if(at0.f<=0)return {valid:false,reason:'DEGENERATE_NONPOSITIVE_INITIAL_TOF',solver:'TOF_PROVIDER_BISECTION_STRAIGHT_PATH'};

  let lo=0,hi=Math.min(maxTau_s,Math.max(0.01,2*at0.tof)),ehi=evalF(hi);
  while((!ehi.ok||ehi.f>0)&&hi<maxTau_s){
    if(!ehi.ok&&ehi.reason==='PROVIDER_DOMAIN_OR_MODEL_LIMIT')return {valid:false,reason:ehi.reason,error:ehi.error,solver:'TOF_PROVIDER_BISECTION_STRAIGHT_PATH'};
    hi=Math.min(maxTau_s,hi*2);ehi=evalF(hi);
  }
  if(!ehi.ok)return {valid:false,reason:ehi.reason,error:ehi.error||null,solver:'TOF_PROVIDER_BISECTION_STRAIGHT_PATH'};
  if(ehi.f>0)return {valid:false,reason:'NO_INTERCEPT_WITHIN_MAX_TAU',solver:'TOF_PROVIDER_BISECTION_STRAIGHT_PATH'};

  let emid=ehi,mid=hi;
  for(let i=0;i<maxIterations;i++){
    mid=0.5*(lo+hi);emid=evalF(mid);
    if(!emid.ok)return {valid:false,reason:emid.reason,error:emid.error||null,solver:'TOF_PROVIDER_BISECTION_STRAIGHT_PATH'};
    if(Math.abs(emid.f)<=tolerance_s||hi-lo<=tolerance_s)break;
    if(emid.f>0)lo=mid;else hi=mid;
  }

  const tau=mid,targetAtArrival_W=emid.targetAtArrival_W;
  const delta=sub3(targetAtArrival_W,shotOrigin_W),bore_W=unit3(delta);
  const targetLOS_W=unit3(sub3(targetPosition_W,shotOrigin_W));
  const physicalLeadVector_W=sub3(targetAtArrival_W,targetPosition_W);
  return Object.freeze({
    valid:true,
    solver:'TOF_PROVIDER_BISECTION_STRAIGHT_PATH',
    providerId:provider.id||'unknown',
    providerStatus:provider.status||'unclassified',
    pelletTOF_s:tau,
    rangeAtIntercept_m:norm3(delta),
    bore_W,targetLOS_W,targetAtArrival_W,
    physicalLeadVector_W,
    physicalLead_m:norm3(physicalLeadVector_W),
    apparentLeadAngle_rad:angularSeparationRad(targetLOS_W,bore_W),
    rootResidual_s:emid.f,
    limitations:Object.freeze([
      'straight pellet path toward future target position',
      'scalar provider time-to-range only',
      'no gravity/wind curvature in this solver',
      'constant target velocity during pellet flight',
      'instructional validity depends on an independently authorised provider and validated assumptions'
    ])
  });
}
