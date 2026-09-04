import fs from 'node:fs';
import path from 'node:path';
import {
  createFlatCrosserReviewerScenario,
  reviewerFrame,
  reviewerQaFrames,
  validateReviewerFrame,
  REVIEWER_FRAME_RATE_HZ,
  REVIEWER_DURATION_S
} from '../physics/reviewer-flat-crosser-v1.mjs';

const outDir=path.resolve('artifacts/reviewer-flat-crosser');
fs.mkdirSync(outDir,{recursive:true});
const scenario=createFlatCrosserReviewerScenario();
const maxFrame=Math.round(REVIEWER_DURATION_S*REVIEWER_FRAME_RATE_HZ);
const frames=[];
for(let i=0;i<=maxFrame;i++){
  const f=reviewerFrame(scenario,i);validateReviewerFrame(f);
  frames.push({
    frameIndex:f.frameIndex,t_s:f.t_s,
    target:{position_W:f.target.position_W,velocity_W:f.target.velocity_W,orientationStatus:f.target.orientationStatus},
    gun:{bore_W:f.gun.bore_W,breech_W:f.gun.breech_W,muzzle_W:f.gun.muzzle_W,stockToe_W:f.gun.stockToe_W,foreHand_W:f.gun.foreHand_W},
    visualRig:f.visualRig,
    labels:f.labels,
    events:f.state.activeNarrativeEvents.map(e=>({type:e.type,t_s:e.t_s,status:e.status})),
    ballistic:{pelletArrival_s:f.state.ballistic.pelletArrival_s,pelletTOF_s:f.state.ballistic.shotIntercept.pelletTOF_s},
    relationship:{physicalLead_m:f.state.relationship.physicalLead_m,apparentLeadAngle_rad:f.state.relationship.apparentLeadAngle_rad}
  });
}
const qa=reviewerQaFrames(scenario);
const qaManifest=Object.fromEntries(Object.entries(qa).map(([k,f])=>[k,{frameIndex:f.frameIndex,t_s:f.t_s,targetPosition_W:f.target.position_W,bore_W:f.gun.bore_W,muzzle_W:f.gun.muzzle_W,events:f.state.activeNarrativeEvents.map(e=>e.type),labels:f.labels}]));
const manifest={
  schema:'SHOTSIGHT_REVIEWER_FLAT_CROSSER_FRAME_MANIFEST_V1',
  sourceModel:'physics/canonical-flat-crosser-v1.mjs',
  sourceAdapter:'physics/reviewer-flat-crosser-v1.mjs',
  status:'PROVISIONAL_ENGINEERING_REVIEW_NOT_INSTRUCTIONAL',
  frameRate_hz:REVIEWER_FRAME_RATE_HZ,duration_s:REVIEWER_DURATION_S,frameCount:frames.length,
  scenario:{id:scenario.id,status:scenario.status,shotTime_s:scenario.shotTime_s,gunStrategy:scenario.gunStrategy,methodReference:{id:scenario.methodEntry.contract.id,role:'SOURCE_REFERENCE_ONLY',kinematicsStatus:'HOLD_NOT_IMPLEMENTED'},provider:{id:scenario.provider.id,status:scenario.provider.status},limitations:scenario.limitations},
  frames
};
fs.writeFileSync(path.join(outDir,'frame-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'qa-frames.json'),JSON.stringify(qaManifest,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',outDir,frameCount:frames.length,frameRate_hz:REVIEWER_FRAME_RATE_HZ,qaFrames:Object.fromEntries(Object.entries(qaManifest).map(([k,v])=>[k,v.frameIndex]))},null,2));
