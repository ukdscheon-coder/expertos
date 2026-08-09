(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const state = { saved: new Set(loadJSON('opportunityos:saved', [])), savedOnly:false, profile:null };

  function loadJSON(key, fallback){ try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch { return fallback; } }
  function saveJSON(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function terms(v){ return String(v||'').toLowerCase().split(/[,;/]+/).map(s=>s.trim()).filter(Boolean); }
  function marketCode(v){ const x=String(v||'').trim().toLowerCase(); if(['uk','united kingdom','britain','great britain'].includes(x)) return 'UK'; if(['kr','korea','south korea','republic of korea'].includes(x)) return 'KR'; if(['eu','europe','european union'].includes(x)) return 'EU'; if(['global','worldwide','world'].includes(x)) return 'GLOBAL'; return x.toUpperCase(); }
  function daysUntil(date){ if(!date) return null; const t=Date.parse(date+'T23:59:59Z'); if(Number.isNaN(t)) return null; return Math.ceil((t-Date.now())/86400000); }
  function money(v){ const n=Math.abs(Number(v)||0); return '£'+n.toLocaleString('en-GB',{maximumFractionDigits:0}); }

  function readProfile(){
    const max = Math.max(0, Number($('maxProject').value)||0);
    return { name:$('companyName').value.trim() || 'My Company', country:$('country').value, industries:terms($('industries').value), employees:$('employees').value, markets:terms($('markets').value), maxProject:max };
  }

  function scoreOpportunity(o,p){
    let score=35, reasons=[], risks=[];
    const overlap=o.industries.filter(i=>p.industries.some(pi=>pi.includes(i)||i.includes(pi)));
    score += Math.min(30, overlap.length*10); if(overlap.length) reasons.push(`산업 적합: ${overlap.join(', ')}`); else risks.push('산업 키워드 일치가 낮음');
    if(o.country==='GLOBAL'||o.country===p.country||p.markets.some(m=>marketCode(m)===o.country)){ score+=15; reasons.push('지역/시장 조건 적합'); }
    else { score-=10; risks.push('지역 조건 추가 확인 필요'); }
    if(o.foreign==='uk_only' && p.country!=='UK'){ score=Math.min(score,49); risks.push('UK 전용 가능성'); }
    if(o.foreign==='local_or_partner' && p.country!=='UK'){ score=Math.min(score,69); risks.push('현지 파트너 필요 가능성'); }
    if(o.value>0 && p.maxProject && o.value>p.maxProject){ score-=15; risks.push('회사 설정 최대 프로젝트 규모 초과'); }
    const d=daysUntil(o.deadline); if(d!==null){ if(d<0){ score=0; risks.push('마감됨'); } else if(d<=7){ score+=5; reasons.push('마감 임박'); } }
    if((o.unknown||[]).length>=2){ score=Math.min(score,89); risks.push('미확인 자격조건 존재'); }
    if(o.demo){ score=Math.min(score,94); risks.push('데모 데이터 — 실제 원문 검증 전 신청 금지'); }
    score=Math.max(0,Math.min(100,Math.round(score)));
    let action=o.action;
    if(score<50 && !['MONITOR','AUTOMATE'].includes(action)) action='SKIP';
    else if(score<70 && action==='APPLY') action='REVIEW';
    return {score,reasons,risks,action,days:d};
  }

  function analyse(){
    state.profile=readProfile(); saveJSON('opportunityos:profile',state.profile); $('profileState').textContent='분석 완료'; $('profileState').classList.add('ok'); render();
  }

  function render(){
    const p=state.profile || readProfile();
    const rows=window.OPPORTUNITY_DATA.map(o=>({o, m:scoreOpportunity(o,p)})).filter(x=>x.m.score>0).sort((a,b)=>b.m.score-a.m.score);
    const shown=state.savedOnly?rows.filter(x=>state.saved.has(x.o.id)):rows;
    $('opportunityList').innerHTML=shown.map(card).join(''); $('emptyState').classList.toggle('hidden',shown.length!==0);
    const applies=rows.filter(x=>['APPLY','REVIEW'].includes(x.m.action)&&x.m.score>=70).length;
    $('applyCount').textContent=applies; $('contactCount').textContent=rows.filter(x=>x.m.action==='CONTACT').length; $('riskCount').textContent=rows.filter(x=>x.o.type==='risk').length;
    const saving=rows.filter(x=>x.o.type==='saving').reduce((s,x)=>s+Math.max(0,x.o.value),0); $('savingTotal').textContent=money(saving);
    const potential=rows.filter(x=>x.o.value>0&&!['risk','saving'].includes(x.o.type)&&x.m.score>=60).reduce((s,x)=>s+x.o.value,0); $('totalValue').textContent=money(potential);
    bindCards();
  }

  function card({o,m}){
    const badge=m.action==='APPLY'?'good':m.action==='SKIP'?'bad':'warn';
    const d=m.days===null?'상시/미정':m.days<0?'마감':`${m.days}일 남음`;
    return `<article class="opp card" data-id="${esc(o.id)}"><div class="opp-top"><div><span class="type">${esc(o.type.toUpperCase())}</span><h4>${esc(o.title)}</h4><p>${esc(o.summary)}</p></div><div class="score"><strong>${m.score}</strong><span>/100</span></div></div><div class="meta"><span>${o.value<0?'Risk ':''}${money(o.value)}</span><span>${esc(d)}</span><span>${esc(o.country)}</span></div><div class="actions"><button class="action ${badge}" data-action="open">${esc(m.action)}</button><button class="ghost save" data-action="save">${state.saved.has(o.id)?'저장됨':'저장'}</button></div></article>`;
  }

  function bindCards(){ document.querySelectorAll('.opp').forEach(el=>el.addEventListener('click',e=>{ const id=el.dataset.id; const action=e.target.dataset.action; if(action==='save'){ e.stopPropagation(); toggleSave(id); } else if(action==='open'||e.target===el||!action) openDetail(id); })); }
  function toggleSave(id){ state.saved.has(id)?state.saved.delete(id):state.saved.add(id); saveJSON('opportunityos:saved',[...state.saved]); render(); }
  function openDetail(id){
    const o=window.OPPORTUNITY_DATA.find(x=>x.id===id); if(!o) return; const m=scoreOpportunity(o,state.profile||readProfile());
    $('drawerContent').innerHTML=`<p class="eyebrow">${esc(m.action)}</p><h2>${esc(o.title)}</h2><div class="big-score">${m.score}/100</div><h3>왜 이 점수인가?</h3>${list('확인된 적합 요인',m.reasons)}${list('불확실성·위험',m.risks)}${list('자격조건',o.eligibility)}${list('미확인 조건',o.unknown)}${list('준비서류',o.documents)}<div class="source-box"><strong>Source</strong><br>${esc(o.source)}${o.demo?'<br><b>DEMO: 실제 신청 전 공식 원문 검증 필수</b>':''}</div>${o.sourceUrl?`<a class="primary linkbtn" href="${esc(o.sourceUrl)}" target="_blank" rel="noopener">공식/참고 출처 열기</a>`:''}`;
    $('drawer').classList.remove('hidden');
  }
  function list(title,items){ if(!items||!items.length) return ''; return `<h3>${esc(title)}</h3><ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`; }

  function showReport(){
    const p=state.profile||readProfile(); const rows=window.OPPORTUNITY_DATA.map(o=>({o,m:scoreOpportunity(o,p)})).sort((a,b)=>b.m.score-a.m.score);
    const top=rows.slice(0,5); const potential=top.filter(x=>x.o.value>0&&!['saving','risk'].includes(x.o.type)).reduce((s,x)=>s+x.o.value,0);
    $('drawerContent').innerHTML=`<div class="report"><p class="eyebrow">£29 PRODUCT PREVIEW · DEMO</p><h2>Business Opportunity Intelligence Report</h2><p><b>${esc(p.name)}</b> · ${esc(p.country)} · ${new Date().toLocaleDateString('ko-KR')}</p><div class="report-value">${money(potential)}<small>Top 5 potential value</small></div><h3>Executive Decision</h3><p>오늘은 검색보다 <b>상위 2개 기회의 자격조건 검증</b>과 <b>1개 파트너 접촉</b>이 우선입니다. 모든 데이터는 데모이므로 실제 판매본에서는 공식 출처와 원문 근거를 포함합니다.</p><h3>Today's Top 5</h3>${top.map((x,i)=>`<div class="report-row"><b>#${i+1} ${esc(x.m.action)}</b><span>${esc(x.o.title)}</span><strong>${x.m.score}/100</strong></div>`).join('')}<h3>Risk & Cost</h3><p>해상운임·보험 위험은 실제 발주계약을 입력하면 연간 비용 영향으로 계산합니다.</p><h3>Next Actions</h3><ol><li>Top opportunity 원문 자격조건 검증</li><li>필수서류 누락 확인</li><li>현지 파트너 필요 여부 확인</li><li>Go / No-Go 결정</li><li>승인 후 AI 초안 생성</li></ol><button class="primary full" onclick="window.print()">인쇄 / PDF 저장</button><p class="tiny">DEMO PREVIEW — 실제 고객 보고서에서는 공식 URL, 발행기관, 확인 시각, 사실/추정 구분을 포함합니다.</p></div>`;
    $('drawer').classList.remove('hidden');
  }

  $('analyseBtn').addEventListener('click',analyse); $('reportBtn').addEventListener('click',showReport); $('closeDrawer').addEventListener('click',()=> $('drawer').classList.add('hidden'));
  $('drawer').addEventListener('click',e=>{ if(e.target===$('drawer')) $('drawer').classList.add('hidden'); });
  $('savedOnly').addEventListener('click',()=>{ state.savedOnly=!state.savedOnly; $('savedOnly').textContent=state.savedOnly?'전체 보기':'저장만 보기'; render(); });
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.addEventListener('click',()=>{ if(b.dataset.tab==='report') showReport(); if(b.dataset.tab==='saved'){state.savedOnly=true;render();} if(b.dataset.tab==='home'){state.savedOnly=false;render();} }));
  const savedProfile=loadJSON('opportunityos:profile',null); if(savedProfile){ state.profile=savedProfile; $('companyName').value=savedProfile.name||''; $('country').value=savedProfile.country||'UK'; $('industries').value=(savedProfile.industries||[]).join(', '); $('markets').value=(savedProfile.markets||[]).join(', '); $('maxProject').value=savedProfile.maxProject||250000; $('profileState').textContent='저장된 프로필'; }
  if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{})); }
  render();
})();
