import assert from 'node:assert/strict';
import {
  STANDARD_GRAVITY, add3, cross3, dot3, norm3, unit3,
  quatMul, quatNorm, quatDerivativeBody, quatAxisAngle,
  zeroAcceleration, gravityAcceleration, zeroMoment,
  rk4Step, simulateFixed, analyticConstantAcceleration,
  validateDiagonalInertia, rotationalDerivative, rk4RotStep, simulateRotationFixed,
  validateAndertAeroParameters, realisticClayAcceleration
} from '../physics/target-engine-v1.mjs';

const near=(a,b,tol=1e-10,msg='')=>assert.ok(Math.abs(a-b)<=tol,`${msg} expected ${b}, got ${a}, tol ${tol}`);
const nearVec=(a,b,tol=1e-10,msg='')=>a.forEach((v,i)=>near(v,b[i],tol,`${msg}[${i}]`));

// Right-handed world basis: X right × Y forward = Z up.
assert.deepEqual(cross3([1,0,0],[0,1,0]),[0,0,1]);
assert.equal(dot3([1,0,0],[0,1,0]),0);
near(norm3(unit3([3,4,0])),1);

// Hamilton quaternion identity/body-rate derivative convention.
assert.deepEqual(quatMul([1,0,0,0],[1,0,0,0]),[1,0,0,0]);
near(quatNorm([1,0,0,0]),1);
const qdot=quatDerivativeBody([1,0,0,0],[0,0,2]);
nearVec(qdot,[0,0,0,1]);

// Stationary target remains stationary with zero acceleration.
const stationary=simulateFixed({initialState:{r:[2,30,4],v:[0,0,0]},tEnd:2,dt:0.01,acceleration:zeroAcceleration()});
nearVec(stationary.state.r,[2,30,4]);
nearVec(stationary.state.v,[0,0,0]);

// Constant velocity analytic equality.
const cv0={r:[-5,20,3],v:[12,-1,0.5]};
const cv=simulateFixed({initialState:cv0,tEnd:1.75,dt:0.013,acceleration:zeroAcceleration()});
const cvExact=analyticConstantAcceleration(cv0,[0,0,0],1.75);
nearVec(cv.state.r,cvExact.r,2e-11,'constant velocity r');
nearVec(cv.state.v,cvExact.v,2e-11,'constant velocity v');

// Gravity-only case should match closed form.
const g0={r:[0,0,1.6],v:[8,20,12]};
const tg=2.3;
const gsim=simulateFixed({initialState:g0,tEnd:tg,dt:0.017,acceleration:gravityAcceleration()});
const gexact=analyticConstantAcceleration(g0,[0,0,-STANDARD_GRAVITY],tg);
nearVec(gsim.state.r,gexact.r,2e-10,'gravity r');
nearVec(gsim.state.v,gexact.v,2e-10,'gravity v');

// Deterministic replay.
const args={initialState:{r:[1,2,3],v:[4,5,6]},t0:0,tEnd:0.77,dt:0.011,acceleration:gravityAcceleration(9.8)};
const a=simulateFixed(args),b=simulateFixed(args);
assert.equal(JSON.stringify(a),JSON.stringify(b),'deterministic replay mismatch');

// Final shortened step.
const short=simulateFixed({initialState:{r:[0,0,0],v:[1,0,0]},tEnd:1,dt:0.3,acceleration:zeroAcceleration()});
assert.equal(short.t,1);
near(short.state.r[0],1,1e-12);

// Rotational principal-axis zero-moment case: spin remains constant and quaternion follows analytic axis-angle.
const inertia=[1.33e-4,1.33e-4,2.57e-4];
validateDiagonalInertia(inertia);
const omegaZ=7.5;
const rot=simulateRotationFixed({initialState:{q:[1,0,0,0],omega:[0,0,omegaZ]},tEnd:1.2,dt:0.002,inertia,momentProvider:zeroMoment()});
nearVec(rot.state.omega,[0,0,omegaZ],2e-11,'principal-axis omega');
const qExact=quatAxisAngle([0,0,1],omegaZ*1.2);
// q and -q represent the same orientation; align sign before comparing.
const sign=(rot.state.q.reduce((s,v,i)=>s+v*qExact[i],0)>=0)?1:-1;
nearVec(rot.state.q.map(v=>v*sign),qExact,2e-9,'principal-axis q');
near(quatNorm(rot.state.q),1,2e-14,'quaternion norm');

// Torque-free asymmetric-body derivative obeys Euler rigid-body equation and remains finite.
const rd=rotationalDerivative({q:[1,0,0,0],omega:[1,2,3]},0,[2,3,4],zeroMoment());
nearVec(rd.domega,[-3,2,-0.5],1e-12,'Euler derivative');
const oneRotStep=rk4RotStep({q:[1,0,0,0],omega:[1,2,3]},0,0.001,[2,3,4],zeroMoment());
assert.ok(oneRotStep.q.every(Number.isFinite)&&oneRotStep.omega.every(Number.isFinite));
near(quatNorm(oneRotStep.q),1,2e-14);

// Input/state safety.
assert.throws(()=>rk4Step({r:[0,0,0],v:[0,0,0]},0,0,zeroAcceleration()),/dt must be > 0/);
assert.throws(()=>simulateFixed({initialState:{r:[0,0,NaN],v:[0,0,0]},tEnd:1,dt:.1,acceleration:zeroAcceleration()}),/finite vec3/);
assert.throws(()=>unit3([0,0,0]),/Cannot normalise/);
assert.throws(()=>validateDiagonalInertia([1,0,2]),/principal inertias must be > 0/);

// REALISTIC_CLAY must fail closed without every required coefficient.
assert.throws(()=>validateAndertAeroParameters({CL0:0}),/missing verified\/calibrated aerodynamic parameters/);
assert.equal(validateAndertAeroParameters({CL0:0.1,CLalpha:1,CD0:.1,K:.1,CM0:0,CMalpha:.1,CN:.1}),true);
assert.throws(()=>realisticClayAcceleration(),/REALISTIC_CLAY is HOLD/);

// Nonlinear TEST_ONLY convergence: dv/dt=-k v.
const linearDrag=k=>(state)=>state.v.map(v=>-k*v);
const d0={r:[0,0,0],v:[20,4,-2]};
const exactV=d0.v.map(v=>v*Math.exp(-0.7*1.2));
const coarse=simulateFixed({initialState:d0,tEnd:1.2,dt:.08,acceleration:linearDrag(.7)}).state.v;
const medium=simulateFixed({initialState:d0,tEnd:1.2,dt:.04,acceleration:linearDrag(.7)}).state.v;
const fine=simulateFixed({initialState:d0,tEnd:1.2,dt:.02,acceleration:linearDrag(.7)}).state.v;
const err=v=>Math.sqrt(v.reduce((s,x,i)=>s+(x-exactV[i])**2,0));
assert.ok(err(medium)<err(coarse),'step halving did not reduce RK4 error');
assert.ok(err(fine)<err(medium),'second step halving did not reduce RK4 error');
assert.ok(err(fine)<1e-7,`fine RK4 toy error too high: ${err(fine)}`);

console.log(JSON.stringify({
  suite:'ShotSight P3 target physics v1',
  status:'PASS',
  tests:{
    worldHandedness:true,quaternionConvention:true,stationary:true,constantVelocity:true,
    gravityAnalytic:true,deterministicReplay:true,finalStep:true,rotationalPrincipalAxis:true,
    rigidBodyEulerDerivative:true,inputSafety:true,realisticClayFailClosed:true,rk4Convergence:true
  }
},null,2));
