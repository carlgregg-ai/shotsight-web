// ShotSight P9B — physics-constrained trajectory fitting v1
// First bounded model: static calibrated camera + constant-velocity 3-D target + one metric range anchor.
// Without the metric anchor monocular scale remains unidentifiable and the fitter MUST fail closed.

import {assertFiniteNumber,norm3,scale3,add3} from './target-engine-v1.mjs';
import {VIDEO_EVIDENCE_CLASS} from './video-observation-v1.mjs';

function dot3(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function sub3(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function unit3(v){const n=norm3(v);if(!(n>0))throw new Error('zero vector cannot be normalised');return scale3(v,1/n);}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}

function validateDerivedRay(o,i){
  if(o?.evidenceClass!==VIDEO_EVIDENCE_CLASS.CALIBRATED_DERIVED)throw new Error(`observation ${i} must be CALIBRATED_DERIVED`);
  assertFiniteNumber(o.t_s,`observation ${i}.t_s`);
  if(!Array.isArray(o.unitRay_C)||o.unitRay_C.length!==3||!o.unitRay_C.every(Number.isFinite))throw new Error(`observation ${i}.unitRay_C required`);
  const n=norm3(o.unitRay_C);if(Math.abs(n-1)>1e-10)throw new Error(`observation ${i}.unitRay_C must be unit length`);
}

function solveLinearSystem(A,b){
  const n=A.length;if(n===0||A.some(r=>r.length!==n)||b.length!==n)throw new Error('square system required');
  const M=A.map((r,i)=>[...r,b[i]]);
  for(let col=0;col<n;col++){
    let pivot=col,best=Math.abs(M[col][col]);
    for(let r=col+1;r<n;r++){const v=Math.abs(M[r][col]);if(v>best){best=v;pivot=r;}}
    if(!(best>1e-14))throw new Error('trajectory fit normal matrix is singular/ill-conditioned');
    if(pivot!==col)[M[pivot],M[col]]=[M[col],M[pivot]];
    const d=M[col][col];for(let c=col;c<=n;c++)M[col][c]/=d;
    for(let r=0;r<n;r++){if(r===col)continue;const f=M[r][col];if(f===0)continue;for(let c=col;c<=n;c++)M[r][c]-=f*M[col][c];}
  }
  return M.map(r=>r[n]);
}

function leastSquares(A,b){
  if(A.length!==b.length||A.length===0)throw new Error('non-empty A/b with matching rows required');
  const n=A[0].length;if(A.some(r=>r.length!==n))throw new Error('inconsistent A columns');
  const ATA=Array.from({length:n},()=>Array(n).fill(0)),ATb=Array(n).fill(0);
  for(let r=0;r<A.length;r++)for(let i=0;i<n;i++){
    ATb[i]+=A[r][i]*b[r];
    for(let j=0;j<n;j++)ATA[i][j]+=A[r][i]*A[r][j];
  }
  return solveLinearSystem(ATA,ATb);
}

export function fitConstantVelocityBearingTrack({observations,metricAnchor=null,modelId='STATIC_CAMERA_CONSTANT_VELOCITY_3D_V1'}={}){
  if(!Array.isArray(observations)||observations.length<3)throw new Error('at least 3 calibrated bearing observations required');
  observations.forEach(validateDerivedRay);
  for(let i=1;i<observations.length;i++)if(!(observations[i].t_s>observations[i-1].t_s))throw new Error('observation times must be strictly increasing');

  if(metricAnchor===null){
    return Object.freeze({
      status:'AMBIGUOUS',
      evidenceClass:VIDEO_EVIDENCE_CLASS.UNOBSERVABLE_AMBIGUOUS,
      modelId,
      quantity:'METRIC_CONSTANT_VELOCITY_3D_TRAJECTORY',
      reason:'MONOCULAR_SCALE_UNRESOLVED_CONSTANT_VELOCITY_FIT',
      required:'ONE_PROVENANCE_BACKED_METRIC_RANGE_ANCHOR',
      value:null
    });
  }
  const {observationIndex,range_m,provenance}=metricAnchor;
  if(!Number.isInteger(observationIndex)||observationIndex<0||observationIndex>=observations.length)throw new Error('metricAnchor.observationIndex out of range');
  assertFiniteNumber(range_m,'metricAnchor.range_m');if(!(range_m>0))throw new Error('metricAnchor.range_m must be > 0');if(!provenance)throw new Error('metricAnchor.provenance required');

  const anchor=observations[observationIndex],tAnchor=anchor.t_s,qAnchor_C=scale3(anchor.unitRay_C,range_m);
  const others=observations.map((o,i)=>({o,i})).filter(x=>x.i!==observationIndex);
  // Unknown vector x=[vx,vy,vz,lambda_0,...]. For each non-anchor observation:
  // q_anchor + v*dt = lambda_i*r_i -> dt*v - lambda_i*r_i = -q_anchor.
  const nUnknown=3+others.length,A=[],b=[];
  for(let k=0;k<others.length;k++){
    const {o}=others[k],dt=o.t_s-tAnchor,r=o.unitRay_C;
    for(let axis=0;axis<3;axis++){
      const row=Array(nUnknown).fill(0);row[axis]=dt;row[3+k]=-r[axis];A.push(row);b.push(-qAnchor_C[axis]);
    }
  }
  const x=leastSquares(A,b),velocity_C=Object.freeze(x.slice(0,3));
  const residuals=[];
  for(const o of observations){
    const dt=o.t_s-tAnchor,predicted_C=add3(qAnchor_C,scale3(velocity_C,dt)),predictedRay=unit3(predicted_C);
    const angularResidual_rad=Math.acos(clamp(dot3(predictedRay,o.unitRay_C),-1,1));
    residuals.push(Object.freeze({t_s:o.t_s,angularResidual_rad,predictedRange_m:norm3(predicted_C)}));
  }
  const squared=residuals.reduce((s,r)=>s+r.angularResidual_rad*r.angularResidual_rad,0),rmsAngularResidual_rad=Math.sqrt(squared/residuals.length),maxAngularResidual_rad=Math.max(...residuals.map(r=>r.angularResidual_rad));
  return Object.freeze({
    status:'FIT_COMPLETE',
    evidenceClass:VIDEO_EVIDENCE_CLASS.INFERRED,
    quantity:'METRIC_CONSTANT_VELOCITY_3D_TRAJECTORY_CAMERA_FRAME',
    modelId,
    assumptions:Object.freeze(['camera is static over fitted interval','pinhole calibration/rays are valid','target follows one constant-velocity 3-D trajectory over fitted interval','metric range anchor is valid and sets monocular scale']),
    confidence:null,
    metricAnchor:Object.freeze({observationIndex,range_m,provenance,t_s:tAnchor}),
    anchorPosition_C:Object.freeze(qAnchor_C),
    velocity_C,
    residuals:Object.freeze(residuals),
    rmsAngularResidual_rad,
    maxAngularResidual_rad,
    note:'Residual magnitude is model-fit evidence, not an automatic real-clay or coaching-method classification threshold.'
  });
}
