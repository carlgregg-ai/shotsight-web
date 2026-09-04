import assert from 'node:assert/strict';
import {allenDragCoefficientFromMach,allenFreeSphereTimeToRange} from '../physics/ballistics-v1.mjs';
import {
  allenDerivedTimeBetweenMach,allenDerivedClosedFormTimeToRange,ALLEN_DERIVED_TOF_PROVENANCE
} from '../physics/allen-tof-derived-v1.mjs';

const near=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: expected ${b}, got ${a}, tol ${tol}`);
const nearRel=(a,b,rel,msg)=>assert.ok(Math.abs(a-b)<=rel*Math.max(Math.abs(b),1e-12),`${msg}: expected ${b}, got ${a}, rel ${rel}`);

assert.equal(ALLEN_DERIVED_TOF_PROVENANCE.status,'RESEARCH_VALIDATION_ONLY');
assert.match(ALLEN_DERIVED_TOF_PROVENANCE.evidenceClass,/DERIVED_VALUE/);

// Independent numerical quadrature of the governing ODE transformed to time:
// dt = -(4 kz / 3 vs) dM/[M^2 C(M)]. Split the numerical mesh at Allen's
// drag-segment boundaries so Simpson quadrature is not asked to integrate across
// derivative discontinuities. This checks the analytic antiderivative itself.
function numericalTimeBetweenMach({Mstart,Mend,kz_m,speedOfSound_mps,intervalsPerSegment=20000}){
  const integrate=(hi,lo)=>{
    if(hi===lo)return 0;
    const n=intervalsPerSegment%2===0?intervalsPerSegment:intervalsPerSegment+1;
    const h=(hi-lo)/n;
    const f=M=>1/(M*M*allenDragCoefficientFromMach(M));
    let sum=f(lo)+f(hi);
    for(let i=1;i<n;i++)sum+=(i%2?4:2)*f(lo+i*h);
    return (h/3)*sum;
  };
  let cur=Mstart,I=0;
  if(cur>1.2){const next=Math.max(Mend,1.2);I+=integrate(cur,next);cur=next;}
  if(cur>0.7&&Mend<cur){const next=Math.max(Mend,0.7);I+=integrate(cur,next);cur=next;}
  if(Mend<cur)I+=integrate(cur,Mend);
  return (4*kz_m/(3*speedOfSound_mps))*I;
}

for(const [Mstart,Mend] of [[1.8,1.5],[1.8,1.0],[1.8,0.5],[1.1759,0.707],[1.1759,0.493],[1.0,0.5],[0.69,0.3]]){
  const args={Mstart,Mend,kz_m:27.538,speedOfSound_mps:349.91};
  const tClosed=allenDerivedTimeBetweenMach(args);
  const tNumeric=numericalTimeBetweenMach(args);
  near(tClosed,tNumeric,2e-10,`closed-vs-governing-ODE quadrature ${Mstart}->${Mend}`);
}

// Secondary internal cross-check against numerical integration of the separately
// implemented, printed exact velocity-vs-range formulas. Those primary-paper formula
// coefficients are rounded decimals and the earlier CI failure measured a ~0.3% TOF
// mismatch in one high-Mach case. Therefore this is intentionally only a 0.5% gross-
// consistency guard; it is not the equation-level validation tolerance above.
const base={speedOfSound_mps:343,pelletDiameter_m:0.0024,pelletDensity_kgm3:11340,airDensity_kgm3:1.204};
for(const M0s of [1.8,1.3,1.1759,1.0,0.69,0.5]){
  const params={...base,muzzleVelocity_mps:M0s*base.speedOfSound_mps};
  for(const x of [5,10,20,30,40]){
    let tNumerical,tClosed;
    try{
      tNumerical=allenFreeSphereTimeToRange(params,x,{intervals:8192});
      tClosed=allenDerivedClosedFormTimeToRange(params,x);
    }catch(e){
      if(/below Allen validated Mach 0.2 domain/.test(String(e)))continue;
      throw e;
    }
    nearRel(tClosed,tNumerical,5e-3,`derived-vs-rounded-velocity quadrature M0=${M0s} x=${x}m`);
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
  // Source publishes four-decimal-second results and rounded Eq. (23) coefficients.
  near(t,publishedT,3e-4,`Allen Eq24 worked flight time ${yards} yd`);
}

assert.throws(()=>allenDerivedTimeBetweenMach({Mstart:2.1,Mend:1,kz_m:10,speedOfSound_mps:343}),/requires/);
assert.throws(()=>allenDerivedTimeBetweenMach({Mstart:1,Mend:0.19,kz_m:10,speedOfSound_mps:343}),/requires/);

console.log(JSON.stringify({suite:'ShotSight P4 Allen derived TOF validation',status:'PASS',tests:{derivedVsGoverningOdeQuadrature:true,roundedFormulaGrossConsistency:true,primaryEq24ThirtyYards:true,primaryEq24SixtyYards:true,domainGuard:true,provenanceGuard:true}},null,2));
