import assert from 'node:assert/strict';
import {buildEllisHumanVisualEvidence,auditHumanVisualEvidence} from '../learning/human-visual-acquisition-v1.mjs';

function obs(t,{az=0,el=0,rate=0.8,elRate=0,q=0.9,visible=true}={}){
  return Object.freeze({
    schema:'SHOOTER_OBSERVATION_V1',observationTime_s:t,latency_s:0.08,visible,
    az_rad:visible?az:null,el_rad:visible?el:null,
    apparentAzRate_radps:visible?rate:null,apparentElRate_radps:visible?elRate:null,
    acquisitionQuality:visible?q:0,
    targetFamilyBelief:{CROSSER:0.7,QUARTERER:0.12,LOOPER:0.1,OTHER:0.08},
    motionPhaseBelief:{STABLE:0.8,CHANGING:0.2},
    context:{expectedDirection:'RIGHT',trapRegionKnown:true}
  });
}

// 1. Immediately after release Ellis gets a streak-like region, not a precise policy-ready centre.
const early=[obs(0.00,{az:0.00}),obs(0.03,{az:0.024})];
const earlyEvidence=buildEllisHumanVisualEvidence(early,{contrast:0.9,clutter:0.05,attention:0.95});
assert.equal(earlyEvidence.phase,'FLASH_STREAK');
assert.equal(earlyEvidence.resolved,null);
assert.equal(earlyEvidence.usableForConnection,false);
assert.equal(Object.hasOwn(earlyEvidence.streak,'centreApprox_rad'),false,'unresolved streak must not expose a pseudo-centre');
assert.ok(earlyEvidence.streak.uncertaintyAlongMotionSd_rad>=earlyEvidence.streak.uncertaintyNormalSd_rad);
assert.equal(auditHumanVisualEvidence(earlyEvidence).status,'PASS');

// 2. Additional high-quality evidence can transition to tracking, but only after acquisition.
const tracked=[];
for(let i=0;i<=12;i++)tracked.push(obs(i*0.02,{az:i*0.016,rate:0.8,q:0.95}));
const trackedEvidence=buildEllisHumanVisualEvidence(tracked,{contrast:1,clutter:0,attention:1,minimumTrackingQuality:0.50});
assert.equal(trackedEvidence.phase,'TRACKING');
assert.equal(trackedEvidence.usableForConnection,true);
assert.ok(trackedEvidence.resolved);
assert.equal(auditHumanVisualEvidence(trackedEvidence).status,'PASS');

// 3. Higher apparent motion should not become easier to acquire at the same evidence duration.
const moderate=[obs(0,{rate:0.25}),obs(0.08,{az:0.02,rate:0.25}),obs(0.16,{az:0.04,rate:0.25})];
const fast=[obs(0,{rate:1.2}),obs(0.08,{az:0.096,rate:1.2}),obs(0.16,{az:0.192,rate:1.2})];
const moderateEvidence=buildEllisHumanVisualEvidence(moderate,{contrast:0.8,clutter:0.15,attention:0.9});
const fastEvidence=buildEllisHumanVisualEvidence(fast,{contrast:0.8,clutter:0.15,attention:0.9});
assert.ok(fastEvidence.acquisitionScore<moderateEvidence.acquisitionScore);
assert.ok(fastEvidence.streak.uncertaintyAlongMotionSd_rad>moderateEvidence.streak.uncertaintyAlongMotionSd_rad);

// 4. Clutter / poor contrast reduce acquisition quality without changing oracle truth.
const clean=buildEllisHumanVisualEvidence(moderate,{contrast:1,clutter:0,attention:1});
const poor=buildEllisHumanVisualEvidence(moderate,{contrast:0.35,clutter:0.7,attention:0.75});
assert.ok(poor.acquisitionScore<clean.acquisitionScore);

// 5. Occlusion after prior visibility removes policy-ready resolved target centre and requires reacquisition.
const occludedHistory=[...tracked,obs(0.26,{visible:false})];
const occluded=buildEllisHumanVisualEvidence(occludedHistory,{occluded:true,contrast:1,clutter:0});
assert.equal(occluded.phase,'REACQUIRING');
assert.equal(occluded.resolved,null);
assert.equal(occluded.usableForConnection,false);
assert.equal(auditHumanVisualEvidence(occluded).status,'PASS');

// 6. The upstream observation validator must reject privileged aliases even if someone tries to hide them in context.
const leaked={...obs(0.2),context:{expectedDirection:'RIGHT',trapRegionKnown:true,trueRange_m:37}};
assert.throws(()=>buildEllisHumanVisualEvidence([leaked]),/PRIVILEGED_STATE_LEAK/);

console.log('PASS Ellis Human Vision V1: streak-first acquisition, no pseudo-centre, anisotropic uncertainty, delayed tracking, clutter/contrast effects, reacquisition and anti-oracle containment.');
