// Super G 🐲 main talking bot + 7 agents + 7777 virtual swarm
(function(){
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const AG=[['🏛️','Architekt','Projektujesz architekturę i dzielisz problem na części.'],['💻','Coder','Piszesz konkretny kod i rozwiązania techniczne.'],['🎨','Designer','Dbasz o wygląd: neon, techno, UX.'],['🎧','DJ/Audio','Ekspert od muzyki, DJ-ingu, audio i wizualizacji.'],['🛠️','Infra/DevOps','Serwery, deploy, tunele, buildy APK.'],['🧪','Tester','Szukasz błędów, ryzyk i przypadków brzegowych.'],['📣','Social','Komunikacja, posty, społeczność, marketing.']];
const N=7777;let slots=3;const q=[];const gate=()=>new Promise(r=>{if(slots>0){slots--;r()}else q.push(r)}),free=()=>{const n=q.shift();n?n():slots++};
let lit=0,busy=false,hist=[];
async function brain(text,system){await gate();try{return await brain0(text,system)}finally{free()}}
async function brain0(text,system){try{const r=await fetch('/api/brain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,system,history:hist.slice(-6)})});const j=await r.json();if(j.reply)return j.reply;throw Error(j.error)}catch(e){
 try{const r=await fetch('https://text.pollinations.ai/openai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:[{role:'system',content:system||''},{role:'user',content:text}]})});const j=await r.json();return j.choices[0].message.content}catch(e2){return '⚠ Brak połączenia z mózgami AI.'}}}
function log(who,t,cls){const L=$('tbLog');L.insertAdjacentHTML('beforeend',`<div class="msg ${cls||''}"><b>${esc(who)}:</b> ${esc(t)}</div>`);L.scrollTop=L.scrollHeight}
function say(t){const D=$('tbDragon');if(!('speechSynthesis' in window)||!$('tbVoice').checked){D.classList.add('talk');setTimeout(()=>D.classList.remove('talk'),1500);return}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.replace(/[#*`_>\[\]]/g,'').slice(0,600));u.lang='pl-PL';const v=speechSynthesis.getVoices().find(v=>v.lang.startsWith('pl'));if(v)u.voice=v;
 u.onstart=()=>D.classList.add('talk');u.onend=u.onerror=()=>D.classList.remove('talk');speechSynthesis.speak(u)}
// swarm grid (canvas, 7777 cells)
const cv=$('tbSwarm'),cx=cv.getContext('2d'),st=new Uint8Array(N);const COLS=101;
function drawSwarm(){const w=cv.width=cv.clientWidth*devicePixelRatio,c=w/COLS,rows=Math.ceil(N/COLS);cv.height=rows*c;for(let i=0;i<N;i++){const s=st[i];cx.fillStyle=s==2?'#39ff14':s==1?'#ff2bd6':'#141a30';cx.fillRect((i%COLS)*c,((i/COLS)|0)*c,c-0.6,c-0.6)}$('tbCnt').textContent=`${st.filter(x=>x==1).length} pracuje · ${lit} wykonanych mikro-zadań · ${N} wirtualnych pod-agentów`}
function light(k,ms){const idx=[];for(let i=0;i<k;i++){const j=Math.random()*N|0;st[j]=1;idx.push(j)}drawSwarm();return()=>{idx.forEach(j=>st[j]=2);lit+=k;drawSwarm();setTimeout(()=>{idx.forEach(j=>{if(st[j]==2)st[j]=0});drawSwarm()},ms||2500)}}
function agentsUI(active){$('tbAgents').innerHTML=AG.map(([e,n],i)=>`<div class="tba ${active&&active.includes(i)?'on':''}">${e}<br>${n}</div>`).join('')}
async function run(task){if(busy)return;busy=true;$('tbGo').disabled=true;log('Ty',task,'me');hist.push({role:'user',content:task});
 const build=/^\s*zbuduj\s+(aplikacj[eęa]\s+)?/i.test(task);
 try{if(!build&&task.length<60&&!/zadani|plan|zrób|przygotuj/i.test(task)){const a=await brain(task,'Jesteś Super G 🐲, główny gadający smok-bot Daniela Dydo. Mów po polsku, krótko, z energią techno.');const done=light(40);done();log('🐲 Super G',a);say(a);hist.push({role:'assistant',content:a});return}
  log('🐲 Super G','Dzielę zadanie między 7 agentów, a oni między wirtualnych pod-agentów…','st');
  const pick=build?[0,1,2,5]:[0,1,2,3,4,5,6];agentsUI(pick);
  const parts=await Promise.all(pick.map(async i=>{const [e,n,p]=AG[i];const done=light(150+Math.random()*400|0,4000);
    const a=await brain(`Zadanie Daniela: "${task}". Daj swój wkład jako ${n} w max 5 punktach.`,`Jesteś agentem ${n} w zespole Super G 🐲. ${p} Odpowiadaj po polsku, zwięźle.`);done();log(e+' '+n,a);return n+': '+a}));
  if(build){const name=task.replace(/^\s*zbuduj\s+(aplikacj[eęa]\s+)?/i,'').trim()||'aplikacja';const slug=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'app';
   log('💻 Coder','Generuję jednoplikową aplikację HTML…','st');const done=light(900,5000);
   let h=await brain(`Zbuduj kompletną aplikację: "${name}". Plan zespołu:\n${parts.join('\n').slice(0,3000)}\nZwróć WYŁĄCZNIE jeden plik HTML (<!doctype html>...) z wbudowanym CSS i JS, bez zewnętrznych zależności, polski interfejs, ciemny neonowy styl techno.`,'Jesteś ekspertem front-end. Zwracasz tylko czysty kod HTML, bez komentarzy i bez markdown.');done();
   const m=h.match(/<!doctype html[\s\S]*<\/html>/i)||h.match(/<html[\s\S]*<\/html>/i);h=m?m[0]:h.replace(/```html|```/g,'');
   const r=await (await fetch('/api/built',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug,html:h})})).json();
   if(r.url){log('🐲 Super G',`Gotowe! Aplikacja zapisana: ${r.url} (${r.bytes} B)`);$('tbBuilt').insertAdjacentHTML('afterbegin',`<div class="row"><a href="${r.url}" target="_blank" style="color:var(--m)">📦 ${esc(name)}</a><button onclick="document.getElementById('tbPrev').src='${r.url}';document.getElementById('tbPrev').style.display='block'">👁 Podgląd</button></div>`);say('Aplikacja '+name+' jest gotowa.')}else log('🐲 Super G','Błąd zapisu: '+r.error);return}
  const done=light(300);const fin=await brain(`Zadanie: "${task}". Wkład agentów:\n${parts.join('\n\n').slice(0,6000)}\nPołącz to w jedną spójną, krótką odpowiedź dla Daniela.`,'Jesteś Super G 🐲, główny bot. Scalasz wyniki zespołu. Po polsku, konkretnie.');done();
  log('🐲 Super G (wynik)',fin);say(fin);hist.push({role:'assistant',content:fin})}
 finally{busy=false;$('tbGo').disabled=false;agentsUI()}}
$('tbGo').onclick=()=>{const t=$('tbIn').value.trim();if(t){$('tbIn').value='';run(t)}};$('tbIn').onkeydown=e=>{if(e.key=='Enter')$('tbGo').click()};
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)$('tbMic').title='Twoja przeglądarka nie obsługuje rozpoznawania mowy';
$('tbMic').onclick=()=>{if(!SR){log('🐲 Super G','Mikrofon niedostępny w tej przeglądarce (spróbuj Chrome).','st');return}const r=new SR();r.lang='pl-PL';r.onresult=e=>{$('tbIn').value=e.results[0][0].transcript;$('tbGo').click()};r.onerror=e=>log('🎤','Błąd mikrofonu: '+e.error,'st');r.start();log('🎤','Słucham…','st')};
agentsUI();drawSwarm();addEventListener('resize',drawSwarm);window.SGT={run};
log('🐲 Super G','Cześć Daniel! Pogadaj ze mną, daj zadanie dla zespołu albo napisz „zbuduj aplikację …”.');
})();
