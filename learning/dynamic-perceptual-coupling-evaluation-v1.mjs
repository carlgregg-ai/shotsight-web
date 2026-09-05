// ShotSight Virtual Shooter L3 — referee-side evaluation for dynamic perceptual coupling.
// Reward scoring is post-trigger only. Trigger feasibility is calibrated separately from
// shooter-visible process traces; no oracle outcome or miss geometry enters that calibration.

import {createL1MultiFamilyBank,createL1ObservationHistory,trainL1FamilyPrototypeModel} from './multifamily-evaluation-v1.mjs';
import {fitL3ShooterVisibleStandPrior,buildL3MaintainedLeadLearnerFrames,L3_PRESENTATION_OBSERVATION_ENVELOPE_V1} from './maintained-lead-evaluation-v1.mjs';
import {runDynamicMaintainedLeadCoupling,L3_DYNAMIC_COUPLING_HYPOTHESES_V1} from './dynamic-perceptual-coupling-v1.mjs';
import {apparentAnglesToWorldUnit} from './naive-shooter-v1.mjs';
import {evaluateOracleShot,L0_DISC_PROXY_RADIUS_M,L0_SCORE_STATUS} from './oracle-evaluation-v1.mjs';
import {auditShooterBoundary,assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';

function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}
function mean(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}
function quantile(xs,q){const a=[...xs].filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const p=(a.length-1)*q,lo=Math.floor(p),hi=Math.ceil(p);return a[lo]+(a[hi]-a[lo])*(p-lo);}
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));

export const L3_DYNAMIC_COUPLING_ACTION_GRID_V1=Object.freeze(
  [0,0.01,0.02,0.03,0.04,0.05,0.06,0.07,0.08,0.09,0.10].flatMap(forwardRelationship_rad=>
    [-0.02,-0.01,0,0.01,0.02].map(lineNormalRelationship_rad=>Object.freeze({forwardRelationship_rad,lineNormalRelationship_rad}))
  )
);

function buildFrames({record,model,standPrior,seed}){
  const history=createL1ObservationHistory(record,{...L3_PRESENTATION_OBSERVATION_ENVELOPE_V1,angleNoiseSd_rad:0.0015,rateNoiseSd_radps:0.02,acquisitionQuality:0.9,seed});
  const frames=buildL3MaintainedLeadLearnerFrames(history,model,standPrior);
  if(frames.length<2)throw new Error('insufficient dynamic-coupling learner frames');
  return {history,frames};
}

function runProcessOnly({record,model,standPrior,action,seed,hypotheses=L3_DYNAMIC_COUPLING_HYPOTHESES_V1}){
  const {history,frames}=buildFrames({record,model,standPrior,seed});
  const run=runDynamicMaintainedLeadCoupling({frames,...action,seed:seed+900000,hypotheses});
  auditShooterBoundary({observations:history,beliefs:[standPrior,...frames,run]});
  return run;
}

function runScoredEpisode({record,model,standPrior,action,seed,hypotheses}){
  const run=runProcessOnly({record,model,standPrior,action,seed,hypotheses});
  const score=run.trigger&&run.triggerState
    ?evaluateOracleShot({scenario:record.scenario,shotTime_s:run.trigger.t_s,bore_W:apparentAnglesToWorldUnit({az_rad:run.triggerState.az_rad,el_rad:run.triggerState.el_rad}),targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M})
    :freezePlain({status:L0_SCORE_STATUS,shotTime_s:null,missDistance_m:null,proxyHit:false,targetProxyRadius_m:L0_DISC_PROXY_RADIUS_M});
  return {run,score};
}

function episodeGateCoverage(run){
  const trace=run.couplingTrace??[],any=k=>trace.some(x=>x[k]),commit=trace.filter(x=>x.inCommitWindow);
  const minCommit=key=>commit.length?Math.min(...commit.map(x=>x[key]).filter(Number.isFinite)):null;
  return {inCommitWindow:any('inCommitWindow'),confidenceReady:any('confidenceReady'),lineReadable:any('lineReadable'),relationshipStable:any('relationshipStable'),speedMatched:any('speedMatched'),relationshipAndCommit:trace.some(x=>x.inCommitWindow&&x.relationshipStable),speedAndCommit:trace.some(x=>x.inCommitWindow&&x.speedMatched),allProcessExceptBreakWindow:trace.some(x=>x.inCommitWindow&&x.confidenceReady&&x.lineReadable&&x.relationshipStable&&x.speedMatched),minRelationshipErrorInCommit_rad:minCommit('relationshipError_rad'),minSpeedMatchErrorInCommit_radps:minCommit('speedMatchError_radps')};
}

export function calibrateL3DynamicCouplingExplorationTrigger({model,standPrior,nCrossers=6,bankSeedBase=321000,quantileLevel=0.65}={}){
  if(!model||!standPrior)throw new Error('frozen perception model and stand prior required');
  const bank=createL1MultiFamilyBank({nPerFamily:nCrossers,seedBase:bankSeedBase}).filter(r=>r.family==='CROSSER');
  const relationshipErrors=[];let processRuns=0,commitRuns=0,speedMatchedCommitRuns=0;
  // No oracle score is computed here. We measure how tightly the finite plant can form the
  // requested live relationship during the intended break region, then freeze a feasible
  // exploration threshold before the reward bank is touched.
  for(const action of L3_DYNAMIC_COUPLING_ACTION_GRID_V1){for(let i=0;i<bank.length;i++){
    const run=runProcessOnly({record:bank[i],model,standPrior,action,seed:bankSeedBase*19+i*101});processRuns++;
    const commit=(run.couplingTrace??[]).filter(x=>x.inCommitWindow&&x.confidenceReady&&x.lineReadable);
    if(!commit.length)continue;commitRuns++;
    const speedMatched=commit.filter(x=>x.speedMatched);
    if(!speedMatched.length)continue;speedMatchedCommitRuns++;
    relationshipErrors.push(Math.min(...speedMatched.map(x=>x.relationshipError_rad)));
  }}
  const raw=quantile(relationshipErrors,quantileLevel);
  if(!Number.isFinite(raw))throw new Error('insufficient process-only support to calibrate exploration trigger');
  const relationshipTolerance_rad=clamp(raw,0.05,0.12);
  const hypotheses=freezePlain({...L3_DYNAMIC_COUPLING_HYPOTHESES_V1,relationshipTolerance_rad,evidenceClass:'SHOTSIGHT_HYPOTHESIS_PROCESS_CALIBRATED_EXPLORATION_TRIGGER_NO_ORACLE_OUTCOME'});
  const result=freezePlain({schema:'L3_DYNAMIC_COUPLING_PROCESS_CALIBRATION_V1',partition:'PROCESS_ONLY_NON_SEALED_CALIBRATION',bankSeedBase,nCrossers:bank.length,actionCount:L3_DYNAMIC_COUPLING_ACTION_GRID_V1.length,processRuns,commitRuns,speedMatchedCommitRuns,quantileLevel,rawRelationshipTolerance_rad:raw,frozenRelationshipTolerance_rad:relationshipTolerance_rad,baseRelationshipTolerance_rad:L3_DYNAMIC_COUPLING_HYPOTHESES_V1.relationshipTolerance_rad,hypotheses,oracleScoring:'NONE',interpretation:'Exploration firing feasibility calibrated only from delayed/noisy perception plus finite-plant coupling traces. It is not a human constant and is not fitted to hit rate or miss distance.'});
  assertNoPrivilegedShooterData(result,{path:'dynamicCoupling.processCalibration'});return result;
}

export function runL3DynamicCouplingRewardSupport({nCrossers=10,bankSeedBase=331000,processCalibrationCrossers=6,processCalibrationSeedBase=321000,familyTrainNPerFamily=48,familyTrainSeedBase=41000,standCalibrationN=30,standCalibrationSeedBase=151000}={}){
  if(bankSeedBase===processCalibrationSeedBase)throw new Error('process calibration and reward diagnostic banks must be distinct');
  const model=trainL1FamilyPrototypeModel({nPerFamily:familyTrainNPerFamily,seedBase:familyTrainSeedBase});
  const standPrior=fitL3ShooterVisibleStandPrior({nCalibration:standCalibrationN,seedBase:standCalibrationSeedBase}).prior;
  const processCalibration=calibrateL3DynamicCouplingExplorationTrigger({model,standPrior,nCrossers:processCalibrationCrossers,bankSeedBase:processCalibrationSeedBase});
  const hypotheses=processCalibration.hypotheses;
  const bank=createL1MultiFamilyBank({nPerFamily:nCrossers,seedBase:bankSeedBase}).filter(r=>r.family==='CROSSER');
  const actions=[];let totalTriggers=0,totalHits=0,followThroughTriggers=0;
  const gateTotals={inCommitWindow:0,confidenceReady:0,lineReadable:0,relationshipStable:0,speedMatched:0,relationshipAndCommit:0,speedAndCommit:0,allProcessExceptBreakWindow:0};
  const allCommitRelationshipErrors=[],allCommitSpeedErrors=[];
  for(const action of L3_DYNAMIC_COUPLING_ACTION_GRID_V1){
    const episodes=[];for(let i=0;i<bank.length;i++)episodes.push(runScoredEpisode({record:bank[i],model,standPrior,action,seed:bankSeedBase*17+i*101,hypotheses}));
    const fired=episodes.filter(e=>e.run.trigger),hits=episodes.filter(e=>e.score.proxyHit),misses=fired.map(e=>e.score.missDistance_m).filter(Number.isFinite),gates=episodes.map(e=>episodeGateCoverage(e.run));
    for(const g of gates){for(const k of Object.keys(gateTotals))if(g[k])gateTotals[k]++;if(Number.isFinite(g.minRelationshipErrorInCommit_rad))allCommitRelationshipErrors.push(g.minRelationshipErrorInCommit_rad);if(Number.isFinite(g.minSpeedMatchErrorInCommit_radps))allCommitSpeedErrors.push(g.minSpeedMatchErrorInCommit_radps);}
    totalTriggers+=fired.length;totalHits+=hits.length;followThroughTriggers+=fired.filter(e=>e.run.followThrough?.continuedGunMotion).length;
    actions.push(freezePlain({...action,attempts:episodes.length,triggers:fired.length,triggerRate:fired.length/episodes.length,hits:hits.length,hitRateAll:hits.length/episodes.length,minPostActionMissDistance_m:misses.length?Math.min(...misses):null,meanPostActionMissDistance_m:mean(misses),meanTriggerProgress:mean(fired.map(e=>e.run.trigger.currentProgress)),meanSpeedMatchErrorAtTrigger_radps:mean(fired.map(e=>e.run.trigger.speedMatchError_radps)),meanRelationshipErrorAtTrigger_rad:mean(fired.map(e=>e.run.trigger.relationshipError_rad)),followThroughContinued:fired.filter(e=>e.run.followThrough?.continuedGunMotion).length,processGateCoverage:{inCommitWindow:gates.filter(g=>g.inCommitWindow).length,relationshipStable:gates.filter(g=>g.relationshipStable).length,speedMatched:gates.filter(g=>g.speedMatched).length,relationshipAndCommit:gates.filter(g=>g.relationshipAndCommit).length,speedAndCommit:gates.filter(g=>g.speedAndCommit).length,allProcessExceptBreakWindow:gates.filter(g=>g.allProcessExceptBreakWindow).length,meanMinRelationshipErrorInCommit_rad:mean(gates.map(g=>g.minRelationshipErrorInCommit_rad).filter(Number.isFinite)),meanMinSpeedMatchErrorInCommit_radps:mean(gates.map(g=>g.minSpeedMatchErrorInCommit_radps).filter(Number.isFinite))}}));
  }
  const rewarded=actions.filter(a=>a.hits>0).sort((a,b)=>b.hitRateAll-a.hitRateAll||b.hits-a.hits),closest=[...actions].filter(a=>Number.isFinite(a.minPostActionMissDistance_m)).sort((a,b)=>a.minPostActionMissDistance_m-b.minPostActionMissDistance_m)[0]??null,attempts=bank.length*L3_DYNAMIC_COUPLING_ACTION_GRID_V1.length;
  const processGateDiagnosis=freezePlain({attempts,episodeCoverage:Object.fromEntries(Object.entries(gateTotals).map(([k,v])=>[k,{n:v,rate:v/attempts}])),meanMinimumCommitRelationshipError_rad:mean(allCommitRelationshipErrors),meanMinimumCommitSpeedMatchError_radps:mean(allCommitSpeedErrors),interpretation:'Shooter-visible process-gate coverage only; no oracle outcome or miss distance used to calibrate the firing threshold.'});
  const publicBoundary={schema:'DYNAMIC_COUPLING_REWARD_SUPPORT_BOUNDARY_V1',processCalibrationSeedBase,bankSeedBase,nCrossers:bank.length,actions:L3_DYNAMIC_COUPLING_ACTION_GRID_V1,controllerInputs:['MULTIFAMILY_BELIEF_V1','PRESENTATION_LEVEL_SHOT_PLAN_V1','FINITE_GUN_PLANT_STATE_V1'],feedbackToController:'NONE_DURING_DIAGNOSTIC',oracleUsage:'POST_TRIGGER_SCORE_ONLY'};
  assertNoPrivilegedShooterData(publicBoundary,{path:'dynamicCoupling.publicBoundary'});assertNoPrivilegedShooterData(processGateDiagnosis,{path:'dynamicCoupling.processGateDiagnosis'});
  return freezePlain({status:rewarded.length?'L3_DYNAMIC_COUPLING_BINARY_REWARD_SUPPORT_DISCOVERED_V1':'L3_DYNAMIC_COUPLING_NO_BINARY_REWARD_SUPPORT_V1',scoreStatus:L0_SCORE_STATUS,processCalibration,population:{bankSeedBase,nCrossers:bank.length,partition:'FRESH_TRAINING_CALIBRATION_DIAGNOSTIC_NOT_SEALED_TEST',sameHiddenBankAcrossActions:true,distinctFromProcessCalibration:true},actionSpace:{count:L3_DYNAMIC_COUPLING_ACTION_GRID_V1.length,evidenceClass:'PREDECLARED_BROAD_SHOOTER_VISIBLE_TANGENT_NORMAL_GRID_SHOTSIGHT_HYPOTHESIS'},overall:{attempts,triggers:totalTriggers,hits:totalHits,followThroughTriggers},processGateDiagnosis,rewardedActions:rewarded,researcherClosestAction:closest,actions,boundary:publicBoundary,antiCheat:'PASS_PROCESS_CALIBRATION_HAS_NO_ORACLE_SCORE; CONTROLLER_HAS_NO_ORACLE_OR_PHYSICS_IMPORT; REWARD REFEREE SCORES ONLY AFTER TRIGGER; MISS DISTANCE NOT PASSED TO CONTROLLER',interpretation:'Reward-support search uses a firing-feasibility threshold frozen from a distinct shooter-visible process-only bank. Any positive reward establishes support for later binary learning, not a universal lead or human timing rule.'});
}
