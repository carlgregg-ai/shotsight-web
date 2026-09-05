import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dynamicTargetLineBasis,buildDynamicCouplingCommand,assessDynamicCoupling,runDynamicMaintainedLeadCoupling} from '../learning/dynamic-perceptual-coupling-v1.mjs';
import {createGunPlantState,PROVISIONAL_GUN_PLANT_LIMITS_V1} from '../learning/gun-plant-v1.mjs';

const controllerSource=fs.readFileSync(new URL('../learning/dynamic-perceptual-coupling-v1.mjs',import.meta.url),'utf8');
for(const forbidden of ['oracle-evaluation','../physics/','missDistance','missVector','targetSeed','requiredLead','exactIntercept','pelletTOF','physicalLead_m'])assert.equal(controllerSource.includes(forbidden),false,`geometry audit controller must not contain/import ${forbidden}`);

function frame({t_s=1,az=0,el=0,azRate=0.6,elRate=0.08,current=0.75}={}){
  return Object.freeze({
    schema:'MAINTAINED_LEAD_PERCEPTION_FRAME_V1',t_s,
    belief:Object.freeze({
      schema:'MULTIFAMILY_BELIEF_V1',confidence:0.8,
      prediction:Object.freeze({azMean_rad:az,elMean_rad:el}),
      apparentMotion:Object.freeze({azRateMean_radps:azRate,elRateMean_radps:elRate})
    }),
    plan:Object.freeze({
      schema:'PRESENTATION_LEVEL_SHOT_PLAN_V1',method:'MAINTAINED_LEAD',
      presentationProgress:Object.freeze({current,intendedBreak:0.80,breakWindow:Object.freeze({start:0.70,end:0.92})}),
      executionAdaptation:Object.freeze({breakWindowMissed:false})
    })
  });
}

// Direction symmetry: tangent follows target travel, so positive forward is forward for both directions.
const ltr=frame({azRate:0.6,elRate:0.08});
const rtl=frame({azRate:-0.6,elRate:0.08});
const a=dynamicTargetLineBasis(ltr),b=dynamicTargetLineBasis(rtl);
for(const basis of [a,b]){
  assert.ok(Math.abs(Math.hypot(basis.tAz,basis.tEl)-1)<1e-12,'tangent must be unit length');
  assert.ok(Math.abs(Math.hypot(basis.nAz,basis.nEl)-1)<1e-12,'normal must be unit length');
  assert.ok(Math.abs(basis.tAz*basis.nAz+basis.tEl*basis.nEl)<1e-12,'tangent and normal must be orthogonal');
  assert.ok(basis.azRate*basis.tAz+basis.elRate*basis.tEl>0,'tangent must point with perceived target travel');
}
assert.ok(a.tAz>0&&b.tAz<0,'azimuth tangent sign must reverse with target direction');

for(const f of [ltr,rtl]){
  const basis=dynamicTargetLineBasis(f);
  const cmd=buildDynamicCouplingCommand(f,{forwardRelationship_rad:0.05,lineNormalRelationship_rad:0.01,motorDelay_s:0});
  const dAz=cmd.command.desiredAz_rad-f.belief.prediction.azMean_rad;
  const dEl=cmd.command.desiredEl_rad-f.belief.prediction.elMean_rad;
  const forward=dAz*basis.tAz+dEl*basis.tEl;
  const normal=dAz*basis.nAz+dEl*basis.nEl;
  assert.ok(Math.abs(forward-0.05)<1e-12,'command forward component must equal requested line-relative relationship');
  assert.ok(Math.abs(normal-0.01)<1e-12,'command normal component must equal requested line-relative relationship');
  const state=createGunPlantState({t_s:f.t_s,az_rad:cmd.command.desiredAz_rad,el_rad:cmd.command.desiredEl_rad,azRate_radps:basis.azRate,elRate_radps:basis.elRate});
  const assessed=assessDynamicCoupling(f,state,{forwardRelationship_rad:0.05,lineNormalRelationship_rad:0.01});
  assert.ok(Math.abs(assessed.achievedForward_rad-0.05)<1e-12,'assessment must use same forward basis as command');
  assert.ok(Math.abs(assessed.achievedNormal_rad-0.01)<1e-12,'assessment must use same normal basis as command');
  assert.ok(assessed.speedMatchError_radps<1e-12,'speed-match projection must use same tangent basis');
  assert.ok(Math.abs(assessed.stateTimeAlignmentError_s)<1e-12,'synthetic same-time state must report zero timing error');
}

// Full finite-plant process audit at 60 Hz perception / 120 Hz integration. Every assessed gun
// state must correspond to that frame's timestamp, not the next perception frame.
const frames=[];
for(let i=0;i<30;i++)frames.push(frame({t_s:1+i/60,az:i*0.01,el:i*0.001,azRate:0.6,elRate:0.06,current:0.50+i*0.014}));
const run=runDynamicMaintainedLeadCoupling({frames,forwardRelationship_rad:0.04,lineNormalRelationship_rad:0,limits:PROVISIONAL_GUN_PLANT_LIMITS_V1,seed:991});
assert.equal(run.couplingTrace.length,frames.length);
assert.equal(run.stateIndexByFrame.length,frames.length);
const maxAbsAlignmentError=Math.max(...run.couplingTrace.map(x=>Math.abs(x.stateTimeAlignmentError_s)));
assert.ok(maxAbsAlignmentError<=PROVISIONAL_GUN_PLANT_LIMITS_V1.dt_s/2+1e-10,`frame/gun time alignment error too large: ${maxAbsAlignmentError}`);
for(let i=1;i<run.stateIndexByFrame.length;i++)assert.ok(run.stateIndexByFrame[i]>run.stateIndexByFrame[i-1],'frame-to-state mapping must be monotonic');

console.log(JSON.stringify({
  suite:'ShotSight L3 dynamic coupling geometry/expressivity audit v1',
  directionSymmetry:'PASS',
  tangentNormalOrthonormality:'PASS',
  commandAssessmentCoordinateConsistency:'PASS',
  speedMatchCoordinateConsistency:'PASS',
  frameGunTimeAlignment:'PASS',
  maxAbsAlignmentError_s:maxAbsAlignmentError,
  antiCheat:'PASS_PROCESS_ONLY_NO_ORACLE_OR_PHYSICS_SCORING_IMPORT'
},null,2));
console.log('virtual-shooter-dynamic-coupling-geometry-v1: PASS');
