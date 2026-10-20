// Standalone shim for GitHub Pages: routes /api,/cc,/apps to live backend from live.json; AI brain falls back to keyless Pollinations.
(function(){if(location.hostname.indexOf('github.io')<0)return;
var base=document.baseURI.replace(/[^/]*$/,''),LIVE=null,of=window.fetch.bind(window);
var ready=of(base+'live.json?'+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){LIVE=(j.url||'').replace(/\/$/,'')}).catch(function(){});
function isB(u){return typeof u==='string'&&/^\/(api|cc|apps)\b/.test(u)}
async function poll(o){var b={};try{b=JSON.parse(o.body||'{}')}catch(e){}var m=[];if(b.system)m.push({role:'system',content:b.system});(b.history||[]).forEach(function(h){if(h&&h.content)m.push({role:h.role||'user',content:h.content})});m.push({role:'user',content:b.text||''});
 var r=await of('https://text.pollinations.ai/openai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:m})});var t;
 try{var j=await r.json();t=j.choices[0].message.content}catch(e){t=await (await of('https://text.pollinations.ai/'+encodeURIComponent(b.text||''))).text()}
 return new Response(JSON.stringify({reply:t,brain:'pollinations (static)'}),{headers:{'Content-Type':'application/json'}})}
window.fetch=async function(u,o){if(!isB(u))return of(u,o);await ready;o=o||{};
 if(u.indexOf('/api/brain')===0){if(LIVE){try{var r=await of(LIVE+u,Object.assign({},o,{signal:AbortSignal.timeout(15000)}));if(r.ok)return r}catch(e){}}return poll(o)}
 if(!LIVE)return new Response(JSON.stringify({error:'backend offline'}),{status:503,headers:{'Content-Type':'application/json'}});
 return of(LIVE+u,o)};
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="/"]');if(a&&LIVE&&isB(a.getAttribute('href'))){e.preventDefault();window.open(LIVE+a.getAttribute('href'),'_blank')}},true);
ready.then(function(){var a=document.createElement('a');a.href=LIVE||'go.html';a.target='_blank';a.textContent='🟢 Live';a.style.cssText='position:fixed;right:10px;bottom:10px;z-index:99999;background:#7b2cff;color:#fff;padding:8px 14px;border-radius:20px;font:bold 14px sans-serif;text-decoration:none';document.body.appendChild(a)});
})();
