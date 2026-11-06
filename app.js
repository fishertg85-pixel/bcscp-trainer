function initApp(QUESTIONS){
  "use strict";
  const $ = (s,r=document)=>r.querySelector(s);
  const app = $('#app');
  const SECS = ['A','B','C','D','E','F','G','H','I','J'];
  const SECNAME = {};
  QUESTIONS.forEach(q=>SECNAME[q.sec]=q.secName);
  const LS_KEY = 'csp_trainer_history_v1';
  const fmt = ms=>{const s=Math.round(ms/1000);const m=Math.floor(s/60);return m+':'+String(s%60).padStart(2,'0');};
  const fmtS = ms=>(ms/1000).toFixed(0)+'s';

  // ---- theme ----
  function initTheme(){
    let t=null; try{t=localStorage.getItem('csp_theme');}catch(e){}
    document.documentElement.setAttribute('data-theme', t==='light'?'light':'dark');
    $('#themeBtn').onclick=()=>{
      const cur=document.documentElement.getAttribute('data-theme')||'dark';
      const next=cur==='light'?'dark':'light';
      document.documentElement.setAttribute('data-theme',next);
      try{localStorage.setItem('csp_theme',next);}catch(e){}
    };
  }

  // ---- state ----
  let S = null;

  // ---- config screen ----
  function configScreen(){
    const secChips = SECS.map(s=>`<button class="chip" data-sec="${s}" aria-pressed="false" type="button"><span class="secdot" style="background:var(--c-${s.toLowerCase()})"></span>${s} · ${SECNAME[s]}</button>`).join('');
    app.innerHTML = `
      <div class="card config">
        <div>
          <div class="eyebrow">Board Certified Sterile Compounding Pharmacist</div>
          <h1>Timed practice with fluency analytics</h1>
          <p class="muted" style="margin:.4rem 0 0">221 items — conditional-reasoning questions, NOT / EXCEPT and true-false formats, plus 10 multi-question clinical vignettes (the scenario stays pinned above each of its questions). Answer order shuffles every run. Real exam: 150 items in 3 h 45 m ≈ 90 s/item.</p>
        </div>
        <div class="field">
          <label>What to run</label>
          <div class="chips" id="modeChips">
            <button class="chip" data-mode="all" aria-pressed="true" type="button">Full set (221)</button>
            <button class="chip" data-mode="random30" aria-pressed="false" type="button">Random 30</button>
            <button class="chip" data-mode="sections" aria-pressed="false" type="button">Pick sections</button>
          </div>
        </div>
        <div class="field" id="secWrap" hidden>
          <label>Sections</label>
          <div class="chips" id="secChips">${secChips}</div>
        </div>
        <div class="field">
          <label>Feedback</label>
          <div class="chips" id="fbChips">
            <button class="chip" data-fb="exam" aria-pressed="true" type="button">Exam mode — reveal at end</button>
            <button class="chip" data-fb="study" aria-pressed="false" type="button">Study mode — reveal each</button>
          </div>
        </div>
        <div class="field">
          <label for="paceIn">Pace target (seconds / question)</label>
          <div class="pace-in">
            <input id="paceIn" class="mono" type="number" min="15" max="300" value="90">
            <button class="chip" data-pace="90" type="button">90 (exam)</button>
            <button class="chip" data-pace="75" type="button">75</button>
            <button class="chip" data-pace="60" type="button">60 (goal)</button>
          </div>
          <div class="hint">Questions slower than your target — even correct ones — get flagged for review.</div>
        </div>
        <div class="row">
          <button class="btn" id="startBtn" type="button">Start</button>
          <div class="spacer"></div>
          <button class="btn ghost" id="histBtn" type="button">Past attempts</button>
        </div>
      </div>
      <div id="histMount"></div>`;

    let mode='all', fb='exam', chosenSecs=new Set();
    const pick=(wrap,attr,cb)=>{wrap.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{
      wrap.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed','false'));
      c.setAttribute('aria-pressed','true'); cb(c.dataset[attr]);});};
    pick($('#modeChips'),'mode',v=>{mode=v;$('#secWrap').hidden=(v!=='sections');});
    pick($('#fbChips'),'fb',v=>{fb=v;});
    $('#secChips').querySelectorAll('.chip').forEach(c=>c.onclick=()=>{
      const s=c.dataset.sec,on=c.getAttribute('aria-pressed')==='true';
      c.setAttribute('aria-pressed',String(!on)); if(on)chosenSecs.delete(s);else chosenSecs.add(s);});
    $('#paceIn').parentElement.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{$('#paceIn').value=c.dataset.pace;});
    $('#histBtn').onclick=()=>renderHistory($('#histMount'),true);
    $('#startBtn').onclick=()=>{
      const target=Math.max(15,Math.min(300,parseInt($('#paceIn').value)||90));
      let pool=[];
      if(mode==='all') pool=QUESTIONS.slice();
      else if(mode==='random30') pool=shuffleGroups(QUESTIONS.slice()).slice(0,30);
      else { const secs=chosenSecs.size?chosenSecs:new Set(SECS); pool=shuffleGroups(QUESTIONS.filter(q=>secs.has(q.sec))); }
      startQuiz(pool,fb,target,mode);
    };
  }
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function shuffleGroups(items){
    const groups={},order=[];
    items.forEach(q=>{const k=q.scenarioId||('solo'+q.n); if(!groups[k]){groups[k]=[];order.push(k);} groups[k].push(q);});
    order.forEach(k=>groups[k].sort((a,b)=>a.n-b.n));
    const out=[]; shuffle(order.slice()).forEach(k=>groups[k].forEach(q=>out.push(q))); return out;
  }

  // ---- quiz runner ----
  function startQuiz(pool,fb,target,mode){
    S={pool,fb,target,mode,idx:0,records:[],startTime:Date.now(),qStart:0,totalTimer:null};
    renderQuestion();
  }
  function renderQuestion(){
    const q=S.pool[S.idx], nTot=S.pool.length, done=S.idx;
    const keys=['A','B','C','D'].filter(k=>q.opts[k]!=null);
    const shufOpts=shuffle(keys.map(k=>({orig:k,text:q.opts[k]})));
    const disp=['A','B','C','D'];
    S.curOpts={}; S.curCorrect=null;
    shufOpts.forEach((o,i)=>{S.curOpts[disp[i]]=o.text; if(o.orig===q.correct)S.curCorrect=disp[i];});
    app.innerHTML=`
      <div class="runbar">
        <div><span class="eyebrow">Question ${S.idx+1} / ${nTot}</span></div>
        <div class="timers">
          <div class="timer" id="qTimer"><div class="k">This question</div><div class="v mono">0s</div></div>
          <div class="timer"><div class="k">Elapsed</div><div class="v mono" id="totalV">0:00</div></div>
        </div>
      </div>
      <div class="progress"><i style="width:${(done/nTot*100)}%"></i></div>
      <div class="card qcard">
        ${q.scenario?`<div class="scenario"><span class="eyebrow">${esc(q.scenarioTitle||'Scenario')}</span><p>${rich(q.scenario)}</p></div>`:''}
        <div class="qmeta">
          <span class="tag sec-${q.sec}">${q.sec} · ${esc(q.secName)}</span>
          <span class="tag">${q.topic}</span>
        </div>
        <div class="stem">${rich(q.stem)}</div>
        <div class="opts" id="opts">
          ${Object.keys(S.curOpts).map(k=>`<button class="opt" data-k="${k}" type="button"><span class="key">${k}</span><span>${rich(S.curOpts[k])}</span></button>`).join('')}
        </div>
        <div id="fbBox"></div>
        <div class="runfoot">
          <button class="btn sec" id="skipBtn" type="button">Skip</button>
          <button class="btn" id="nextBtn" type="button" disabled>Next</button>
        </div>
      </div>`;
    S.qStart=Date.now(); S.answered=false;
    const qv=$('#qTimer .v');
    clearInterval(S.totalTimer);
    S.totalTimer=setInterval(()=>{
      const el=Date.now()-S.qStart;
      qv.textContent=fmtS(el);
      $('#qTimer').classList.toggle('over', el>S.target*1000);
      $('#totalV').textContent=fmt(Date.now()-S.startTime);
    },250);
    $('#opts').querySelectorAll('.opt').forEach(b=>b.onclick=()=>choose(b.dataset.k));
    $('#skipBtn').onclick=()=>{ if(!S.answered){record(null);} advance(); };
    $('#nextBtn').onclick=advance;
  }
  function choose(k){
    if(S.answered && S.fb==='study') return;
    const q=S.pool[S.idx];
    $('#opts').querySelectorAll('.opt').forEach(o=>o.setAttribute('aria-pressed', String(o.dataset.k===k)));
    if(S.fb==='study'){
      const correct=k===S.curCorrect;
      record(k);
      $('#opts').querySelectorAll('.opt').forEach(o=>{
        o.disabled=true;
        if(o.dataset.k===S.curCorrect)o.classList.add('correct');
        if(o.dataset.k===k && !correct)o.classList.add('wrong');
      });
      $('#fbBox').innerHTML=`<div class="feedback ${correct?'ok':'no'}"><strong>${correct?'Correct.':'Not quite — answer is '+S.curCorrect+'.'}</strong> ${rich(q.rationale)}</div>`;
      $('#nextBtn').disabled=false;
    } else {
      S.pendingAnswer=k; $('#nextBtn').disabled=false;
    }
  }
  function record(k){
    const q=S.pool[S.idx];
    S.records.push({n:q.n,sec:q.sec,secName:q.secName,topic:q.topic,stem:q.stem,opts:{...S.curOpts},
      scenario:q.scenario||'',scenarioTitle:q.scenarioTitle||'',
      correctKey:S.curCorrect,rationale:q.rationale,answer:k,correct:k===S.curCorrect,
      timeMs:Date.now()-S.qStart});
    S.answered=true;
  }
  function advance(){
    if(S.fb==='exam' && !S.answered){
      if(S.pendingAnswer){record(S.pendingAnswer);S.pendingAnswer=null;}
    }
    if(!S.answered){ // skipped with no selection handled in skip; safety
      if(S.pendingAnswer){record(S.pendingAnswer);S.pendingAnswer=null;}
    }
    S.idx++;
    if(S.idx>=S.pool.length){clearInterval(S.totalTimer);finish();}
    else renderQuestion();
  }

  // ---- analytics ----
  function finish(){
    const recs=S.records, totalMs=Date.now()-S.startTime;
    const answered=recs.filter(r=>r.answer!=null);
    const correct=recs.filter(r=>r.correct).length;
    const times=answered.map(r=>r.timeMs).sort((a,b)=>a-b);
    const median=times.length?times[Math.floor(times.length/2)]:0;
    const avg=answered.length?answered.reduce((s,r)=>s+r.timeMs,0)/answered.length:0;
    const slowThresh=Math.max(S.target*1000, median*1.5);
    recs.forEach(r=>{ r.slow = r.answer!=null && r.timeMs>slowThresh; r.shaky = r.correct && r.slow; });
    const pct=Math.round(correct/recs.length*100);
    const avgS=avg/1000, onPace=avgS<=S.target;
    const projFull=avgS*150; // seconds for a full 150-item exam at this pace

    // by section
    const bySec={};
    recs.forEach(r=>{(bySec[r.sec]=bySec[r.sec]||{sec:r.sec,name:r.secName,tot:0,ok:0,t:0,ans:0}); const b=bySec[r.sec];b.tot++; if(r.answer!=null){b.ans++;b.t+=r.timeMs;} if(r.correct)b.ok++;});
    // by topic (review priority)
    const byTopic={};
    recs.forEach(r=>{(byTopic[r.topic]=byTopic[r.topic]||{topic:r.topic,sec:r.sec,tot:0,wrong:0,shaky:0,t:0,ans:0}); const b=byTopic[r.topic];b.tot++; if(r.answer!=null){b.ans++;b.t+=r.timeMs;} if(r.answer!=null&&!r.correct)b.wrong++; if(r.shaky)b.shaky++;});
    const topics=Object.values(byTopic).map(t=>({...t,score:t.wrong*2+t.shaky, avg:t.ans?t.t/t.ans:0})).filter(t=>t.score>0).sort((a,b)=>b.score-a.score||b.avg-a.avg);

    const attempt={date:new Date().toISOString(),mode:S.mode,n:recs.length,pct,avgS:+avgS.toFixed(1),target:S.target,correct};
    saveAttempt(attempt);

    renderDashboard({recs,totalMs,correct,pct,avg,median,avgS,onPace,projFull,bySec,topics,answered});
  }

  function barColor(p){return p>=80?'var(--good)':p>=60?'var(--warn)':'var(--bad)';}
  function reviewHint(topic){
    const m={
      'Category from environment':'Re-run: environment sets the category ceiling (SCA=Cat1; cleanroom suite=Cat2/3).',
      'Category 2 BUD':'Drill Table 13 rows — the all-sterile vs nonsterile split, and tested vs not.',
      'Category 3 BUD':'Drill Table 14 — aseptic vs terminally sterilized, by storage temp.',
      'Category 1 BUD':'Fix: 12 h RT / 24 h fridge, no freezer tier.',
      'Particle count → ISO class':'A count meets a class if ≤ its limit; over-limit = fails its required class, never reclassify.',
      'ISO particle limits':'Memorize the 352 ladder: 352 / 3,520 / 35,200 / 352,000 / 3,520,000.',
      'ACPH requirements':'ISO 7 ≥30, ISO 8 ≥20, ≥15 from ceiling HVAC, SCA none.',
      'Pressure differentials':'0.020″ between classified areas; SCA none; HD buffer negative 0.01–0.03″.',
      'Endotoxin applicability':'Trigger = injectable + ≥1 nonsterile component. Cat3 required; Cat2 req if BUD needs sterility test.',
      'Biological indicators':'Steam = G. stearothermophilus; dry heat = B. atrophaeus; depyrogenation = endotoxin vials.',
      'Steam sterilization params':'20–60 min at 121°C/15 psi; temperature kills, pressure just raises steam temp.',
      'GFT action levels':'>0 cfu after garbing; >3 cfu after media-fill.',
      'Competency frequency':'Cat1/2 every 6 mo; Cat3 every 3 mo; oversight 12 mo; initial garbing 3× in a row.',
      'Air/surface sampling frequency':'Air: Cat1/2 q6mo, Cat3 monthly. Surface: Cat1/2 monthly, Cat3 weekly.',
      'Air/surface action levels':'Air: ISO5 >1,7 >10,8 >100. Surface: ISO5 >3,7 >5,8 >50.',
    };
    return m[topic]||'Review this concept in the study pack and re-test.';
  }

  function renderDashboard(d){
    const paceClass=d.onPace?'good':'bad';
    const tiles=[
      {k:'Score',v:d.pct+'%',s:d.correct+' / '+d.recs.length,cls:d.pct>=75?'good':d.pct>=60?'warn':'bad'},
      {k:'Avg / question',v:d.avgS.toFixed(0)+'s',s:'target '+S.target+'s',cls:paceClass},
      {k:'Total time',v:fmt(d.totalMs),s:d.recs.length+' items',cls:''},
      {k:'Pace',v:d.onPace?'On pace':'Too slow',s:'full exam ≈ '+fmt(d.projFull*1000),cls:paceClass},
    ];
    const secRows=SECS.filter(s=>d.bySec[s]).map(s=>{const b=d.bySec[s];const p=Math.round(b.ok/b.tot*100);const at=b.ans?(b.t/b.ans/1000):0;
      return `<div class="bar-row"><div class="bar-label">${b.sec} · ${esc(b.name)} <small>&nbsp;${b.ok}/${b.tot} · ${at.toFixed(0)}s avg</small><div class="bar"><i style="width:${p}%;background:${barColor(p)}"></i></div></div><div class="bar-val">${p}%</div></div>`;}).join('');
    const topicsHtml = d.topics.length ? d.topics.map((t,i)=>{
      const col=i<2?'var(--bad)':i<4?'var(--warn)':'var(--slate)';
      return `<div class="review-item"><div class="pri" style="background:${col}">${i+1}</div><div class="body"><div class="t">${esc(t.topic)} <span class="muted" style="font-weight:400">· ${t.wrong} wrong${t.shaky?', '+t.shaky+' slow-but-right':''}</span></div><div class="d">${esc(reviewHint(t.topic))}</div></div></div>`;
    }).join('') : `<p class="muted">Nothing flagged — clean run. Tighten pace next time.</p>`;

    app.innerHTML=`
      <div class="runbar"><h1>Results</h1><button class="btn sec" id="againBtn" type="button">New session</button></div>
      <div class="tiles">${tiles.map(t=>`<div class="card tile ${t.cls}"><div class="k">${t.k}</div><div class="v">${t.v}</div><div class="s">${t.s}</div></div>`).join('')}</div>

      <div class="card panel">
        <h2>What to review first</h2>
        <div class="sub">Ranked by impact: each wrong answer counts double, each correct-but-slow answer counts once. Slow-but-right means the concept isn't automatic yet.</div>
        ${topicsHtml}
      </div>

      <div class="card panel">
        <h2>By section</h2>
        <div class="sub">Accuracy and average time per section.</div>
        ${secRows}
      </div>

      <div class="card panel">
        <h2>Every question</h2>
        <div class="filterbar" id="filterBar">
          <button class="chip" data-f="all" aria-pressed="true" type="button">All</button>
          <button class="chip" data-f="wrong" aria-pressed="false" type="button">Wrong</button>
          <button class="chip" data-f="shaky" aria-pressed="false" type="button">Slow-but-right</button>
          <button class="chip" data-f="slow" aria-pressed="false" type="button">All slow</button>
        </div>
        <div class="tbl-scroll"><table id="qtable"><thead><tr><th>#</th><th>Sec</th><th>Topic</th><th>You</th><th>Key</th><th>Result</th><th>Time</th></tr></thead><tbody></tbody></table></div>
      </div>

      <div class="card panel">
        <h2>Attempt history</h2>
        <div class="sub">Saved in this browser so you can watch pace and accuracy improve.</div>
        <div id="histMount2"></div>
      </div>

      <div class="card panel">
        <h2>Export data</h2>
        <div class="sub">Copy your results to keep a record outside the app.</div>
        <div class="row" style="margin-bottom:10px">
          <button class="btn sec" id="csvBtn" type="button">Copy CSV</button>
          <button class="btn sec" id="jsonBtn" type="button">Copy JSON</button>
          <button class="btn ghost" id="drillBtn" type="button">Drill my weak questions →</button>
        </div>
        <textarea id="exportArea" readonly placeholder="Copied data appears here — select all to copy manually if the button is blocked."></textarea>
      </div>`;

    $('#againBtn').onclick=configScreen;
    // table
    const tbody=$('#qtable tbody');
    function drawTable(filter){
      const rows=d.recs.filter(r=> filter==='all'?true: filter==='wrong'?(r.answer!=null&&!r.correct)||r.answer==null : filter==='shaky'?r.shaky : r.slow);
      tbody.innerHTML=rows.map(r=>{
        const res=r.answer==null?'<span class="res no">skip</span>':r.correct?'<span class="res ok">✓</span>':'<span class="res no">✗</span>';
        const flag=r.slow?' <span class="flag" title="slower than target">⚠</span>':'';
        return `<tr data-n="${r.n}"><td class="c">${r.n}</td><td class="c">${r.sec}</td><td>${esc(r.topic)}</td><td class="c">${r.answer||'—'}</td><td class="c">${r.correctKey}</td><td>${res}${flag}</td><td class="c">${(r.timeMs/1000).toFixed(0)}s</td></tr>`+
          `<tr class="exp" data-exp="${r.n}" hidden><td colspan="7">${r.scenario?('<em>'+rich(r.scenario)+'</em><br>'):''}${rich(r.stem)}<br><strong>${r.correctKey}.</strong> ${rich(r.opts[r.correctKey]||'')} — ${rich(r.rationale)}</td></tr>`;
      }).join('');
      tbody.querySelectorAll('tr[data-n]').forEach(tr=>tr.onclick=()=>{const ex=tbody.querySelector('tr[data-exp="'+tr.dataset.n+'"]');if(ex)ex.hidden=!ex.hidden;});
    }
    drawTable('all');
    $('#filterBar').querySelectorAll('.chip').forEach(c=>c.onclick=()=>{$('#filterBar').querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed','false'));c.setAttribute('aria-pressed','true');drawTable(c.dataset.f);});

    renderHistory($('#histMount2'),false);

    // export
    const csv=()=>{const head='n,section,topic,your_answer,correct,result,time_s\n';
      return head+d.recs.map(r=>[r.n,r.sec,'"'+r.topic+'"',r.answer||'',r.correctKey,r.answer==null?'skip':(r.correct?'correct':'wrong'),(r.timeMs/1000).toFixed(1)].join(',')).join('\n');};
    const jsonOut=()=>JSON.stringify({date:new Date().toISOString(),score:d.pct,avgS:+d.avgS.toFixed(1),target:S.target,records:d.recs.map(r=>({n:r.n,sec:r.sec,topic:r.topic,answer:r.answer,correct:r.correct,timeMs:r.timeMs}))},null,2);
    const copy=(txt)=>{$('#exportArea').value=txt;const t=$('#exportArea');t.focus();t.select();
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).catch(()=>{});}};
    $('#csvBtn').onclick=()=>copy(csv());
    $('#jsonBtn').onclick=()=>copy(jsonOut());
    $('#drillBtn').onclick=()=>{const weak=d.recs.filter(r=>r.slow||r.answer==null||!r.correct).map(r=>QUESTIONS.find(q=>q.n===r.n)).filter(Boolean);
      if(!weak.length){alert&&0;$('#exportArea').value='No weak questions — nothing to drill.';return;}
      startQuiz(shuffle(weak.slice()),'study',S.target,'drill');};
  }

  // ---- history (localStorage) ----
  function loadHistory(){try{return JSON.parse(localStorage.getItem(LS_KEY)||'[]');}catch(e){return [];}}
  function saveAttempt(a){try{const h=loadHistory();h.push(a);localStorage.setItem(LS_KEY,JSON.stringify(h.slice(-200)));}catch(e){}}
  function mergeHistory(text){
    let inc; try{inc=JSON.parse(text);}catch(e){return {ok:false,msg:'Not valid JSON.'};}
    const arr = Array.isArray(inc) ? inc : (inc.history || [inc]);
    const cur = loadHistory(); const seen=new Set(cur.map(a=>a.date)); let added=0;
    arr.forEach(a=>{ if(a && a.date && !seen.has(a.date)){
      cur.push({date:a.date,mode:a.mode||'imported',n:a.n||(a.records?a.records.length:0),
        pct:(a.pct!=null?a.pct:a.score),avgS:a.avgS,target:a.target,correct:a.correct});
      seen.add(a.date); added++; }});
    cur.sort((x,y)=>new Date(x.date)-new Date(y.date));
    try{localStorage.setItem(LS_KEY,JSON.stringify(cur.slice(-200)));}catch(e){return {ok:false,msg:'Could not save to this browser.'};}
    return {ok:true,msg:'Merged '+added+' attempt(s).'};
  }
  function renderHistory(mount,standalone){
    const h=loadHistory().slice().reverse();
    if(!mount) return;
    if(!h.length){mount.innerHTML=`<div class="${standalone?'card panel':''}"><p class="muted" style="margin:0">No saved attempts yet. Finish a session and it'll be recorded here.</p>${standalone?'<div class="row" style="margin-top:10px"><button class="btn sec" id="backCfg" type="button">Back</button></div>':''}</div>`;
      if(standalone)$('#backCfg').onclick=configScreen;return;}
    const rows=h.map((a,i)=>{
      const prev=h[i+1];
      let trend='';
      if(prev){const dp=a.pct-prev.pct;const dt=a.avgS-prev.avgS;
        trend=`<span class="trend ${dp>=0?'up':'down'}">${dp>=0?'▲':'▼'}${Math.abs(dp)}%</span> <span class="trend ${dt<=0?'up':'down'}" title="avg time change">${dt<=0?'▼':'▲'}${Math.abs(dt).toFixed(0)}s</span>`;}
      const dt=new Date(a.date);
      return `<div class="hist-row"><span>${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} <span class="muted">· ${a.mode} · ${a.n}q</span></span><span class="mono">${a.pct}%</span><span class="mono">${a.avgS}s</span><span>${trend}</span></div>`;
    }).join('');
    const all=loadHistory();
    const modeLabel={all:'Full set',random30:'Random 30',sections:'Sections',drill:'Weak-question drill'};
    const counts={}; all.forEach(a=>counts[a.mode]=(counts[a.mode]||0)+1);
    const countsHtml=Object.keys(counts).map(m=>`<span class="chip" style="cursor:default">${modeLabel[m]||m}: <strong>&nbsp;${counts[m]}</strong></span>`).join('');
    mount.innerHTML=`<div class="${standalone?'card panel':''}">${standalone?'<h2>Past attempts</h2>':''}<div class="muted" style="font-size:.82rem;margin-bottom:8px">Total runs: <strong>${all.length}</strong></div><div class="chips" style="margin-bottom:14px">${countsHtml}</div><div class="hist-row" style="color:var(--faint);font-size:.72rem;text-transform:uppercase;letter-spacing:.05em"><span>When</span><span>Score</span><span>Avg</span><span>vs prev</span></div>${rows}${standalone?`<div class="row" style="margin-top:14px"><button class="btn sec" id="backCfg" type="button">Back</button><button class="btn sec" id="expHist" type="button">Copy history</button><label class="btn sec" style="cursor:pointer">Import file<input id="impFile" type="file" accept=".json,application/json" hidden></label><button class="btn ghost" id="clrHist" type="button">Clear</button></div><details style="margin-top:10px"><summary class="muted" style="cursor:pointer;font-size:.85rem">Paste a backup to restore</summary><textarea id="impPaste" placeholder="Paste exported history JSON here, then Merge."></textarea><div class="row" style="margin-top:8px"><button class="btn sec" id="mergeBtn" type="button">Merge pasted</button><span id="impMsg" class="muted" style="align-self:center;font-size:.85rem"></span></div></details>`:''}</div>`;
    if(standalone){
      $('#backCfg').onclick=configScreen;
      $('#clrHist').onclick=()=>{try{localStorage.removeItem(LS_KEY);}catch(e){}renderHistory(mount,true);};
      const exp=$('#expHist'); if(exp)exp.onclick=()=>{const t=JSON.stringify(loadHistory(),null,2);const area=$('#impPaste');if(area)area.value=t;if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).catch(()=>{});exp.textContent='Copied ✓';setTimeout(()=>{exp.textContent='Copy history';},1500);};
      const mb=$('#mergeBtn'); if(mb)mb.onclick=()=>{const r=mergeHistory($('#impPaste').value);if(r.ok){renderHistory(mount,true);}else{$('#impMsg').textContent=r.msg;}};
      const f=$('#impFile'); if(f)f.onchange=e=>{const file=e.target.files[0];if(!file)return;const rd=new FileReader();rd.onload=()=>{mergeHistory(rd.result);renderHistory(mount,true);};rd.readAsText(file);};
    }
  }

  function esc(s){return String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
  function rich(s){return esc(s).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');}

  initTheme();
  configScreen();
}

(function(){
  if (window.QUESTIONS) return initApp(window.QUESTIONS);
  fetch('questions.json').then(function(r){if(!r.ok)throw 0;return r.json();}).then(initApp)
    .catch(function(){var a=document.getElementById('app'); if(a)a.innerHTML='<p style="padding:20px">Could not load questions.json — serve over http.</p>';});
})();
