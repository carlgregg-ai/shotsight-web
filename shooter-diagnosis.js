const shooterQuestions={
  symptom:{title:'What are you seeing?',sub:'Start with the repeatable symptom — not the cause.',options:[
    ['behind','Consistently behind','The clay escapes in front of the shot.'],
    ['ahead','Consistently in front','You feel you are giving too much or rushing past it.'],
    ['line','Above / below the line','Lead may look plausible, but the shot is vertically displaced.'],
    ['inconsistent','No consistent miss','Different misses, or the picture never settles.'],
    ['lose','I lose the clay','The barrel or effort starts to dominate your vision.'],
    ['rush','I rush the shot','You fire before the picture feels organised.'],
    ['stop','I stop the gun','The move looks right, then dies at the shot.']
  ]},
  target:{title:'What sort of target?',sub:'Context changes which mechanism is most likely.',options:[
    ['crossing','Crossing','A clear lateral target.'],['quartering','Quartering','Moving away or towards at an angle.'],['away','Going away','Speed / line judgement dominates.'],['incoming','Incoming','The target is closing toward you.'],['looper','Looper / arcing','The barrel may take a different route to the clay.'],['mixed','It happens on several types','Treat it as a shooter pattern first.']
  ]},
  feel:{title:'What does the move feel like?',sub:'Pick the closest description.',options:[
    ['smooth','Smooth but wrong','The move feels controlled, but the result is repeatably off.'],['fast','Gun feels too fast','You accelerate hard or run past the picture.'],['slow','Gun feels late / heavy','You are catching up or never quite getting there.'],['correcting','Lots of little corrections','The barrel steers and hunts near the break point.'],['checking','I become aware of the barrel','Attention leaves the target and the picture tightens.'],['unclear','I never get a clear picture','Pickup / visual connection feels late or vague.']
  ]}
};

const diagnosisRules={
  behind:{title:'Insufficient lead / late connection',confidence:'Likely',mechanism:'The gun is arriving on the target line too late, or the lead gap is never fully established before release.',cue:'SEE IT EARLIER → JOIN CLEANLY → FINISH THROUGH',demo:'behind',drill:'pursuit',fix:'Use Smooth Pursuit to remove catch-up movements, then rehearse a deliberate pickup and one committed move.'},
  ahead:{title:'Excess lead / over-acceleration',confidence:'Likely',mechanism:'The gun is creating separation faster than the target picture requires.',cue:'MATCH FIRST → BUILD ONLY WHAT YOU NEED',demo:'ahead',drill:'three',fix:'Use Three Bullet to soften visual effort, then rehearse a calmer match before creating lead.'},
  line:{title:'Line error',confidence:'Strong',mechanism:'The gun path is displaced from the target flight line, so timing can be good while the shot still misses vertically.',cue:'FIND THE LINE → JOIN IT → THEN CREATE LEAD',demo:'line',drill:'saccade',fix:'Use Saccade Ladder for cleaner acquisition, then rehearse joining the actual target line before thinking about lead.'},
  inconsistent:{title:'Unstable acquisition / correction loop',confidence:'Moderate',mechanism:'The picture is not settling early enough, so the final part of the move becomes reactive rather than committed.',cue:'PICK UP EARLIER → ONE MOVE → ONE DECISION',demo:'correction',drill:'quiet',fix:'Use Quiet Eye before movement, then Smooth Pursuit if the barrel still hunts near the break.'},
  lose:{title:'Target-focus break',confidence:'Strong',mechanism:'Attention is shifting from the clay toward the barrel or the act of shooting, weakening visual connection.',cue:'SEE THE CLAY → LET THE GUN STAY PERIPHERAL',demo:'sustained',drill:'three',fix:'Use Three Bullet and Quiet Eye. The goal is to preserve target detail while allowing the gun to remain in peripheral awareness.'},
  rush:{title:'Rushed acquisition',confidence:'Strong',mechanism:'The trigger decision is arriving before the visual picture and gun movement are organised.',cue:'SEE → CONNECT → MOVE → THEN FIRE',demo:'pullaway',drill:'quiet',fix:'Use Quiet Eye to delay the urge to act, then rehearse a clear pickup before initiating the shot move.'},
  stop:{title:'Stopped gun',confidence:'Strong',mechanism:'The barrel reaches a usable relationship, then loses speed around trigger release.',cue:'FIRE INSIDE THE MOVE — NOT AT THE END OF IT',demo:'stopped',drill:'pursuit',fix:'Use Smooth Pursuit and consciously continue the movement through the shot rather than treating the trigger as a finish line.'}
};

let shooterAnswers={};let shooterStep=0;const diagnosisSteps=['symptom','target','feel'];

function buildDiagnosisUI(){
  const host=document.querySelector('#shooterDiagnosis');if(!host)return;
  host.innerHTML=`<div class="diagnosis-intro"><span class="diag-badge">QUERY → DIAGNOSE → FIX</span><h2>What’s going wrong?</h2><p>Describe the miss and ShotSight will walk the diagnostic tree, show the most likely mechanism, then route you to a corrective demo and drill.</p><button class="primary big" id="startShooterDiagnosis">Start diagnosis <span>→</span></button></div>`;
  document.querySelector('#startShooterDiagnosis')?.addEventListener('click',openShooterDiagnosis);
}

function openShooterDiagnosis(){shooterAnswers={};shooterStep=0;document.querySelector('#diagnosisSheet')?.classList.add('active');document.querySelector('#diagnosisSheet')?.setAttribute('aria-hidden','false');renderShooterQuestion()}
function closeShooterDiagnosis(){document.querySelector('#diagnosisSheet')?.classList.remove('active');document.querySelector('#diagnosisSheet')?.setAttribute('aria-hidden','true')}

function renderShooterQuestion(){
  const key=diagnosisSteps[shooterStep],q=shooterQuestions[key],body=document.querySelector('#diagnosisBody');if(!body)return;
  document.querySelector('#diagnosisProgress').textContent=`${shooterStep+1} / ${diagnosisSteps.length}`;
  body.innerHTML=`<span class="diag-badge">SHOOTER QUERY</span><h2>${q.title}</h2><p class="diagnosis-sub">${q.sub}</p><div class="diagnosis-options">${q.options.map(o=>`<button class="diagnosis-option" data-answer="${o[0]}"><span><strong>${o[1]}</strong><small>${o[2]}</small></span><b>›</b></button>`).join('')}</div>`;
  body.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{shooterAnswers[key]=btn.dataset.answer;if(shooterStep<diagnosisSteps.length-1){shooterStep++;renderShooterQuestion()}else renderShooterResult()}));
}

function deriveDiagnosis(){
  const a={...diagnosisRules[shooterAnswers.symptom]};
  if(shooterAnswers.feel==='correcting'){Object.assign(a,diagnosisRules.inconsistent,{title:'Over-correction / chasing'});a.demo='correction';a.drill='pursuit';}
  if(shooterAnswers.feel==='checking'){Object.assign(a,diagnosisRules.lose);}
  if(shooterAnswers.feel==='slow'&&shooterAnswers.symptom==='behind'){a.title='Late connection / under-acceleration';a.confidence='Strong';a.fix='Rehearse an earlier pickup and a positive but smooth move. Use Smooth Pursuit before returning to the shot-type demo.';}
  if(shooterAnswers.feel==='fast'&&shooterAnswers.symptom==='ahead'){a.confidence='Strong';}
  if(shooterAnswers.target==='looper'&&!['lose','rush','stop'].includes(shooterAnswers.symptom)){a.demo='looper';a.mechanism+=' On a looper, remember that the barrel path does not have to mirror the clay arc; it can travel underneath and converge at the chosen break point.';}
  return a;
}

function labelFor(group,value){const q=shooterQuestions[group];return q.options.find(o=>o[0]===value)?.[1]||value}
function renderShooterResult(){
  const r=deriveDiagnosis(),body=document.querySelector('#diagnosisBody');document.querySelector('#diagnosisProgress').textContent='RESULT';
  body.innerHTML=`<span class="diag-badge">LIKELY DIAGNOSIS</span><h2>${r.title}</h2><div class="diagnosis-confidence">${r.confidence} match</div><div class="diagnosis-tree-view"><div><span>SYMPTOM</span><strong>${labelFor('symptom',shooterAnswers.symptom)}</strong></div><i>↓</i><div><span>CONTEXT</span><strong>${labelFor('target',shooterAnswers.target)}</strong></div><i>↓</i><div><span>MOVEMENT CLUE</span><strong>${labelFor('feel',shooterAnswers.feel)}</strong></div><i>↓</i><div class="active"><span>MECHANISM</span><strong>${r.title}</strong></div></div><div class="diagnosis-explain"><span>WHY SHOTSIGHT THINKS THAT</span><p>${r.mechanism}</p></div><div class="diagnosis-fix"><span>FIX</span><strong>${r.cue}</strong><p>${r.fix}</p></div><div class="diagnosis-actions"><button class="secondary-button" id="diagnosisAgain">Ask again</button><button class="secondary-button" id="diagnosisDemo">See demo</button><button class="primary" id="diagnosisDrill">Start corrective drill</button></div><p class="diagnosis-note">This is a coaching hypothesis from your answers, not proof of the miss. ShotSight Sense data can later confirm or reject it from the gun trace.</p>`;
  document.querySelector('#diagnosisAgain')?.addEventListener('click',()=>{shooterStep=0;shooterAnswers={};renderShooterQuestion()});
  document.querySelector('#diagnosisDemo')?.addEventListener('click',()=>{closeShooterDiagnosis();const idx=(typeof shotDemos!=='undefined')?shotDemos.findIndex(d=>d.id===r.demo):-1;if(idx>=0&&typeof openDemo==='function')openDemo(idx)});
  document.querySelector('#diagnosisDrill')?.addEventListener('click',()=>{closeShooterDiagnosis();const a=(typeof activities!=='undefined')?activities.find(x=>x.id===r.drill):null;if(a&&typeof requestOpen==='function')requestOpen(a)});
}

document.querySelector('#diagnosisClose')?.addEventListener('click',closeShooterDiagnosis);
buildDiagnosisUI();
