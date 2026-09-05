// ShotSight Virtual Shooter L2 — whole-presentation shot planning.
// Learner-side only: consumes belief + SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1.
// It never imports physics/oracle state and never calculates ballistic lead/intercept.

import {assertNoPrivilegedShooterData} from './virtual-shooter-boundary-v1.mjs';
import {L2_SOURCE_PRIORS} from './shot-plan-v1.mjs';

const METHODS=Object.freeze(['SWING_THROUGH','PULL_AWAY','MAINTAINED_LEAD']);
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function freezePlain(v){if(Array.isArray(v))return Object.freeze(v.map(freezePlain));if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=freezePlain(x);return Object.freeze(o);}return v;}

function validate(belief,context){
  if(!belief||belief.schema!=='MULTIFAMILY_BELIEF_V1')throw new Error('MULTIFAMILY_BELIEF_V1 required');
  if(!context||context.schema!=='SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1')throw new Error('SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1 required');
  assertNoPrivilegedShooterData({belief,context},{path:'presentationShotPlan.input'});
}

export function buildPresentationLevelShotPlan(belief,context,{method='PULL_AWAY',priorMode='SOURCE_PRIOR'}={}){
  validate(belief,context);if(!METHODS.includes(method))throw new Error(`unsupported method ${method}`);
  const current=clamp(context.elapsedPresentationProgress,0,0.99),breakStart=context.breakWindow.start,breakEnd=context.breakWindow.end;
  let hold,connection,intendedBreak,evidenceClass;
  if(priorMode==='SOURCE_PRIOR'){
    const p=L2_SOURCE_PRIORS.methodProgressPriors[method];hold=p.hold;connection=p.connection;intendedBreak=p.break;evidenceClass='COACHING_PRIOR_PLUS_SHOTSIGHT_HYPOTHESIS';
  }else if(priorMode==='BLANK_SLATE'){
    hold=0.25;connection=0.50;intendedBreak=0.75;evidenceClass='BLANK_SLATE_CONTROL';
  }else throw new Error(`unsupported priorMode ${priorMode}`);

  // Whole-presentation semantics: hold is a pre-call spatial plan and does not chase the live target.
  // Intended break remains anchored to the chosen plan/break window. Uncertainty does NOT simply
  // push it later. The execution connection may be forced later only because visible progress has
  // already consumed the planned runway; that loss is explicitly reported.
  intendedBreak=clamp(intendedBreak,breakStart,breakEnd);
  const plannedConnection=clamp(connection,hold+0.08,intendedBreak-0.08);
  const connectionAlreadyPassed=current>=plannedConnection;
  const effectiveConnection=connectionAlreadyPassed?clamp(current+0.015,plannedConnection,intendedBreak-0.035):plannedConnection;
  const breakWindowMissed=current>=breakEnd;
  const remainingPreBreakRunway=Math.max(0,intendedBreak-current);
  const connectionRunwayRemaining=Math.max(0,effectiveConnection-current);
  const family=Object.entries(belief.familyProb).sort((a,b)=>b[1]-a[1])[0]?.[0]??'UNKNOWN';
  const lowConfidence=(belief.confidence??0)<0.30;
  const runwayState=breakWindowMissed?'MISSED_BREAK_WINDOW':remainingPreBreakRunway<0.08?'CRITICAL':remainingPreBreakRunway<0.18?'COMPRESSED':'AVAILABLE';

  const plan=freezePlain({
    schema:'PRESENTATION_LEVEL_SHOT_PLAN_V1',method,priorMode,evidenceClass,
    targetBeliefSummary:{mostLikelyFamily:family,confidence:belief.confidence,familyProb:belief.familyProb,motionPhaseProb:belief.motionPhaseProb},
    presentationProgress:{current,plannedPickup:context.pickupProgressPrior,gunHold:hold,plannedConnection,intendedBreak,breakWindow:context.breakWindow},
    executionAdaptation:{effectiveConnection,connectionAlreadyPassed,breakWindowMissed,remainingPreBreakRunway,connectionRunwayRemaining,runwayState,lowConfidence,informationNeed:lowConfidence&&runwayState==='AVAILABLE'?'CONSIDER_MORE_OBSERVATION':'COMMIT_OR_REPLAN_WITH_CURRENT_INFORMATION'},
    methodTopology:{
      SWING_THROUGH:method==='SWING_THROUGH'?'BEGIN_BEHIND_PASS_THROUGH_THEN_FORWARD_RELATIONSHIP':null,
      PULL_AWAY:method==='PULL_AWAY'?'CONNECT_OR_SPEED_MATCH_THEN_SEPARATE':null,
      MAINTAINED_LEAD:method==='MAINTAINED_LEAD'?'ESTABLISH_FORWARD_RELATIONSHIP_EARLY_AND_PRESERVE':null
    },
    runtimeInputs:['MULTIFAMILY_BELIEF_V1','SHOOTER_VISIBLE_PRESENTATION_CONTEXT_V1'],
    evidenceBoundary:'HOLD_CONNECTION_BREAK PROGRESS ARE WHOLE-PRESENTATION PRIORS; CURRENT PROGRESS COMES ONLY FROM OBSERVED ANGULAR TRAVEL; NO BALLISTIC ANSWER',
    forbiddenInterpretation:'NO EXACT RANGE, METRIC LEAD, PELLET TOF, ORACLE FUTURE OR INTERCEPT IS REPRESENTED'
  });
  assertNoPrivilegedShooterData(plan,{path:'presentationShotPlan'});return plan;
}
