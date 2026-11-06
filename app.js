const FLASHCARDS = [
 ["ISO 5 particle limit (≥0.5 µm/m³)","3,520"],
 ["ISO 6 particle limit","35,200"],
 ["ISO 7 particle limit","352,000"],
 ["ISO 8 particle limit","3,520,000"],
 ["ISO 7 buffer room — total ACPH","≥ 30"],
 ["ISO 8 room — total ACPH","≥ 20"],
 ["Minimum ACPH from ceiling HVAC HEPA","15"],
 ["SCA — ACPH requirement","None"],
 ["Non-HD buffer room pressure","Positive 0.020″ WC"],
 ["HD buffer room pressure","Negative 0.01–0.03″ WC"],
 ["SCA — pressure differential","None required"],
 ["Compounding room temperature","≤ 20°C"],
 ["Relative humidity","≤ 60%"],
 ["Category 1 BUD","12 h room temp / 24 h fridge"],
 ["Cat 2 aseptic, all-sterile, not tested (RT/fridge/freezer)","4 d / 10 d / 45 d"],
 ["Cat 2 aseptic, ≥1 nonsterile, not tested","1 d / 4 d / 45 d"],
 ["Cat 2 terminally sterilized, not tested","14 d / 28 d / 45 d"],
 ["Cat 2 aseptic, sterility tested","30 d / 45 d / 60 d"],
 ["Cat 2 terminally sterilized + tested","45 d / 60 d / 90 d"],
 ["Cat 3 aseptic, tested","60 d / 90 d / 120 d"],
 ["Cat 3 terminally sterilized, tested","90 d / 120 d / 180 d"],
 ["Frozen, untested Category 2 — BUD","45 days (all rows)"],
 ["Single-dose vial punctured in ISO 5","12 hours"],
 ["Manufactured multiple-dose vial","28 days"],
 ["Opened ampule","Single use; 5 µm filter"],
 ["Viable AIR action level — ISO 5 / 7 / 8","> 1 / > 10 / > 100 cfu/m³"],
 ["SURFACE action level — ISO 5 / 7 / 8","> 3 / > 5 / > 50 cfu/device"],
 ["GFT action level after garbing","> 0 cfu"],
 ["GFT action level after media-fill","> 3 cfu"],
 ["Initial garbing competency","3 times in succession"],
 ["Competency — Cat 1/2 vs Cat 3","Every 6 mo / every 3 mo"],
 ["Viable air sampling — Cat 1/2 vs Cat 3","Every 6 mo / monthly"],
 ["Surface sampling — Cat 1/2 vs Cat 3","Monthly / weekly"],
 ["Steam sterilization cycle","20–60 min, 121°C, 15 psi"],
 ["Steam biological indicator","Geobacillus stearothermophilus"],
 ["Dry-heat biological indicator","Bacillus atrophaeus"],
 ["Depyrogenation","~250°C / 30 min; endotoxin challenge vials"],
 ["Sterilizing-filter validation organism","Brevundimonas diminuta"],
 ["Sterilizing filter pore size","0.22 µm"],
 ["PN filter — 2-in-1 vs 3-in-1","0.22 µm / 1.2 µm"],
 ["Peripheral osmolarity limit","≤ 900 mOsm/L"],
 ["Sterility test incubation","14 days"],
 ["Media-fill incubation","≥ 7 days each at 20–25°C and 30–35°C"],
 ["Max batch size requiring sterility testing","250 final yield units"],
 ["FMEA Risk Priority Number","Severity × Occurrence × Detection"],
 ["PN calcium-phosphate add order","Phosphate first, calcium last"],
 ["Preferred calcium salt in PN","Calcium gluconate"],
 ["Central tip location (PICC, CVC, port)","SVC / cavoatrial junction"],
 ["Midline — central or peripheral?","Peripheral (tip at axilla)"],
 ["Port access needle","Non-coring Huber needle"],
];

function initApp(QUESTIONS){
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const content=$('#content'), sidebar=$('#sidebar');
  const SECS=['A','B','C','D','E','F','G','H','I','J'];
  const SECNAME={}; QUESTIONS.forEach(q=>SECNAME[q.sec]=q.secName);
  const DOMAIN={A:1,B:1,C:1,D:1,E:1,F:1,G:1,H:3,I:3,J:2};
  const DOMNAME={1:'Domain 1 — Compounded Sterile Preparations',2:'Domain 2 — Therapeutics',3:'Domain 3 — Professional Practice'};
  const LS_KEY='csp_trainer_history_v1';
  const fmt=ms=>{const s=Math.max(0,Math.round(ms/1000));const m=Math.floor(s/60);return m+':'+String(s%60).padStart(2,'0');};
  const fmtH=ms=>{let s=Math.max(0,Math.round(ms/1000));const h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60);return (h>0?h+':':'')+String(m).padStart(h>0?2:1,'0')+':'+String(s%60).padStart(2,'0');};
  const esc=s=>String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const rich=s=>esc(s).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function shuffleGroups(items){const g={},o=[];items.forEach(q=>{const k=q.scenarioId||('s'+q.n);if(!g[k]){g[k]=[];o.push(k);}g[k].push(q);});o.forEach(k=>g[k].sort((a,b)=>a.n-b.n));const out=[];shuffle(o.slice()).forEach(k=>g[k].forEach(q=>out.push(q)));return out;}

  // theme
  (function(){let t=null;try{t=localStorage.getItem('csp_theme');}catch(e){}document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');
    $('#themeBtn').onclick=()=>{const cur=document.documentElement.getAttribute('data-theme')||'dark';const n=cur==='light'?'dark':'light';document.documentElement.setAttribute('data-theme',n);try{localStorage.setItem('csp_theme',n);}catch(e){}};})();
  // mobile drawer
  const drawer=open=>{sidebar.classList.toggle('open',open);$('#backdrop').classList.toggle('show',open);};
  $('#menuBtn').onclick=()=>drawer(!sidebar.classList.contains('open'));
  $('#backdrop').onclick=()=>drawer(false);

  // history
  function loadHistory(){try{return JSON.parse(localStorage.getItem(LS_KEY)||'[]');}catch(e){return [];}}
  function saveAttempt(a){try{const h=loadHistory();h.push(a);localStorage.setItem(LS_KEY,JSON.stringify(h.slice(-200)));}catch(e){}}
  function mergeHistory(text){let inc;try{inc=JSON.parse(text);}catch(e){return{ok:false,msg:'Not valid JSON.'};}const arr=Array.isArray(inc)?inc:(inc.history||[inc]);const cur=loadHistory();const seen=new Set(cur.map(a=>a.date));let n=0;arr.forEach(a=>{if(a&&a.date&&!seen.has(a.date)){cur.push({date:a.date,mode:a.mode||'imported',n:a.n,pct:(a.pct!=null?a.pct:a.score),avgS:a.avgS,target:a.target,correct:a.correct});seen.add(a.date);n++;}});cur.sort((x,y)=>new Date(x.date)-new Date(y.date));try{localStorage.setItem(LS_KEY,JSON.stringify(cur.slice(-200)));}catch(e){}return{ok:true,msg:'Merged '+n+' attempt(s).'};}

  // ---------- NAV ----------
  const NAV=[
    {id:'home',label:'Home',ic:'H'},
    {id:'practice',label:'Practice',ic:'Q',sub:[
      {id:'quick',label:'Quick session'},{id:'examsim',label:'Exam simulation'},
      {id:'bydomain',label:'By domain'},{id:'flashcards',label:'Flashcards'}]},
    {id:'analytics',label:'Analytics',ic:'A'},
    {id:'profile',label:'Profile',ic:'P'},
  ];
  let active='home';
  function renderNav(){
    const h=loadHistory();const runs=h.length;const acc=runs?Math.round(h.reduce((s,a)=>s+(a.pct||0),0)/runs):0;
    sidebar.innerHTML=`<div class="navlabel">Navigation</div>`+
      NAV.map(n=>{
        const cur=(n.id===active||(n.sub&&n.sub.some(s=>s.id===active)));
        let html=`<button class="navitem" data-nav="${n.id}" aria-current="${n.id===active}"><span class="ic">${n.ic}</span>${n.label}</button>`;
        if(n.sub && cur) html+=`<div class="subnav">`+n.sub.map(s=>`<button data-nav="${s.id}" aria-current="${s.id===active}">${s.label}</button>`).join('')+`</div>`;
        return html;
      }).join('')+
      `<div class="navlabel" style="margin-top:14px">Your stats</div>
       <div class="ministat"><div class="m"><div class="v mono">${runs}</div><div class="k">Sessions</div></div>
       <div class="m"><div class="v mono">${acc}%</div><div class="k">Avg acc</div></div></div>`;
    sidebar.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{go(b.dataset.nav);drawer(false);});
  }
  function go(view){active=view;location.hash=view;renderNav();route(view);window.scrollTo(0,0);}
  function route(v){
    if(v==='home')return viewHome();
    if(v==='practice'||v==='quick')return viewQuick();
    if(v==='examsim')return viewExamSim();
    if(v==='bydomain')return viewByDomain();
    if(v==='flashcards')return viewFlashHome();
    if(v==='analytics')return viewAnalytics();
    if(v==='profile')return viewProfile();
    viewHome();
  }

  // ---------- HOME ----------
  function viewHome(){
    const h=loadHistory();const last=h[h.length-1];
    content.innerHTML=`
      <div class="viewhead"><h1>Welcome back, Neo</h1><p class="muted">${QUESTIONS.length} questions across 10 topic areas and three domains. Pick a mode to start.</p></div>
      <div class="startgrid" style="margin-bottom:18px">
        <div class="card startcard" data-go="quick"><h3>Quick session</h3><p>A short random set to warm up.</p></div>
        <div class="card startcard" data-go="examsim" style="border-left-color:var(--c-d)"><h3>Exam simulation</h3><p>Timed 150-item mock, blueprint-weighted.</p></div>
        <div class="card startcard" data-go="bydomain" style="border-left-color:var(--c-c)"><h3>By domain</h3><p>Target specific sections.</p></div>
        <div class="card startcard" data-go="flashcards" style="border-left-color:var(--c-b)"><h3>Flashcards</h3><p>Rapid recall on the high-yield numbers.</p></div>
      </div>
      ${last?`<div class="card panel"><h2>Last session</h2><div class="sub">${new Date(last.date).toLocaleString()}</div>
        <div class="tiles"><div class="card tile"><div class="k">Score</div><div class="v">${last.pct}%</div></div>
        <div class="card tile"><div class="k">Avg / question</div><div class="v">${last.avgS}s</div></div>
        <div class="card tile"><div class="k">Items</div><div class="v">${last.n}</div></div></div></div>`:''}`;
    content.querySelectorAll('[data-go]').forEach(c=>c.onclick=()=>go(c.dataset.go));
  }

  // ---------- config helpers ----------
  function paceField(def){return `<div class="field"><label for="paceIn">Pace target (seconds / question)</label>
      <div class="row"><input id="paceIn" type="number" min="15" max="300" value="${def||90}">
      <button class="chip" data-pace="90" type="button">90</button><button class="chip" data-pace="75" type="button">75</button><button class="chip" data-pace="60" type="button">60</button></div>
      <div class="hint">Questions slower than target — even correct ones — get flagged for review.</div></div>`;}
  function wirePace(){content.querySelectorAll('[data-pace]').forEach(c=>c.onclick=()=>{$('#paceIn').value=c.dataset.pace;});}
  function getPace(){return Math.max(15,Math.min(300,parseInt($('#paceIn').value)||90));}
  function fbField(){return `<div class="field"><label>Feedback</label><div class="chips" id="fbChips">
      <button class="chip" data-fb="exam" aria-pressed="true" type="button">Exam — reveal at end</button>
      <button class="chip" data-fb="study" aria-pressed="false" type="button">Study — reveal each</button></div></div>`;}

  function viewQuick(){
    active='quick';renderNav();
    content.innerHTML=`<div class="viewhead"><h1>Quick session</h1><p class="muted">A random set, answer order shuffled.</p></div>
      <div class="card panel" style="max-width:560px">
        <div class="field"><label>How many questions</label><div class="chips" id="cntChips">
          <button class="chip" data-cnt="15" aria-pressed="true" type="button">15</button>
          <button class="chip" data-cnt="30" aria-pressed="false" type="button">30</button>
          <button class="chip" data-cnt="50" aria-pressed="false" type="button">50</button></div></div>
        ${fbField()}${paceField(90)}
        <button class="btn" id="startBtn" type="button">Start</button>
      </div>`;
    let cnt=15,fb='exam';
    const pick=(sel,attr,cb)=>content.querySelectorAll(sel+' .chip').forEach(c=>c.onclick=()=>{content.querySelectorAll(sel+' .chip').forEach(x=>x.setAttribute('aria-pressed','false'));c.setAttribute('aria-pressed','true');cb(c.dataset[attr]);});
    pick('#cntChips','cnt',v=>cnt=+v);pick('#fbChips','fb',v=>fb=v);wirePace();
    $('#startBtn').onclick=()=>{const pool=shuffleGroups(QUESTIONS.slice()).slice(0,cnt);startQuiz({pool,fb,target:getPace(),mode:'quick'});};
  }

  function viewByDomain(){
    active='bydomain';renderNav();
    const chips=SECS.map(s=>`<button class="chip" data-sec="${s}" aria-pressed="false" type="button"><span class="secdot" style="background:var(--c-${s.toLowerCase()})"></span>${s} · ${SECNAME[s]}</button>`).join('');
    content.innerHTML=`<div class="viewhead"><h1>By domain</h1><p class="muted">Pick one or more topic areas.</p></div>
      <div class="card panel" style="max-width:640px"><div class="field"><label>Sections</label><div class="chips" id="secChips">${chips}</div></div>
      ${fbField()}${paceField(90)}<button class="btn" id="startBtn" type="button">Start</button></div>`;
    const chosen=new Set();let fb='exam';
    content.querySelectorAll('#secChips .chip').forEach(c=>c.onclick=()=>{const s=c.dataset.sec,on=c.getAttribute('aria-pressed')==='true';c.setAttribute('aria-pressed',String(!on));on?chosen.delete(s):chosen.add(s);});
    content.querySelectorAll('#fbChips .chip').forEach(c=>c.onclick=()=>{content.querySelectorAll('#fbChips .chip').forEach(x=>x.setAttribute('aria-pressed','false'));c.setAttribute('aria-pressed','true');fb=c.dataset.fb;});
    wirePace();
    $('#startBtn').onclick=()=>{const secs=chosen.size?chosen:new Set(SECS);const pool=shuffleGroups(QUESTIONS.filter(q=>secs.has(q.sec)));startQuiz({pool,fb,target:getPace(),mode:'bydomain'});};
  }

  function viewExamSim(){
    active='examsim';renderNav();
    content.innerHTML=`<div class="viewhead"><h1>Exam simulation</h1><p class="muted">The real conditions.</p></div>
      <div class="card panel" style="max-width:620px">
        <p>A <strong>150-item</strong> timed mock with a <strong>3 h 45 m</strong> countdown, sampled toward the real blueprint weighting (Domain 1 60% / Domain 2 15% / Domain 3 25%). No feedback until the end, then a score, per-domain breakdown, pace, and a readiness verdict.</p>
        <p class="hint">Note: the bank is Domain-1 heavy, so Domain 2 is thinner than 15% — the mix approximates the blueprint. The scaled-score figure is a rough estimate, not an official BPS score.</p>
        <div class="row" style="margin-top:14px"><button class="btn" id="startBtn" type="button">Begin 150-item mock</button>
        <button class="btn sec" id="startBtn2" type="button">Short mock (50)</button></div>
      </div>`;
    $('#startBtn').onclick=()=>startExam(150);
    $('#startBtn2').onclick=()=>startExam(50);
  }
  function buildExamPool(nTarget){
    const byDom={1:[],2:[],3:[]};QUESTIONS.forEach(q=>byDom[DOMAIN[q.sec]||1].push(q));
    const tg={1:Math.round(nTarget*0.6),2:Math.round(nTarget*0.15),3:Math.round(nTarget*0.25)};
    let pool=[];[1,2,3].forEach(d=>{pool=pool.concat(shuffle(byDom[d].slice()).slice(0,tg[d]));});
    if(pool.length<nTarget){const used=new Set(pool.map(q=>q.n));pool=pool.concat(shuffle(QUESTIONS.filter(q=>!used.has(q.n))).slice(0,nTarget-pool.length));}
    return shuffleGroups(pool).slice(0,nTarget);
  }
  function startExam(n){const pool=buildExamPool(n);const mins=n===150?225:75;startQuiz({pool,fb:'exam',target:90,mode:'examsim',exam:true,deadline:Date.now()+mins*60000});}

  // ---------- QUIZ ENGINE ----------
  let S=null;
  function startQuiz(cfg){S=Object.assign({idx:0,records:[],startTime:Date.now(),qStart:0,timer:null},cfg);renderQuestion();}
  function liveStats(){
    const recs=S.records;const correct=recs.filter(r=>r.correct).length;const wrong=recs.filter(r=>r.answer!=null&&!r.correct).length;const skip=recs.filter(r=>r.answer==null).length;const ans=correct+wrong;const acc=ans?Math.round(correct/ans*100):0;
    if(S.exam){
      const remain=S.deadline-Date.now();
      return `<div class="card panel"><div class="eyebrow">Time remaining</div><div class="timer-big ${remain<300000?'over':''}" id="examClock">${fmtH(remain)}</div></div>
      <div class="card panel"><div class="eyebrow" style="margin-bottom:10px">Progress</div><div class="statgrid">
        <div class="sbox accent"><div class="v">${S.idx+1}</div><div class="k">Current</div></div>
        <div class="sbox"><div class="v">${S.pool.length}</div><div class="k">Total</div></div>
        <div class="sbox"><div class="v">${recs.filter(r=>r.answer!=null).length}</div><div class="k">Answered</div></div>
        <div class="sbox"><div class="v">${skip}</div><div class="k">Skipped</div></div></div>
        <div class="progress"><i style="width:${S.idx/S.pool.length*100}%"></i></div></div>`;
    }
    return `<div class="card panel"><div class="eyebrow" style="margin-bottom:10px">Progress</div>
      <div class="progress" style="margin:0 0 12px"><i style="width:${S.idx/S.pool.length*100}%"></i></div>
      <div style="font-size:.85rem;color:var(--muted)">${S.idx+1} of ${S.pool.length}</div></div>
      <div class="card panel"><div class="eyebrow" style="margin-bottom:10px">Session stats</div><div class="statgrid">
        <div class="sbox good"><div class="v">${correct}</div><div class="k">Correct</div></div>
        <div class="sbox bad"><div class="v">${wrong}</div><div class="k">Wrong</div></div>
        <div class="sbox"><div class="v">${skip}</div><div class="k">Skipped</div></div>
        <div class="sbox accent"><div class="v">${acc}%</div><div class="k">Accuracy</div></div></div></div>`;
  }
  function renderQuestion(){
    const q=S.pool[S.idx];
    const keys=['A','B','C','D'].filter(k=>q.opts[k]!=null);
    const shuf=shuffle(keys.map(k=>({o:k,t:q.opts[k]})));const disp=['A','B','C','D'];
    S.curOpts={};S.curCorrect=null;shuf.forEach((o,i)=>{S.curOpts[disp[i]]=o.t;if(o.o===q.correct)S.curCorrect=disp[i];});
    content.classList.remove('wide');
    content.innerHTML=`<div class="viewhead"><h1>${S.exam?'Exam simulation':(S.mode==='bydomain'?'By domain':'Practice')}</h1></div>
      <div class="session"><div>
        <div class="card qcard">
          <div class="qtop"><span class="qnum">Question ${S.idx+1} of ${S.pool.length}</span><span class="qsrc">${esc(q.secName)}</span></div>
          ${q.scenario?`<div class="scenario"><span class="eyebrow">${esc(q.scenarioTitle||'Scenario')}</span><p>${rich(q.scenario)}</p></div>`:''}
          <div class="qmeta"><span class="tag sec-${q.sec}">${q.sec} · ${esc(q.secName)}</span><span class="tag">${esc(q.topic)}</span></div>
          <div class="stem">${rich(q.stem)}</div>
          <div class="opts" id="opts">${Object.keys(S.curOpts).map(k=>`<button class="opt" data-k="${k}" type="button"><span class="key">${k}</span><span>${rich(S.curOpts[k])}</span></button>`).join('')}</div>
          <div id="fbBox"></div>
          <div class="runfoot">
            <div class="row"><button class="btn sec" id="prevBtn" type="button" ${S.idx===0?'disabled':''}>Previous</button>
            <button class="btn sec" id="skipBtn" type="button">Skip</button></div>
            <button class="btn" id="nextBtn" type="button" disabled>${S.idx+1>=S.pool.length?'Finish':'Next'}</button>
          </div>
        </div></div>
        <aside class="panel-side" id="sidePanel">${liveStats()}</aside>
      </div>`;
    S.qStart=Date.now();S.answered=false;S.pendingAnswer=null;
    clearInterval(S.timer);
    S.timer=setInterval(()=>{ if(S.exam){const c=$('#examClock'); if(c){const r=S.deadline-Date.now();c.textContent=fmtH(r);c.classList.toggle('over',r<300000);if(r<=0){clearInterval(S.timer);advance(true);}}}},500);
    content.querySelectorAll('.opt').forEach(b=>b.onclick=()=>choose(b.dataset.k));
    $('#skipBtn').onclick=()=>{if(!S.answered)record(null);advance();};
    $('#nextBtn').onclick=()=>advance();
    $('#prevBtn').onclick=()=>{if(S.idx>0){S.records.pop();S.idx--;renderQuestion();}};
  }
  function refreshSide(){const sp=$('#sidePanel');if(sp)sp.innerHTML=liveStats();}
  function choose(k){
    const q=S.pool[S.idx];
    content.querySelectorAll('.opt').forEach(o=>o.setAttribute('aria-pressed',String(o.dataset.k===k)));
    if(S.fb==='study'){
      if(S.answered)return;
      const correct=k===S.curCorrect;record(k);
      content.querySelectorAll('.opt').forEach(o=>{o.disabled=true;if(o.dataset.k===S.curCorrect)o.classList.add('correct');if(o.dataset.k===k&&!correct)o.classList.add('wrong');});
      $('#fbBox').innerHTML=`<div class="feedback ${correct?'ok':'no'}"><strong>${correct?'Correct.':'Not quite — answer is '+S.curCorrect+'.'}</strong> ${rich(q.rationale)}</div>`;
      $('#nextBtn').disabled=false;refreshSide();
    } else {S.pendingAnswer=k;$('#nextBtn').disabled=false;}
  }
  function record(k){const q=S.pool[S.idx];S.records.push({n:q.n,sec:q.sec,secName:q.secName,topic:q.topic,stem:q.stem,opts:Object.assign({},S.curOpts),scenario:q.scenario||'',scenarioTitle:q.scenarioTitle||'',correctKey:S.curCorrect,rationale:q.rationale,answer:k,correct:k===S.curCorrect,timeMs:Date.now()-S.qStart});S.answered=true;}
  function advance(force){
    if(!S.answered){if(S.pendingAnswer)record(S.pendingAnswer);else if(force)record(null);else if(S.fb==='exam'&&S.pendingAnswer==null){/*require? allow skip*/record(null);}}
    S.idx++;
    if(S.idx>=S.pool.length||force&&S.idx>=S.pool.length){clearInterval(S.timer);return finish();}
    if(force&&S.exam&&Date.now()>=S.deadline){clearInterval(S.timer);return finish();}
    renderQuestion();
  }

  // ---------- RESULTS ----------
  function finish(){
    clearInterval(S.timer);
    const recs=S.records,totalMs=Date.now()-S.startTime;
    const answered=recs.filter(r=>r.answer!=null);const correct=recs.filter(r=>r.correct).length;
    const times=answered.map(r=>r.timeMs).sort((a,b)=>a-b);const median=times.length?times[Math.floor(times.length/2)]:0;
    const avg=answered.length?answered.reduce((s,r)=>s+r.timeMs,0)/answered.length:0;const avgS=avg/1000;
    const slowT=Math.max(S.target*1000,median*1.5);
    recs.forEach(r=>{r.slow=r.answer!=null&&r.timeMs>slowT;r.shaky=r.correct&&r.slow;});
    const pct=Math.round(correct/recs.length*100);const onPace=avgS<=S.target;
    const wrong=answered.filter(r=>!r.correct).length;const skip=recs.length-answered.length;
    const donut=(c,w,s)=>{const tot=c+w+s||1,C=2*Math.PI*54;let off=0,arcs='';[['var(--good)',c],['var(--bad)',w],['var(--warn)',s]].forEach(([col,val])=>{const len=val/tot*C;arcs+=`<circle cx="80" cy="80" r="54" fill="none" style="stroke:${col}" stroke-width="22" stroke-dasharray="${len.toFixed(2)} ${(C-len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 80 80)"></circle>`;off+=len;});return `<svg viewBox="0 0 160 160" width="180" height="180" role="img" aria-label="Performance breakdown: ${c} correct, ${w} incorrect, ${s} skipped"><circle cx="80" cy="80" r="54" fill="none" style="stroke:var(--surface-2)" stroke-width="22"></circle>${arcs}<text x="80" y="78" text-anchor="middle" style="fill:var(--fg);font-family:var(--mono);font-weight:600;font-size:26px">${Math.round(c/tot*100)}%</text><text x="80" y="98" text-anchor="middle" style="fill:var(--muted);font-size:10px;letter-spacing:1px">CORRECT</text></svg>`;};
    const bars=(c,w,s)=>{const data=[['Correct',c,'var(--good)'],['Incorrect',w,'var(--bad)'],['Skipped',s,'var(--warn)']],max=Math.max(1,c,w,s),W=300,H=190,pad=30,bw=54,gap=38,base=H-pad;let b='';data.forEach((d,i)=>{const x=pad+i*(bw+gap),h=(d[1]/max)*(base-24),y=base-h;b+=`<rect x="${x}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="4" style="fill:${d[2]}"></rect><text x="${x+bw/2}" y="${base+17}" text-anchor="middle" style="fill:var(--muted);font-size:11px">${d[0]}</text><text x="${x+bw/2}" y="${(y-7).toFixed(1)}" text-anchor="middle" style="fill:var(--fg);font-family:var(--mono);font-size:13px;font-weight:600">${d[1]}</text>`;});return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="200" role="img" aria-label="Answer distribution"><line x1="${pad}" y1="${base}" x2="${W-12}" y2="${base}" style="stroke:var(--line)"></line>${b}</svg>`;};
    const legend='<span class="chip" style="cursor:default"><span class="secdot" style="background:var(--good)"></span>Correct</span><span class="chip" style="cursor:default"><span class="secdot" style="background:var(--bad)"></span>Incorrect</span><span class="chip" style="cursor:default"><span class="secdot" style="background:var(--warn)"></span>Skipped</span>';
    // by section & domain
    const bySec={},byDom={1:{t:0,ok:0},2:{t:0,ok:0},3:{t:0,ok:0}};
    recs.forEach(r=>{(bySec[r.sec]=bySec[r.sec]||{tot:0,ok:0}).tot++;if(r.correct)bySec[r.sec].ok++;const d=DOMAIN[r.sec]||1;byDom[d].t++;if(r.correct)byDom[d].ok++;});
    const byTopic={};recs.forEach(r=>{const b=byTopic[r.topic]=byTopic[r.topic]||{wrong:0,shaky:0,t:0,ans:0};if(r.answer!=null){b.ans++;b.t+=r.timeMs;}if(r.answer!=null&&!r.correct)b.wrong++;if(r.shaky)b.shaky++;});
    const topics=Object.entries(byTopic).map(([k,v])=>({topic:k,...v,score:v.wrong*2+v.shaky,avg:v.ans?v.t/v.ans:0})).filter(t=>t.score>0).sort((a,b)=>b.score-a.score);
    const attempt={date:new Date().toISOString(),mode:S.mode,n:recs.length,pct,avgS:+avgS.toFixed(1),target:S.target,correct};saveAttempt(attempt);
    // readiness (rough)
    let band,vcls;if(pct>=75){band='On track to pass';vcls='good';}else if(pct>=68){band='Borderline — close';vcls='warn';}else{band='Not yet — keep drilling';vcls='bad';}
    const scaled=Math.round(300+pct*2.9); // rough, labeled
    active='analytics';renderNav();content.classList.add('wide');
    content.innerHTML=`<div class="viewhead" style="text-align:center"><h1>${S.exam?'Exam complete':'Quiz complete'}</h1><p class="muted">Review your performance and keep improving.</p></div>
      ${S.exam?`<div class="verdict ${vcls}" style="margin-bottom:16px">${band} · ${pct}% correct · rough scaled estimate ~${scaled} (passing ≈ 500; estimate only)</div>`:''}
      <div class="tiles" style="margin-bottom:14px">
        <div class="card tile ${pct>=75?'good':pct>=60?'warn':'bad'}"><div class="k">Final score</div><div class="v">${pct}%</div></div>
        <div class="card tile"><div class="k">Questions answered</div><div class="v">${answered.length}</div></div>
        <div class="card tile good"><div class="k">Correct</div><div class="v">${correct}</div></div>
        <div class="card tile bad"><div class="k">Incorrect</div><div class="v">${wrong}</div></div>
      </div>
      <div class="tiles" style="margin-bottom:18px">
        <div class="card tile ${onPace?'good':'bad'}"><div class="k">Avg / question</div><div class="v" style="font-size:1.25rem">${avgS.toFixed(0)}s</div><div class="s">target ${S.target}s</div></div>
        <div class="card tile"><div class="k">Total time</div><div class="v" style="font-size:1.25rem">${fmt(totalMs)}</div></div>
        <div class="card tile ${onPace?'good':'bad'}"><div class="k">Pace</div><div class="v" style="font-size:1.1rem">${onPace?'On pace':'Too slow'}</div><div class="s">150 ≈ ${fmtH(avgS*150*1000)}</div></div>
        <div class="card tile warn"><div class="k">Skipped</div><div class="v" style="font-size:1.25rem">${skip}</div></div>
      </div>
      <div class="grid2" style="margin-bottom:16px">
        <div class="card panel"><h2>Performance breakdown</h2><div style="display:flex;justify-content:center;padding:8px 0">${donut(correct,wrong,skip)}</div><div class="chips" style="justify-content:center">${legend}</div></div>
        <div class="card panel"><h2>Answer distribution</h2><div style="padding-top:6px">${bars(correct,wrong,skip)}</div></div>
      </div>
      <div class="grid2">
        <div class="card panel"><h2>By domain</h2><div class="sub">Weighted 60 / 15 / 25 on the real exam.</div>${[1,2,3].map(d=>{const b=byDom[d];if(!b.t)return '';const p=Math.round(b.ok/b.t*100);return `<div class="bar-row"><div class="bar-label">${DOMNAME[d]} <small>&nbsp;${b.ok}/${b.t}</small><div class="bar"><i style="width:${p}%;background:${p>=75?'var(--good)':p>=60?'var(--warn)':'var(--bad)'}"></i></div></div><div class="bar-val">${p}%</div></div>`;}).join('')}</div>
        <div class="card panel"><h2>By section</h2>${SECS.filter(s=>bySec[s]).map(s=>{const b=bySec[s];const p=Math.round(b.ok/b.tot*100);return `<div class="bar-row"><div class="bar-label"><span class="secdot" style="background:var(--c-${s.toLowerCase()})"></span>${s} · ${esc(SECNAME[s])} <small>&nbsp;${b.ok}/${b.tot}</small><div class="bar"><i style="width:${p}%;background:${p>=75?'var(--good)':p>=60?'var(--warn)':'var(--bad)'}"></i></div></div><div class="bar-val">${p}%</div></div>`;}).join('')}</div>
      </div>
      <div class="card panel" style="margin-top:16px"><h2>What to review first</h2><div class="sub">Each wrong counts double; each correct-but-slow counts once.</div>
        ${topics.length?topics.map((t,i)=>`<div class="review-item"><div class="pri" style="background:${i<2?'var(--bad)':i<4?'var(--warn)':'var(--slate)'}">${i+1}</div><div><div class="t">${esc(t.topic)} <span class="muted" style="font-weight:400">· ${t.wrong} wrong${t.shaky?', '+t.shaky+' slow':''}</span></div></div></div>`).join(''):'<p class="muted">Nothing flagged — clean run.</p>'}</div>
      <div class="card panel" style="margin-top:16px"><h2>Every question</h2>
        <div class="chips" id="fbar" style="margin-bottom:12px"><button class="chip" data-f="all" aria-pressed="true" type="button">All</button><button class="chip" data-f="wrong" aria-pressed="false" type="button">Wrong</button><button class="chip" data-f="shaky" aria-pressed="false" type="button">Slow-but-right</button></div>
        <div class="tbl-scroll"><table id="qt"><thead><tr><th>#</th><th>Sec</th><th>Topic</th><th>You</th><th>Key</th><th>Result</th><th>Time</th></tr></thead><tbody></tbody></table></div></div>
      <div class="row" style="margin-top:16px"><button class="btn" id="againBtn" type="button">New session</button>
        <button class="btn sec" id="drillBtn" type="button">Drill my weak questions →</button></div>`;
    const tb=$('#qt tbody');
    function draw(f){const rows=recs.filter(r=>f==='all'?true:f==='wrong'?(r.answer!=null&&!r.correct)||r.answer==null:r.shaky);
      tb.innerHTML=rows.map(r=>{const res=r.answer==null?'<span class="res no">skip</span>':r.correct?'<span class="res ok">✓</span>':'<span class="res no">✗</span>';return `<tr data-n="${r.n}"><td class="c">${r.n}</td><td class="c">${r.sec}</td><td>${esc(r.topic)}</td><td class="c">${r.answer||'—'}</td><td class="c">${r.correctKey}</td><td>${res}${r.slow?' <span class="flag">⚠</span>':''}</td><td class="c">${(r.timeMs/1000).toFixed(0)}s</td></tr><tr class="exp" data-exp="${r.n}" hidden><td colspan="7">${r.scenario?('<em>'+rich(r.scenario)+'</em><br>'):''}${rich(r.stem)}<br><strong>${r.correctKey}.</strong> ${rich(r.opts[r.correctKey]||'')} — ${rich(r.rationale)}</td></tr>`;}).join('');
      tb.querySelectorAll('tr[data-n]').forEach(tr=>tr.onclick=()=>{const ex=tb.querySelector('tr[data-exp="'+tr.dataset.n+'"]');if(ex)ex.hidden=!ex.hidden;});}
    draw('all');
    $('#fbar').querySelectorAll('.chip').forEach(c=>c.onclick=()=>{$('#fbar').querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed','false'));c.setAttribute('aria-pressed','true');draw(c.dataset.f);});
    $('#againBtn').onclick=()=>go('home');
    $('#drillBtn').onclick=()=>{const weak=recs.filter(r=>r.slow||r.answer==null||!r.correct).map(r=>QUESTIONS.find(q=>q.n===r.n)).filter(Boolean);if(!weak.length){return;}startQuiz({pool:shuffleGroups(weak.slice()),fb:'study',target:S.target,mode:'drill'});};
  }

  // ---------- FLASHCARDS ----------
  function viewFlashHome(){
    active='flashcards';renderNav();
    content.innerHTML=`<div class="viewhead"><h1>Flashcards</h1><p class="muted">Rapid recall on the high-yield numbers. Tap a card to flip, then rate yourself.</p></div>
      <div class="card panel" style="max-width:520px"><p>${FLASHCARDS.length} cards — BUDs, ACPH, ISO limits, action levels, pressures, sterilization, filters, access devices.</p>
      <button class="btn" id="startBtn" type="button">Start flashcards</button></div>`;
    $('#startBtn').onclick=()=>startFlash(shuffle(FLASHCARDS.map((c,i)=>({i,front:c[0],back:c[1]}))));
  }
  function startFlash(deck){
    let idx=0,flipped=false,known=[],review=[];
    content.classList.remove('wide');
    function render(){
      if(idx>=deck.length){
        content.innerHTML=`<div class="viewhead"><h1>Flashcards — done</h1></div>
          <div class="tiles" style="margin-bottom:16px"><div class="card tile good"><div class="k">Knew it</div><div class="v">${known.length}</div></div>
          <div class="card tile warn"><div class="k">To review</div><div class="v">${review.length}</div></div>
          <div class="card tile"><div class="k">Total</div><div class="v">${deck.length}</div></div></div>
          <div class="row">${review.length?'<button class="btn" id="revBtn" type="button">Review the '+review.length+' I missed</button>':''}
          <button class="btn sec" id="restartBtn" type="button">Shuffle & restart</button>
          <button class="btn ghost" id="homeBtn" type="button">Done</button></div>`;
        if(review.length)$('#revBtn').onclick=()=>startFlash(shuffle(review.slice()));
        $('#restartBtn').onclick=()=>startFlash(shuffle(FLASHCARDS.map((c,i)=>({i,front:c[0],back:c[1]}))));
        $('#homeBtn').onclick=()=>go('home');return;
      }
      const c=deck[idx];
      content.innerHTML=`<div class="viewhead"><h1>Flashcards</h1><p class="muted">Card ${idx+1} of ${deck.length}</p></div>
        <div class="progress" style="max-width:620px;margin:0 auto 16px"><i style="width:${idx/deck.length*100}%"></i></div>
        <div class="flash"><div class="flaptag">${flipped?'Answer':'Tap to reveal'}</div>
          <div class="flashinner" id="fcard">${flipped?`<div class="back">${esc(c.back)}<span class="sub">${esc(c.front)}</span></div>`:`<div class="front">${esc(c.front)}</div>`}</div>
          <div class="row" style="justify-content:center;margin-top:16px">${flipped?`<button class="btn sec" id="revCard" type="button">Review again</button><button class="btn" id="knowCard" type="button">Knew it ✓</button>`:`<button class="btn" id="flipBtn" type="button">Flip</button>`}</div>
        </div>`;
      $('#fcard').onclick=()=>{flipped=!flipped;render();};
      if(flipped){$('#knowCard').onclick=()=>{known.push(c);idx++;flipped=false;render();};$('#revCard').onclick=()=>{review.push(c);idx++;flipped=false;render();};}
      else $('#flipBtn').onclick=()=>{flipped=true;render();};
    }
    render();
  }

  // ---------- ANALYTICS ----------
  function viewAnalytics(){
    active='analytics';renderNav();content.classList.add('wide');
    const h=loadHistory();const all=h.slice().reverse();
    const modeLabel={quick:'Quick',examsim:'Exam sim',bydomain:'By domain',drill:'Drill',imported:'Imported'};
    const counts={};h.forEach(a=>counts[a.mode]=(counts[a.mode]||0)+1);
    content.innerHTML=`<div class="viewhead"><h1>Analytics</h1><p class="muted">Your attempts over time, saved in this browser.</p></div>
      <div class="card panel"><h2>Attempt history</h2>
        <div class="muted" style="font-size:.82rem;margin:4px 0 8px">Total runs: <strong>${h.length}</strong></div>
        <div class="chips" style="margin-bottom:14px">${Object.keys(counts).map(m=>`<span class="chip" style="cursor:default">${modeLabel[m]||m}: <strong>&nbsp;${counts[m]}</strong></span>`).join('')||'<span class="muted">No sessions yet.</span>'}</div>
        ${all.length?`<div class="hist-row" style="color:var(--faint);font-size:.7rem;text-transform:uppercase;letter-spacing:.05em"><span>When</span><span>Score</span><span>Avg</span><span>vs prev</span></div>`+all.map((a,i)=>{const prev=all[i+1];let tr='';if(prev){const dp=a.pct-prev.pct,dt=a.avgS-prev.avgS;tr=`<span class="trend ${dp>=0?'up':'down'}">${dp>=0?'▲':'▼'}${Math.abs(dp)}%</span> <span class="trend ${dt<=0?'up':'down'}">${dt<=0?'▼':'▲'}${Math.abs(dt).toFixed(0)}s</span>`;}const d=new Date(a.date);return `<div class="hist-row"><span>${d.toLocaleDateString()} ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} <span class="muted">· ${modeLabel[a.mode]||a.mode} · ${a.n}q</span></span><span class="mono">${a.pct}%</span><span class="mono">${a.avgS}s</span><span>${tr}</span></div>`;}).join(''):'<p class="muted">Finish a session and it appears here.</p>'}
      </div>`;
  }

  // ---------- PROFILE ----------
  function viewProfile(){
    active='profile';renderNav();
    content.innerHTML=`<div class="viewhead"><h1>Profile & settings</h1></div>
      <div class="grid2">
        <div class="card panel"><h2>Appearance</h2><div class="sub">The trainer defaults to the low-brightness dark theme.</div>
          <button class="btn sec" id="themeToggle" type="button">Toggle light / dark</button></div>
        <div class="card panel"><h2>Backup & restore</h2><div class="sub">History is stored in this browser only.</div>
          <div class="row" style="margin-bottom:10px"><button class="btn sec" id="exp" type="button">Copy history</button>
          <label class="btn sec" style="cursor:pointer">Import file<input id="impFile" type="file" accept=".json,application/json" hidden></label>
          <button class="btn ghost" id="clr" type="button">Clear history</button></div>
          <textarea id="area" readonly placeholder="Copied history appears here; select all to copy manually if the button is blocked."></textarea>
          <details style="margin-top:8px"><summary class="muted" style="cursor:pointer;font-size:.85rem">Paste a backup to restore</summary>
            <textarea id="imp" placeholder="Paste exported history JSON, then Merge."></textarea>
            <div class="row" style="margin-top:8px"><button class="btn sec" id="merge" type="button">Merge pasted</button><span id="msg" class="muted" style="align-self:center;font-size:.85rem"></span></div></details>
        </div>
      </div>`;
    $('#themeToggle').onclick=()=>$('#themeBtn').click();
    $('#exp').onclick=()=>{const t=JSON.stringify(loadHistory(),null,2);$('#area').value=t;$('#imp')&&($('#imp').value=t);if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).catch(()=>{});const b=$('#exp');b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy history',1500);};
    $('#clr').onclick=()=>{try{localStorage.removeItem(LS_KEY);}catch(e){}renderNav();viewProfile();};
    $('#merge').onclick=()=>{const r=mergeHistory($('#imp').value);$('#msg').textContent=r.msg;if(r.ok)renderNav();};
    $('#impFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const r=mergeHistory(rd.result);renderNav();const m=$('#msg');if(m)m.textContent=r.msg;};rd.readAsText(f);};
  }

  // boot
  const VIEWS=['home','quick','examsim','bydomain','flashcards','analytics','profile'];
  window.addEventListener('hashchange',()=>{const h=(location.hash||'').replace('#','');if(VIEWS.includes(h)&&h!==active){active=h;renderNav();route(h);window.scrollTo(0,0);}});
  renderNav();
  const hash=(location.hash||'').replace('#','');
  go(VIEWS.includes(hash)?hash:'home');
}

// Bootstrap: load questions.json then start the app.
fetch('questions.json').then(r=>r.json()).then(Q=>{ try{ initApp(Q); }catch(e){ document.getElementById('content').innerHTML='<p style="padding:24px;color:#bf7b6f">App failed to start: '+e.message+'</p>'; } }).catch(e=>{ document.getElementById('content').innerHTML='<p style="padding:24px;color:#bf7b6f">Could not load questions.json: '+e.message+'</p>'; });
