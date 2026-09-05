// ShotSight Virtual Shooter L3 — shooter-visible phase-dependent relationship trajectories.
// Diagnostic only. Trajectory parameters are predeclared in perceived target-line coordinates,
// indexed only by shooter-visible presentation progress, and never fitted from oracle outcomes.

import {createL1MultiFamilyBank,createL1ObservationHistory,trainL1FamilyPrototypeModel} from './multifamily-evaluation-v1.mjs';
import {fitL3ShooterVisibleStandPrior,buildL3MaintainedLeadLearnerFrames,L3_PRESENTATION_OBSERVATION_ENVELOPE_V1} from './maintained-lead-evaluation-v1.mjs';
import {runDynamicMaintainedLeadCoupling} from './dynamic-perceptual-coupling-v1.mjs';
import {calibrateL3DynamicCouplingExplorationTrigger} from './dynamic-perceptual-coupling-evaluation-v1.mjs';
import {buildL3LowDiscrepancyRelationshipActions} from './dynamic-continuous-relationship-evaluation-v1.mjs';
import {apparentAnglesToWorldUnit} from './naive-shooter-v1.mjs';
import {evaluateOracleShot,L0_DISC_PROXY_RADIUS_M,L0_SCORE_STATUS} from './oracle-evaluation-v1.mjs';
import {auditShooterBoundary,assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function halton(index,base){let f=1,r=0,i=index;while(i>0){f/=base;r+=f*(i%base);i=Math.floor(i/base);}return r;}

export function buildL3PhaseDependentRelationshipTrajectories({count=128}={}){
  if(!Number.isInteger(count)||count<1)throw new Error('positive integer count required');
  const trajectories=[];
  for(let i=1;i<=count;i++){
    // Maintained-lead topology is preserved qualitatively: establish a forward relationship
    // at connection and keep a forward relationship through the intended break region.
    // The modest start->break evolution is deliberately a SHOTSIGHT hypothesis, not a human law.
    const centreForward=0.01+0.10*halton(i,2);
    const forwardDelta=-0.02+0.04*halton(i,3);
    const centreNormal=-0.025+0.05*halton(i,5);
    const normalDelta=-0.015+0.03*halton(i,7);
    const trajectory=freezePlain({
      schema:'SHOOTER_VISIBLE_RELATIONSHIP_TRAJECTORY_V1',
      connectionForward_rad:clamp(centreForward-forwardDelta/2,0.002,0.118),
      breakForward_rad:clamp(centreForward+forwardDelta/2,0.002,0.118),
      connectionNormal_rad:clamp(centreNormal-normalDelta/2,-0.039,0.039),
      breakNormal_rad:clamp(centreNormal+normalDelta/2,-0.039,0.039),
      interpolation:'LINEAR_IN_SHOOTER_VISIBLE_PRESENTATION_PROGRESS',
      evidenceClass:'SHOTSIGHT_HYPOTHESIS_PROVISIONAL_METHOD_KINEMATICS'
    });
    assertNoPrivilegedShooterData(trajectory,{path:'phaseTrajectory.action'});
    trajectories.push(trajectory);
  }
  return freezePlain(trajectories);
}

function buildFrames({record,model,standPrior,seed}){
  const history=createL1ObservationHistory(record,{...L3_PRESENTATION_OBSERVATION_ENVELOPE_V1,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.9,seed});
  const frames=buildL3MaintainedLeadLearnerFrames(history,model,standPrior);
  if(frames.length<2)throw new Error('insufficient learner frames');
  return {history,frames};
}

function runEpisode({record,model,standPrior,relationshipTrajectory,constantAction,seed,hypotheses}){
  const {history,frames}=buildFrames({record,model,standPrior,seed});
  const run=runDynamicMaintainedLeadCoupling({frames,...(relationshipTrajectory?{relationshipTrajectory}:constantAction),seed:seed+900000,hypotheses});
  auditShooterBoundary({observations:history,beliefs:[standPrior,...frames,run]});
  const score=run.trigger&&run.triggerState
    ?evaluateOracleShot({scenario:record.scenario,shotTime_s:run.trigger.t_s,bore_W:apparentAnglesToWorldUnit({az_rad:run.triggerState.az_rad,el_rad:run.triggerState.el_rad}),targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M})
    :freezePlain({status:L0_SCORE_STATUS,shotTime_s:null,missDistance_m:null,proxyHit:false,targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M});
  return {run,score};
}

function evaluateSet({actions,mode,bank,model,standPrior,hypotheses,seedBase}){
  let attempts=0,triggers=0,hits=0,followThroughTriggers=0,rewardedActions=0;
  for(let a=0;a<actions.length;a++){
    let actionHits=0;
    for(let i=0;i<bank.length;i++){
      const args=mode==='TRAJECTORY'?{relationshipTrajectory:actions[a]}:{constantAction:actions[a]};
      const episode=runEpisode({record:bank[i],model,standPrior,...args,seed:seedBase*17+i*101,hypotheses});
      attempts++;
      if(episode.run.trigger){triggers++;if(episode.run.followThrough?.continuedGunMotion)followThroughTriggers++;}
      if(episode.score.proxyHit){hits++;actionHits++;}
    }
    if(actionHits>0)rewardedActions++;
  }
  return freezePlain({attempts,triggers,hits,followThroughTriggers,rewardedActions});
}

export function runL3PhaseDependentRelationshipRewardSupport({
  nCrossers=8,
  bankSeedBase=371000,
  trajectoryCount=128,
  constantActionCount=128,
  processCalibrationCrossers=6,
  processCalibrationSeedBase=321000,
  familyTrainNPerFamily=48,
  familyTrainSeedBase=41000,
  standCalibrationN=30,
  standCalibrationSeedBase=151000
}={}){
  if(bankSeedBase===processCalibrationSeedBase)throw new Error('reward and process calibration banks must differ');
  const model=trainL1FamilyPrototypeModel({nPerFamily:familyTrainNPerFamily,seedBase:familyTrainSeedBase});
  const standPrior=fitL3ShooterVisibleStandPrior({nCalibration:standCalibrationN,seedBase:standCalibrationSeedBase}).prior;
  const processCalibration=calibrateL3DynamicCouplingExplorationTrigger({model,standPrior,nCrossers:processCalibrationCrossers,bankSeedBase:processCalibrationSeedBase});
  const hypotheses=processCalibration.hypotheses;
  const bank=createL1MultiFamilyBank({nPerFamily:nCrossers,seedBase:bankSeedBase}).filter(r=>r.family==='CROSSER');
  const trajectories=buildL3PhaseDependentRelationshipTrajectories({count:trajectoryCount});
  const constants=buildL3LowDiscrepancyRelationshipActions({count:constantActionCount});
  const phaseDependent=evaluateSet({actions:trajectories,mode:'TRAJECTORY',bank,model,standPrior,hypotheses,seedBase:bankSeedBase});
  const constantBaseline=evaluateSet({actions:constants,mode:'CONSTANT',bank,model,standPrior,hypotheses,seedBase:bankSeedBase});
  const result=freezePlain({
    status:phaseDependent.hits>0?'L3_PHASE_DEPENDENT_RELATIONSHIP_BINARY_REWARD_SUPPORT_DISCOVERED_V1':'L3_PHASE_DEPENDENT_RELATIONSHIP_NO_BINARY_REWARD_SUPPORT_V1',
    scoreStatus:L0_SCORE_STATUS,
    population:{partition:'FRESH_TRAINING_CALIBRATION_DIAGNOSTIC_NOT_SEALED_TEST',bankSeedBase,nCrossers:bank.length,sameHiddenBankAcrossActionSets:true,distinctFromProcessCalibration:true},
    representation:{schema:'SHOOTER_VISIBLE_RELATIONSHIP_TRAJECTORY_V1',trajectoryCount:trajectories.length,interpolation:'LINEAR_IN_SHOOTER_VISIBLE_PRESENTATION_PROGRESS',definitionUsesOracleOutcome:false,definitionUsesMissDistance:false,definitionUsesRange:false,definitionUsesIntercept:false,definitionUsesPelletTof:false},
    phaseDependent,
    constantBaseline,
    processCalibration:{partition:processCalibration.partition,oracleScoring:processCalibration.oracleScoring,frozenRelationshipTolerance_rad:processCalibration.frozenRelationshipTolerance_rad},
    boundary:{controllerFeedback:'NONE_DURING_DIAGNOSTIC',oracleUsage:'POST_TRIGGER_SCORE_ONLY',missDistanceToController:false},
    antiCheat:'PASS_PREDECLARED_PHASE_TRAJECTORIES_USE_ONLY_SHOOTER_VISIBLE_PRESENTATION_PROGRESS_AND_TARGET_LINE_RELATIONSHIP; NO_ORACLE_OUTCOME_MISS_DISTANCE_RANGE_INTERCEPT_PELLET_TOF_REQUIRED_LEAD_OR_SEED_USED_TO_DEFINE_ACTIONS'
  });
  assertNoPrivilegedShooterData(result.representation,{path:'phaseTrajectory.representation'});
  assertNoPrivilegedShooterData(result.boundary,{path:'phaseTrajectory.boundary'});
  return result;
}
