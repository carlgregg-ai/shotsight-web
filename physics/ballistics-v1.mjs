// ShotSight P4 Ballistics & Intercept Engine v1
// The only implemented ballistic provider in this file is TEST_ONLY.
// It must never be presented as realistic shotgun instruction.

import {add3,sub3,scale3,dot3,norm3,unit3,assertFiniteNumber,assertFiniteVec3} from './target-engine-v1.mjs';

export const BALLISTIC_PROVIDER_STATUS=Object.freeze({
  ANALYTIC_CONSTANT_SPEED_TEST_ONLY:'TEST_ONLY',
  FREE_SPHERE_ALLEN:'HOLD_PRIMARY_EQUATIONS_EXTRACTION_REQUIRED'
});

export function assertInstructionalBallisticProvider(provider){
  if(!provider||typeof provider!=='object') throw new Error('ballistic provider required');
  if(provider.status!=='VALIDATED_INSTRUCTIONAL') throw new Error(`ballistic provider ${provider.id||'unknown'} is not authorised for instructional simulation (${provider.status||'unclassified'})`);
  return true;
}

export function constantSpeedTestProvider(speed_mps){
  assertFiniteNumber(speed_mps,'speed_mps');if(!(speed_mps>0))throw new Error('speed_mps must be > 0');
  return Object.freeze({
    id:'ANALYTIC_CONSTANT_SPEED_TEST_ONLY',
    status:BALLISTIC_PROVIDER_STATUS.ANALYTIC_CONSTANT_SPEED_TEST_ONLY,
    validDomain:'analytic/unit tests only; no drag, gravity, cloud or string',
    speed_mps,
    stateAtTime({origin_W,bore_W},tau){
      assertFiniteVec3(origin_W,'origin_W');assertFiniteVec3(bore_W,'bore_W');assertFiniteNumber(tau,'tau');if(tau<0)throw new Error('tau must be >= 0');
      const b=unit3(bore_W);
      return {position_W:add3(origin_W,scale3(b,speed_mps*tau)),velocity_W:scale3(b,speed_mps)};
    },
    timeToRange(range_m){assertFiniteNumber(range_m,'range_m');if(range_m<0)throw new Error('range_m must be >= 0');return range_m/speed_mps;}
  });
}

// Analytic interception of a constant-velocity point target by a constant-speed TEST_ONLY pellet.
// Solve |r + v*tau|^2 = (s*tau)^2, where r is target-relative position at shot time.
// Returns the earliest non-negative physically valid root. This verifies intercept geometry only.
export function analyticConstantVelocityIntercept({shotOrigin_W,targetPosition_W,targetVelocity_W,pelletSpeed_mps}){
  assertFiniteVec3(shotOrigin_W,'shotOrigin_W');assertFiniteVec3(targetPosition_W,'targetPosition_W');assertFiniteVec3(targetVelocity_W,'targetVelocity_W');assertFiniteNumber(pelletSpeed_mps,'pelletSpeed_mps');
  if(!(pelletSpeed_mps>0))throw new Error('pelletSpeed_mps must be > 0');
  const r=sub3(targetPosition_W,shotOrigin_W),v=targetVelocity_W,s=pelletSpeed_mps;
  const A=dot3(v,v)-s*s,B=2*dot3(r,v),C=dot3(r,r);
  let roots=[];
  const eps=1e-14*Math.max(1,Math.abs(A),Math.abs(B),Math.abs(C));
  if(Math.abs(A)<=eps){
    if(Math.abs(B)>eps) roots=[-C/B];
  }else{
    const disc=B*B-4*A*C;
    if(disc>=-eps){
      const sd=Math.sqrt(Math.max(0,disc));
      roots=[(-B-sd)/(2*A),(-B+sd)/(2*A)];
    }
  }
  const positive=roots.filter(t=>Number.isFinite(t)&&t>=0).sort((a,b)=>a-b);
  if(!positive.length) return {valid:false,reason:'NO_POSITIVE_INTERCEPT',solver:'ANALYTIC_TEST_ONLY'};
  const tau=positive[0];
  const targetAtArrival_W=add3(targetPosition_W,scale3(targetVelocity_W,tau));
  const delta=sub3(targetAtArrival_W,shotOrigin_W);
  if(!(norm3(delta)>0)) return {valid:false,reason:'DEGENERATE_ZERO_RANGE',solver:'ANALYTIC_TEST_ONLY'};
  const bore_W=unit3(delta);
  const pelletAtArrival_W=add3(shotOrigin_W,scale3(bore_W,s*tau));
  const missVector_W=sub3(pelletAtArrival_W,targetAtArrival_W);
  return Object.freeze({
    valid:true,solver:'ANALYTIC_CONSTANT_SPEED_CONSTANT_TARGET_VELOCITY_TEST_ONLY',
    pelletTOF_s:tau,arrivalTimeOffset_s:tau,bore_W,targetAtArrival_W,pelletAtArrival_W,missVector_W,
    residual_m:norm3(missVector_W),
    providerStatus:BALLISTIC_PROVIDER_STATUS.ANALYTIC_CONSTANT_SPEED_TEST_ONLY
  });
}

export function angularSeparationRad(a,b){
  const ua=unit3(a),ub=unit3(b);const c=Math.max(-1,Math.min(1,dot3(ua,ub)));
  const crossMag=norm3([
    ua[1]*ub[2]-ua[2]*ub[1],
    ua[2]*ub[0]-ua[0]*ub[2],
    ua[0]*ub[1]-ua[1]*ub[0]
  ]);
  return Math.atan2(crossMag,c);
}

export function testOnlyLeadGeometry({shotOrigin_W,targetPosition_W,targetVelocity_W,pelletSpeed_mps}){
  const hit=analyticConstantVelocityIntercept({shotOrigin_W,targetPosition_W,targetVelocity_W,pelletSpeed_mps});
  if(!hit.valid)return hit;
  const targetLOS_W=unit3(sub3(targetPosition_W,shotOrigin_W));
  const physicalLeadVector_W=sub3(hit.targetAtArrival_W,targetPosition_W);
  return Object.freeze({...hit,targetLOS_W,physicalLeadVector_W,physicalLead_m:norm3(physicalLeadVector_W),apparentLeadAngle_rad:angularSeparationRad(targetLOS_W,hit.bore_W)});
}
