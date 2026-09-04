// ShotSight P4 — DERIVED closed-form flight-time validator for Allen (2018).
//
// This module does NOT transcribe a generic Allen time equation as primary text.
// It algebraically integrates the already verified governing ODE
//   dM/dz = -(3/4) M (a + b M)
// over each of Allen's piecewise-linear drag segments.
// Evidence class: DERIVED_VALUE_FROM_PRIMARY_GOVERNING_ODE.
// Intended use: research validation / cross-check only. NOT instructional ballistics.

import {allenFreeSphereVelocityAtRange} from './ballistics-v1.mjs';

const SEGMENTS=Object.freeze({
  LOW:Object.freeze({min:0.2,max:0.7,a:0.418,b:0.11}),
  MID:Object.freeze({min:0.7,max:1.2,a:-0.163,b:0.94}),
  HIGH:Object.freeze({min:1.2,max:2.0,a:0.92,b:0.0375})
});

function finitePositive(v,name){
  if(!Number.isFinite(v)||!(v>0))throw new Error(`${name} must be finite and > 0`);
}

// Primitive of 1/[M^2(a+bM)] dM.
// F(M)=b/a^2 ln((a+bM)/M)-1/(aM)
function primitiveInvM2Drag(M,{a,b}){
  finitePositive(M,'Mach');
  const c=a+b*M;
  if(!(c>0))throw new Error('drag line must remain positive over evaluated Mach');
  return (b/(a*a))*Math.log(c/M)-1/(a*M);
}

function segmentTimeDescending(Mstart,Mend,kz_m,vs_mps,segment){
  if(!(Mstart>=Mend))throw new Error('segment integration requires descending Mach');
  if(Mstart===Mend)return 0;
  const scale=4*kz_m/(3*vs_mps);
  return scale*(primitiveInvM2Drag(Mstart,segment)-primitiveInvM2Drag(Mend,segment));
}

// Closed-form time increment between two Mach states, Mstart >= Mend,
// automatically splitting at Allen's M=1.2 and M=0.7 boundaries.
export function allenDerivedTimeBetweenMach({Mstart,Mend,kz_m,speedOfSound_mps}){
  finitePositive(Mstart,'Mstart');finitePositive(Mend,'Mend');
  finitePositive(kz_m,'kz_m');finitePositive(speedOfSound_mps,'speedOfSound_mps');
  if(Mstart>2.0||Mend<0.2||Mend>Mstart)throw new Error('Allen derived TOF requires 0.2 <= Mend <= Mstart <= 2.0');
  let cur=Mstart,t=0;
  if(cur>1.2){
    const next=Math.max(Mend,1.2);
    t+=segmentTimeDescending(cur,next,kz_m,speedOfSound_mps,SEGMENTS.HIGH);cur=next;
  }
  if(cur>0.7&&Mend<cur){
    const next=Math.max(Mend,0.7);
    t+=segmentTimeDescending(cur,next,kz_m,speedOfSound_mps,SEGMENTS.MID);cur=next;
  }
  if(Mend<cur){
    t+=segmentTimeDescending(cur,Mend,kz_m,speedOfSound_mps,SEGMENTS.LOW);cur=Mend;
  }
  return t;
}

// Convenience cross-check against the existing exact velocity-vs-range implementation.
// This remains DERIVED/RESEARCH_VALIDATION_ONLY and must not be used to authorise
// sporting-shot instructional ballistics.
export function allenDerivedClosedFormTimeToRange(params,x_m){
  if(!Number.isFinite(x_m)||x_m<0)throw new Error('x_m must be finite and >= 0');
  if(x_m===0)return 0;
  for(const [k,v] of Object.entries(params))finitePositive(v,k);
  const Mstart=params.muzzleVelocity_mps/params.speedOfSound_mps;
  const vEnd=allenFreeSphereVelocityAtRange(params,x_m);
  const Mend=vEnd/params.speedOfSound_mps;
  const kz_m=params.pelletDiameter_m*params.pelletDensity_kgm3/params.airDensity_kgm3;
  return allenDerivedTimeBetweenMach({Mstart,Mend,kz_m,speedOfSound_mps:params.speedOfSound_mps});
}

export const ALLEN_DERIVED_TOF_PROVENANCE=Object.freeze({
  status:'RESEARCH_VALIDATION_ONLY',
  evidenceClass:'DERIVED_VALUE_FROM_PRIMARY_GOVERNING_ODE',
  source:'E. J. Allen, Defence Technology 14 (2018) 1-11, DOI 10.1016/j.dt.2017.11.004',
  derivation:'analytic integration of dM/dz=-(3/4)M(a+bM), split at Mach 1.2 and 0.7',
  limitations:Object.freeze([
    'single non-interacting spherical pellet',
    'inherits Allen free-sphere piecewise drag approximation and Mach 0.2-2.0 domain',
    'scalar path-distance time only',
    'not a dense shot-cloud or shot-string model',
    'not authorised for instructional output'
  ])
});
