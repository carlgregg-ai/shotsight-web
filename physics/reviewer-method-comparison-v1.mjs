// ShotSight reviewer method-comparison adapter v1.
// IMPORTANT: recognised method names are source-backed; numerical timing/separation below are
// SHOTSIGHT_HYPOTHESIS parameters for expert review only. NOT instructional method kinematics.
import {unit3,add3,scale3,assertFiniteNumber} from './target-engine-v1.mjs';
import {createCanonicalFlatCrosserScenario,simulateCanonicalFlatCrosser} from './canonical-flat-crosser-v1.mjs';

export const METHOD_COMPARISON_STATUS='PROVISIONAL_METHOD_KINEMATIC_HYPOTHESIS_FOR_EXPERT_REVIEW';
export const METHOD_KINEMATICS_STATUS='SHOTSIGHT_HYPOTHESIS_PENDING_EXPERT_REVIEW';
export const METHOD_EVIDENCE_CLASS='SHOTSIGHT_HYPOTHESIS';
export const METHOD_REVIEW_FRAME_RATE_HZ=60;
export const METHOD_REVIEW_DURATION_S=2;

export const METHOD_REVIEW_CONFIG=Object.freeze({
  SWING_THROUGH:Object.freeze({
    id:'SWING_THROUGH',name:'Swing-through',sourceRegistryId:'CPSA_SWING_THROUGH_RECOGNISED',
    parameters:Object.freeze({initialLeadScale:-1.25,crossTargetTime_s:0.55,shotTime_s:0.8}),
    interpretation:'Begin behind, swing through the target, cross it, and continue to the ballistic shot lead.'
  }),
  PULL_AWAY:Object.freeze({
    id:'PULL_AWAY',name:'Pull-away',sourceRegistryId:'CPSA_PULL_AWAY_RECOGNISED',
    parameters:Object.freeze({initialLeadScale:-0.35,connectionTime_s:0.32,separationStartTime_s:0.50,shotTime_s:0.8}),
    interpretation:'Acquire to connection, hold a target-speed match phase, then separate smoothly to the ballistic shot lead.'
  }),
  MAINTAINED_LEAD:Object.freeze({
    id:'MAINTAINED_LEAD',name:'Maintained lead',sourceRegistryId:'CPSA_MAINTAINED_LEAD_RECOGNISED',
    parameters:Object.freeze({leadScale:1,shotTime_s:0.8}),
    interpretation:'Maintain the final ballistic shot-lead relationship throughout the visible move.'
  })
});

const SHOULDER_W=Object.freeze([0.18,-0.05,1.48]);
const BARREL_LENGTH_M=1.25;
function clamp(v,lo,hi){return Math.min(hi,Math.max(lo,v));}
function smoothstep01(u){const x=clamp(u,0,1);return x*x*(3-2*x);}
function lerp(a,b,u){return a+(b-a)*u;}
function transposeMul3(R,v){return [R[0][0]*v[0]+R[1][0]*v[1]+R[2][0]*v[2],R[0][1]*v[0]+R[1][1]*v[1]+R[2][1]*v[2],R[0][2]*v[0]+R[1][2]*v[1]+R[2][2]*v[2]];}
function cameraUnitFromAngles(az,el){const ce=Math.cos(el);return [Math.sin(az)*ce,-Math.sin(el),Math.cos(az)*ce];}
function worldDirectionFromCameraAngles(R_CW,az,el){return unit3(transposeMul3(R_CW,cameraUnitFromAngles(az,el)));}

export function methodLeadScale(methodId,t_s,{shotTime_s=0.8}={}){
  assertFiniteNumber(t_s,'t_s');assertFiniteNumber(shotTime_s,'shotTime_s');if(t_s<0||!(shotTime_s>0))throw new Error('invalid method-review time');
  const m=METHOD_REVIEW_CONFIG[methodId];if(!m)throw new Error(`unknown method review id: ${methodId}`);
  if(methodId==='MAINTAINED_LEAD')return Object.freeze({g:1,phase:'MAINTAIN_LEAD'});
  if(methodId==='PULL_AWAY'){
    const {initialLeadScale,connectionTime_s,separationStartTime_s}=m.parameters;
    if(t_s<connectionTime_s)return Object.freeze({g:lerp(initialLeadScale,0,smoothstep01(t_s/connectionTime_s)),phase:'ACQUIRE_TO_CONNECTION'});
    if(t_s<separationStartTime_s)return Object.freeze({g:0,phase:'MATCH_TARGET_SPEED'});
    if(t_s<shotTime_s)return Object.freeze({g:smoothstep01((t_s-separationStartTime_s)/(shotTime_s-separationStartTime_s)),phase:'SEPARATE_SMOOTHLY'});
    return Object.freeze({g:1,phase:'POST_SHOT_REFERENCE'});
  }
  const {initialLeadScale,crossTargetTime_s}=m.parameters;
  if(t_s<crossTargetTime_s)return Object.freeze({g:lerp(initialLeadScale,0,smoothstep01(t_s/crossTargetTime_s)),phase:'SWING_FROM_BEHIND'});
  if(t_s<shotTime_s)return Object.freeze({g:smoothstep01((t_s-crossTargetTime_s)/(shotTime_s-crossTargetTime_s)),phase:'PASS_THROUGH_TO_LEAD'});
  return Object.freeze({g:1,phase:'POST_SHOT_REFERENCE'});
}

export function createMethodComparisonScenario(){
  const scenario=createCanonicalFlatCrosserScenario();
  if(scenario.shotTime_s!==0.8)throw new Error('method-comparison v1 parameters are bound to canonical 0.8 s shot time');
  return scenario;
}

export function methodComparisonFrame(scenario,methodId,t_s){
  if(!scenario||scenario.status!=='ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION')throw new Error('canonical flat-crosser scenario required');
  const method=METHOD_REVIEW_CONFIG[methodId];if(!method)throw new Error(`unknown method review id: ${methodId}`);
  assertFiniteNumber(t_s,'t_s');const t=clamp(t_s,0,METHOD_REVIEW_DURATION_S);
  const base=simulateCanonicalFlatCrosser(scenario,t),shot=simulateCanonicalFlatCrosser(scenario,scenario.shotTime_s);
  if(base.certification.realisticClay||base.certification.instructionalMotion)throw new Error('method reviewer must remain provisional/non-instructional');
  const dAz=shot.gun.az_rad-shot.target.az_rad,dEl=shot.gun.el_rad-shot.target.el_rad;
  const {g,phase}=methodLeadScale(methodId,t,{shotTime_s:scenario.shotTime_s});
  const az=base.target.az_rad+g*dAz,el=base.target.el_rad+g*dEl;
  const bore_W=worldDirectionFromCameraAngles(scenario.R_CW,az,el);
  const muzzle_W=add3(SHOULDER_W,scale3(bore_W,BARREL_LENGTH_M));
  const foreHand_W=add3(SHOULDER_W,scale3(bore_W,0.67));
  const stockToe_W=add3(SHOULDER_W,scale3(bore_W,-0.34));
  return Object.freeze({
    status:METHOD_COMPARISON_STATUS,t_s:t,baseState:base,
    target:Object.freeze({position_W:[...base.target.position_W],velocity_W:[...base.target.velocity_W],orientationStatus:'TARGET_ORIENTATION_HOLD'}),
    gun:Object.freeze({bore_W,breech_W:[...SHOULDER_W],muzzle_W,foreHand_W,stockToe_W}),
    method:Object.freeze({id:method.id,name:method.name,sourceRegistryId:method.sourceRegistryId,evidenceClass:METHOD_EVIDENCE_CLASS,kinematicsStatus:METHOD_KINEMATICS_STATUS,phase,leadScale_g:g,interpretation:method.interpretation,parameters:method.parameters}),
    labels:Object.freeze({realisticClay:'HOLD_NOT_CERTIFIED',instructionalMotion:'NOT_AUTHORISED',methodKinematics:METHOD_KINEMATICS_STATUS,methodEvidenceClass:METHOD_EVIDENCE_CLASS}),
    events:base.activeNarrativeEvents
  });
}

export function methodComparisonFrameIndex(frameIndex){assertFiniteNumber(frameIndex,'frameIndex');if(!Number.isInteger(frameIndex))throw new Error('frameIndex must be integer');return clamp(frameIndex,0,Math.round(METHOD_REVIEW_DURATION_S*METHOD_REVIEW_FRAME_RATE_HZ))/METHOD_REVIEW_FRAME_RATE_HZ;}
