// ShotSight P4 Ballistics & Intercept Engine v1
// Realistic instructional use remains FAIL-CLOSED.
// The Allen free-sphere provider below is a RESEARCH_VALIDATION_ONLY implementation of
// the piecewise free-sphere drag/velocity model recovered from E. J. Allen (2018).
// It models a single, non-interacting spherical pellet in still air and is NOT a dense
// shot-cloud / shot-string model and is NOT yet authorised for instructional output.

import {add3,sub3,scale3,dot3,norm3,unit3,assertFiniteNumber,assertFiniteVec3} from './target-engine-v1.mjs';

export const BALLISTIC_PROVIDER_STATUS=Object.freeze({
  ANALYTIC_CONSTANT_SPEED_TEST_ONLY:'TEST_ONLY',
  FREE_SPHERE_ALLEN:'RESEARCH_VALIDATION_ONLY'
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

// Allen (2018) piecewise-linear drag approximation, Eq. (8), recovered/verified by
// differentiating the primary paper's exact Eq. (11) velocity-distance solution.
// Evidence class for the coefficients here: DERIVED_VALUE from primary exact solution;
// continuity holds at Mach 0.7 and 1.2. Validated primary domain: 0.2 <= M <= 2.0.
export function allenDragCoefficientFromMach(M){
  assertFiniteNumber(M,'M');
  if(M<0.2||M>2.0)throw new Error('Allen free-sphere model validated domain is 0.2 <= Mach <= 2.0');
  if(M<0.7)return 0.418+0.11*M;
  if(M<1.2)return 0.94*M-0.163;
  return 0.92+0.0375*M;
}

function assertAllenInputs({muzzleVelocity_mps,speedOfSound_mps,pelletDiameter_m,pelletDensity_kgm3,airDensity_kgm3}){
  for(const [k,v] of Object.entries({muzzleVelocity_mps,speedOfSound_mps,pelletDiameter_m,pelletDensity_kgm3,airDensity_kgm3})){
    assertFiniteNumber(v,k);if(!(v>0))throw new Error(`${k} must be > 0`);
  }
  const M0=muzzleVelocity_mps/speedOfSound_mps;
  if(M0<0.2||M0>2.0)throw new Error('Allen provider requires 0.2 <= muzzle Mach <= 2.0');
  return M0;
}

// Exact velocity-vs-distance relation corresponding to Allen's piecewise-linear C(M).
// For Case 1 the coefficients/transition formulas are primary-paper Eq. (11) values.
// Case 2/3 integration constants are DERIVED from the same exact segment solutions by
// enforcing M(0)=M0, rather than introducing new fitted constants.
export function allenFreeSphereVelocityAtRange({muzzleVelocity_mps,speedOfSound_mps,pelletDiameter_m,pelletDensity_kgm3,airDensity_kgm3},x_m){
  assertFiniteNumber(x_m,'x_m');if(x_m<0)throw new Error('x_m must be >= 0');
  const M0=assertAllenInputs({muzzleVelocity_mps,speedOfSound_mps,pelletDiameter_m,pelletDensity_kgm3,airDensity_kgm3});
  const vs=speedOfSound_mps;
  const kz=pelletDiameter_m*pelletDensity_kgm3/airDensity_kgm3;
  let M;
  if(M0>=1.2){
    const x1=1.44298*kz*Math.log((0.80417*M0)/(0.92+0.0375*M0));
    const x2=x1+1.05173*kz;
    if(x_m<=x1){
      M=(0.92*M0)/((0.92+0.0375*M0)*Math.exp(0.69*x_m/kz)-0.0375*M0);
    }else if(x_m<=x2){
      M=(-0.1956)/(0.965*Math.exp(-0.12225*(x_m-x1)/kz)-1.128);
    }else{
      M=0.2926/(0.495*Math.exp(0.3135*(x_m-x2)/kz)-0.077);
    }
  }else if(M0>=0.7){
    const A=1.128-0.1956/M0;
    const z2=-Math.log((1.128-0.1956/0.7)/A)/0.12225;
    const x2=z2*kz;
    if(x_m<=x2){
      M=(-0.1956)/(A*Math.exp(-0.12225*x_m/kz)-1.128);
    }else{
      M=0.2926/(0.495*Math.exp(0.3135*(x_m-x2)/kz)-0.077);
    }
  }else{
    const A=0.2926/M0+0.077;
    M=0.2926/(A*Math.exp(0.3135*x_m/kz)-0.077);
  }
  if(M<0.2)throw new Error('requested range decelerates pellet below Allen validated Mach 0.2 domain');
  return M*vs;
}

// Deterministic Simpson quadrature of t = integral(dx/v(x)). This intentionally does
// not claim Allen's closed-form time equation until that primary expression is recovered.
export function allenFreeSphereTimeToRange(params,x_m,{intervals=2048}={}){
  assertFiniteNumber(x_m,'x_m');if(x_m<0)throw new Error('x_m must be >= 0');
  if(!Number.isInteger(intervals)||intervals<2||intervals%2!==0)throw new Error('intervals must be an even integer >= 2');
  if(x_m===0)return 0;
  const h=x_m/intervals;
  let sum=1/allenFreeSphereVelocityAtRange(params,0)+1/allenFreeSphereVelocityAtRange(params,x_m);
  for(let i=1;i<intervals;i++)sum+=(i%2?4:2)/allenFreeSphereVelocityAtRange(params,i*h);
  return (h/3)*sum;
}

// Independent numerical integration of Allen's governing dimensionless ODE
// dM/dz = -(3/4) M C(M), using RK4. Used only as a cross-check of the exact relation.
export function integrateAllenMachNumerically(M0,z,{steps=20000}={}){
  assertFiniteNumber(M0,'M0');assertFiniteNumber(z,'z');if(z<0)throw new Error('z must be >= 0');
  if(M0<0.2||M0>2.0)throw new Error('M0 outside Allen validated domain');
  if(!Number.isInteger(steps)||steps<1)throw new Error('steps must be positive integer');
  let M=M0;const h=z/steps;
  const f=m=>-0.75*m*allenDragCoefficientFromMach(m);
  for(let i=0;i<steps;i++){
    const k1=f(M),k2=f(M+0.5*h*k1),k3=f(M+0.5*h*k2),k4=f(M+h*k3);
    M+=(h/6)*(k1+2*k2+2*k3+k4);
    if(M<0.2)throw new Error('numerical integration crossed below Allen validated Mach 0.2 domain');
  }
  return M;
}

export function freeSphereAllenResearchProvider(params){
  const M0=assertAllenInputs(params);
  const kz=params.pelletDiameter_m*params.pelletDensity_kgm3/params.airDensity_kgm3;
  return Object.freeze({
    id:'FREE_SPHERE_ALLEN_2018',
    status:BALLISTIC_PROVIDER_STATUS.FREE_SPHERE_ALLEN,
    evidenceClass:'PRIMARY_EQUATIONS_PLUS_DERIVED_SEGMENT_CONSTANTS',
    limitations:Object.freeze([
      'single non-interacting spherical pellet only',
      'still-air scalar speed-vs-trajectory-distance model',
      'no dense shot-cloud wake interaction',
      'no shot string or pellet-to-pellet collision',
      'no gravity/wind trajectory curvature in this provider version',
      'instructional use prohibited pending validation and cloud-model boundary review'
    ]),
    validMach:[0.2,2.0],M0,kz_m:kz,
    velocityAtRange(x_m){return allenFreeSphereVelocityAtRange(params,x_m);},
    timeToRange(x_m,options){return allenFreeSphereTimeToRange(params,x_m,options);}
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
