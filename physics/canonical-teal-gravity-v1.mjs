// ShotSight P8C — teal strong-vertical-component gravity-only engineering proof v1
// IMPORTANT: engineering geometry only. NOT a measured/validated real teal trajectory.

import {add3,sub3,scale3,norm3,dot3,assertFiniteNumber,assertFiniteVec3} from './target-engine-v1.mjs';
import {constantSpeedTestProvider,angularSeparationRad} from './ballistics-v1.mjs';
import {interceptWithTargetTrajectoryProvider} from './ballistic-intercept-trajectory-v1.mjs';
import {worldPointToCamera,apparentAnglesFromCameraVector,losAngularVelocityVector,boreAngularRateBetweenSamples} from './projection-gun-v1.mjs';
import {createNarrativeTimeline,validateNarrativeOrdering} from './method-narrative-v1.mjs';

export const P8C_STANDARD_GRAVITY_MPS2=9.80665;
export const P8C_ENGINEERING_GUN_STRATEGY=Object.freeze({id:'ENGINEERING_INTERCEPT_REFERENCE',provenanceClass:'ENGINEERING_REFERENCE',status:'NOT_A_COACHING_METHOD',description:'Bore follows the instantaneous engineering intercept solution only.'});
export const P8C_DEFAULT_CAMERA_R_CW=Object.freeze([Object.freeze([1,0,0]),Object.freeze([0,0,-1]),Object.freeze([0,1,0])]);

export function createCanonicalTealGravityScenario({targetInitial_W=[0,22,1.5],targetInitialVelocity_W=[1,3,16],shotOrigin_W=[0,0,1.5],cameraOrigin_W=[0,0,1.65],R_CW=P8C_DEFAULT_CAMERA_R_CW,shotTime_s=0.9,gravity_mps2=P8C_STANDARD_GRAVITY_MPS2,provider=constantSpeedTestProvider(400)}={}){
  for(const [name,value] of Object.entries({targetInitial_W,targetInitialVelocity_W,shotOrigin_W,cameraOrigin_W}))assertFiniteVec3(value,name);
  assertFiniteNumber(shotTime_s,'shotTime_s');assertFiniteNumber(gravity_mps2,'gravity_mps2');
  if(shotTime_s<0||!(gravity_mps2>0))throw new Error('invalid shotTime_s/gravity_mps2');
  if(!(targetInitialVelocity_W[2]>0))throw new Error('P8C teal proof requires positive initial vertical velocity');
  const horizontalSpeed=Math.hypot(targetInitialVelocity_W[0],targetInitialVelocity_W[1]);
  if(!(horizontalSpeed>0))throw new Error('P8C teal proof requires nonzero horizontal velocity for projection/LOS validation');
  if(!(Math.abs(targetInitialVelocity_W[2])>horizontalSpeed))throw new Error('P8C teal engineering proof requires a strong vertical component');
  if(provider.status!=='TEST_ONLY')throw new Error('P8C teal proof requires explicit TEST_ONLY ballistic provider');
  return Object.freeze({
    id:'P8C_TEAL_TOY_GRAVITY_ONLY_V1',status:'ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION',presentation:'TEAL_TOY_GRAVITY_ONLY_STRONG_VERTICAL',modelBoundary:'TOY_GRAVITY_ONLY',gravity_mps2,gravityProvenance:'P2_SPEC_STANDARD_GRAVITY',
    targetInitial_W:Object.freeze([...targetInitial_W]),targetInitialVelocity_W:Object.freeze([...targetInitialVelocity_W]),shotOrigin_W:Object.freeze([...shotOrigin_W]),cameraOrigin_W:Object.freeze([...cameraOrigin_W]),R_CW,shotTime_s,apexTime_s:targetInitialVelocity_W[2]/gravity_mps2,
    initialVerticalToHorizontalSpeedRatio:Math.abs(targetInitialVelocity_W[2])/horizontalSpeed,
    gunStrategy:P8C_ENGINEERING_GUN_STRATEGY,
    sourceMethodReference:Object.freeze({id:null,role:'NONE_SELECTED',kinematicsStatus:'HOLD_NO_AUTHORISED_APPLICABILITY_MAPPING',thresholdEventsStatus:'HOLD_UNLESS_AUTHORISED_PREDICATE'}),
    phaseSemantics:Object.freeze({rise:'RISE_GEOMETRIC_ONLY',underPower:'HOLD_NO_TRAP_LAUNCH_OR_EMPIRICAL_POWERED_REGION_MODEL',apex:'APEX_GEOMETRIC',descent:'DESCENT_GEOMETRIC'}),
    provider,
    inputProvenance:Object.freeze({launchState:'ENGINEERING_TEST_INPUT_NOT_REAL_TEAL_MEASUREMENT',gravity:'VERIFIED_FACT_P2_SPEC_STANDARD_GRAVITY'}),
    limitations:Object.freeze(['gravity-only point-target flight; no aerodynamic drag/lift/moment/spin model','launch state is an engineering test input, not a measured teal throw','the coaching phrase rise-under-power is explicitly HOLD','TEST_ONLY constant-speed pellet provider with straight pellet path','no dense shot-cloud model','engineering intercept-reference gun strategy is NOT a coaching method','no coaching method is asserted for this proof'])
  });
}

export function tealTargetStateAt(scenario,t_s){
  if(!scenario||scenario.presentation!=='TEAL_TOY_GRAVITY_ONLY_STRONG_VERTICAL')throw new Error('P8C teal scenario required');
  assertFiniteNumber(t_s,'t_s');if(t_s<0)throw new Error('t_s must be >= 0');
  const g=scenario.gravity_mps2,a=[0,0,-g];
  const position_W=add3(add3(scenario.targetInitial_W,scale3(scenario.targetInitialVelocity_W,t_s)),scale3(a,0.5*t_s*t_s));
  const velocity_W=add3(scenario.targetInitialVelocity_W,scale3(a,t_s)),vz=velocity_W[2];
  const phaseEps=64*Number.EPSILON*Math.max(1,Math.abs(scenario.targetInitialVelocity_W[2]),Math.abs(g*t_s));
  const phase=Math.abs(vz)<=phaseEps?'APEX':vz>0?'RISE':'DESCENT';
  const horizontalSpeed_mps=Math.hypot(velocity_W[0],velocity_W[1]);
  return Object.freeze({t_s,position_W,velocity_W,speed_mps:norm3(velocity_W),horizontalSpeed_mps,verticalVelocity_mps:vz,verticalToHorizontalSpeedRatio:Math.abs(vz)/horizontalSpeed_mps,phase,underPowerStatus:scenario.phaseSemantics.underPower});
}

function interceptAt(scenario,t_s){return interceptWithTargetTrajectoryProvider({provider:scenario.provider,shotOrigin_W:scenario.shotOrigin_W,targetPositionAtTau_W:tau=>tealTargetStateAt(scenario,t_s+tau).position_W,maxTau_s:2,tolerance_s:1e-10,maxIterations:140});}

export function simulateCanonicalTealGravity(scenario,t_s,{rateDt_s=1e-4}={}){
  if(!scenario||scenario.status!=='ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION'||scenario.presentation!=='TEAL_TOY_GRAVITY_ONLY_STRONG_VERTICAL')throw new Error('canonical P8C teal scenario required');
  assertFiniteNumber(t_s,'t_s');assertFiniteNumber(rateDt_s,'rateDt_s');if(t_s<0||!(rateDt_s>0))throw new Error('invalid simulation time/rateDt_s');
  const targetState=tealTargetStateAt(scenario,t_s),targetRelativeCamera_W=sub3(targetState.position_W,scenario.cameraOrigin_W),targetRange_m=norm3(targetRelativeCamera_W);
  const targetRangeRate_mps=dot3(targetRelativeCamera_W,targetState.velocity_W)/targetRange_m;
  const targetVector_C=worldPointToCamera({point_W:targetState.position_W,cameraOrigin_W:scenario.cameraOrigin_W,R_CW:scenario.R_CW}),targetAngles=apparentAnglesFromCameraVector(targetVector_C),targetLosOmega_W=losAngularVelocityVector(targetRelativeCamera_W,targetState.velocity_W);
  const currentIntercept=interceptAt(scenario,t_s);if(!currentIntercept.valid)throw new Error(`P8C intercept invalid: ${currentIntercept.reason}`);
  const borePoint_W=add3(scenario.cameraOrigin_W,currentIntercept.bore_W),boreVector_C=worldPointToCamera({point_W:borePoint_W,cameraOrigin_W:scenario.cameraOrigin_W,R_CW:scenario.R_CW}),boreAngles=apparentAnglesFromCameraVector(boreVector_C);
  const t0=Math.max(0,t_s-rateDt_s),prevIntercept=interceptAt(scenario,t0);if(!prevIntercept.valid)throw new Error(`P8C previous intercept invalid: ${prevIntercept.reason}`);
  const gunRate=t_s===0?Object.freeze({angle_rad:0,angularSpeed_radps:0,axis_W:[0,0,0],dt_s:rateDt_s}):boreAngularRateBetweenSamples({b0_W:prevIntercept.bore_W,b1_W:currentIntercept.bore_W,dt_s:t_s-t0});
  const shotIntercept=interceptAt(scenario,scenario.shotTime_s);if(!shotIntercept.valid)throw new Error(`P8C shot intercept invalid: ${shotIntercept.reason}`);
  const narrative=createNarrativeTimeline({shotTime_s:scenario.shotTime_s,pelletTOF_s:shotIntercept.pelletTOF_s,hit:false});validateNarrativeOrdering(narrative);
  return Object.freeze({scenarioId:scenario.id,scenarioStatus:scenario.status,presentation:scenario.presentation,modelBoundary:scenario.modelBoundary,t_s,target:Object.freeze({...targetState,range_m:targetRange_m,rangeRate_mps:targetRangeRate_mps,az_rad:targetAngles.az_rad,el_rad:targetAngles.el_rad,losAngularVelocity_W:targetLosOmega_W,losAngularSpeed_radps:norm3(targetLosOmega_W)}),gun:Object.freeze({bore_W:currentIntercept.bore_W,az_rad:boreAngles.az_rad,el_rad:boreAngles.el_rad,angularSpeed_radps:gunRate.angularSpeed_radps}),gunStrategy:Object.freeze({...scenario.gunStrategy,active:true}),relationship:Object.freeze({signedApparentAzSeparation_rad:boreAngles.az_rad-targetAngles.az_rad,physicalLeadVector_W:currentIntercept.physicalLeadVector_W,physicalLead_m:currentIntercept.physicalLead_m,apparentLeadAngle_rad:angularSeparationRad(targetVector_C,boreVector_C),ballisticShotOriginLeadAngle_rad:currentIntercept.apparentLeadAngle_rad,apparentLeadReference:'CAMERA_ORIGIN_PROJECTED_TARGET_VS_BORE'}),ballistic:Object.freeze({providerId:scenario.provider.id,providerStatus:scenario.provider.status,currentIntercept,shotIntercept,pelletArrival_s:scenario.shotTime_s+shotIntercept.pelletTOF_s}),method:Object.freeze({...scenario.sourceMethodReference}),phaseSemantics:scenario.phaseSemantics,narrative,activeNarrativeEvents:Object.freeze(narrative.filter(e=>Number.isFinite(e.t_s)&&e.t_s<=t_s)),masterClock:Object.freeze({t_s,allSubsystemsReadSameTime:true}),certification:Object.freeze({realisticClay:false,instructionalMotion:false,engineeringIntegrationProof:true,strongVerticalGravityOnlyValidatedOnly:true})});
}

export function mirrorTealAcrossWorldYZ(scenario){
  if(!scenario||scenario.presentation!=='TEAL_TOY_GRAVITY_ONLY_STRONG_VERTICAL')throw new Error('P8C teal scenario required');
  return createCanonicalTealGravityScenario({targetInitial_W:[-scenario.targetInitial_W[0],scenario.targetInitial_W[1],scenario.targetInitial_W[2]],targetInitialVelocity_W:[-scenario.targetInitialVelocity_W[0],scenario.targetInitialVelocity_W[1],scenario.targetInitialVelocity_W[2]],shotOrigin_W:[-scenario.shotOrigin_W[0],scenario.shotOrigin_W[1],scenario.shotOrigin_W[2]],cameraOrigin_W:[-scenario.cameraOrigin_W[0],scenario.cameraOrigin_W[1],scenario.cameraOrigin_W[2]],R_CW:scenario.R_CW,shotTime_s:scenario.shotTime_s,gravity_mps2:scenario.gravity_mps2,provider:scenario.provider});
}
