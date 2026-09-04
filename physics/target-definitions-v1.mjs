// ShotSight P3 provenance-backed target definitions.
// This file contains source-supported physical target parameters only.
// It intentionally contains NO clay aerodynamic coefficients and NO trap launch defaults.

export const PARAMETER_CLASSES = new Set([
  'VERIFIED_FACT','DERIVED_VALUE','CALIBRATED_PARAMETER','MODEL_ASSUMPTION',
  'SHOTSIGHT_HYPOTHESIS','UNKNOWN','HOLD'
]);

export function parameter({value=null,unit,classification,sourceId=null,applicability='',uncertainty=null,notes=''}){
  if(typeof unit!=='string'||!unit) throw new Error('parameter unit required');
  if(!PARAMETER_CLASSES.has(classification)) throw new Error(`invalid parameter classification: ${classification}`);
  if(value!==null){
    const finiteScalar=Number.isFinite(value);
    const finiteArray=Array.isArray(value)&&value.length>0&&value.every(Number.isFinite);
    if(!finiteScalar&&!finiteArray) throw new Error('parameter value must be null, finite number, or finite numeric array');
  }
  if((classification==='UNKNOWN'||classification==='HOLD')&&value!==null)
    throw new Error(`${classification} parameter must not carry a runtime numeric value`);
  return Object.freeze({value,unit,classification,sourceId,applicability,uncertainty,notes});
}

export function numericValue(p,label='parameter'){
  if(!p||typeof p!=='object') throw new Error(`${label} record required`);
  if(p.value===null) throw new Error(`${label} has no authorised numeric value (${p.classification||'unclassified'})`);
  if(!(Number.isFinite(p.value)||(Array.isArray(p.value)&&p.value.every(Number.isFinite))))
    throw new Error(`${label} numeric value invalid`);
  return p.value;
}

export const SOURCES = Object.freeze({
  ANDERT_2016: Object.freeze({
    id:'ANDERT_2016_CLAY_FLIGHT',
    citation:'Andert, Freudenthal & Levedag, VISAPP 2016, DOI 10.5220/0005674602950302',
    applicability:'Reference target used in the published clay-flight model; values are not universal manufacturer defaults.'
  })
});

// Source-specific reference target constants verified during P1.
export const ANDERT_REFERENCE_TARGET = Object.freeze({
  id:'andert-2016-reference-standard',
  type:'STANDARD_REFERENCE',
  manufacturerModel:null,
  mass_kg:parameter({value:0.105,unit:'kg',classification:'VERIFIED_FACT',sourceId:SOURCES.ANDERT_2016.id,applicability:SOURCES.ANDERT_2016.applicability}),
  referenceArea_m2:parameter({value:0.0095,unit:'m^2',classification:'VERIFIED_FACT',sourceId:SOURCES.ANDERT_2016.id,applicability:SOURCES.ANDERT_2016.applicability}),
  diameter_m:parameter({value:0.11,unit:'m',classification:'VERIFIED_FACT',sourceId:SOURCES.ANDERT_2016.id,applicability:SOURCES.ANDERT_2016.applicability}),
  inertiaTensor_B_kgm2:parameter({value:[1.33e-4,1.33e-4,2.57e-4],unit:'kg*m^2',classification:'VERIFIED_FACT',sourceId:SOURCES.ANDERT_2016.id,applicability:SOURCES.ANDERT_2016.applicability,notes:'Diagonal principal-axis inertia values for the paper reference target.'}),
  aeroModelId:'ANDERT_FAMILY_PARAMETERISED',
  aeroParameters:Object.freeze({
    CL0:parameter({value:null,unit:'1',classification:'HOLD',sourceId:SOURCES.ANDERT_2016.id,notes:'Numerical coefficient not reliably extracted/validated in P1.'}),
    CLalpha:parameter({value:null,unit:'1/rad',classification:'HOLD',sourceId:SOURCES.ANDERT_2016.id,notes:'Numerical coefficient not reliably extracted/validated in P1.'}),
    CD0:parameter({value:null,unit:'1',classification:'HOLD',sourceId:SOURCES.ANDERT_2016.id,notes:'Numerical coefficient not reliably extracted/validated in P1.'}),
    K:parameter({value:null,unit:'1',classification:'HOLD',sourceId:SOURCES.ANDERT_2016.id,notes:'Numerical coefficient not reliably extracted/validated in P1.'}),
    CM0:parameter({value:null,unit:'1',classification:'HOLD',sourceId:SOURCES.ANDERT_2016.id,notes:'Numerical coefficient not reliably extracted/validated in P1.'}),
    CMalpha:parameter({value:null,unit:'1/rad',classification:'HOLD',sourceId:SOURCES.ANDERT_2016.id,notes:'Numerical coefficient not reliably extracted/validated in P1.'}),
    CN:parameter({value:null,unit:'1',classification:'HOLD',sourceId:SOURCES.ANDERT_2016.id,notes:'Numerical coefficient not reliably extracted/validated in P1.'})
  }),
  provenance:Object.freeze([SOURCES.ANDERT_2016.id])
});

export function runtimeTargetDefinition(definition){
  if(!definition||typeof definition!=='object') throw new Error('target definition required');
  const mass=numericValue(definition.mass_kg,'mass_kg');
  const area=numericValue(definition.referenceArea_m2,'referenceArea_m2');
  const diameter=numericValue(definition.diameter_m,'diameter_m');
  const inertia=numericValue(definition.inertiaTensor_B_kgm2,'inertiaTensor_B_kgm2');
  if(!(mass>0&&area>0&&diameter>0)) throw new Error('target physical scalars must be > 0');
  if(!Array.isArray(inertia)||inertia.length!==3||inertia.some(v=>!(v>0))) throw new Error('target diagonal inertia must contain three positive values');
  return Object.freeze({id:definition.id,type:definition.type,mass_kg:mass,referenceArea_m2:area,diameter_m:diameter,inertiaTensor_B_kgm2:[...inertia],aeroModelId:definition.aeroModelId,provenance:[...(definition.provenance||[])]});
}

export function authorisedAeroParameters(definition){
  if(!definition?.aeroParameters) throw new Error('target aero parameter records required');
  const result={};
  for(const [key,p] of Object.entries(definition.aeroParameters)) result[key]=numericValue(p,`aeroParameters.${key}`);
  return result;
}
