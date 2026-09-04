import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createFlatCrosserReviewerScenario,reviewerFrame,reviewerHistory,validateReviewerFrame,validateHistoryDirection,reviewerQaFrames,REVIEWER_FRAME_RATE_HZ,REVIEWER_DURATION_S} from '../physics/reviewer-flat-crosser-v1.mjs';

const s=createFlatCrosserReviewerScenario();
assert.equal(REVIEWER_FRAME_RATE_HZ,60);assert.equal(REVIEWER_DURATION_S,2);
for(const i of [0,1,47,48,49,60,120])assert.equal(validateReviewerFrame(reviewerFrame(s,i)),true);
const h=reviewerHistory(s,0.9);assert.equal(validateHistoryDirection(h),true);assert(h.every((f,i)=>i===0||f.t_s>=h[i-1].t_s));
const q=reviewerQaFrames(s);for(const f of Object.values(q))validateReviewerFrame(f);
assert.equal(q.shot.labels.gunStrategy,'ENGINEERING_INTERCEPT_REFERENCE');assert.equal(q.shot.labels.coachingMethod,'NONE_ACTIVE');
assert.equal(q.shot.labels.realisticClay,'HOLD_NOT_CERTIFIED');assert.equal(q.shot.labels.instructionalMotion,'NOT_AUTHORISED');
const html=fs.readFileSync(new URL('../reviewer-flat-crosser.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../reviewer-flat-crosser.js',import.meta.url),'utf8');
for(const token of ['Third-person coach view','Shooter-eye view','Elevated oblique view','NOT REALISTIC CLAY CERTIFIED','ENGINEERING INTERCEPT REFERENCE','60 fps'])assert(html.includes(token),`missing reviewer contract token ${token}`);
assert(js.includes('reviewerFrameAtTime'));assert(js.includes('reviewerHistory'));assert(!js.includes('image_gen'));assert(!js.includes('keyframe'));
console.log(JSON.stringify({suite:'ShotSight 3D reviewer flat-crosser v1',status:'PASS',tests:{sharedClock:true,barrelEqualsBore:true,pastOnlyTargetHistory:true,noActiveCoachingMethod:true,provisionalLocks:true,styleSurfaceContract:true,frameRate60:true}},null,2));
