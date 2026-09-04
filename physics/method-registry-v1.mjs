// ShotSight P6 — source-attributed shooting-method registry v1
//
// This registry records only method existence/applicability and source narrative
// that is already certified in the representative Playbook evidence set.
// It deliberately does NOT invent numerical transition thresholds, connection
// tolerances, speed-match tolerances, hold-point distances or human kinematic limits.

import {EVIDENCE_CLASS,createMethodEvidenceContract} from './method-narrative-v1.mjs';

function entry({contract,sourceNarrative}){
  return Object.freeze({contract,sourceNarrative:Object.freeze([...sourceNarrative]),executableThresholdEvents:Object.freeze([])});
}

export const METHOD_REGISTRY_V1=Object.freeze({
  CPSA_PULL_AWAY_RECOGNISED:entry({
    contract:createMethodEvidenceContract({
      id:'CPSA_PULL_AWAY_RECOGNISED',name:'Pull-away',sources:['CPSA_S3'],evidenceClass:EVIDENCE_CLASS.DIRECT,
      applicability:{scope:'recognised_shooting_method',universalPrescription:false}
    }),
    sourceNarrative:['Pull-away is a recognised CPSA shooting method.','ShotSight must not promote it as universally preferred.']
  }),
  CPSA_SWING_THROUGH_RECOGNISED:entry({
    contract:createMethodEvidenceContract({
      id:'CPSA_SWING_THROUGH_RECOGNISED',name:'Swing-through',sources:['CPSA_S3'],evidenceClass:EVIDENCE_CLASS.DIRECT,
      applicability:{scope:'recognised_shooting_method',universalPrescription:false}
    }),
    sourceNarrative:['Swing-through is a recognised CPSA shooting method.','ShotSight must not promote it as universally preferred.']
  }),
  CPSA_MAINTAINED_LEAD_RECOGNISED:entry({
    contract:createMethodEvidenceContract({
      id:'CPSA_MAINTAINED_LEAD_RECOGNISED',name:'Maintained lead',sources:['CPSA_S3'],evidenceClass:EVIDENCE_CLASS.DIRECT,
      applicability:{scope:'recognised_shooting_method',universalPrescription:false}
    }),
    sourceNarrative:['Maintained lead is a recognised CPSA shooting method.','ShotSight must not promote it as universally preferred.']
  }),
  NSCA_LONG_CROSSER_PULL_AWAY:entry({
    contract:createMethodEvidenceContract({
      id:'NSCA_LONG_CROSSER_PULL_AWAY',name:'Long-crosser pull-away',sources:['NSCA_LONG_CROSSER'],evidenceClass:EVIDENCE_CLASS.DIRECT,
      applicability:{flight_family:'crossing',phase:'stable',presentation:'long_crosser'}
    }),
    sourceNarrative:['Use a useful runway.','Keep visual attention on the target/leading edge.','Match target speed before smooth separation.']
  }),
  NSCA_TEAL_POWERED_PASS_THROUGH:entry({
    contract:createMethodEvidenceContract({
      id:'NSCA_TEAL_POWERED_PASS_THROUGH',name:'Powered-teal pass-through',sources:['NSCA_TEAL'],evidenceClass:EVIDENCE_CLASS.DIRECT,
      applicability:{flight_family:'vertical_teal',phase:'powered',direction:'away'}
    }),
    sourceNarrative:['This is the outgoing-under-power teal case, not a universal teal prescription.','The source describes a pass-through move.','A source-stated hold-point relationship exists, but ShotSight does not convert it to an executable angular/distance threshold without calibrated geometry.']
  }),
  NSCA_DRIVEN_PASS_THROUGH:entry({
    contract:createMethodEvidenceContract({
      id:'NSCA_DRIVEN_PASS_THROUGH',name:'Driven-target pass-through',sources:['NSCA_DRIVEN'],evidenceClass:EVIDENCE_CLASS.DIRECT,
      applicability:{flight_family:'falling_driven',direction:'overhead_toward',elevation:'high'}
    }),
    sourceNarrative:['Establish visual connection before the pass-through move.','Incoming driven and already-passed/going-away overhead geometry must remain distinct.']
  })
});

export function getMethodRegistryEntry(id){
  const value=METHOD_REGISTRY_V1[id];
  if(!value)throw new Error(`unknown method registry id: ${id}`);
  return value;
}

export function validateMethodRegistryFailClosed(registry=METHOD_REGISTRY_V1){
  for(const [id,item] of Object.entries(registry)){
    if(item.contract.id!==id)throw new Error(`registry key/id mismatch: ${id}`);
    if(Object.keys(item.contract.authorisedPredicates).length!==0)throw new Error(`instructional method ${id} contains an unauthorised executable predicate`);
    if(item.executableThresholdEvents.length!==0)throw new Error(`instructional method ${id} contains an executable threshold event`);
  }
  return true;
}
