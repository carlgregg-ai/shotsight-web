import assert from 'node:assert/strict';
import {constantSpeedTestProvider,freeSphereAllenResearchProvider,testOnlyLeadGeometry} from '../physics/ballistics-v1.mjs';
import {interceptWithTimeToRangeProvider} from '../physics/ballistic-intercept-tof-v1.mjs';

const near=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: expected ${b}, got ${a}, tol ${tol}`);

// The generic TOF-provider root solver must reproduce the independent analytic
// constant-speed intercept to numerical root tolerance.
const origin=[0,0,0],target=[0,40,0],velocity=[20,0,0];
const analytic=testOnlyLeadGeometry({shotOrigin_W:origin,targetPosition_W:target,targetVelocity_W:velocity,pelletSpeed_mps:400});
const numeric=interceptWithTimeToRangeProvider({provider:constantSpeedTestProvider(400),shotOrigin_W:origin,targetPosition_W:target,targetVelocity_W:velocity});
assert.equal(numeric.valid,true);
near(numeric.pelletTOF_s,analytic.pelletTOF_s,2e-8,'numeric provider solver TOF vs analytic');
near(numeric.physicalLead_m,analytic.physicalLead_m,5e-7,'numeric provider solver physical lead vs analytic');
near(numeric.apparentLeadAngle_rad,analytic.apparentLeadAngle_rad,2e-8,'numeric provider solver angular lead vs analytic');
assert.ok(Math.abs(numeric.rootResidual_s)<1e-7,'root residual bounded');

// A drag-aware free-sphere provider must produce a longer TOF and therefore more
// target displacement/lead than a fictitious constant muzzle-speed pellet under the
// same straight-path assumptions. This is a research/property test, NOT a sporting-
// load certification and NOT a dense-cloud claim.
const params={muzzleVelocity_mps:400,speedOfSound_mps:343,pelletDiameter_m:0.0024,pelletDensity_kgm3:11340,airDensity_kgm3:1.204};
const allen=freeSphereAllenResearchProvider(params);
const dragHit=interceptWithTimeToRangeProvider({provider:allen,shotOrigin_W:origin,targetPosition_W:target,targetVelocity_W:velocity,maxTau_s:1});
const noDragHit=interceptWithTimeToRangeProvider({provider:constantSpeedTestProvider(400),shotOrigin_W:origin,targetPosition_W:target,targetVelocity_W:velocity,maxTau_s:1});
assert.equal(dragHit.valid,true);
assert.equal(dragHit.providerStatus,'RESEARCH_VALIDATION_ONLY');
assert.ok(dragHit.pelletTOF_s>noDragHit.pelletTOF_s,'drag increases TOF relative to constant muzzle speed');
assert.ok(dragHit.physicalLead_m>noDragHit.physicalLead_m,'drag-aware TOF increases physical target displacement');
assert.ok(dragHit.apparentLeadAngle_rad>noDragHit.apparentLeadAngle_rad,'drag-aware TOF increases apparent lead in transverse test');
assert.ok(dragHit.limitations.some(x=>/gravity\/wind/.test(x)),'solver declares curvature limitation');

// Impossible pursuit within bounded time should fail safely.
const impossible=interceptWithTimeToRangeProvider({provider:constantSpeedTestProvider(300),shotOrigin_W:origin,targetPosition_W:[0,10,0],targetVelocity_W:[0,500,0],maxTau_s:1});
assert.equal(impossible.valid,false);
assert.equal(impossible.reason,'NO_INTERCEPT_WITHIN_MAX_TAU');

console.log(JSON.stringify({suite:'ShotSight P4 provider-based TOF intercept',status:'PASS',tests:{analyticEquivalence:true,dragAwareLeadProperty:true,providerStatusPreserved:true,limitationsDeclared:true,impossibleFailClosed:true}},null,2));
