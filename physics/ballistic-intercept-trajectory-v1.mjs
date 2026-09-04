// ShotSight trajectory-aware provider intercept infrastructure.
// Solves provider time-to-range against an explicit future target-position function.
// Straight pellet path/scalar TOF only; instructional validity remains fail-closed.

import {sub3,norm3,unit3,assertFiniteNumber,assertFiniteVec3} from './target-engine-v1.mjs';
import {angularSeparationRad} from './ballistics-v1.mjs';

export function interceptWithTargetTrajectoryProvider({
  provider,
  shotOrigin_W,
  targetPositionAtTau_W,
  maxTau_s=2,
  tolerance_s=1e-8,
  maxIterations=100
}){
  if(!provider||typeof provider.timeToRange!=='function')throw new Error('provider.timeToRange(range_m) required');
  assertFiniteVec3(shotOrigin_W,'shotOrigin_W');
  if(typeof targetPositionAtTau_W!=='function')throw new Error('targetPositionAtTau_W(tau_s) required');
  assertFiniteNumber(maxTau_s,'maxTau_s');assertFiniteNumber(tolerance_s,'tolerance_s');
  if(!(maxTau_s>0)||!(tolerance_s>0)||!Number.isInteger(maxIterations)||maxIterations<1)throw new Error('invalid root-solver controls');

  const evalF=tau=>{
    let p;
    try{p=targetPositionAtTau_W(tau);assertFiniteVec3(p,'targetPositionAtTau_W result');}
    catch(error){return {ok:false,reason:'INVALID_TARGET_TRAJECTORY',error:String(error)};}
    const delta=sub3(p,shotOrigin_W),range=norm3(delta);
    if(!(range>0))return {ok:false,reason:'DEGENERATE_ZERO_RANGE'};
    try{
      const tof=provider.timeToRange(range);
      if(!Number.isFinite(tof)||tof<0)return {ok:false,reason:'INVALID_PROVIDER_TOF'};
      return {ok:true,f:tof-tau,tof,range,targetAtArrival_W:p};
    }catch(error){return {ok:false,reason:'PROVIDER_DOMAIN_OR_MODEL_LIMIT',error:String(error)};}
  };

  const solver='TOF_PROVIDER_BISECTION_EXPLICIT_TARGET_TRAJECTORY_STRAIGHT_PELLET_PATH';
  const at0=evalF(0);
  if(!at0.ok)return {valid:false,reason:at0.reason,error:at0.error||null,solver};
  if(at0.f<=0)return {valid:false,reason:'DEGENERATE_NONPOSITIVE_INITIAL_TOF',solver};

  let lo=0,hi=Math.min(maxTau_s,Math.max(0.01,2*at0.tof)),ehi=evalF(hi);
  while((!ehi.ok||ehi.f>0)&&hi<maxTau_s){
    if(!ehi.ok&&(ehi.reason==='PROVIDER_DOMAIN_OR_MODEL_LIMIT'||ehi.reason==='INVALID_TARGET_TRAJECTORY'))return {valid:false,reason:ehi.reason,error:ehi.error||null,solver};
    hi=Math.min(maxTau_s,hi*2);ehi=evalF(hi);
  }
  if(!ehi.ok)return {valid:false,reason:ehi.reason,error:ehi.error||null,solver};
  if(ehi.f>0)return {valid:false,reason:'NO_INTERCEPT_WITHIN_MAX_TAU',solver};

  let emid=ehi,mid=hi;
  for(let i=0;i<maxIterations;i++){
    mid=0.5*(lo+hi);emid=evalF(mid);
    if(!emid.ok)return {valid:false,reason:emid.reason,error:emid.error||null,solver};
    if(Math.abs(emid.f)<=tolerance_s||hi-lo<=tolerance_s)break;
    if(emid.f>0)lo=mid;else hi=mid;
  }

  const tau=mid,targetAtArrival_W=emid.targetAtArrival_W;
  const targetNow_W=targetPositionAtTau_W(0);assertFiniteVec3(targetNow_W,'targetPositionAtTau_W(0)');
  const delta=sub3(targetAtArrival_W,shotOrigin_W),bore_W=unit3(delta),targetLOS_W=unit3(sub3(targetNow_W,shotOrigin_W));
  const physicalLeadVector_W=sub3(targetAtArrival_W,targetNow_W);
  return Object.freeze({
    valid:true,
    solver,
    providerId:provider.id||'unknown',
    providerStatus:provider.status||'unclassified',
    pelletTOF_s:tau,
    rangeAtIntercept_m:norm3(delta),
    bore_W,
    targetLOS_W,
    targetAtArrival_W,
    physicalLeadVector_W,
    physicalLead_m:norm3(physicalLeadVector_W),
    apparentLeadAngle_rad:angularSeparationRad(targetLOS_W,bore_W),
    rootResidual_s:emid.f,
    limitations:Object.freeze([
      'straight pellet path toward future target position',
      'scalar provider time-to-range only',
      'no pellet gravity/wind curvature in this solver',
      'target future position supplied explicitly by scenario trajectory function',
      'instructional validity depends on independently authorised provider and target trajectory'
    ])
  });
}
