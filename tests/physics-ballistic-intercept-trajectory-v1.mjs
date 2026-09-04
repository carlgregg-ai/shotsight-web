import assert from 'node:assert/strict';
import {add3,scale3,sub3,norm3} from '../physics/target-engine-v1.mjs';
import {constantSpeedTestProvider} from '../physics/ballistics-v1.mjs';
import {interceptWithTimeToRangeProvider} from '../physics/ballistic-intercept-tof-v1.mjs';
import {interceptWithTargetTrajectoryProvider} from '../physics/ballistic-intercept-trajectory-v1.mjs';

const near=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: expected ${b}, got ${a}, tol ${tol}`);
const nearVec=(a,b,tol,msg)=>{assert.equal(a.length,b.length,msg);for(let i=0;i<a.length;i++)near(a[i],b[i],tol,`${msg}[${i}]`);};
const provider=constantSpeedTestProvider(400),origin=[0,0,0],p0=[-5,30,2],v=[10,3,1];

// New explicit-trajectory solver must collapse to the already verified constant-velocity solver.
const legacy=interceptWithTimeToRangeProvider({provider,shotOrigin_W:origin,targetPosition_W:p0,targetVelocity_W:v,tolerance_s:1e-11,maxIterations:160});
const generic=interceptWithTargetTrajectoryProvider({provider,shotOrigin_W:origin,targetPositionAtTau_W:tau=>add3(p0,scale3(v,tau)),tolerance_s:1e-11,maxIterations:160});
assert.equal(legacy.valid,true);assert.equal(generic.valid,true);
near(generic.pelletTOF_s,legacy.pelletTOF_s,2e-11,'constant-velocity TOF equivalence');
nearVec(generic.targetAtArrival_W,legacy.targetAtArrival_W,2e-10,'constant-velocity arrival equivalence');
nearVec(generic.bore_W,legacy.bore_W,2e-11,'constant-velocity bore equivalence');
nearVec(generic.physicalLeadVector_W,legacy.physicalLeadVector_W,2e-10,'constant-velocity lead equivalence');
near(generic.apparentLeadAngle_rad,legacy.apparentLeadAngle_rad,2e-11,'constant-velocity apparent lead equivalence');

// Explicit accelerating trajectory: root must satisfy tau = provider TOF(range(target(tau))).
const g=9.80665,a=[0,0,-g],ap0=[-4,28,1.5],av0=[8,4,12];
const targetAt=tau=>[
  ap0[0]+av0[0]*tau+0.5*a[0]*tau*tau,
  ap0[1]+av0[1]*tau+0.5*a[1]*tau*tau,
  ap0[2]+av0[2]*tau+0.5*a[2]*tau*tau
];
const accel=interceptWithTargetTrajectoryProvider({provider,shotOrigin_W:origin,targetPositionAtTau_W:targetAt,tolerance_s:1e-11,maxIterations:180});
assert.equal(accel.valid,true);
const exactArrival=targetAt(accel.pelletTOF_s);nearVec(accel.targetAtArrival_W,exactArrival,1e-12,'accelerating trajectory arrival');
const exactRange=norm3(sub3(exactArrival,origin));near(accel.pelletTOF_s,provider.timeToRange(exactRange),2e-11,'accelerating trajectory root residual');
nearVec(accel.physicalLeadVector_W,sub3(exactArrival,ap0),1e-12,'accelerating target physical lead');
assert.ok(Math.abs(accel.rootResidual_s)<=1e-11,'reported root residual must respect configured tolerance');
assert.ok(accel.limitations.some(x=>x.includes('target future position supplied explicitly')));

const bad=interceptWithTargetTrajectoryProvider({provider,shotOrigin_W:origin,targetPositionAtTau_W:()=>[NaN,0,0]});
assert.equal(bad.valid,false);assert.equal(bad.reason,'INVALID_TARGET_TRAJECTORY');

console.log(JSON.stringify({suite:'ShotSight explicit-target-trajectory intercept',status:'PASS',tests:{constantVelocityEquivalence:true,acceleratingTrajectoryRoot:true,physicalLeadFromTrajectory:true,failClosedInvalidTrajectory:true}},null,2));
