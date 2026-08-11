(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const state = { saved: new Set(loadJSON('opportunityos:saved', [])), savedOnly:false, profile:null };

  function loadJSON(key, fallback){ try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch { return fallback; } }
  function saveJSON(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function esc(v){ return String(v ?? '').replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c])); }
  function terms(v){ return String(v||'').toLowerCase().split(/[,;/]+/).map(s=>s.trim()).filter(Boolean); }
  function marketCode(v){ const x=String(v||'').trim().toLowerCase(); if(['uk','united kingdom','britain','great britain'].includes(x)) return 'UK'; if(['kr','korea','south korea','republic of korea'].includes(x)) return 'KR'; if(['eu','europe','european union'].includes(x)) return 'EU'; if(['global','worldwide','world'].includes(x)) return 'GLOBAL'; return x.toUpperCase(); }
  function daysUntil(date){ if(!date) return null; const t=Date.parse(date+'T23:59:59Z'); if(Number.isNaN(t)) return null; return Math.ceil((t-Date.now())/86400000); }
  function money(v){ const n=Math.abs(Number(v)||0); return '£'+n.toLocaleString('en-GB',{maximumFractionDigits:0}); }
  function fmtDate(v){ return v ? new Date(v).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : 'Not stated'; }

  function readProfile(){
    const max = Math.max(0, Number($('maxProject').value)||0);
    return { name:$('companyName').value.trim() || 'My Company', country:marketCode($('country').value), industries:terms($('industries').value), employees:$('employees').value, markets:terms($('markets').value).map(marketCode), maxProject:max };
  }

  function evidenceLabel(o){
    const grade=o.evidenceGrade||'C';
    const map={A:'A · Primary/official evidence',B:'B · Strong secondary evidence',C:'C · Demo/insufficiently verified',D:'D · Speculative'};
    return map[grade]||map.C;
  }

  function entryStage(o,m){
    if(o.demo || (o.confidence||0)<60) return {label:'VALIDATE FIRST',why:'Evidence is not strong enough for a direct commercial commitment.'};
    if(m.score>=85 && (o.confidence||0)>=80) return {label:'ATTRACTIVE',why:'High company fit and strong evidence.'};
    if(m.score>=70) return {label:'SELECTIVE',why:'Potentially attractive, but verification or execution risk remains.'};
    if(m.score<50) return {label:'AVOID / TOO WEAK',why:'Fit or eligibility is currently too weak.'};
    return {label:'EARLY',why:'Interesting signal, but not mature enough for priority investment.'};
  }

  function scoreOpportunity(o,p){
    let fit=35, reasons=[], risks=[];
    const overlap=o.industries.filter(i=>p.industries.some(pi=>pi.includes(i)||i.includes(pi)));
    fit += Math.min(30, overlap.length*10); if(overlap.length) reasons.push(`Industry fit: ${overlap.join(', ')}`); else risks.push('Low industry-keyword match');
    if(o.country==='GLOBAL'||o.country===p.country||p.markets.includes(o.country)){ fit+=15; reasons.push('Business location / target-market fit'); }
    else { fit-=10; risks.push('Market/location condition requires verification'); }
    if(o.foreign==='uk_only' && p.country!=='UK'){ fit=Math.min(fit,49); risks.push('Likely restricted to UK suppliers'); }
    if(o.foreign==='local_or_partner' && p.country!=='UK'){ fit=Math.min(fit,69); risks.push('Local delivery partner may be required'); }
    if(o.value>0 && p.maxProject && o.value>p.maxProject){ fit-=15; risks.push('Opportunity exceeds the company-defined maximum project size'); }
    const d=daysUntil(o.deadline); if(d!==null){ if(d<0){ fit=0; risks.push('Deadline passed'); } else if(d<=7){ fit+=5; reasons.push('Deadline is close'); } }
    if((o.unknown||[]).length>=2){ fit=Math.min(fit,89); risks.push('Multiple eligibility conditions remain unverified'); }
    if(o.demo){ fit=Math.min(fit,94); risks.push('DEMO DATA — do not act until an official notice is verified'); }
    fit=Math.max(0,Math.min(100,Math.round(fit)));

    const confidence=Math.max(0,Math.min(100,Number(o.confidence)||0));
    const decisionScore=Math.round(fit*0.7 + confidence*0.3);
    let action=o.action;
    if(o.demo && ['APPLY','CONTACT','PREPARE'].includes(action)) action='VALIDATE';
    else if(decisionScore<50 && !['MONITOR','AUTOMATE'].includes(action)) action='SKIP';
    else if(decisionScore<70 && action==='APPLY') action='REVIEW';
    return {score:decisionScore,fit,confidence,reasons,risks,action,days:d};
  }

  function analyse(){
    state.profile=readProfile(); saveJSON('opportunityos:profile',state.profile); $('profileState').textContent='Analysed'; $('profileState').classList.add('ok'); render();
  }

  function render(){
    const p=state.profile || readProfile();
    const rows=window.OPPORTUNITY_DATA.map(o=>({o, m:scoreOpportunity(o,p)})).filter(x=>x.m.score>0).sort((a,b)=>b.m.score-a.m.score);
    const shown=state.savedOnly?rows.filter(x=>state.saved.has(x.o.id)):rows;
    $('opportunityList').innerHTML=shown.map(card).join(''); $('emptyState').classList.toggle('hidden',shown.length!==0);
    const applies=rows.filter(x=>['APPLY','REVIEW'].includes(x.m.action)&&x.m.score>=70).length;
    $('applyCount').textContent=applies; $('contactCount').textContent=rows.filter(x=>x.m.action==='CONTACT').length; $('riskCount').textContent=rows.filter(x=>x.o.type==='risk').length;
    const saving=rows.filter(x=>x.o.type==='saving').reduce((s,x)=>s+Math.max(0,x.o.value),0); $('savingTotal').textContent=money(saving);
    const potential=rows.filter(x=>x.o.value>0&&!['risk','saving'].includes(x.o.type)&&x.m.score>=60&&!x.o.demo).reduce((s,x)=>s+x.o.value,0); $('totalValue').textContent=money(potential);
    bindCards();
  }

  function card({o,m}){
    const badge=['APPLY','CONTACT'].includes(m.action)?'good':m.action==='SKIP'?'bad':'warn';
    const d=m.days===null?'Open / not stated':m.days<0?'Closed':`${m.days} days left`;
    return `<article class="opp card" data-id="${esc(o.id)}"><div class="opp-top"><div><span class="type">${esc(o.type.toUpperCase())}</span><h4>${esc(o.title)}</h4><p>${esc(o.summary)}</p></div><div class="score"><strong>${m.score}</strong><span>/100</span></div></div><div class="meta"><span>${o.value<0?'Risk ':''}${money(o.value)}</span><span>${esc(d)}</span><span>${esc(o.country)}</span><span>Confidence ${m.confidence}%</span></div><div class="actions"><button class="action ${badge}" data-action="open">${esc(m.action)}</button><button class="ghost save" data-action="save">${state.saved.has(o.id)?'Saved':'Save'}</button></div></article>`;
  }

  function bindCards(){ document.querySelectorAll('.opp').forEach(el=>el.addEventListener('click',e=>{ const id=el.dataset.id; const action=e.target.dataset.action; if(action==='save'){ e.stopPropagation(); toggleSave(id); } else if(action==='open'||e.target===el||!action) openDetail(id); })); }
  function toggleSave(id){ state.saved.has(id)?state.saved.delete(id):state.saved.add(id); saveJSON('opportunityos:saved',[...state.saved]); render(); }
  function openDetail(id){
    const o=window.OPPORTUNITY_DATA.find(x=>x.id===id); if(!o) return; const m=scoreOpportunity(o,state.profile||readProfile()); const stage=entryStage(o,m);
    $('drawerContent').innerHTML=`<p class="eyebrow">${esc(m.action)}</p><h2>${esc(o.title)}</h2><div class="big-score">${m.score}/100</div><p><b>Decision score</b> = 70% company fit (${m.fit}) + 30% evidence confidence (${m.confidence}).</p><h3>FACT</h3><p>${esc(o.fact||'Not stated')}</p><h3>INTERPRETATION</h3><p>${esc(o.interpretation||'Not stated')}</p><h3>BUSINESS OPPORTUNITY</h3><p>${esc(o.opportunity||'Not stated')}</p><h3>Evidence quality</h3><p><b>${esc(evidenceLabel(o))}</b> · Confidence ${m.confidence}% · Last checked ${esc(fmtDate(o.checkedAt))}</p><h3>Entry-stage judgement</h3><p><b>${esc(stage.label)}</b> — ${esc(stage.why)}</p>${list('Matched factors',m.reasons)}${list('Uncertainty / risk',m.risks)}${list('Eligibility',o.eligibility)}${list('Unverified conditions',o.unknown)}${list('Documents / evidence needed',o.documents)}<div class="source-box"><strong>Source</strong><br>${esc(o.source)}${o.demo?'<br><b>DEMO: verify the official primary source before any commercial action.</b>':''}</div>${o.sourceUrl?`<a class="primary linkbtn" href="${esc(o.sourceUrl)}" target="_blank" rel="noopener">Open official / reference source</a>`:''}`;
    $('drawer').classList.remove('hidden');
  }
  function list(title,items){ if(!items||!items.length) return ''; return `<h3>${esc(title)}</h3><ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`; }

  function showReport(){
    const p=state.profile||readProfile(); const rows=window.OPPORTUNITY_DATA.map(o=>({o,m:scoreOpportunity(o,p)})).sort((a,b)=>b.m.score-a.m.score);
    const top=rows.slice(0,5); const verifiedPotential=top.filter(x=>x.o.value>0&&!['saving','risk'].includes(x.o.type)&&!x.o.demo&&x.m.confidence>=70).reduce((s,x)=>s+x.o.value,0);
    $('drawerContent').innerHTML=`<div class="report"><p class="eyebrow">£29 PRODUCT PREVIEW · DEMO</p><h2>Business Opportunity Intelligence Report</h2><p><b>${esc(p.name)}</b> · ${esc(p.country)} · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p><div class="report-value">${money(verifiedPotential)}<small>Verified potential value</small></div><h3>Executive decision</h3><p>Do not treat ranking as proof. First verify the strongest opportunity's primary source, eligibility and missing evidence. Demo items are excluded from verified value.</p><h3>Today's Top 5</h3>${top.map((x,i)=>`<div class="report-row"><b>#${i+1} ${esc(x.m.action)}</b><span>${esc(x.o.title)}</span><strong>${x.m.score}/100 · C${x.m.confidence}</strong></div>`).join('')}<h3>Evidence rule</h3><p>Every recommendation is separated into <b>Fact / Interpretation / Business Opportunity</b>. Primary-source evidence outranks news reports; unverified or demo items cannot trigger APPLY.</p><h3>Next actions</h3><ol><li>Open and verify the primary source</li><li>Confirm eligibility and foreign-participation rules</li><li>Collect missing documents and evidence</li><li>Estimate real execution cost and win probability</li><li>Make a Go / No-Go decision</li></ol><button class="primary full" onclick="window.print()">Print / save PDF</button><p class="tiny">DEMO PREVIEW — a paid report must include source URL, publisher, last-checked time, evidence grade, confidence, known unknowns and a clear separation between fact and forecast.</p></div>`;
    $('drawer').classList.remove('hidden');
  }

  $('analyseBtn').addEventListener('click',analyse); $('reportBtn').addEventListener('click',showReport); $('closeDrawer').addEventListener('click',()=> $('drawer').classList.add('hidden'));
  $('drawer').addEventListener('click',e=>{ if(e.target===$('drawer')) $('drawer').classList.add('hidden'); });
  $('savedOnly').addEventListener('click',()=>{ state.savedOnly=!state.savedOnly; $('savedOnly').textContent=state.savedOnly?'Show all':'Saved only'; render(); });
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.addEventListener('click',()=>{ if(b.dataset.tab==='report') showReport(); if(b.dataset.tab==='saved'){state.savedOnly=true;render();} if(b.dataset.tab==='home'){state.savedOnly=false;render();} }));
  const savedProfile=loadJSON('opportunityos:profile',null); if(savedProfile){ state.profile=savedProfile; $('companyName').value=savedProfile.name||''; $('country').value=savedProfile.country||'UK'; $('industries').value=(savedProfile.industries||[]).join(', '); $('markets').value=(savedProfile.markets||[]).join(', '); $('maxProject').value=savedProfile.maxProject||250000; $('profileState').textContent='Saved profile'; }
  if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{})); }
  render();
})();
