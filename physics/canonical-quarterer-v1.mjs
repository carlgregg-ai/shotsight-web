// ShotSight P8A — canonical quarterer integrated engineering proof v1
// IMPORTANT: constant-velocity engineering geometry only.
// NOT realistic clay-flight certification and NOT production instructional motion.

import {add3,sub3,scale3,norm3,unit3,dot3,assertFiniteNumber,assertFiniteVec3} from './target-engine-v1.mjs';
import {constantSpeedTestProvider,angularSeparationRad} from './ballistics-v1.mjs';
import {interceptWithTimeToRangeProvider} from './ballistic-intercept-tof-v1.mjs';
import {worldPointToCamera,apparentAnglesFromCameraVector,losAngularVelocityVector,boreAngularRateBetweenSamples} from './projection-gun-v1.mjs';
import {createNarrativeTimeline,validateNarrativeOrdering} from './method-narrative-v1.mjs';

export const P8A_ENGINEERING_GUN_STRATEGY=Object.freeze({
  id:'ENGINEERING_INTERCEPT_REFERENCE',
  provenanceClass:'ENGINEERING_REFERENCE',
  status:'NOT_A_COACHING_METHOD',
  description:'Bore continuously follows the instantaneous physical intercept solution for geometry/integration validation only.'
});

export const P8A_DEFAULT_CAMERA_R_CW=Object.freeze([
  Object.freeze([1,0,0]),
  Object.freeze([0,0,-1]),
  Object.freeze([0,1,0])
]);

export function createCanonicalQuartererScenario({
  targetInitial_W=[-8,25,1.5],
  targetVelocity_W=[12,5,0],
  shotOrigin_W=[0,0,1.5],
  cameraOrigin_W=[0,0,1.65],
  R_CW=P8A_DEFAULT_CAMERA_R_CW,
  shotTime_s=0.8,
  provider=constantSpeedTestProvider(400)
}={}){
  for(const [name,value] of Object.entries({targetInitial_W,targetVelocity_W,shotOrigin_W,cameraOrigin_W}))assertFiniteVec3(value,name);
  assertFiniteNumber(shotTime_s,'shotTime_s');if(shotTime_s<0)throw new Error('shotTime_s must be >= 0');
  if(provider.status!=='TEST_ONLY')throw new Error('P8A quarterer proof requires explicit TEST_ONLY ballistic provider');
  const initialRelative=sub3(targetInitial_W,cameraOrigin_W);
  if(!(norm3(initialRelative)>0))throw new Error('target initial position must not coincide with camera origin');
  return Object.freeze({
    id:'P8A_QUARTERER_ENGINEERING_PROOF_V1',
    status:'ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION',
    presentation:'QUARTERING_CONSTANT_VELOCITY_GEOMETRY_PROOF',
    targetInitial_W:Object.freeze([...targetInitial_W]),
    targetVelocity_W:Object.freeze([...targetVelocity_W]),
    shotOrigin_W:Object.freeze([...shotOrigin_W]),
    cameraOrigin_W:Object.freeze([...cameraOrigin_W]),
    R_CW,
    shotTime_s,
    gunStrategy:P8A_ENGINEERING_GUN_STRATEGY,
    sourceMethodReference:Object.freeze({
      id:null,
      role:'NONE_SELECTED',
      kinematicsStatus:'HOLD_NO_AUTHORISED_APPLICABILITY_MAPPING',
      thresholdEventsStatus:'HOLD_UNLESS_AUTHORISED_PREDICATE'
    }),
    provider,
    limitations:Object.freeze([
      'constant-velocity point-target trajectory used to isolate quartering geometry',
      'TEST_ONLY constant-speed pellet provider',
      'straight pellet path',
      'no realistic clay aerodynamics or launch/spin model',
      'no dense shot-cloud model',
      'engineering intercept-reference gun strategy is NOT a coaching method',
      'no source coaching method is asserted for this proof'
    ])
  });
}

function targetPositionAt(scenario,t_s){return add3(scenario.targetInitial_W,scale3(scenario.targetVelocity_W,t_s));}
function interceptAt(scenario,t_s){
  return interceptWithTimeToRangeProvider({
    provider:scenario.provider,
    shotOrigin_W:scenario.shotOrigin_W,
    targetPosition_W:targetPositionAt(scenario,t_s),
    targetVelocity_W:scenario.targetVelocity_W,
    maxTau_s:2,
    tolerance_s:1e-10,
    maxIterations:120
  });
}

export function simulateCanonicalQuarterer(scenario,t_s,{rateDt_s=1e-4}={}){
  if(!scenario||scenario.status!=='ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION'||scenario.presentation!=='QUARTERING_CONSTANT_VELOCITY_GEOMETRY_PROOF')throw new Error('canonical P8A quarterer scenario required');
  assertFiniteNumber(t_s,'t_s');assertFiniteNumber(rateDt_s,'rateDt_s');if(t_s<0||!(rateDt_s>0))throw new Error('invalid simulation time/rateDt_s');

  const targetPosition_W=targetPositionAt(scenario,t_s);
  const targetRelativeCamera_W=sub3(targetPosition_W,scenario.cameraOrigin_W);
  const targetRange_m=norm3(targetRelativeCamera_W);
  const targetRangeRate_mps=dot3(targetRelativeCamera_W,scenario.targetVelocity_W)/targetRange_m;
  const targetVector_C=worldPointToCamera({point_W:targetPosition_W,cameraOrigin_W:scenario.cameraOrigin_W,R_CW:scenario.R_CW});
  const targetAngles=apparentAnglesFromCameraVector(targetVector_C);
  const targetLosOmega_W=losAngularVelocityVector(targetRelativeCamera_W,scenario.targetVelocity_W);
  const targetLosAngularSpeed_radps=norm3(targetLosOmega_W);

  const currentIntercept=interceptAt(scenario,t_s);
  if(!currentIntercept.valid)throw new Error(`P8A intercept invalid: ${currentIntercept.reason}`);
  const borePoint_W=add3(scenario.cameraOrigin_W,currentIntercept.bore_W);
  const boreVector_C=worldPointToCamera({point_W:borePoint_W,cameraOrigin_W:scenario.cameraOrigin_W,R_CW:scenario.R_CW});
  const boreAngles=apparentAnglesFromCameraVector(boreVector_C);
  const cameraApparentLeadAngle_rad=angularSeparationRad(targetVector_C,boreVector_C);

  const t0=Math.max(0,t_s-rateDt_s);
  const prevIntercept=interceptAt(scenario,t0);
  if(!prevIntercept.valid)throw new Error(`P8A previous intercept invalid: ${prevIntercept.reason}`);
  const gunRate=t_s===0
    ?Object.freeze({angle_rad:0,angularSpeed_radps:0,axis_W:[0,0,0],dt_s:rateDt_s})
    :boreAngularRateBetweenSamples({b0_W:prevIntercept.bore_W,b1_W:currentIntercept.bore_W,dt_s:t_s-t0});

  const shotIntercept=interceptAt(scenario,scenario.shotTime_s);
  if(!shotIntercept.valid)throw new Error(`P8A shot intercept invalid: ${shotIntercept.reason}`);
  const narrative=createNarrativeTimeline({shotTime_s:scenario.shotTime_s,pelletTOF_s:shotIntercept.pelletTOF_s,hit:false});
  validateNarrativeOrdering(narrative);

  return Object.freeze({
    scenarioId:scenario.id,
    scenarioStatus:scenario.status,
    presentation:scenario.presentation,
    t_s,
    target:Object.freeze({
      position_W:targetPosition_W,
      velocity_W:scenario.targetVelocity_W,
      speed_mps:norm3(scenario.targetVelocity_W),
      range_m:targetRange_m,
      rangeRate_mps:targetRangeRate_mps,
      az_rad:targetAngles.az_rad,
      el_rad:targetAngles.el_rad,
      losAngularVelocity_W:targetLosOmega_W,
      losAngularSpeed_radps:targetLosAngularSpeed_radps
    }),
    gun:Object.freeze({
      bore_W:currentIntercept.bore_W,
      az_rad:boreAngles.az_rad,
      el_rad:boreAngles.el_rad,
      angularSpeed_radps:gunRate.angularSpeed_radps
    }),
    gunStrategy:Object.freeze({...scenario.gunStrategy,active:true}),
    relationship:Object.freeze({
      signedApparentAzSeparation_rad:boreAngles.az_rad-targetAngles.az_rad,
      physicalLeadVector_W:currentIntercept.physicalLeadVector_W,
      physicalLead_m:currentIntercept.physicalLead_m,
      apparentLeadAngle_rad:cameraApparentLeadAngle_rad,
      ballisticShotOriginLeadAngle_rad:currentIntercept.apparentLeadAngle_rad,
      apparentLeadReference:'CAMERA_ORIGIN_PROJECTED_TARGET_VS_BORE'
    }),
    ballistic:Object.freeze({
      providerId:scenario.provider.id,
      providerStatus:scenario.provider.status,
      currentIntercept,
      shotIntercept,
      pelletArrival_s:scenario.shotTime_s+shotIntercept.pelletTOF_s
    }),
    method:Object.freeze({...scenario.sourceMethodReference}),
    narrative,
    activeNarrativeEvents:Object.freeze(narrative.filter(e=>Number.isFinite(e.t_s)&&e.t_s<=t_s)),
    masterClock:Object.freeze({t_s,allSubsystemsReadSameTime:true}),
    certification:Object.freeze({
      realisticClay:false,
      instructionalMotion:false,
      engineeringIntegrationProof:true,
      quarteringGeometryValidatedOnly:true
    })
  });
}

export function mirrorQuartererAcrossWorldYZ(scenario){
  if(!scenario||scenario.presentation!=='QUARTERING_CONSTANT_VELOCITY_GEOMETRY_PROOF')throw new Error('P8A quarterer scenario required');
  return createCanonicalQuartererScenario({
    targetInitial_W:[-scenario.targetInitial_W[0],scenario.targetInitial_W[1],scenario.targetInitial_W[2]],
    targetVelocity_W:[-scenario.targetVelocity_W[0],scenario.targetVelocity_W[1],scenario.targetVelocity_W[2]],
    shotOrigin_W:[-scenario.shotOrigin_W[0],scenario.shotOrigin_W[1],scenario.shotOrigin_W[2]],
    cameraOrigin_W:[-scenario.cameraOrigin_W[0],scenario.cameraOrigin_W[1],scenario.cameraOrigin_W[2]],
    R_CW:scenario.R_CW,
    shotTime_s:scenario.shotTime_s,
    provider:scenario.provider
  });
}
