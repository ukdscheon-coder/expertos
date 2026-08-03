let pendingSpeechText='',recognition=null,isListening=false,lastLang=navigator.language||'ko-KR';
const $=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]));
const API_URL=(window.EXPERTOS_CONFIG&&window.EXPERTOS_CONFIG.apiUrl||'').replace(/\/$/,'');

function addAssistant(text,sources=[]){
  const box=$('chatbox');
  const wrap=document.createElement('div');
  const msg=document.createElement('div');
  const btn=document.createElement('button');
  wrap.className='assistant-block';
  msg.className='message assistant';
  msg.textContent=text;
  wrap.appendChild(msg);
  if(Array.isArray(sources)&&sources.length){
    const src=document.createElement('div');
    src.className='meta';
    src.innerHTML=sources.map((s,i)=>`<a class="tag" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title||`출처 ${i+1}`)}</a>`).join('');
    wrap.appendChild(src);
  }
  btn.className='speak-request';
  btn.type='button';
  btn.textContent='🔊 음성으로 듣기';
  btn.onclick=()=>{pendingSpeechText=text;$('voiceApprovalModal').showModal()};
  wrap.appendChild(btn);
  box.appendChild(wrap);
  box.scrollTop=box.scrollHeight;
}

async function askBackend(question){
  if(!API_URL)throw new Error('SERVICE_UNAVAILABLE');
  const endpoint=API_URL.endsWith('/answer')?API_URL:`${API_URL}/answer`;
  const response=await fetch(endpoint,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({question,language:navigator.language||'ko-KR'})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.code||data.error||`HTTP_${response.status}`);
  if(!data.answer)throw new Error('EMPTY_ANSWER');
  return{answer:data.answer,sources:Array.isArray(data.sources)?data.sources:[]};
}

$('questionForm').onsubmit=async event=>{
  event.preventDefault();
  const input=$('questionInput');
  const question=input.value.trim();
  if(!question)return;
  $('chatbox').insertAdjacentHTML('beforeend',`<div class="message user">${esc(question)}</div>`);
  input.value='';
  const loading=document.createElement('div');
  loading.className='message assistant';
  loading.textContent='최신 자료를 확인하고 답변을 준비하고 있습니다…';
  $('chatbox').appendChild(loading);
  try{
    const result=await askBackend(question);
    loading.remove();
    addAssistant(result.answer,result.sources);
  }catch(error){
    console.error('ExpertOS request failed:',error);
    loading.remove();
    addAssistant('현재 답변을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
};

function detectLang(text){
  if(/[가-힣]/.test(text))return'ko-KR';
  if(/[ぁ-んァ-ン]/.test(text))return'ja-JP';
  if(/[一-龥]/.test(text))return'zh-CN';
  return'en-GB';
}

const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SpeechRecognition){
  recognition=new SpeechRecognition();
  recognition.interimResults=true;
  recognition.continuous=false;
  recognition.onresult=event=>{
    let text='';
    for(let i=event.resultIndex;i<event.results.length;i++)text+=event.results[i][0].transcript;
    $('questionInput').value=text.trim();
    if(text.trim())lastLang=detectLang(text);
  };
  recognition.onerror=()=>{$('speechStatus').textContent='음성 인식을 다시 시도해 주세요.'};
  recognition.onend=()=>{
    isListening=false;
    $('micBtn').classList.remove('listening');
    $('speechStatus').textContent='음성 입력 완료';
  };
  $('micBtn').onclick=()=>{
    if(isListening){recognition.stop();return;}
    const selected=$('speechLanguage').value;
    recognition.lang=selected==='auto'?lastLang:selected;
    isListening=true;
    $('micBtn').classList.add('listening');
    $('speechStatus').textContent='듣는 중…';
    recognition.start();
  };
}else{
  $('micBtn').disabled=true;
  $('speechStatus').textContent='이 브라우저에서는 음성 입력을 지원하지 않습니다.';
}

$('approveVoice').onclick=()=>{
  if(!pendingSpeechText)return;
  const utterance=new SpeechSynthesisUtterance(pendingSpeechText);
  utterance.lang=detectLang(pendingSpeechText);
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  pendingSpeechText='';
  $('voiceApprovalModal').close();
};
$('cancelVoice').onclick=()=>{pendingSpeechText='';$('voiceApprovalModal').close()};

if('serviceWorker'in navigator){
  navigator.serviceWorker.register('./service-worker.js?v=10').then(reg=>reg.update()).catch(console.error);
}
