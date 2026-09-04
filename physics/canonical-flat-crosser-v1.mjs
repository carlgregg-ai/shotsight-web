// ShotSight P7 — canonical flat-crosser integrated engineering proof v1
// IMPORTANT: NOT realistic clay-flight certification and NOT production instructional motion.

import {add3,sub3,scale3,norm3,unit3,dot3,assertFiniteNumber,assertFiniteVec3} from './target-engine-v1.mjs';
import {interceptWithTimeToRangeProvider} from './ballistic-intercept-tof-v1.mjs';
import {worldPointToCamera,apparentAnglesFromCameraVector,losAngularVelocityVector,boreAngularRateBetweenSamples} from './projection-gun-v1.mjs';
import {getMethodRegistryEntry} from './method-registry-v1.mjs';
import {createNarrativeTimeline,validateNarrativeOrdering} from './method-narrative-v1.mjs';

export function createTestOnlyConstantSpeedProvider(speed_mps=400){
  assertFiniteNumber(speed_mps,'speed_mps');if(!(speed_mps>0))throw new Error('speed_mps must be > 0');
  return Object.freeze({id:'P7_TEST_ONLY_CONSTANT_SPEED',status:'TEST_ONLY_NOT_INSTRUCTIONAL',speed_mps,timeToRange(range_m){assertFiniteNumber(range_m,'range_m');if(!(range_m>0))throw new Error('range_m must be > 0');return range_m/speed_mps;}});
}

export const P7_DEFAULT_CAMERA_R_CW=Object.freeze([Object.freeze([1,0,0]),Object.freeze([0,0,-1]),Object.freeze([0,1,0])]);

export function createCanonicalFlatCrosserScenario({targetInitial_W=[-6,35,1.5],targetVelocity_W=[15,0,0],shotOrigin_W=[0,0,1.5],cameraOrigin_W=[0,0,1.65],R_CW=P7_DEFAULT_CAMERA_R_CW,shotTime_s=0.8,methodRegistryId='NSCA_LONG_CROSSER_PULL_AWAY',provider=createTestOnlyConstantSpeedProvider()}={}){
  for(const [name,value] of Object.entries({targetInitial_W,targetVelocity_W,shotOrigin_W,cameraOrigin_W}))assertFiniteVec3(value,name);
  assertFiniteNumber(shotTime_s,'shotTime_s');if(shotTime_s<0)throw new Error('shotTime_s must be >= 0');
  const methodEntry=getMethodRegistryEntry(methodRegistryId);
  if(provider.status!=='TEST_ONLY_NOT_INSTRUCTIONAL')throw new Error('P7 v1 canonical proof requires explicit TEST_ONLY provider');
  return Object.freeze({id:'P7_FLAT_CROSSER_ENGINEERING_PROOF_V1',status:'ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION',targetInitial_W:Object.freeze([...targetInitial_W]),targetVelocity_W:Object.freeze([...targetVelocity_W]),shotOrigin_W:Object.freeze([...shotOrigin_W]),cameraOrigin_W:Object.freeze([...cameraOrigin_W]),R_CW,shotTime_s,methodEntry,provider,limitations:Object.freeze(['constant-velocity target','TEST_ONLY constant-speed pellet provider','straight pellet path','no realistic clay aerodynamics','no dense shot-cloud model','method provenance attached but threshold-dependent coaching states remain held'])});
}

function targetPositionAt(scenario,t_s){return add3(scenario.targetInitial_W,scale3(scenario.targetVelocity_W,t_s));}
function interceptAt(scenario,t_s){return interceptWithTimeToRangeProvider({provider:scenario.provider,shotOrigin_W:scenario.shotOrigin_W,targetPosition_W:targetPositionAt(scenario,t_s),targetVelocity_W:scenario.targetVelocity_W,maxTau_s:2,tolerance_s:1e-10,maxIterations:120});}
function angleBetween(a,b){const d=Math.max(-1,Math.min(1,dot3(unit3(a),unit3(b))));return Math.acos(d);}

export function simulateCanonicalFlatCrosser(scenario,t_s,{rateDt_s=1e-4}={}){
  if(!scenario||scenario.status!=='ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION')throw new Error('canonical P7 scenario required');
  assertFiniteNumber(t_s,'t_s');assertFiniteNumber(rateDt_s,'rateDt_s');if(t_s<0||!(rateDt_s>0))throw new Error('invalid simulation time/rateDt_s');
  const targetPosition_W=targetPositionAt(scenario,t_s);
  const targetRange_m=norm3(sub3(targetPosition_W,scenario.cameraOrigin_W));
  const targetVector_C=worldPointToCamera({point_W:targetPosition_W,cameraOrigin_W:scenario.cameraOrigin_W,R_CW:scenario.R_CW});
  const targetAngles=apparentAnglesFromCameraVector(targetVector_C);
  const targetLosOmega_W=losAngularVelocityVector(sub3(targetPosition_W,scenario.cameraOrigin_W),scenario.targetVelocity_W);
  const currentIntercept=interceptAt(scenario,t_s);if(!currentIntercept.valid)throw new Error(`P7 intercept invalid: ${currentIntercept.reason}`);
  const borePoint_W=add3(scenario.cameraOrigin_W,currentIntercept.bore_W);
  const boreVector_C=worldPointToCamera({point_W:borePoint_W,cameraOrigin_W:scenario.cameraOrigin_W,R_CW:scenario.R_CW});
  const boreAngles=apparentAnglesFromCameraVector(boreVector_C);
  const cameraApparentLeadAngle_rad=angleBetween(targetVector_C,boreVector_C);
  const t0=Math.max(0,t_s-rateDt_s),prevIntercept=interceptAt(scenario,t0);if(!prevIntercept.valid)throw new Error(`P7 previous intercept invalid: ${prevIntercept.reason}`);
  const gunRate=t_s===0?Object.freeze({angle_rad:0,angularSpeed_radps:0,axis_W:[0,0,0],dt_s:rateDt_s}):boreAngularRateBetweenSamples({b0_W:prevIntercept.bore_W,b1_W:currentIntercept.bore_W,dt_s:t_s-t0});
  const shotIntercept=interceptAt(scenario,scenario.shotTime_s);if(!shotIntercept.valid)throw new Error(`P7 shot intercept invalid: ${shotIntercept.reason}`);
  const narrative=createNarrativeTimeline({shotTime_s:scenario.shotTime_s,pelletTOF_s:shotIntercept.pelletTOF_s,hit:false});validateNarrativeOrdering(narrative);
  return Object.freeze({scenarioId:scenario.id,scenarioStatus:scenario.status,t_s,target:Object.freeze({position_W:targetPosition_W,velocity_W:scenario.targetVelocity_W,speed_mps:norm3(scenario.targetVelocity_W),range_m:targetRange_m,az_rad:targetAngles.az_rad,el_rad:targetAngles.el_rad,losAngularVelocity_W:targetLosOmega_W}),gun:Object.freeze({bore_W:currentIntercept.bore_W,az_rad:boreAngles.az_rad,el_rad:boreAngles.el_rad,angularSpeed_radps:gunRate.angularSpeed_radps}),relationship:Object.freeze({signedApparentAzSeparation_rad:boreAngles.az_rad-targetAngles.az_rad,physicalLead_m:currentIntercept.physicalLead_m,apparentLeadAngle_rad:cameraApparentLeadAngle_rad,ballisticShotOriginLeadAngle_rad:currentIntercept.apparentLeadAngle_rad,apparentLeadReference:'CAMERA_ORIGIN_PROJECTED_TARGET_VS_BORE'}),ballistic:Object.freeze({providerId:scenario.provider.id,providerStatus:scenario.provider.status,currentIntercept,shotIntercept,pelletArrival_s:scenario.shotTime_s+shotIntercept.pelletTOF_s}),method:Object.freeze({id:scenario.methodEntry.contract.id,evidenceClass:scenario.methodEntry.contract.evidenceClass,sources:scenario.methodEntry.contract.sources,thresholdEventsStatus:'HOLD_UNLESS_AUTHORISED_PREDICATE'}),narrative,activeNarrativeEvents:Object.freeze(narrative.filter(e=>Number.isFinite(e.t_s)&&e.t_s<=t_s)),masterClock:Object.freeze({t_s,allSubsystemsReadSameTime:true}),certification:Object.freeze({realisticClay:false,instructionalMotion:false,engineeringIntegrationProof:true})});
}
