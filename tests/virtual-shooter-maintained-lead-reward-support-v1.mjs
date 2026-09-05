import assert from 'node:assert/strict';
import {runL3MaintainedLeadHitMissLearningExperiment} from '../learning/maintained-lead-learning-evaluation-v1.mjs';

const result=runL3MaintainedLeadHitMissLearningExperiment({trainCrossers:242,heldoutCrossers:24});
assert.equal(result.antiCheat.startsWith('PASS_'),true);
assert.equal(result.scoreStatus,'ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY');

const rows=Object.entries(result.refereeTrainingDiagnostics.byAction).map(([action,d])=>({action_rad:Number(action),...d}));
const fired=rows.filter(r=>r.triggers>0);
assert(fired.length>0,'diagnosis requires at least one fired action');

const minMiss=Math.min(...fired.map(r=>r.minPostActionMissDistance_m).filter(Number.isFinite));
const best=fired.filter(r=>Number.isFinite(r.minPostActionMissDistance_m)).sort((a,b)=>a.minPostActionMissDistance_m-b.minPostActionMissDistance_m)[0];
const maxTriggerRate=Math.max(...rows.map(r=>r.triggerRate));
const maxAchieved=Math.max(...fired.map(r=>r.meanAchievedSeparation_rad).filter(Number.isFinite));
const requestedMax=Math.max(...rows.map(r=>r.action_rad));
const motorSupportRatio=requestedMax>0?maxAchieved/requestedMax:null;
const triggerProgressMean=fired.reduce((s,r)=>s+(Number.isFinite(r.meanTriggerProgress)?r.meanTriggerProgress:0),0)/fired.length;

const diagnosis={
  suite:'ShotSight L3 maintained-lead reward-support diagnosis v1',
  status:'PASS_DIAGNOSTIC_ONLY',
  learnerStatus:result.status,
  training:result.training.overall,
  actionRows:rows,
  summary:{
    bestObservedAction_rad:best?.action_rad??null,
    minPostActionMissDistance_m:Number.isFinite(minMiss)?minMiss:null,
    proxyRadius_m:0.055,
    rewardSupportObserved:Number.isFinite(minMiss)&&minMiss<=0.055,
    maxTriggerRate,
    requestedMaxSeparation_rad:requestedMax,
    maxMeanAchievedSeparation_rad:Number.isFinite(maxAchieved)?maxAchieved:null,
    motorSupportRatio,
    meanTriggerProgressAcrossFiringActions:triggerProgressMean
  },
  boundary:result.refereeTrainingDiagnostics.boundary,
  interpretation:'Researcher-only post-action diagnosis. No miss distance, oracle state, intercept, range, pellet TOF or corrective vector is transferred into learner memory or action selection.'
};

console.log(JSON.stringify(diagnosis,null,2));
