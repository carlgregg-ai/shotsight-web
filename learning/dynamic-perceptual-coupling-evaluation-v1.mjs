// ShotSight Virtual Shooter L3 — referee-side evaluation for dynamic perceptual coupling.
// The same fresh training/calibration crosser bank is used for every learner-safe action.
// Oracle score is computed only after a trigger and never returned to the controller as a correction.

import {createL1MultiFamilyBank,createL1ObservationHistory,trainL1FamilyPrototypeModel} from './multifamily-evaluation-v1.mjs';
import {fitL3ShooterVisibleStandPrior,buildL3MaintainedLeadLearnerFrames,L3_PRESENTATION_OBSERVATION_ENVELOPE_V1} from './maintained-lead-evaluation-v1.mjs';
import {runDynamicMaintainedLeadCoupling} from './dynamic-perceptual-coupling-v1.mjs';
import {apparentAnglesToWorldUnit} from './naive-shooter-v1.mjs';
import {evaluateOracleShot,L0_DISC_PROXY_RADIUS_M,L0_SCORE_STATUS} from './oracle-evaluation-v1.mjs';
import {auditShooterBoundary,assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function mean(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}

export const L3_DYNAMIC_COUPLING_ACTION_GRID_V1=Object.freeze(
  [0,0.01,0.02,0.03,0.04,0.05,0.06,0.07,0.08,0.09,0.10].flatMap(forwardRelationship_rad=>
    [-0.02,-0.01,0,0.01,0.02].map(lineNormalRelationship_rad=>Object.freeze({forwardRelationship_rad,lineNormalRelationship_rad}))
  )
);

function runEpisode({record,model,standPrior,action,seed}){
  const history=createL1ObservationHistory(record,{...L3_PRESENTATION_OBSERVATION_ENVELOPE_V1,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.9,seed});
  const frames=buildL3MaintainedLeadLearnerFrames(history,model,standPrior);
  if(frames.length<2)throw new Error('insufficient dynamic-coupling learner frames');
  const run=runDynamicMaintainedLeadCoupling({frames,...action,seed:seed+900000});
  auditShooterBoundary({observations:history,beliefs:[standPrior,...frames,run]});
  const score=run.trigger&&run.triggerState
    ?evaluateOracleShot({scenario:record.scenario,shotTime_s:run.trigger.t_s,bore_W:apparentAnglesToWorldUnit({az_rad:run.triggerState.az_rad,el_rad:run.triggerState.el_rad}),targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M})
    :freezePlain({status:L0_SCORE_STATUS,shotTime_s:null,missDistance_m:null,proxyHit:false,targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M});
  return {run,score};
}

function episodeGateCoverage(run){
  const trace=run.couplingTrace??[];
  const any=k=>trace.some(x=>x[k]);
  const commit=trace.filter(x=>x.inCommitWindow);
  const minCommit=(key)=>commit.length?Math.min(...commit.map(x=>x[key]).filter(Number.isFinite)):null;
  return {
    inCommitWindow:any('inCommitWindow'),
    confidenceReady:any('confidenceReady'),
    lineReadable:any('lineReadable'),
    relationshipStable:any('relationshipStable'),
    speedMatched:any('speedMatched'),
    relationshipAndCommit:trace.some(x=>x.inCommitWindow&&x.relationshipStable),
    speedAndCommit:trace.some(x=>x.inCommitWindow&&x.speedMatched),
    allProcessExceptBreakWindow:trace.some(x=>x.inCommitWindow&&x.confidenceReady&&x.lineReadable&&x.relationshipStable&&x.speedMatched),
    minRelationshipErrorInCommit_rad:minCommit('relationshipError_rad'),
    minSpeedMatchErrorInCommit_radps:minCommit('speedMatchError_radps')
  };
}

export function runL3DynamicCouplingRewardSupport({nCrossers=10,bankSeedBase=331000,familyTrainNPerFamily=48,familyTrainSeedBase=41000,standCalibrationN=30,standCalibrationSeedBase=151000}={}){
  const model=trainL1FamilyPrototypeModel({nPerFamily:familyTrainNPerFamily,seedBase:familyTrainSeedBase});
  const standPrior=fitL3ShooterVisibleStandPrior({nCalibration:standCalibrationN,seedBase:standCalibrationSeedBase}).prior;
  const bank=createL1MultiFamilyBank({nPerFamily:nCrossers,seedBase:bankSeedBase}).filter(r=>r.family==='CROSSER');
  const actions=[];let totalTriggers=0,totalHits=0,followThroughTriggers=0;
  const gateTotals={inCommitWindow:0,confidenceReady:0,lineReadable:0,relationshipStable:0,speedMatched:0,relationshipAndCommit:0,speedAndCommit:0,allProcessExceptBreakWindow:0};
  const allCommitRelationshipErrors=[],allCommitSpeedErrors=[];
  for(let ai=0;ai<L3_DYNAMIC_COUPLING_ACTION_GRID_V1.length;ai++){
    const action=L3_DYNAMIC_COUPLING_ACTION_GRID_V1[ai],episodes=[];
    for(let i=0;i<bank.length;i++)episodes.push(runEpisode({record:bank[i],model,standPrior,action,seed:bankSeedBase*17+i*101}));
    const fired=episodes.filter(e=>e.run.trigger),hits=episodes.filter(e=>e.score.proxyHit),misses=fired.map(e=>e.score.missDistance_m).filter(Number.isFinite);
    const gates=episodes.map(e=>episodeGateCoverage(e.run));
    for(const g of gates){for(const k of Object.keys(gateTotals))if(g[k])gateTotals[k]++;if(Number.isFinite(g.minRelationshipErrorInCommit_rad))allCommitRelationshipErrors.push(g.minRelationshipErrorInCommit_rad);if(Number.isFinite(g.minSpeedMatchErrorInCommit_radps))allCommitSpeedErrors.push(g.minSpeedMatchErrorInCommit_radps);}
    totalTriggers+=fired.length;totalHits+=hits.length;followThroughTriggers+=fired.filter(e=>e.run.followThrough?.continuedGunMotion).length;
    actions.push(freezePlain({...action,attempts:episodes.length,triggers:fired.length,triggerRate:fired.length/episodes.length,hits:hits.length,hitRateAll:hits.length/episodes.length,minPostActionMissDistance_m:misses.length?Math.min(...misses):null,meanPostActionMissDistance_m:mean(misses),meanTriggerProgress:mean(fired.map(e=>e.run.trigger.currentProgress)),meanSpeedMatchErrorAtTrigger_radps:mean(fired.map(e=>e.run.trigger.speedMatchError_radps)),meanRelationshipErrorAtTrigger_rad:mean(fired.map(e=>e.run.trigger.relationshipError_rad)),followThroughContinued:fired.filter(e=>e.run.followThrough?.continuedGunMotion).length,processGateCoverage:{inCommitWindow:gates.filter(g=>g.inCommitWindow).length,relationshipStable:gates.filter(g=>g.relationshipStable).length,speedMatched:gates.filter(g=>g.speedMatched).length,relationshipAndCommit:gates.filter(g=>g.relationshipAndCommit).length,speedAndCommit:gates.filter(g=>g.speedAndCommit).length,allProcessExceptBreakWindow:gates.filter(g=>g.allProcessExceptBreakWindow).length,meanMinRelationshipErrorInCommit_rad:mean(gates.map(g=>g.minRelationshipErrorInCommit_rad).filter(Number.isFinite)),meanMinSpeedMatchErrorInCommit_radps:mean(gates.map(g=>g.minSpeedMatchErrorInCommit_radps).filter(Number.isFinite))}}));
  }
  const rewarded=actions.filter(a=>a.hits>0).sort((a,b)=>b.hitRateAll-a.hitRateAll||b.hits-a.hits);
  const closest=[...actions].filter(a=>Number.isFinite(a.minPostActionMissDistance_m)).sort((a,b)=>a.minPostActionMissDistance_m-b.minPostActionMissDistance_m)[0]??null;
  const attempts=bank.length*L3_DYNAMIC_COUPLING_ACTION_GRID_V1.length;
  const processGateDiagnosis=freezePlain({attempts,episodeCoverage:Object.fromEntries(Object.entries(gateTotals).map(([k,v])=>[k,{n:v,rate:v/attempts}])),meanMinimumCommitRelationshipError_rad:mean(allCommitRelationshipErrors),meanMinimumCommitSpeedMatchError_radps:mean(allCommitSpeedErrors),interpretation:'Shooter-visible process-gate coverage only. These diagnostics do not use oracle outcome or miss distance and may be used to diagnose whether the trigger rule is suppressing exploration.'});
  const publicBoundary={schema:'DYNAMIC_COUPLING_REWARD_SUPPORT_BOUNDARY_V1',bankSeedBase,nCrossers:bank.length,actions:L3_DYNAMIC_COUPLING_ACTION_GRID_V1,controllerInputs:['MULTIFAMILY_BELIEF_V1','PRESENTATION_LEVEL_SHOT_PLAN_V1','FINITE_GUN_PLANT_STATE_V1'],feedbackToController:'NONE_DURING_DIAGNOSTIC',oracleUsage:'POST_TRIGGER_SCORE_ONLY'};
  assertNoPrivilegedShooterData(publicBoundary,{path:'dynamicCoupling.publicBoundary'});assertNoPrivilegedShooterData(processGateDiagnosis,{path:'dynamicCoupling.processGateDiagnosis'});
  return freezePlain({status:rewarded.length?'L3_DYNAMIC_COUPLING_BINARY_REWARD_SUPPORT_DISCOVERED_V1':'L3_DYNAMIC_COUPLING_NO_BINARY_REWARD_SUPPORT_V1',scoreStatus:L0_SCORE_STATUS,population:{bankSeedBase,nCrossers:bank.length,partition:'FRESH_TRAINING_CALIBRATION_DIAGNOSTIC_NOT_SEALED_TEST',sameHiddenBankAcrossActions:true},actionSpace:{count:L3_DYNAMIC_COUPLING_ACTION_GRID_V1.length,evidenceClass:'PREDECLARED_BROAD_SHOOTER_VISIBLE_TANGENT_NORMAL_GRID_SHOTSIGHT_HYPOTHESIS'},overall:{attempts,triggers:totalTriggers,hits:totalHits,followThroughTriggers},processGateDiagnosis,rewardedActions:rewarded,researcherClosestAction:closest,actions,boundary:publicBoundary,antiCheat:'PASS_CONTROLLER_HAS_NO_ORACLE_OR_PHYSICS_IMPORT; REFEREE SCORES ONLY AFTER TRIGGER; MISS DISTANCE NOT PASSED TO CONTROLLER',interpretation:'This is a reward-support search over a broad learner-visible dynamic target-gun relationship, not a learned policy and not a ballistic lead lookup. Trigger-gate coverage is diagnosed separately from oracle outcomes so a sparse trigger rule is not mistaken for evidence against the coupling representation.'});
}
