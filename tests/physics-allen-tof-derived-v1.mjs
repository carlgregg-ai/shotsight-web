import assert from 'node:assert/strict';
import {allenFreeSphereTimeToRange} from '../physics/ballistics-v1.mjs';
import {
  allenDerivedTimeBetweenMach,allenDerivedClosedFormTimeToRange,ALLEN_DERIVED_TOF_PROVENANCE
} from '../physics/allen-tof-derived-v1.mjs';

const near=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: expected ${b}, got ${a}, tol ${tol}`);

assert.equal(ALLEN_DERIVED_TOF_PROVENANCE.status,'RESEARCH_VALIDATION_ONLY');
assert.match(ALLEN_DERIVED_TOF_PROVENANCE.evidenceClass,/DERIVED_VALUE/);

// Cross-check the derived closed form against independent numerical quadrature of
// t=integral(dx/v(x)) for starts in all three Allen Mach segments.
const base={speedOfSound_mps:343,pelletDiameter_m:0.0024,pelletDensity_kgm3:11340,airDensity_kgm3:1.204};
for(const M0 of [1.8,1.3,1.1759,1.0,0.69,0.5]){
  const params={...base,muzzleVelocity_mps:M0*base.speedOfSound_mps};
  for(const x of [5,10,20,30,40]){
    let tNumerical,tClosed;
    try{
      tNumerical=allenFreeSphereTimeToRange(params,x,{intervals:8192});
      tClosed=allenDerivedClosedFormTimeToRange(params,x);
    }catch(e){
      if(/below Allen validated Mach 0.2 domain/.test(String(e)))continue;
      throw e;
    }
    near(tClosed,tNumerical,2e-7,`closed-vs-quadrature M0=${M0} x=${x}m`);
  }
}

// External primary worked-example check using Allen paper Eqs. (23)-(24), Case 2.
// The indexed primary text reports M0=1.1759, kz=2753.8 cm, x1~2818 cm,
// Eq. (23) velocity branches, and Eq. (24) t=0.0892 s at 30 yd and
// t=0.2229 s at 60 yd. We reconstruct endpoint Mach from printed Eq. (23),
// then independently integrate the governing ODE in closed form.
const M0=1.1759,kz_m=27.538;
const v0_cmps=6067.8/(1-0.85253);
const vs_mps=(v0_cmps/100)/M0;
function paperEq23VelocityMps(x_m){
  const x_cm=x_m*100;
  if(x_cm<2818){
    return (6067.8/(1-0.85253*Math.exp(-0.00004439*x_cm)))/100;
  }
  return (132970/(6.4286*Math.exp(0.00011384*(x_cm-2818.2))-1))/100;
}
for(const [yards,publishedT] of [[30,0.0892],[60,0.2229]]){
  const x_m=yards*0.9144;
  const Mend=paperEq23VelocityMps(x_m)/vs_mps;
  const t=allenDerivedTimeBetweenMach({Mstart:M0,Mend,kz_m,speedOfSound_mps:vs_mps});
  // Printed coefficients/results are rounded; tolerance is tied to that source precision.
  near(t,publishedT,3e-4,`Allen Eq24 worked flight time ${yards} yd`);
}

assert.throws(()=>allenDerivedTimeBetweenMach({Mstart:2.1,Mend:1,kz_m:10,speedOfSound_mps:343}),/requires/);
assert.throws(()=>allenDerivedTimeBetweenMach({Mstart:1,Mend:0.19,kz_m:10,speedOfSound_mps:343}),/requires/);

console.log(JSON.stringify({suite:'ShotSight P4 Allen derived TOF validation',status:'PASS',tests:{derivedVsQuadrature:true,primaryEq24ThirtyYards:true,primaryEq24SixtyYards:true,domainGuard:true,provenanceGuard:true}},null,2));
