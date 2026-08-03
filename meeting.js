(()=>{
  const $=id=>document.getElementById(id);
  const startBtn=$("startMeetingBtn"),stopBtn=$("stopMeetingBtn"),copyBtn=$("copyMinutesBtn"),makeBtn=$("makeMinutesBtn"),transcript=$("meetingTranscript"),summary=$("meetingSummary"),langSelect=$("meetingLanguage");
  if(!startBtn)return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  let rec=null,running=false,finalText="";
  const detectLang=text=>/[가-힣]/.test(text)?"ko-KR":/[ぁ-んァ-ン]/.test(text)?"ja-JP":/[一-龥]/.test(text)?"zh-CN":"en-GB";
  const getLang=()=>langSelect.value==="auto"?(localStorage.getItem("expertos-meeting-lang")||navigator.language||"en-GB"):langSelect.value;

  function setup(){
    if(!SR){startBtn.disabled=true;summary.textContent="이 브라우저에서는 연속 음성 인식을 지원하지 않습니다. iPhone 받아쓰기를 사용해 회의 내용을 입력할 수 있습니다.";return}
    rec=new SR();rec.continuous=true;rec.interimResults=true;rec.lang=getLang();
    rec.onstart=()=>{running=true;startBtn.disabled=true;stopBtn.disabled=false;summary.textContent=`회의 기록 중… (${rec.lang})`};
    rec.onresult=e=>{let interim="";for(let i=e.resultIndex;i<e.results.length;i++){const text=e.results[i][0].transcript;if(e.results[i].isFinal){finalText+=text.trim()+"\n";const detected=detectLang(text);localStorage.setItem("expertos-meeting-lang",detected)}else interim+=text}transcript.value=finalText+interim;transcript.scrollTop=transcript.scrollHeight};
    rec.onerror=e=>{summary.textContent=e.error==="not-allowed"?"마이크 권한이 필요합니다.":`음성 인식 오류: ${e.error}`};
    rec.onend=()=>{if(running){try{rec.lang=getLang();rec.start()}catch{}}else{startBtn.disabled=false;stopBtn.disabled=true;summary.textContent="회의 기록이 중지되었습니다."}};
  }
  setup();
  startBtn.onclick=()=>{if(!rec)return;finalText=transcript.value.trim()?transcript.value.trim()+"\n":"";rec.lang=getLang();running=true;try{rec.start()}catch{}};
  stopBtn.onclick=()=>{running=false;if(rec)rec.stop()};
  copyBtn.onclick=async()=>{const text=(summary.dataset.minutes||transcript.value).trim();if(!text)return;await navigator.clipboard.writeText(text);summary.textContent="회의록을 클립보드에 복사했습니다."};
  makeBtn.onclick=()=>{const raw=transcript.value.trim();if(!raw){summary.textContent="먼저 회의 내용을 기록하세요.";return}const lines=raw.split(/\n+/).map(s=>s.trim()).filter(Boolean);const decisions=lines.filter(s=>/결정|합의|agree|decide|will|해야|하기로/.test(s)).slice(0,8);const actions=lines.filter(s=>/담당|기한|까지|action|owner|deadline|next/.test(s)).slice(0,8);const minutes=`회의록 초안\n\n1. 회의 개요\n- 기록 언어: ${detectLang(raw)}\n- 발언 문장 수: ${lines.length}\n\n2. 주요 논의\n${lines.slice(0,12).map(s=>`- ${s}`).join("\n")}\n\n3. 결정사항\n${decisions.length?decisions.map(s=>`- ${s}`).join("\n"):"- 명확한 결정 문장을 자동 식별하지 못했습니다."}\n\n4. 후속조치\n${actions.length?actions.map(s=>`- ${s}`).join("\n"):"- 담당자와 기한을 수동으로 확인하십시오."}\n\n※ 자동 생성 초안이므로 참석자·결정·기한을 최종 확인해야 합니다.`;summary.dataset.minutes=minutes;summary.textContent=minutes};
})();