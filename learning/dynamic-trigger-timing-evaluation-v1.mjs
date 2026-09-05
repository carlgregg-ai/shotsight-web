// Referee-side L3 trigger-timing reward-support diagnostic. Oracle is used only after trigger.
import {createL1MultiFamilyBank,createL1ObservationHistory,trainL1FamilyPrototypeModel} from './multifamily-evaluation-v1.mjs';
import {fitL3ShooterVisibleStandPrior,buildL3MaintainedLeadLearnerFrames,L3_PRESENTATION_OBSERVATION_ENVELOPE_V1} from './maintained-lead-evaluation-v1.mjs';
import {calibrateL3DynamicCouplingExplorationTrigger} from './dynamic-perceptual-coupling-evaluation-v1.mjs';
import {runDynamicMaintainedLeadWithTriggerTiming} from './dynamic-trigger-timing-v1.mjs';
import {apparentAnglesToWorldUnit} from './naive-shooter-v1.mjs';
import {evaluateOracleShot,L0_DISC_PROXY_RADIUS_M,L0_SCORE_STATUS} from './oracle-evaluation-v1.mjs';
import {auditShooterBoundary,assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function mean(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}

export const L3_TRIGGER_TIMING_OFFSETS_V1=Object.freeze([-0.12,-0.08,-0.04,0,0.04,0.08,0.12]);
export const L3_TRIGGER_TIMING_RELATIONSHIPS_V1=Object.freeze(
  [0,0.02,0.04,0.06,0.08,0.10].flatMap(forwardRelationship_rad=>[-0.01,0,0.01].map(lineNormalRelationship_rad=>Object.freeze({forwardRelationship_rad,lineNormalRelationship_rad})))
);
export const L3_TRIGGER_TIMING_ACTION_GRID_V1=Object.freeze(L3_TRIGGER_TIMING_RELATIONSHIPS_V1.flatMap(r=>L3_TRIGGER_TIMING_OFFSETS_V1.map(commitmentOffset_progress=>Object.freeze({...r,commitmentOffset_progress}))));

function buildFrames({record,model,standPrior,seed}){const history=createL1ObservationHistory(record,{...L3_PRESENTATION_OBSERVATION_ENVELOPE_V1,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.9,seed});const frames=buildL3MaintainedLeadLearnerFrames(history,model,standPrior);if(frames.length<2)throw new Error('insufficient learner frames');return {history,frames};}

export function runL3DynamicTriggerTimingRewardSupport({nCrossers=12,bankSeedBase=341000,processCalibrationCrossers=6,processCalibrationSeedBase=321000,familyTrainNPerFamily=48,familyTrainSeedBase=41000,standCalibrationN=30,standCalibrationSeedBase=151000}={}){
  if([processCalibrationSeedBase,familyTrainSeedBase,standCalibrationSeedBase].includes(bankSeedBase))throw new Error('reward bank must be distinct from calibration/training seeds');
  const model=trainL1FamilyPrototypeModel({nPerFamily:familyTrainNPerFamily,seedBase:familyTrainSeedBase});
  const standPrior=fitL3ShooterVisibleStandPrior({nCalibration:standCalibrationN,seedBase:standCalibrationSeedBase}).prior;
  const processCalibration=calibrateL3DynamicCouplingExplorationTrigger({model,standPrior,nCrossers:processCalibrationCrossers,bankSeedBase:processCalibrationSeedBase});
  const couplingHypotheses=processCalibration.hypotheses;
  const bank=createL1MultiFamilyBank({nPerFamily:nCrossers,seedBase:bankSeedBase}).filter(r=>r.family==='CROSSER');
  const actions=[];let triggers=0,hits=0,followThrough=0;
  for(const action of L3_TRIGGER_TIMING_ACTION_GRID_V1){
    const episodes=[];
    for(let i=0;i<bank.length;i++){
      const {history,frames}=buildFrames({record:bank[i],model,standPrior,seed:bankSeedBase*23+i*131});
      const run=runDynamicMaintainedLeadWithTriggerTiming({frames,...action,seed:bankSeedBase*29+i*137,couplingHypotheses});
      auditShooterBoundary({observations:history,beliefs:[standPrior,...frames,run]});
      const score=run.trigger&&run.triggerState?evaluateOracleShot({scenario:bank[i].scenario,shotTime_s:run.trigger.t_s,bore_W:apparentAnglesToWorldUnit({az_rad:run.triggerState.az_rad,el_rad:run.triggerState.el_rad}),targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M}):freezePlain({status:L0_SCORE_STATUS,shotTime_s:null,missDistance_m:null,proxyHit:false,targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M});
      episodes.push({run,score});
    }
    const fired=episodes.filter(e=>e.run.trigger),rewarded=episodes.filter(e=>e.score.proxyHit);triggers+=fired.length;hits+=rewarded.length;followThrough+=fired.filter(e=>e.run.followThrough?.continuedGunMotion).length;
    actions.push(freezePlain({...action,attempts:episodes.length,triggers:fired.length,hits:rewarded.length,hitRateAll:rewarded.length/episodes.length,meanTriggerProgress:mean(fired.map(e=>e.run.trigger.currentProgress)),minPostActionMissDistance_m:fired.length?Math.min(...fired.map(e=>e.score.missDistance_m).filter(Number.isFinite)):null}));
  }
  const rewardedActions=actions.filter(a=>a.hits>0).sort((a,b)=>b.hitRateAll-a.hitRateAll||b.hits-a.hits);
  const fixedTiming=actions.filter(a=>a.commitmentOffset_progress===0),timingVariants=actions.filter(a=>a.commitmentOffset_progress!==0);
  const fixedHits=fixedTiming.reduce((s,a)=>s+a.hits,0),variantHits=timingVariants.reduce((s,a)=>s+a.hits,0);
  const boundary=freezePlain({schema:'L3_DYNAMIC_TRIGGER_TIMING_BOUNDARY_V1',controllerInputs:['MULTIFAMILY_BELIEF_V1','PRESENTATION_LEVEL_SHOT_PLAN_V1','FINITE_GUN_PLANT_STATE_V1','SHOOTER_VISIBLE_PRESENTATION_PROGRESS'],feedbackDuringEpisode:'NONE',learnerFeedbackAfterEpisode:'BINARY_HIT_MISS_ONLY_FOR_LATER_LEARNING',oracleUsage:'POST_TRIGGER_SCORE_ONLY',forbidden:['RANGE','FUTURE_TRAJECTORY','INTERCEPT','PELLET_TOF','MISS_VECTOR','METRIC_LEAD']});
  assertNoPrivilegedShooterData(boundary,{path:'dynamicTriggerTiming.boundary'});
  return freezePlain({status:rewardedActions.length?'L3_TRIGGER_TIMING_BINARY_REWARD_SUPPORT_DISCOVERED_V1':'L3_TRIGGER_TIMING_NO_BINARY_REWARD_SUPPORT_V1',scoreStatus:L0_SCORE_STATUS,population:{partition:'FRESH_NON_SEALED_TRIGGER_TIMING_DIAGNOSTIC',bankSeedBase,nCrossers:bank.length,sameHiddenBankAcrossActions:true},actionSpace:{relationships:L3_TRIGGER_TIMING_RELATIONSHIPS_V1.length,timingOffsets:L3_TRIGGER_TIMING_OFFSETS_V1.length,total:L3_TRIGGER_TIMING_ACTION_GRID_V1.length,evidenceClass:'SHOTSIGHT_HYPOTHESIS_SHOOTER_VISIBLE_PROGRESS_ACTION'},processCalibration:{partition:processCalibration.partition,oracleScoring:processCalibration.oracleScoring,frozenRelationshipTolerance_rad:processCalibration.frozenRelationshipTolerance_rad},overall:{attempts:bank.length*L3_TRIGGER_TIMING_ACTION_GRID_V1.length,triggers,hits,followThroughTriggers:followThrough,fixedTimingHits:fixedHits,variantTimingHits:variantHits},rewardedActions,actions,boundary,antiCheat:'PASS_CONTROLLER_HAS_NO_ORACLE_OR_PHYSICS_IMPORT; TIMING IS NORMALISED SHOOTER_VISIBLE BREAK-WINDOW PROGRESS; ORACLE SCORES ONLY AFTER TRIGGER',interpretation:'This diagnostic asks whether choosing when to commit inside the already planned break region creates binary reward support. Positive hits establish support for later learning; they do not identify a universal human timing or lead.'});
}
