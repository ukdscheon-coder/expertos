const $=id=>document.getElementById(id);
const API_BASE=((window.EXPERTOS_CONFIG&&window.EXPERTOS_CONFIG.apiUrl)||'').replace(/\/answer\/?$/,'').replace(/\/$/,'');
const SAMPLE=[
{id:'sample-1',title:'2026년 중소기업 수출지원 사업 참여기업 모집',agency:'중소벤처기업부',operator:'중소벤처기업진흥공단',category:'수출',region:'전국',period:'2026-08-01 ~ 2026-08-31',deadline:'2026-08-31',summary:'해외시장 진출을 준비하는 중소기업을 대상으로 수출 마케팅과 현지화 비용을 지원합니다.',target:'수출을 준비하거나 진행 중인 중소기업',method:'온라인 신청',contact:'기업마당 공고문 확인',url:'https://www.bizinfo.go.kr'},
{id:'sample-2',title:'서울시 초기창업기업 사업화 지원 모집',agency:'서울특별시',operator:'서울경제진흥원',category:'창업',region:'서울',period:'2026-08-03 ~ 2026-08-14',deadline:'2026-08-14',summary:'서울 소재 초기창업기업의 제품 검증, 마케팅 및 판로개척 비용을 지원합니다.',target:'서울 소재 업력 3년 이내 기업',method:'온라인 접수',contact:'공고문 확인',url:'https://www.bizinfo.go.kr'},
{id:'sample-3',title:'AI·디지털 전환 기술개발 지원사업',agency:'산업통상자원부',operator:'한국산업기술진흥원',category:'기술',region:'전국',period:'2026-07-28 ~ 2026-09-05',deadline:'2026-09-05',summary:'중소·중견기업의 AI 도입과 디지털 전환을 위한 기술개발 및 실증을 지원합니다.',target:'국내 중소·중견기업 및 컨소시엄',method:'전산 접수',contact:'공고문 확인',url:'https://www.bizinfo.go.kr'}
];
let notices=[],tab='all';
const saved=new Set(JSON.parse(localStorage.getItem('funding-saved')||'[]'));

function daysLeft(date){if(!date)return 9999;const d=new Date(`${date}T23:59:59`);return Math.ceil((d-Date.now())/86400000)}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function normalise(item,i){return{id:String(item.id||item.pblancId||item.noticeId||`item-${i}`),title:item.title||item.pblancNm||item.bizPbancNm||'제목 없음',agency:item.agency||item.jrsdInsttNm||item.department||'',operator:item.operator||item.excInsttNm||item.organization||'',category:item.category||item.lclasNm||item.field||'기타',region:item.region||item.area||'전국',period:item.period||item.reqstBeginEndDe||item.applicationPeriod||'',deadline:item.deadline||item.reqstEndDe||item.endDate||'',summary:item.summary||item.bsnsSumryCn||item.description||'',target:item.target||item.trgetNm||item.supportTarget||'',method:item.method||item.reqstMthPapersCn||item.applicationMethod||'',contact:item.contact||item.inqireCo||item.contactInfo||'',url:item.url||item.pblancUrl||item.detailUrl||item.bizPbancUrl||'https://www.bizinfo.go.kr'} }

async function loadNotices(){
 $('status').textContent='공식 공고를 불러오는 중입니다…';
 try{
  if(!API_BASE)throw new Error('NO_API');
  const r=await fetch(`${API_BASE}/notices?limit=100`,{cache:'no-store'});
  const data=await r.json();
  if(!r.ok)throw new Error(data.code||data.error||'API_ERROR');
  notices=(data.items||data.notices||[]).map(normalise);
  $('status').textContent=`공식 데이터 업데이트: ${new Date().toLocaleString('ko-KR')}`;
 }catch(e){
  console.warn('Official notice API unavailable:',e);
  notices=SAMPLE.map(normalise);
  $('status').textContent='현재 샘플 공고를 표시합니다. 공공데이터 API 연결 후 공식 최신 공고로 자동 전환됩니다.';
 }
 render();
}

function currentList(){
 const q=$('keywordInput').value.trim().toLowerCase(),region=$('regionFilter').value,cat=$('categoryFilter').value;
 let list=notices.filter(n=>{const hay=[n.title,n.agency,n.operator,n.summary,n.target,n.category,n.region].join(' ').toLowerCase();return(!q||hay.includes(q))&&(!region||hay.includes(region))&&(!cat||n.category.includes(cat)||hay.includes(cat))});
 if(tab==='urgent')list=list.filter(n=>daysLeft(n.deadline)>=0&&daysLeft(n.deadline)<=7);
 if(tab==='saved')list=list.filter(n=>saved.has(n.id));
 if($('sortFilter').value==='deadline')list.sort((a,b)=>daysLeft(a.deadline)-daysLeft(b.deadline));
 else list.sort((a,b)=>String(b.id).localeCompare(String(a.id)));
 return list;
}

function render(){
 const list=currentList();
 const urgent=notices.filter(n=>daysLeft(n.deadline)>=0&&daysLeft(n.deadline)<=7).length;
 $('totalCount').textContent=list.length;$('urgentCount').textContent=urgent;$('savedCount').textContent=saved.size;
 $('noticeList').innerHTML=list.length?list.map(card).join(''):'<div class="empty">조건에 맞는 공고가 없습니다.</div>';
 document.querySelectorAll('.save-btn').forEach(b=>b.onclick=()=>toggleSave(b.dataset.id));
 document.querySelectorAll('.detail-btn').forEach(b=>b.onclick=()=>showDetail(b.dataset.id));
}
function card(n){const d=daysLeft(n.deadline);const urgent=d>=0&&d<=7;const dText=d<0?'마감':d===0?'오늘 마감':d<9999?`D-${d}`:'';return`<article class="notice-card"><div class="card-top"><div class="badges"><span class="badge">${esc(n.category)}</span><span class="badge">${esc(n.region)}</span>${urgent?`<span class="badge urgent">${dText}</span>`:''}</div><button class="save-btn ${saved.has(n.id)?'saved':''}" data-id="${esc(n.id)}">${saved.has(n.id)?'★':'☆'}</button></div><h2>${esc(n.title)}</h2><p>${esc(n.summary||n.target||'공고 상세 내용을 확인하세요.')}</p><div class="meta"><div class="meta-row"><b>소관기관</b><span>${esc(n.agency||'-')}</span></div><div class="meta-row"><b>수행기관</b><span>${esc(n.operator||'-')}</span></div><div class="meta-row"><b>신청기간</b><span>${esc(n.period||n.deadline||'-')}</span></div></div><div class="card-actions"><button class="detail-btn" data-id="${esc(n.id)}">상세 보기</button><a class="source-link" href="${esc(n.url)}" target="_blank" rel="noopener">원문 공고</a></div></article>`}
function toggleSave(id){saved.has(id)?saved.delete(id):saved.add(id);localStorage.setItem('funding-saved',JSON.stringify([...saved]));render()}
function showDetail(id){const n=notices.find(x=>x.id===id);if(!n)return;$('detailTitle').textContent=n.title;$('detailBody').innerHTML=`<div class="detail-section"><h3>사업 개요</h3><p>${esc(n.summary||'-')}</p></div><div class="detail-section"><h3>지원 대상</h3><p>${esc(n.target||'-')}</p></div><div class="detail-section"><h3>신청 방법</h3><p>${esc(n.method||'-')}</p></div><div class="detail-section"><h3>신청 기간</h3><p>${esc(n.period||n.deadline||'-')}</p></div><div class="detail-section"><h3>문의처</h3><p>${esc(n.contact||'-')}</p></div><a class="detail-source" href="${esc(n.url)}" target="_blank" rel="noopener">공식 원문 열기</a>`;$('detailDialog').showModal()}
function setTab(next){tab=next;['all','urgent','saved'].forEach(x=>$(`${x}Tab`).classList.toggle('active',x===next));render()}
['keywordInput','regionFilter','categoryFilter','sortFilter'].forEach(id=>$(id).addEventListener(id==='keywordInput'?'input':'change',render));
$('allTab').onclick=()=>setTab('all');$('urgentTab').onclick=()=>setTab('urgent');$('savedTab').onclick=()=>setTab('saved');$('refreshBtn').onclick=loadNotices;$('closeDialog').onclick=()=>$('detailDialog').close();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js?v=11').then(r=>r.update()).catch(console.error);
loadNotices();