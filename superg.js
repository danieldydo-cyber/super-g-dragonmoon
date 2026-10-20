// Super G 🐲 — hub: Agenci, Agent Builder, DJ asystent, Inne aplikacje
(function(){
const $$=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function J(u,o){const r=await fetch(u,o);const t=await r.text();let j;try{j=JSON.parse(t)}catch(e){j={error:t.slice(0,120)}}if(!r.ok&&!j.error)j.error='HTTP '+r.status;return j}
const post=(u,b)=>J(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
async function brain(text,system,history){const j=await post('/api/brain',{text,system,history});return j.reply||('⚠ '+(j.error||'brak odpowiedzi'))}
let BOTS=[],QUEUE=[],cur=null,local={};
async function loadState(){const j=await J('/cc/api/state');if(j.error)throw Error(j.error);BOTS=j.bots||[];QUEUE=j.queue||[];return j}
// ---- Agenci
async function agents(){const L=$$('agList');try{await loadState();$$('agErr').textContent='';}catch(e){$$('agErr').textContent='Błąd CC: '+e.message;return}
 L.innerHTML=BOTS.map(b=>`<button class="agb${cur&&cur.id==b.id?' on':''}" data-id="${esc(b.id)}" title="${esc(b.role)}">${b.pending?'🟣':'🟢'} ${esc(b.name)} <small>${b.pending||0}/${b.done||0}</small></button>`).join('');
 $$('agCount').textContent=BOTS.length+' agentów';if(cur)renderChat()}
function renderChat(){const b=cur;if(!b)return;$$('agTitle').textContent='🤖 '+b.name+' — '+(b.role||'');
 const its=QUEUE.filter(x=>x.bot_id==b.id),loc=local[b.id]||[];
 const rows=[...its.map(x=>({t:x.created||'',h:`<div class="msg me"><b>Ty:</b> ${esc(x.text)}<div class="st">kolejka: ${esc(x.status)} · ${esc(x.created||'')}</div></div>`+(x.result?`<div class="msg"><b>${esc(b.name)} (bot):</b> ${esc(x.result)}</div>`:'')})),...loc]
 .sort((a,c)=>a.t<c.t?-1:1);const C=$$('agChat');C.innerHTML=rows.map(r=>r.h).join('')||'<div class="small">Brak wiadomości. Napisz coś!</div>';C.scrollTop=C.scrollHeight}
function persona(b){return b.persona||`Jesteś botem "${b.name}" (${b.role||'asystent'}) w zespole botów Daniela Dydo. Odpowiadaj po polsku, krótko, w swoim charakterze. Zadanie trafiło też do kolejki prawdziwego bota.`}
async function agSend(){const t=$$('agIn').value.trim();if(!t)return;$$('agIn').value='';
 if($$('agAll').checked){const r=await post('/cc/api/broadcast',{text:'[Super G 🐲] '+t});$$('agErr').textContent=r.error?'Błąd: '+r.error:'📢 Wysłano do wszystkich ('+r.ok+')';
  const g=$$('agChat');g.innerHTML+=`<div class="msg me"><b>📢 Do wszystkich:</b> ${esc(t)}</div><div class="msg st">AI myśli…</div>`;
  const a=await brain(t,'Jesteś moderatorem czatu grupowego botów Daniela (Super G 🐲). Odpowiedz po polsku krótko jako 2-3 różne boty z zespołu, format "Nazwa: tekst".');g.lastChild.outerHTML=`<div class="msg"><b>🐲 Grupa (AI):</b> ${esc(a)}</div>`;g.scrollTop=g.scrollHeight;return}
 const b=cur;if(!b){$$('agErr').textContent='Wybierz agenta z listy';return}
 const r=await post('/cc/api/command',{bot_id:b.id,bot_name:b.name,text:'[Super G 🐲] '+t});if(r.error)$$('agErr').textContent='Błąd kolejki: '+r.error;else QUEUE.push(r);
 const now=(r.created||new Date().toISOString()),L=(local[b.id]=local[b.id]||[]);const slot={t:now+'~',h:`<div class="msg st">🧠 ${esc(b.name)} myśli…</div>`};L.push(slot);renderChat();
 const hist=QUEUE.filter(x=>x.bot_id==b.id).slice(-6).map(x=>({role:'user',content:x.text}));
 const a=await brain(t,persona(b),hist);slot.h=`<div class="msg"><b>🧠 ${esc(b.name)} (AI natychmiast):</b> ${esc(a)}</div>`;renderChat()}
// ---- Builder
async function build(){const n=$$('abName').value.trim(),r=$$('abRole').value.trim(),p=$$('abPers').value.trim();if(!n){$$('abMsg').textContent='Podaj nazwę';return}
 const j=await post('/api/agents',{name:n,role:r,persona:p});if(j.error){$$('abMsg').textContent='Błąd: '+j.error;return}
 $$('abMsg').textContent='✅ Utworzono '+j.name+' ('+j.id+') — otwieram czat';await agents();cur=BOTS.find(x=>x.id==j.id)||j;tab('agents');agents()}
// ---- DJ asystent
const ACT={play:()=>$$('play').click(),demo:()=>$$('demo').click(),milkdrop:()=>setMode('devil'),next:()=>{if(mode!=='devil')setMode('devil');else $$('mdNext').click()},bars:()=>setMode('bars'),wave:()=>setMode('wave'),particles:()=>setMode('part'),nebula:()=>setMode('nebula')};
async function djAsk(){const t=$$('djIn').value.trim();if(!t)return;$$('djIn').value='';const C=$$('djChat');C.innerHTML+=`<div class="msg me">${esc(t)}</div><div class="msg st">🐲 myślę…</div>`;
 const a=await brain(t,'Jesteś Super G 🐲, asystentem DJ-a w aplikacji D DragonMoon DJ. Po polsku, krótko. Proponuj utwory, przejścia, efekty FX i BPM. Gdy użytkownik chce akcję, dodaj na końcu tagi z listy: [ACT:play] [ACT:demo] [ACT:milkdrop] [ACT:next] [ACT:bars] [ACT:wave] [ACT:particles] [ACT:nebula].');
 const acts=[...a.matchAll(/\[ACT:(\w+)\]/g)].map(m=>m[1]).filter(k=>ACT[k]);C.lastChild.outerHTML=`<div class="msg"><b>🐲</b> ${esc(a.replace(/\[ACT:\w+\]/g,''))}${acts.length?'<div class="st">▶ wykonano: '+acts.join(', ')+'</div>':''}</div>`;C.scrollTop=C.scrollHeight;
 acts.forEach(k=>{try{ACT[k]()}catch(e){console.warn(e)}})}
// ---- Inne aplikacje
const APPN={superg:'SuperGrok · Super G 🐲 D7 DJ (:8080)',gdj:'G DJ Ultra (:8765)',devil:'Super Devil Bot X · Diabeł 7 (:8777)',dax:'DJ DaX Shop (:8787)',starg:'SuperStarG Smart Bot (:8799)',musicai:'D7 Music AI Pro (statyczna)'};
const EXTRA=[['superg','app.html','D7 DJ ONE /app.html'],['superg','hiphopx.html','HipHop X'],['superg','g-pro.html','G PRO']];
async function apps(){try{const a=await J('/api/apps');$$('hApps').innerHTML=a.map(x=>`<a class="hc ${x.up?'':'off'}" href="${x.url}" target="_blank">${x.up?'🟢':'🔴'} ${esc(APPN[x.key]||x.key)}</a>`).join('')+EXTRA.map(([k,f,n])=>`<a class="hc" href="/apps/${k}/${f}" target="_blank">🔗 ${n}</a>`).join('')}catch(e){$$('hApps').textContent='Błąd: '+e.message}}
// ---- wiring
window.SG={agents,apps};
document.addEventListener('click',e=>{const t=e.target.closest('[data-go]');if(t){const g=t.dataset.go;if(g=='milkdrop'){tab('deck');setMode('devil')}else tab(g);if(g=='bots'&&window.botsTab)botsTab();if(g=='agents')agents();window.scrollTo(0,0)}
 const a=e.target.closest('.agb');if(a){cur=BOTS.find(b=>b.id==a.dataset.id);$$('agAll').checked=false;agents()}});
$$('agSend').onclick=agSend;$$('agIn').onkeydown=e=>{if(e.key=='Enter'&&!e.shiftKey){e.preventDefault();agSend()}};
$$('abGo').onclick=build;$$('djGo').onclick=djAsk;$$('djIn').onkeydown=e=>{if(e.key=='Enter')djAsk()};
document.querySelectorAll('[data-djq]').forEach(b=>b.onclick=()=>{$$('djIn').value=b.dataset.djq;djAsk()});
setInterval(()=>{if($$('p-agents').classList.contains('on'))agents()},10000);
if(!location.hash)tab("home");apps();if($$('p-agents').classList.contains('on'))agents();
})();
