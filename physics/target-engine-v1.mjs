// ShotSight Target Physics Engine v1 — P3
// Physics-only infrastructure. No production clay aerodynamic coefficients live here.

export const STANDARD_GRAVITY = 9.80665;

export function vec3(x=0,y=0,z=0){return [x,y,z]}
export function add3(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]}
export function sub3(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]}
export function scale3(a,s){return [a[0]*s,a[1]*s,a[2]*s]}
export function dot3(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}
export function cross3(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
export function norm3(a){return Math.hypot(a[0],a[1],a[2])}
export function unit3(a){const n=norm3(a);if(!(n>0)||!Number.isFinite(n))throw new Error('Cannot normalise zero/non-finite vector');return scale3(a,1/n)}

export function assertFiniteNumber(v,label='value'){if(!Number.isFinite(v))throw new Error(`${label} must be finite`);return v}
export function assertFiniteVec3(v,label='vec3'){if(!Array.isArray(v)||v.length!==3||!v.every(Number.isFinite))throw new Error(`${label} must be finite vec3`);return v}

// Hamilton product, scalar-first [w,x,y,z].
export function quatMul(a,b){
  const [aw,ax,ay,az]=a,[bw,bx,by,bz]=b;
  return [
    aw*bw-ax*bx-ay*by-az*bz,
    aw*bx+ax*bw+ay*bz-az*by,
    aw*by-ax*bz+ay*bw+az*bx,
    aw*bz+ax*by-ay*bx+az*bw
  ];
}
export function quatNorm(q){return Math.hypot(q[0],q[1],q[2],q[3])}
export function quatUnit(q){const n=quatNorm(q);if(!(n>0)||!Number.isFinite(n))throw new Error('Cannot normalise quaternion');return q.map(v=>v/n)}
// q_WT maps target-body -> world; omegaBody is body-expressed rad/s.
export function quatDerivativeBody(qWT,omegaBody){return quatMul(qWT,[0,...omegaBody]).map(v=>0.5*v)}

export function validateTargetState(state){
  if(!state||typeof state!=='object')throw new Error('target state required');
  assertFiniteVec3(state.r,'state.r');
  assertFiniteVec3(state.v,'state.v');
  return state;
}

export function gravityAcceleration(g=STANDARD_GRAVITY){assertFiniteNumber(g,'g');if(g<0)throw new Error('g must be non-negative magnitude');return ()=>[0,0,-g]}
export function zeroAcceleration(){return ()=>[0,0,0]}

function combineState(s,k,h){return {r:add3(s.r,scale3(k.dr,h)),v:add3(s.v,scale3(k.dv,h))}}
function derivative(state,t,acceleration){
  validateTargetState(state);assertFiniteNumber(t,'t');
  const a=acceleration(state,t);assertFiniteVec3(a,'acceleration');
  return {dr:[...state.v],dv:[...a]};
}

// Deterministic fixed-step classical RK4 for translational state.
export function rk4Step(state,t,dt,acceleration){
  validateTargetState(state);assertFiniteNumber(t,'t');assertFiniteNumber(dt,'dt');
  if(!(dt>0))throw new Error('dt must be > 0');
  if(typeof acceleration!=='function')throw new Error('acceleration provider required');
  const k1=derivative(state,t,acceleration);
  const k2=derivative(combineState(state,k1,dt/2),t+dt/2,acceleration);
  const k3=derivative(combineState(state,k2,dt/2),t+dt/2,acceleration);
  const k4=derivative(combineState(state,k3,dt),t+dt,acceleration);
  const sum=(a,b,c,d)=>[
    a[0]+2*b[0]+2*c[0]+d[0],
    a[1]+2*b[1]+2*c[1]+d[1],
    a[2]+2*b[2]+2*c[2]+d[2]
  ];
  const next={
    r:add3(state.r,scale3(sum(k1.dr,k2.dr,k3.dr,k4.dr),dt/6)),
    v:add3(state.v,scale3(sum(k1.dv,k2.dv,k3.dv,k4.dv),dt/6))
  };
  return validateTargetState(next);
}

export function simulateFixed({initialState,t0=0,tEnd,dt,acceleration}){
  validateTargetState(initialState);assertFiniteNumber(t0,'t0');assertFiniteNumber(tEnd,'tEnd');assertFiniteNumber(dt,'dt');
  if(tEnd<t0)throw new Error('tEnd must be >= t0');if(!(dt>0))throw new Error('dt must be > 0');
  let state={r:[...initialState.r],v:[...initialState.v]},t=t0;
  const samples=[{t,state:{r:[...state.r],v:[...state.v]}}];
  // Final shortened step is part of deterministic solver policy; no overshoot.
  while(t<tEnd){const h=Math.min(dt,tEnd-t);if(!(h>0))break;state=rk4Step(state,t,h,acceleration);t+=h;if(Math.abs(tEnd-t)<1e-12)t=tEnd;samples.push({t,state:{r:[...state.r],v:[...state.v]}})}
  return {t,state,samples};
}

export function analyticConstantAcceleration(initialState,a,t){
  validateTargetState(initialState);assertFiniteVec3(a,'a');assertFiniteNumber(t,'t');
  return {
    r:add3(add3(initialState.r,scale3(initialState.v,t)),scale3(a,0.5*t*t)),
    v:add3(initialState.v,scale3(a,t))
  };
}

export const ANDERT_REQUIRED_AERO_KEYS=['CL0','CLalpha','CD0','K','CM0','CMalpha','CN'];

// P3 interface guard only. It intentionally does NOT calculate realistic clay aerodynamics yet.
export function validateAndertAeroParameters(parameters){
  if(!parameters||typeof parameters!=='object')throw new Error('Andert aerodynamic parameters required');
  const missing=ANDERT_REQUIRED_AERO_KEYS.filter(k=>!Number.isFinite(parameters[k]));
  if(missing.length)throw new Error(`REALISTIC_CLAY blocked: missing verified/calibrated aerodynamic parameters: ${missing.join(', ')}`);
  return true;
}

export function realisticClayAcceleration(){
  throw new Error('REALISTIC_CLAY is HOLD in P3 until aerodynamic coefficients and rotational coupling are verified/calibrated');
}
