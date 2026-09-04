import fs from 'node:fs';import path from 'node:path';import {createMethodComparisonScenario,methodComparisonFrame,validateMethodTopology,METHOD_REVIEW_FRAME_RATE_HZ,METHOD_REVIEW_DURATION_S,METHOD_REVIEW_CONFIG} from '../physics/reviewer-method-comparison-v1.mjs';
const scenario=createMethodComparisonScenario();const out=path.resolve('artifacts/reviewer-method-comparison');fs.mkdirSync(out,{recursive:true});
const summary={schema:'SHOTSIGHT_REVIEWER_METHOD_COMPARISON_SUMMARY_V1',status:'PROVISIONAL_METHOD_KINEMATIC_HYPOTHESIS_FOR_EXPERT_REVIEW',frameRate_hz:METHOD_REVIEW_FRAME_RATE_HZ,duration_s:METHOD_REVIEW_DURATION_S,scenario:{id:scenario.id,status:scenario.status,shotTime_s:scenario.shotTime_s,provider:scenario.provider,limitations:scenario.limitations},methods:{}};
for(const id of Object.keys(METHOD_REVIEW_CONFIG)){
  validateMethodTopology(scenario,id);
  const frames=[];const trace=[];const count=Math.round(METHOD_REVIEW_DURATION_S*METHOD_REVIEW_FRAME_RATE_HZ);
  for(let i=0;i<=count;i++){
    const t=i/METHOD_REVIEW_FRAME_RATE_HZ,f=methodComparisonFrame(scenario,id,t),k=f.angularKinematics;
    frames.push({frameIndex:i,t_s:t,target:f.target,gun:f.gun,observerAngles:f.observerAngles,angularKinematics:k,method:f.method,labels:f.labels,events:f.events,ballistic:{pelletArrival_s:f.baseState.ballistic.pelletArrival_s,pelletTOF_s:f.baseState.ballistic.shotIntercept.pelletTOF_s}});
    trace.push({frameIndex:i,t_s:t,phase:f.method.phase,leadScale_g:f.method.leadScale_g,signedSeparation_rad:k.separation.signedMagnitude_rad,targetAngularVelocity_rad_s:k.targetAngularVelocity.magnitude_rad_s,gunAngularVelocity_rad_s:k.gunAngularVelocity.magnitude_rad_s,relativeAngularVelocity_rad_s:k.relativeAngularVelocity.magnitude_rad_s,gunAngularAcceleration_rad_s2:k.gunAngularAcceleration.magnitude_rad_s2});
  }
  const m=METHOD_REVIEW_CONFIG[id],payload={schema:'SHOTSIGHT_REVIEWER_METHOD_COMPARISON_V1',status:'PROVISIONAL_METHOD_KINEMATIC_HYPOTHESIS_FOR_EXPERT_REVIEW',frameRate_hz:METHOD_REVIEW_FRAME_RATE_HZ,duration_s:METHOD_REVIEW_DURATION_S,scenario:summary.scenario,method:{id:m.id,name:m.name,sourceRegistryId:m.sourceRegistryId,evidenceClass:'SHOTSIGHT_HYPOTHESIS',kinematicsStatus:'SHOTSIGHT_HYPOTHESIS_PENDING_EXPERT_REVIEW',parameters:m.parameters,interpretation:m.interpretation},topologyValidated:true,frames,trace};
  fs.writeFileSync(path.join(out,`${id.toLowerCase()}.json`),JSON.stringify(payload,null,2));
  fs.writeFileSync(path.join(out,`${id.toLowerCase()}-trace.csv`),['frame,t_s,phase,lead_scale_g,signed_separation_rad,target_angular_velocity_rad_s,gun_angular_velocity_rad_s,relative_angular_velocity_rad_s,gun_angular_acceleration_rad_s2',...trace.map(r=>[r.frameIndex,r.t_s.toFixed(6),r.phase,r.leadScale_g.toFixed(9),r.signedSeparation_rad.toFixed(9),r.targetAngularVelocity_rad_s.toFixed(9),r.gunAngularVelocity_rad_s.toFixed(9),r.relativeAngularVelocity_rad_s.toFixed(9),r.gunAngularAcceleration_rad_s2.toFixed(9)].join(','))].join('\n'));
  summary.methods[id]={name:m.name,topologyValidated:true,parameters:m.parameters,kinematicsStatus:'SHOTSIGHT_HYPOTHESIS_PENDING_EXPERT_REVIEW',traceFile:`${id.toLowerCase()}-trace.csv`};
}
fs.writeFileSync(path.join(out,'comparison-summary.json'),JSON.stringify(summary,null,2));
console.log('wrote method-comparison manifests and quantitative traces',out);
