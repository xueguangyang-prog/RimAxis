const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLISHABLE_KEYS = (() => {
  try { return JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}"); } catch { return {}; }
})();
const PUBLISHABLE_KEY = PUBLISHABLE_KEYS.default || ANON_KEY;

const html = String.raw`<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Harmonia｜API 密鑰管理</title>
<style>
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#f5f3ff;background:#080712;font-synthesis:none}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 50% -20%,#33205f 0,transparent 52%),#080712;overflow-x:hidden}body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;opacity:.16;background-image:linear-gradient(#ffffff10 1px,transparent 1px),linear-gradient(90deg,#ffffff10 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse at center,#000,transparent 78%)}
.shell{display:grid;grid-template-columns:248px minmax(0,1fr);min-height:100vh}aside{background:rgba(10,9,22,.82);backdrop-filter:blur(18px);border-right:1px solid #ffffff12;padding:25px 18px;color:#f5f3ff}.brand{font-size:19px;font-weight:750;letter-spacing:.03em;padding:8px 10px 34px;color:#fff}.brand:before{content:"H";display:inline-grid;place-items:center;width:34px;height:34px;margin-right:11px;vertical-align:middle;border-radius:11px;background:linear-gradient(135deg,#c4b5fd,#6366f1,#22d3ee);box-shadow:0 0 26px #7c3aed66}.navlabel{color:#77728f;font-size:10px;letter-spacing:.2em;padding:12px}.navitem{display:flex;gap:12px;align-items:center;padding:12px 14px;border-radius:12px;border:1px solid #8b5cf633;background:linear-gradient(100deg,#6d28d933,#4338ca18);box-shadow:inset 0 1px #ffffff0b;font-size:13px;color:#e4dff2}
main{min-width:0}.top{height:66px;background:#09081799;backdrop-filter:blur(16px);border-bottom:1px solid #ffffff12;display:flex;align-items:center;justify-content:space-between;padding:0 34px;font-size:12px;color:#aaa4bd}.content{max-width:980px;padding:48px 34px;margin:0 auto}.eyebrow{font-size:10px;letter-spacing:.22em;color:#b9a6ff;text-transform:uppercase;font-weight:700;margin-bottom:12px}.heading{font-size:34px;letter-spacing:-.045em;color:#f8f7ff;font-weight:650;margin:0 0 10px}.intro{font-size:13px;color:#9993ae;line-height:1.8;margin:0 0 32px}
.panel{position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(145deg,#19152f,#100f20 68%,#111127);border:1px solid #a78bfa33;padding:28px;margin-bottom:18px;box-shadow:0 24px 70px #0007,inset 0 1px #ffffff0c}.panel:before{content:"";position:absolute;width:300px;height:200px;right:-130px;top:-145px;background:#7c3aed;filter:blur(100px);opacity:.24;pointer-events:none}.panelhead{display:flex;justify-content:space-between;align-items:center;gap:16px}.panel h2{font-size:17px;color:#f5f3ff;font-weight:650;margin:0}.muted{font-size:12px;color:#9690aa;line-height:1.7}.status{font-size:10px;padding:7px 11px;border-radius:999px;border:1px solid #ffffff22;background:#ffffff0b;color:#c8c2d9}.status.ok{color:#86efac;border-color:#22c55e55;background:#16a34a18}.status.bad{color:#fda4af;border-color:#fb718555;background:#e11d4818}
label{display:block;font-size:12px;color:#d8d3e8;margin:22px 0 9px}input{width:100%;height:50px;padding:0 15px;border:1px solid #393550;background:#090918;color:#fff;border-radius:12px;font:inherit;font-size:14px;outline:none;transition:border .2s,box-shadow .2s}input:focus{border-color:#a78bfa;box-shadow:0 0 0 3px #8b5cf633}.actions{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}button{height:42px;padding:0 17px;border:1px solid transparent;border-radius:11px;background:linear-gradient(100deg,#7c3aed,#6366f1 60%,#0891b2);color:#fff;font-size:12px;font-weight:650;cursor:pointer;box-shadow:0 8px 24px #6366f133;transition:transform .2s,filter .2s}button:hover{transform:translateY(-1px);filter:brightness(1.1)}button.secondary{background:#ffffff0b;border-color:#ffffff1b;color:#ddd8ef;box-shadow:none}button.danger{background:#e11d4810;border-color:#fb718533;color:#fda4af;box-shadow:none}button:disabled{opacity:.55;cursor:wait}.help{margin-top:16px;font-size:12px;color:#8c87a1;line-height:1.7}.notice{padding:14px 16px;border-radius:13px;border:1px solid #6366f133;background:linear-gradient(100deg,#6366f11a,#8b5cf60d);font-size:12px;color:#b8b2cc;line-height:1.7;margin:22px 0}.message{font-size:12px;margin-top:12px;min-height:18px;color:#c4b5fd}.link{background:none;color:#c4b5fd;padding:0;height:auto;text-decoration:none;box-shadow:none;border:0}.login{position:relative;overflow:hidden;width:min(440px,calc(100% - 36px));margin:12vh auto;padding:36px;border-radius:24px;background:linear-gradient(145deg,#1a1730f2,#0d0d1bf5);border:1px solid #a78bfa44;box-shadow:0 30px 100px #0009,inset 0 1px #ffffff15}.login:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 100% 0,#7c3aed30,transparent 55%)}.login h1{position:relative;font-size:30px;letter-spacing:-.04em;color:#fff;font-weight:650}.login .muted{position:relative;margin-bottom:25px}.login form{position:relative}.login input{margin-bottom:8px}.login button[type=submit]{width:100%;margin-top:12px}.login .link{display:block;margin:18px auto 0}.login .eyebrow{position:relative}.hidden{display:none!important}
@media(max-width:720px){.shell{grid-template-columns:1fr}aside{padding:13px 16px;border-right:0;border-bottom:1px solid #ffffff12}.brand{padding:3px 6px 12px}.navlabel{display:none}.navitem{padding:9px 12px}.content{padding:30px 16px}.top{padding:0 16px;height:58px}.panel{padding:20px 16px}.heading{font-size:29px}.panelhead{align-items:flex-start}.actions button{flex:1 1 auto}.login{margin:12vh auto 40px;padding:28px 22px}}
</style></head><body>
<div id="login" class="login"><div class="eyebrow">HARMONIA WORKSPACE</div><h1 id="loginTitle">登入 Harmonia</h1><p class="muted">登入後管理你的外部服務連線憑據。</p>
<form id="loginForm"><label for="email">電子郵件</label><input id="email" type="email" autocomplete="username" required><label for="password">密碼</label><input id="password" type="password" autocomplete="current-password" required><button id="loginButton" type="submit">登入</button><button id="modeButton" class="link" type="button">建立帳戶</button><div id="loginMessage" class="message"></div></form></div>
<div id="app" class="shell hidden"><aside><div class="brand">Harmonia</div><div class="navlabel">工作區</div><div class="navitem"><span>⚙</span><span>設定 / API 密鑰</span></div></aside>
<main><header class="top"><span>設定　/　API 密鑰</span><button class="secondary" id="logout">登出</button></header><section class="content">
<div class="eyebrow">設定中心</div><h1 class="heading">API 密鑰管理</h1><p class="intro">集中管理 Harmonia 外部資料服務的連線憑據。密鑰只會在提交時傳送至伺服器，保存後不會再次顯示。</p>
<div class="panel"><div class="panelhead"><h2>採集服務 API</h2><span id="status" class="status">讀取中</span></div><p class="muted">用於全球企業與地點資料發現。連線驗證成功後，才會允許後續採集任務使用。</p>
<div class="notice">安全提示：請使用新生成的 API Token。密鑰會在服務端使用 AES-256-GCM 加密後保存；加密主密鑰由 Supabase Vault 管理。</div>
<label for="apiToken">API Token</label><input id="apiToken" type="password" autocomplete="new-password" placeholder="貼上新的 API Token" spellcheck="false">
<div class="actions"><button id="saveVerify">保存並驗證</button><button id="verify" class="secondary">重新驗證</button><button id="remove" class="danger">刪除密鑰</button></div>
<div id="detail" class="help">正在讀取憑據狀態…</div><div id="message" class="message" role="status"></div></div>
<div class="muted">密鑰狀態與採集任務分開管理。驗證失敗不會啟動採集；後續可在此頁擴充其他服務提供商。</div>
</section></main></div>
<script>
const SUPABASE_URL="https://ehzdoevqqmmtetulcpbo.supabase.co";
const SUPABASE_KEY="__PUBLISHABLE_KEY__";
const API_BASE=(location.pathname.endsWith("/login")||location.pathname.endsWith("/settings"))?location.pathname.slice(0,location.pathname.lastIndexOf("/")):"";
let accessToken="";let signUpMode=false;
const $=id=>document.getElementById(id);
function setMessage(t,bad=false){$("message").textContent=t;$("message").style.color=bad?"#a2191f":"#525252"}
async function api(path,options={}){const h=new Headers(options.headers||{});if(accessToken)h.set("Authorization","Bearer "+accessToken);h.set("apikey",SUPABASE_KEY);if(options.body)h.set("Content-Type","application/json");const r=await fetch(API_BASE+path,{...options,credentials:"same-origin",headers:h});const d=await r.json().catch(()=>({error:"伺服器回應格式錯誤"}));if(!r.ok)throw new Error(d.error||"請求失敗");return d}
function showApp(){$("login").classList.add("hidden");$("app").classList.remove("hidden");loadStatus()}
function showLogin(){$("app").classList.add("hidden");$("login").classList.remove("hidden")}
$("modeButton").addEventListener("click",()=>{signUpMode=!signUpMode;$("loginTitle").textContent=signUpMode?"建立 Harmonia 帳戶":"登入 Harmonia";$("loginButton").textContent=signUpMode?"建立帳戶":"登入";$("modeButton").textContent=signUpMode?"返回登入":"建立帳戶";});
$("loginForm").addEventListener("submit",async e=>{e.preventDefault();$("loginButton").disabled=true;$("loginMessage").textContent="正在處理…";try{const path=signUpMode?"/auth/v1/signup":"/auth/v1/token?grant_type=password";const r=await fetch(SUPABASE_URL+path,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY},body:JSON.stringify({email:$("email").value,password:$("password").value})});const d=await r.json();if(!r.ok)throw new Error(d.msg||d.message||"登入失敗");if(!d.access_token){$("loginMessage").textContent="帳戶已建立。如需郵件驗證，請先完成驗證，再登入。";return}const sr=await fetch(API_BASE+"/api/session",{method:"POST",headers:{Authorization:"Bearer "+d.access_token}});const sd=await sr.json().catch(()=>({}));if(!sr.ok)throw new Error(sd.error||"無法建立安全工作階段");location.assign(API_BASE+"/settings")}catch(e){$("loginMessage").textContent=e.message}finally{$("loginButton").disabled=false}});
async function loadStatus(){try{const d=await api("/api/credentials");const c=d.credential;if(!c){$("status").textContent="未配置";$("status").className="status";$("detail").textContent="尚未保存 API Token。";return}const labels={saved:"已保存，待驗證",verified:"已連線",verification_failed:"驗證失敗",disabled:"已停用"};$("status").textContent=labels[c.status]||"已配置";$("status").className="status "+(c.status==="verified"?"ok":c.status==="verification_failed"?"bad":"");$("detail").textContent=(c.last_verified_at?"最近驗證："+new Date(c.last_verified_at).toLocaleString():"尚未驗證")+(c.last_error?"；原因："+c.last_error:"")+"。已保存的密鑰不會回傳明文。"}catch(e){setMessage(e.message,true)}}
$("saveVerify").addEventListener("click",async()=>{const token=$("apiToken").value.trim();if(!token){setMessage("請先輸入 API Token。",true);return}$("saveVerify").disabled=true;setMessage("正在加密保存並驗證…");try{await api("/api/credentials",{method:"PUT",body:JSON.stringify({token})});$("apiToken").value="";const v=await api("/api/credentials/verify",{method:"POST"});setMessage(v.valid?"密鑰保存成功，連線驗證通過。":"密鑰已保存，但驗證未通過。",!v.valid);await loadStatus()}catch(e){setMessage(e.message,true);await loadStatus()}finally{$("saveVerify").disabled=false}});
$("verify").addEventListener("click",async()=>{$("verify").disabled=true;setMessage("正在驗證…");try{const d=await api("/api/credentials/verify",{method:"POST"});setMessage(d.valid?"連線驗證通過。":"驗證失敗。",!d.valid);await loadStatus()}catch(e){setMessage(e.message,true)}finally{$("verify").disabled=false}});
$("remove").addEventListener("click",async()=>{if(!confirm("確定刪除此服務的 API 密鑰？"))return;$("remove").disabled=true;try{await api("/api/credentials",{method:"DELETE"});setMessage("密鑰已刪除。");$("apiToken").value="";await loadStatus()}catch(e){setMessage(e.message,true)}finally{$("remove").disabled=false}});
$("logout").addEventListener("click",async()=>{await fetch(API_BASE+"/api/session",{method:"DELETE",credentials:"same-origin"});location.replace(API_BASE+"/login")});
if(location.pathname.endsWith("/settings"))loadStatus();\n</script></body></html>`;

const corsHeaders = {"access-control-allow-origin":"https://ehzdoevqqmmtetulcpbo.supabase.co","access-control-allow-headers":"authorization, apikey, content-type","access-control-allow-methods":"GET, POST, PUT, DELETE, OPTIONS"};
function reply(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...corsHeaders}})}
function b64(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes)))}
function fromB64(s){return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
async function getEncryptionKey(){
 const r=await fetch(SUPABASE_URL+"/rest/v1/rpc/get_harmonia_credentials_key",{method:"POST",headers:{apikey:ANON_KEY,Authorization:"Bearer "+SERVICE_ROLE_KEY,"Content-Type":"application/json"},body:"{}"});
 if(!r.ok)throw new Error("vault_key_unavailable");
 const v=await r.json();if(typeof v!=="string"||!/^[0-9a-f]{64}$/i.test(v))throw new Error("vault_key_invalid");
 return crypto.subtle.importKey("raw",Uint8Array.from(v.match(/.{2}/g),x=>parseInt(x,16)),"AES-GCM",false,["encrypt","decrypt"]);
}
let keyPromise;
function encryptionKey(){if(!keyPromise)keyPromise=getEncryptionKey();return keyPromise}
async function encryptValue(value){const key=await encryptionKey();const iv=crypto.getRandomValues(new Uint8Array(12));const cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(value));return {encrypted_value:b64(cipher),encryption_iv:b64(iv)}}
async function decryptValue(row){const key=await encryptionKey();const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:fromB64(row.encryption_iv)},key,fromB64(row.encrypted_value));return new TextDecoder().decode(plain)}
async function currentUser(req){
 let auth=req.headers.get("authorization")||"";
 if(!auth.startsWith("Bearer ")){
  const cookie=req.headers.get("cookie")||"";
  const match=cookie.match(/(?:^|;\s*)harmonia_session=([^;]+)/);
  if(match)auth="Bearer "+decodeURIComponent(match[1]);
 }
 if(!auth.startsWith("Bearer "))return null;
 const r=await fetch(SUPABASE_URL+"/auth/v1/user",{headers:{apikey:ANON_KEY,Authorization:auth}});
 if(!r.ok)return null;const user=await r.json();return user?.id?user:null;
}
async function admin(path,method="GET",body=null){
 const headers={apikey:ANON_KEY,Authorization:"Bearer "+SERVICE_ROLE_KEY};
 if(body!==null)headers["Content-Type"]="application/json";
 const prefs=method==="POST"?"resolution=merge-duplicates,return=minimal":((method==="PATCH"||method==="DELETE")?"return=minimal":null);
 const finalHeaders={...headers};if(prefs)finalHeaders.Prefer=prefs;
 const r=await fetch(SUPABASE_URL+"/rest/v1/"+path,{method,headers:finalHeaders,body:body===null?undefined:JSON.stringify(body)});
 if(!r.ok)throw new Error("credential_storage_failed");
 return r.status===204?null:await r.json().catch(()=>null);
}
async function handleSession(req){
 if(req.method==="DELETE")return new Response(JSON.stringify({signedOut:true}),{status:200,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","set-cookie":"harmonia_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"}});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 const user=await currentUser(req);if(!user)return reply({error:"登入驗證失敗。"},401);
 const token=(req.headers.get("authorization")||"").slice(7);let maxAge=3600;
 try{const payload=JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));if(Number.isFinite(payload.exp))maxAge=Math.max(60,payload.exp-Math.floor(Date.now()/1000));}catch{}
 return new Response(JSON.stringify({signedIn:true}),{status:200,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","set-cookie":"harmonia_session="+encodeURIComponent(token)+"; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age="+maxAge}});
}
async function handleApi(req,path){
 const user=await currentUser(req);if(!user)return reply({error:"登入已失效，請重新登入。"},401);
 const owner=encodeURIComponent(user.id);
 if(path==="/api/credentials"&&req.method==="GET"){
  const rows=await admin("api_credentials?select=provider,status,last_verified_at,last_error,updated_at&owner_id=eq."+owner+"&provider=eq.apify&limit=1");
  return reply({credential:rows?.[0]||null});
 }
 if(path==="/api/credentials"&&req.method==="PUT"){
  let body;try{body=await req.json()}catch{return reply({error:"請求格式錯誤。"},400)}
  if(typeof body.token!=="string"||body.token.trim().length<12||body.token.length>4096)return reply({error:"API Token 格式不正確。"},400);
  const enc=await encryptValue(body.token.trim());
  await admin("api_credentials?on_conflict=owner_id,provider","POST",{owner_id:user.id,provider:"apify",...enc,key_version:1,status:"saved",last_verified_at:null,last_error:null,updated_at:new Date().toISOString()});
  await admin("api_credential_events","POST",{owner_id:user.id,provider:"apify",event_type:"saved",metadata:{}});
  return reply({saved:true});
 }
 if(path==="/api/credentials/verify"&&req.method==="POST"){
  const rows=await admin("api_credentials?select=encrypted_value,encryption_iv,key_version&owner_id=eq."+owner+"&provider=eq.apify&limit=1");
  if(!rows?.length)return reply({error:"尚未配置 API Token。"},404);
  const secret=await decryptValue(rows[0]);let valid=false;
  try{const upstream=await fetch("https://api.apify.com/v2/users/me",{headers:{Authorization:"Bearer "+secret}});valid=upstream.ok}catch{}
  const now=new Date().toISOString();
  await admin("api_credentials?owner_id=eq."+owner+"&provider=eq.apify","PATCH",{status:valid?"verified":"verification_failed",last_verified_at:now,last_error:valid?null:"Token 無效、已撤銷或上游服務暫時不可用。",updated_at:now});
  await admin("api_credential_events","POST",{owner_id:user.id,provider:"apify",event_type:valid?"verified":"verification_failed",metadata:{}});
  return reply({valid});
 }
 if(path==="/api/credentials"&&req.method==="DELETE"){
  await admin("api_credential_events","POST",{owner_id:user.id,provider:"apify",event_type:"deleted",metadata:{}});
  await admin("api_credentials?owner_id=eq."+owner+"&provider=eq.apify","DELETE");
  return reply({deleted:true});
 }
 return reply({error:"Not found"},404);
}
Deno.serve(async(req)=>{
 const url=new URL(req.url);let path=url.pathname;const routePrefixes=["/functions/v1/harmonia-settings","/harmonia-settings"];
 for(const prefix of routePrefixes){if(path===prefix){path="/";break}if(path.startsWith(prefix+"/")){path=path.slice(prefix.length)||"/";break}}
 if(path.length>1&&path.endsWith("/"))path=path.slice(0,-1);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:corsHeaders});
 if(req.method==="GET"&&(path==="/"||path==="/login"||path==="/settings")){
  if(path==="/")return Response.redirect(new URL("/login",req.url),302);
  const page=path==="/settings"?html.replace('<div id="login" class="login">','<div id="login" class="login hidden">').replace('<div id="app" class="shell hidden">','<div id="app" class="shell">'):html;
  return new Response(page.replace("__PUBLISHABLE_KEY__",PUBLISHABLE_KEY),{status:200,headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer","content-security-policy":"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self' https://ehzdoevqqmmtetulcpbo.supabase.co; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'"}});
 }
 if(path==="/api/public-config"&&req.method==="GET")return reply({supabaseUrl:SUPABASE_URL,publishableKey:PUBLISHABLE_KEY});
 if(path==="/api/session")return await handleSession(req);
 if(path.startsWith("/api/")){
  if(!["GET","POST","PUT","DELETE"].includes(req.method))return reply({error:"Method not allowed"},405);
  try{return await handleApi(req,path)}catch{return reply({error:"服務暫時無法完成操作，請稍後重試。"},500)}
 }
 return reply({error:"Not found"},404);
});
