import assert from 'node:assert/strict';
import {buildEllisHumanVisualEvidence} from '../learning/human-visual-acquisition-v1.mjs';
import {createGunPlantState} from '../learning/gun-plant-v1.mjs';
import {createPullAwayPolicyStateV1,auditPullAwayHumanVisionPolicyInputV1,PULL_AWAY_HUMAN_VISION_HYPOTHESES_V1} from '../learning/pull-away-human-vision-policy-v1.mjs';
import {createAcquisitionExperienceV1} from '../learning/ellis-experience-v1.mjs';

function obs(t,{az=0,el=0,rate=.55,elRate=0,q=.95,visible=true}={}){
  return Object.freeze({schema:'SHOOTER_OBSERVATION_V1',observationTime_s:t,latency_s:.08,visible,az_rad:visible?az:null,el_rad:visible?el:null,apparentAzRate_radps:visible?rate:null,apparentElRate_radps:visible?elRate:null,acquisitionQuality:visible?q:0,targetFamilyBelief:{CROSSER:.72,QUARTERER:.12,LOOPER:.08,OTHER:.08},motionPhaseBelief:{STABLE:.8,CHANGING:.2},context:{expectedDirection:'RIGHT',trapRegionKnown:true}});
}

// Raw upstream observation is explicitly forbidden at the pull-away policy boundary.
assert.throws(()=>auditPullAwayHumanVisionPolicyInputV1(obs(.1,{az:.05})),/RAW_OBSERVATION_BYPASS_FORBIDDEN/);

// Early target evidence is a streak/region. The policy must hold current gun state and must
// not create a target-point command from unresolved az/el information.
const earlyHistory=[obs(0,{az:0}),obs(.03,{az:.0165})];
const early=buildEllisHumanVisualEvidence(earlyHistory,{contrast:.95,clutter:.05,attention:1});
assert.equal(early.phase,'FLASH_STREAK');
assert.equal(early.resolved,null);
const earlyGun=createGunPlantState({t_s:.03,az_rad:-.02,el_rad:.01});
const waiting=createPullAwayPolicyStateV1({visualEvidence:early,gunState:earlyGun});
assert.equal(waiting.phase,'WAIT_FOR_ACQUISITION');
assert.equal(waiting.trigger,false);
assert.equal(waiting.command.desiredAz_rad,earlyGun.az_rad);
assert.equal(waiting.command.desiredEl_rad,earlyGun.el_rad);
assert.equal(auditPullAwayHumanVisionPolicyInputV1(early).status,'PASS');

// After enough good visual evidence the target becomes resolved-but-uncertain. Put the gun
// at the learner-visible target state with matching perceived angular speed: pull-away is then
// allowed to transition from connection/speed match into deliberate separation.
const history=[];for(let i=0;i<=14;i++)history.push(obs(i*.02,{az:i*.011,rate:.55,q:.98}));
const tracked=buildEllisHumanVisualEvidence(history,{contrast:1,clutter:0,attention:1,minimumTrackingQuality:.45});
assert.equal(tracked.phase,'TRACKING');assert.ok(tracked.resolved);
const r=tracked.resolved;
const connectedGun=createGunPlantState({t_s:r.observationTime_s,az_rad:r.az_rad,el_rad:r.el_rad,azRate_radps:r.apparentAzRate_radps,elRate_radps:r.apparentElRate_radps});
const separating=createPullAwayPolicyStateV1({visualEvidence:tracked,gunState:connectedGun,separationTarget_rad:.035});
assert.equal(separating.phase,'DEVELOP_SEPARATION');
assert.equal(separating.trigger,false);
assert.ok(separating.command.desiredAz_rad>r.az_rad,'right-going pull-away must command a forward visual relationship after connection');

// A sufficiently developed learner-visible forward picture can become trigger-ready without
// any oracle intercept, range, pellet TOF, required lead or miss vector entering the policy.
const ahead=.035*PULL_AWAY_HUMAN_VISION_HYPOTHESES_V1.triggerSeparationFraction+.001;
const triggerGun=createGunPlantState({t_s:r.observationTime_s,az_rad:r.az_rad+ahead,el_rad:r.el_rad,azRate_radps:r.apparentAzRate_radps,elRate_radps:r.apparentElRate_radps});
const ready=createPullAwayPolicyStateV1({visualEvidence:tracked,gunState:triggerGun,separationTarget_rad:.035});
assert.equal(ready.phase,'TRIGGER_READY');assert.equal(ready.trigger,true);

// Human acquisition conditions become durable Ellis apprenticeship data for future Chiron work.
const acquisition=createAcquisitionExperienceV1({phase:tracked.phase,acquisitionScore:tracked.acquisitionScore,observationSpan_s:tracked.uncertainty.observationSpan_s,contrast:tracked.uncertainty.contrast,clutter:tracked.uncertainty.clutter,occluded:false,waitedForMoreEvidence:true,reacquisitionOccurred:false,streakVsResolved:'RESOLVED'});
assert.equal(acquisition.schema,'ELLIS_ACQUISITION_EXPERIENCE_V1');assert.ok(Object.isFrozen(acquisition));
assert.throws(()=>createAcquisitionExperienceV1({phase:'ACQUIRING',acquisitionScore:.4,observationSpan_s:.08,contrast:.8,clutter:.2,streakVsResolved:'RESOLVED'}),/unresolved phase/);

// Direct privileged aliases still fail recursively if smuggled into the visual object.
const leaked={...tracked,provenance:{...tracked.provenance,trueRange_m:35}};
assert.throws(()=>createPullAwayPolicyStateV1({visualEvidence:leaked,gunState:connectedGun}),/PRIVILEGED_STATE_LEAK/);

console.log(JSON.stringify({status:'PASS',schema:'PULL_AWAY_HUMAN_VISION_POLICY_GATE_V1',rawObservationAccepted:false,earlyPreciseAim:false,trackedPolicyPhase:separating.phase,triggerPolicyPhase:ready.phase,acquisitionExperience:true,antiCheat:'PASS'},null,2));
