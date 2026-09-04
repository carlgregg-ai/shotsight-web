// ShotSight reviewer adapter v1. Renderer-facing data only; physics remains in canonical P7 model.
import {add3,scale3,sub3,norm3,unit3,dot3,assertFiniteNumber} from './target-engine-v1.mjs';
import {createCanonicalFlatCrosserScenario,simulateCanonicalFlatCrosser} from './canonical-flat-crosser-v1.mjs';

export const REVIEWER_FRAME_RATE_HZ=60;
export const REVIEWER_DURATION_S=2;
export const REVIEWER_STATUS='PROVISIONAL_ENGINEERING_REVIEW_NOT_INSTRUCTIONAL';
export const VISUAL_RIG_STATUS='VISUAL_RIG_ONLY_NOT_METHOD_KINEMATICS';
export const TARGET_ORIENTATION_STATUS='TARGET_ORIENTATION_HOLD';

const SHOULDER_W=Object.freeze([0.18,-0.05,1.48]);
const PELVIS_W=Object.freeze([0,-0.15,0.96]);
const HEAD_W=Object.freeze([0.04,-0.01,1.72]);
const BARREL_LENGTH_M=1.25;

function clamp(v,lo,hi){return Math.min(hi,Math.max(lo,v));}
function near(a,b,tol=1e-10){return Math.abs(a-b)<=tol;}

export function createFlatCrosserReviewerScenario(){
  const scenario=createCanonicalFlatCrosserScenario();
  if(scenario.gunStrategy.id!=='ENGINEERING_INTERCEPT_REFERENCE'||scenario.gunStrategy.status!=='NOT_A_COACHING_METHOD')throw new Error('reviewer refuses non-engineering or mislabelled gun strategy');
  return scenario;
}

export function frameIndexForTime(t_s){assertFiniteNumber(t_s,'t_s');return Math.round(clamp(t_s,0,REVIEWER_DURATION_S)*REVIEWER_FRAME_RATE_HZ);}
export function timeForReviewerFrame(frameIndex){assertFiniteNumber(frameIndex,'frameIndex');if(!Number.isInteger(frameIndex))throw new Error('frameIndex must be integer');return clamp(frameIndex,0,Math.round(REVIEWER_DURATION_S*REVIEWER_FRAME_RATE_HZ))/REVIEWER_FRAME_RATE_HZ;}

export function reviewerFrameAtTime(scenario,t_s){
  assertFiniteNumber(t_s,'t_s');const t=clamp(t_s,0,REVIEWER_DURATION_S);const state=simulateCanonicalFlatCrosser(scenario,t);
  if(!state.masterClock?.allSubsystemsReadSameTime)throw new Error('shared-clock state required');
  if(state.certification.realisticClay||state.certification.instructionalMotion)throw new Error('reviewer v1 must remain provisional/non-instructional');
  if(state.gunStrategy.id!=='ENGINEERING_INTERCEPT_REFERENCE'||state.gunStrategy.status!=='NOT_A_COACHING_METHOD')throw new Error('active coaching method or strategy relabelling prohibited');
  const bore=unit3(state.gun.bore_W);
  const muzzle_W=add3(SHOULDER_W,scale3(bore,BARREL_LENGTH_M));
  const foreHand_W=add3(SHOULDER_W,scale3(bore,0.67));
  const stockToe_W=add3(SHOULDER_W,scale3(bore,-0.34));
  return Object.freeze({
    status:REVIEWER_STATUS,
    t_s:state.t_s,
    frameIndex:frameIndexForTime(state.t_s),
    state,
    target:Object.freeze({position_W:[...state.target.position_W],velocity_W:[...state.target.velocity_W],orientationStatus:TARGET_ORIENTATION_STATUS}),
    gun:Object.freeze({bore_W:[...bore],breech_W:[...SHOULDER_W],muzzle_W,stockToe_W,foreHand_W}),
    visualRig:Object.freeze({status:VISUAL_RIG_STATUS,pelvis_W:[...PELVIS_W],head_W:[...HEAD_W],shoulder_W:[...SHOULDER_W]}),
    labels:Object.freeze({realisticClay:'HOLD_NOT_CERTIFIED',instructionalMotion:'NOT_AUTHORISED',gunStrategy:'ENGINEERING_INTERCEPT_REFERENCE',coachingMethod:'NONE_ACTIVE',sourceMethodReference:state.method.id,methodKinematics:state.method.kinematicsStatus})
  });
}

export function reviewerFrame(scenario,frameIndex){return reviewerFrameAtTime(scenario,timeForReviewerFrame(frameIndex));}

export function reviewerHistory(scenario,t_s,{trail_s=0.45,sampleRate_hz=60}={}){
  assertFiniteNumber(t_s,'t_s');assertFiniteNumber(trail_s,'trail_s');assertFiniteNumber(sampleRate_hz,'sampleRate_hz');if(!(trail_s>=0&&sampleRate_hz>0))throw new Error('invalid history controls');
  const end=clamp(t_s,0,REVIEWER_DURATION_S),start=Math.max(0,end-trail_s),dt=1/sampleRate_hz,samples=[];
  for(let t=start;t<end-1e-12;t+=dt)samples.push(reviewerFrameAtTime(scenario,Math.min(t,end)));
  samples.push(reviewerFrameAtTime(scenario,end));
  return Object.freeze(samples);
}

export function validateReviewerFrame(frame){
  if(!frame||frame.status!==REVIEWER_STATUS)throw new Error('reviewer frame required');
  if(!near(frame.t_s,frame.state.t_s))throw new Error('renderer/model clock mismatch');
  const barrel=unit3(sub3(frame.gun.muzzle_W,frame.gun.breech_W));
  if(dot3(barrel,frame.gun.bore_W)<1-1e-12)throw new Error('rendered barrel direction diverges from model bore');
  if(frame.labels.coachingMethod!=='NONE_ACTIVE')throw new Error('coaching method must remain inactive');
  if(frame.visualRig.status!==VISUAL_RIG_STATUS)throw new Error('visual rig provenance lost');
  if(frame.target.orientationStatus!==TARGET_ORIENTATION_STATUS)throw new Error('target orientation HOLD lost');
  return true;
}

export function validateHistoryDirection(history){
  if(!Array.isArray(history)||history.length<2)throw new Error('history requires >=2 frames');
  for(let i=1;i<history.length;i++){
    if(history[i].t_s<history[i-1].t_s)throw new Error('history time reversal');
    const dx=sub3(history[i].target.position_W,history[i-1].target.position_W);
    if(dot3(dx,history[i].target.velocity_W)<-1e-12)throw new Error('target history contradicts target velocity');
  }
  return true;
}

export function reviewerQaFrames(scenario){
  const shot=reviewerFrameAtTime(scenario,scenario.shotTime_s);const arrival=reviewerFrameAtTime(scenario,shot.state.ballistic.pelletArrival_s);
  return Object.freeze({start:reviewerFrameAtTime(scenario,0),preShot:reviewerFrameAtTime(scenario,Math.max(0,scenario.shotTime_s-1/REVIEWER_FRAME_RATE_HZ)),shot,arrival,end:reviewerFrameAtTime(scenario,REVIEWER_DURATION_S)});
}
