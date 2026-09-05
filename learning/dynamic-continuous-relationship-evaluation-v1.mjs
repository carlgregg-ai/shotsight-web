// ShotSight Virtual Shooter L3 — quasi-continuous shooter-visible relationship exploration.
// Diagnostic only: sampling is predeclared in tangent/normal coordinates and never uses
// oracle miss distance, range, intercept, pellet TOF, target seed or required lead.

import {createL1MultiFamilyBank,createL1ObservationHistory,trainL1FamilyPrototypeModel} from './multifamily-evaluation-v1.mjs';
import {fitL3ShooterVisibleStandPrior,buildL3MaintainedLeadLearnerFrames,L3_PRESENTATION_OBSERVATION_ENVELOPE_V1} from './maintained-lead-evaluation-v1.mjs';
import {runDynamicMaintainedLeadCoupling} from './dynamic-perceptual-coupling-v1.mjs';
import {calibrateL3DynamicCouplingExplorationTrigger,L3_DYNAMIC_COUPLING_ACTION_GRID_V1} from './dynamic-perceptual-coupling-evaluation-v1.mjs';
import {apparentAnglesToWorldUnit} from './naive-shooter-v1.mjs';
import {evaluateOracleShot,L0_DISC_PROXY_RADIUS_M,L0_SCORE_STATUS} from './oracle-evaluation-v1.mjs';
import {auditShooterBoundary,assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function halton(index,base){let f=1,r=0,i=index;while(i>0){f/=base;r+=f*(i%base);i=Math.floor(i/base);}return r;}

export function buildL3LowDiscrepancyRelationshipActions({count=128}={}){
  if(!Number.isInteger(count)||count<1)throw new Error('positive integer count required');
  const actions=[];
  for(let i=1;i<=count;i++){
    // Existing controller bounds only: forward [0,0.12], normal [-0.04,+0.04].
    // Halton bases 2 and 3 remove coarse grid quantisation without fitting to outcomes.
    actions.push(freezePlain({
      forwardRelationship_rad:0.12*halton(i,2),
      lineNormalRelationship_rad:-0.04+0.08*halton(i,3)
    }));
  }
  const out=freezePlain(actions);
  assertNoPrivilegedShooterData(out,{path:'continuousRelationship.actions'});
  return out;
}

function buildFrames({record,model,standPrior,seed}){
  const history=createL1ObservationHistory(record,{...L3_PRESENTATION_OBSERVATION_ENVELOPE_V1,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.9,seed});
  const frames=buildL3MaintainedLeadLearnerFrames(history,model,standPrior);
  if(frames.length<2)throw new Error('insufficient learner frames');
  return {history,frames};
}

function runEpisode({record,model,standPrior,action,seed,hypotheses}){
  const {history,frames}=buildFrames({record,model,standPrior,seed});
  const run=runDynamicMaintainedLeadCoupling({frames,...action,seed:seed+900000,hypotheses});
  auditShooterBoundary({observations:history,beliefs:[standPrior,...frames,run]});
  const score=run.trigger&&run.triggerState
    ?evaluateOracleShot({scenario:record.scenario,shotTime_s:run.trigger.t_s,bore_W:apparentAnglesToWorldUnit({az_rad:run.triggerState.az_rad,el_rad:run.triggerState.el_rad}),targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M})
    :freezePlain({status:L0_SCORE_STATUS,shotTime_s:null,missDistance_m:null,proxyHit:false,targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M});
  return {run,score};
}

function evaluateActionSet({actions,bank,model,standPrior,hypotheses,seedBase}){
  let attempts=0,triggers=0,hits=0,followThroughTriggers=0,rewardedActions=0;
  for(let a=0;a<actions.length;a++){
    let actionHits=0;
    for(let i=0;i<bank.length;i++){
      const episode=runEpisode({record:bank[i],model,standPrior,action:actions[a],seed:seedBase*17+i*101,hypotheses});
      attempts++;
      if(episode.run.trigger){
        triggers++;
        if(episode.run.followThrough?.continuedGunMotion)followThroughTriggers++;
      }
      if(episode.score.proxyHit){hits++;actionHits++;}
    }
    if(actionHits>0)rewardedActions++;
  }
  return freezePlain({attempts,triggers,hits,followThroughTriggers,rewardedActions});
}

export function runL3ContinuousRelationshipRewardSupport({
  nCrossers=8,
  bankSeedBase=361000,
  lowDiscrepancyActionCount=128,
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
  const quasiContinuousActions=buildL3LowDiscrepancyRelationshipActions({count:lowDiscrepancyActionCount});
  const quasiContinuous=evaluateActionSet({actions:quasiContinuousActions,bank,model,standPrior,hypotheses,seedBase:bankSeedBase});
  const coarseBaseline=evaluateActionSet({actions:L3_DYNAMIC_COUPLING_ACTION_GRID_V1,bank,model,standPrior,hypotheses,seedBase:bankSeedBase});
  const result=freezePlain({
    status:quasiContinuous.hits>0?'L3_CONTINUOUS_RELATIONSHIP_BINARY_REWARD_SUPPORT_DISCOVERED_V1':'L3_CONTINUOUS_RELATIONSHIP_NO_BINARY_REWARD_SUPPORT_V1',
    scoreStatus:L0_SCORE_STATUS,
    population:{partition:'FRESH_TRAINING_CALIBRATION_DIAGNOSTIC_NOT_SEALED_TEST',bankSeedBase,nCrossers:bank.length,sameHiddenBankAcrossActionSets:true,distinctFromProcessCalibration:true},
    sampling:{type:'DETERMINISTIC_HALTON_BASE2_BASE3',forwardBounds_rad:[0,0.12],lineNormalBounds_rad:[-0.04,0.04],count:quasiContinuousActions.length,definitionUsesOracleOutcome:false,definitionUsesMissDistance:false,definitionUsesRange:false,definitionUsesIntercept:false},
    quasiContinuous,
    coarseBaseline,
    processCalibration:{partition:processCalibration.partition,oracleScoring:processCalibration.oracleScoring,frozenRelationshipTolerance_rad:processCalibration.frozenRelationshipTolerance_rad},
    boundary:{controllerFeedback:'NONE_DURING_DIAGNOSTIC',oracleUsage:'POST_TRIGGER_SCORE_ONLY',missDistanceToController:false},
    antiCheat:'PASS_PREDECLARED_SHOOTER_VISIBLE_SAMPLING_ONLY; NO_ORACLE_OUTCOME_MISS_DISTANCE_RANGE_INTERCEPT_PELLET_TOF_OR_REQUIRED_LEAD_USED_TO_DEFINE_ACTIONS'
  });
  assertNoPrivilegedShooterData(result.sampling,{path:'continuousRelationship.sampling'});
  assertNoPrivilegedShooterData(result.boundary,{path:'continuousRelationship.boundary'});
  return result;
}
