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
:root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#161616;background:#f4f4f4;font-synthesis:none}*{box-sizing:border-box}body{margin:0;min-height:100vh}
.shell{display:grid;grid-template-columns:248px 1fr;min-height:100vh}aside{background:#161616;color:#f4f4f4;padding:24px 16px}.brand{font-size:19px;font-weight:650;padding:8px 12px 30px}.navlabel{color:#a8a8a8;font-size:12px;padding:12px}.navitem{display:flex;gap:12px;align-items:center;padding:12px;border-left:3px solid #0f62fe;background:#262626;font-size:14px}
main{min-width:0}.top{height:56px;background:#fff;border-bottom:1px solid #e0e0e0;display:flex;align-items:center;justify-content:space-between;padding:0 32px;font-size:13px}.content{max-width:920px;padding:44px 32px;margin:0 auto}.eyebrow{font-size:12px;color:#6f6f6f;margin-bottom:10px}.heading{font-size:28px;font-weight:400;margin:0 0 10px}.intro{font-size:14px;color:#525252;line-height:1.6;margin:0 0 32px}
.panel{background:#fff;padding:24px 24px 28px;margin-bottom:16px}.panelhead{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:8px}.panel h2{font-size:16px;font-weight:600;margin:0}.muted{font-size:13px;color:#6f6f6f;line-height:1.55}.status{font-size:12px;padding:4px 8px;background:#e8e8e8;color:#525252}.status.ok{background:#defbe6;color:#0e6027}.status.bad{background:#fff1f1;color:#a2191f}
label{display:block;font-size:13px;margin:22px 0 8px}input{width:100%;height:48px;padding:0 14px;border:1px solid #8d8d8d;background:#fff;border-radius:0;font:inherit;font-size:14px}input:focus{outline:2px solid #0f62fe;outline-offset:-2px}.actions{display:flex;gap:12px;margin-top:18px;flex-wrap:wrap}button{height:40px;padding:0 16px;border:0;background:#0f62fe;color:#fff;font-size:14px;cursor:pointer}button.secondary{background:#e0e0e0;color:#161616}button.danger{background:transparent;color:#da1e28;padding:0 8px}button:disabled{opacity:.5;cursor:wait}.help{margin-top:16px;font-size:12px;color:#6f6f6f;line-height:1.6}.notice{padding:12px 16px;background:#edf5ff;border-left:3px solid #0f62fe;font-size:13px;line-height:1.6;margin:20px 0}
.login{max-width:420px;margin:12vh auto;padding:32px;background:white}.login h1{font-size:24px;font-weight:400}.login input{margin-bottom:12px}.message{font-size:13px;margin-top:14px;min-height:18px;color:#525252}.hidden{display:none!important}.link{background:none;color:#0f62fe;padding:0;height:auto;text-decoration:underline}
@media(max-width:720px){.shell{grid-template-columns:1fr}aside{padding:12px 16px}.brand{padding:6px 8px 12px}.navlabel{display:none}.navitem{padding:10px}.content{padding:28px 16px}.top{padding:0 16px}.panel{padding:18px 16px}}
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
const API_BASE=location.pathname.replace(/\/$/,"");
let accessToken="";let signUpMode=false;
const $=id=>document.getElementById(id);
function setMessage(t,bad=false){$("message").textContent=t;$("message").style.color=bad?"#a2191f":"#525252"}
async function api(path,options={}){const h=new Headers(options.headers||{});h.set("Authorization","Bearer "+accessToken);h.set("apikey",SUPABASE_KEY);if(options.body)h.set("Content-Type","application/json");const r=await fetch(API_BASE+path,{...options,headers:h});const d=await r.json().catch(()=>({error:"伺服器回應格式錯誤"}));if(!r.ok)throw new Error(d.error||"請求失敗");return d}
function showApp(){$("login").classList.add("hidden");$("app").classList.remove("hidden");loadStatus()}
function showLogin(){$("app").classList.add("hidden");$("login").classList.remove("hidden")}
$("modeButton").addEventListener("click",()=>{signUpMode=!signUpMode;$("loginTitle").textContent=signUpMode?"建立 Harmonia 帳戶":"登入 Harmonia";$("loginButton").textContent=signUpMode?"建立帳戶":"登入";$("modeButton").textContent=signUpMode?"返回登入":"建立帳戶";});
$("loginForm").addEventListener("submit",async e=>{e.preventDefault();$("loginButton").disabled=true;$("loginMessage").textContent="正在處理…";try{const path=signUpMode?"/auth/v1/signup":"/auth/v1/token?grant_type=password";const r=await fetch(SUPABASE_URL+path,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY},body:JSON.stringify({email:$("email").value,password:$("password").value})});const d=await r.json();if(!r.ok)throw new Error(d.msg||d.message||"登入失敗");if(!d.access_token){$("loginMessage").textContent="帳戶已建立。如需郵件驗證，請先完成驗證，再登入。";return}accessToken=d.access_token;showApp()}catch(e){$("loginMessage").textContent=e.message}finally{$("loginButton").disabled=false}});
async function loadStatus(){try{const d=await api("/api/credentials");const c=d.credential;if(!c){$("status").textContent="未配置";$("status").className="status";$("detail").textContent="尚未保存 API Token。";return}const labels={saved:"已保存，待驗證",verified:"已連線",verification_failed:"驗證失敗",disabled:"已停用"};$("status").textContent=labels[c.status]||"已配置";$("status").className="status "+(c.status==="verified"?"ok":c.status==="verification_failed"?"bad":"");$("detail").textContent=(c.last_verified_at?"最近驗證："+new Date(c.last_verified_at).toLocaleString():"尚未驗證")+(c.last_error?"；原因："+c.last_error:"")+"。已保存的密鑰不會回傳明文。"}catch(e){setMessage(e.message,true)}}
$("saveVerify").addEventListener("click",async()=>{const token=$("apiToken").value.trim();if(!token){setMessage("請先輸入 API Token。",true);return}$("saveVerify").disabled=true;setMessage("正在加密保存並驗證…");try{await api("/api/credentials",{method:"PUT",body:JSON.stringify({token})});$("apiToken").value="";const v=await api("/api/credentials/verify",{method:"POST"});setMessage(v.valid?"密鑰保存成功，連線驗證通過。":"密鑰已保存，但驗證未通過。",!v.valid);await loadStatus()}catch(e){setMessage(e.message,true);await loadStatus()}finally{$("saveVerify").disabled=false}});
$("verify").addEventListener("click",async()=>{$("verify").disabled=true;setMessage("正在驗證…");try{const d=await api("/api/credentials/verify",{method:"POST"});setMessage(d.valid?"連線驗證通過。":"驗證失敗。",!d.valid);await loadStatus()}catch(e){setMessage(e.message,true)}finally{$("verify").disabled=false}});
$("remove").addEventListener("click",async()=>{if(!confirm("確定刪除此服務的 API 密鑰？"))return;$("remove").disabled=true;try{await api("/api/credentials",{method:"DELETE"});setMessage("密鑰已刪除。");$("apiToken").value="";await loadStatus()}catch(e){setMessage(e.message,true)}finally{$("remove").disabled=false}});
$("logout").addEventListener("click",()=>{accessToken="";showLogin();$("password").value=""});
</script></body></html>`;

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
 const auth=req.headers.get("authorization")||"";if(!auth.startsWith("Bearer "))return null;
 const r=await fetch(SUPABASE_URL+"/auth/v1/user",{headers:{apikey:ANON_KEY,Authorization:auth}});
 if(!r.ok)return null;const user=await r.json();return user?.id?user:null;
}
async function admin(path,method="GET",body=null){
 const headers={apikey:ANON_KEY,Authorization:"Bearer "+SERVICE_ROLE_KEY};
 if(body!==null)headers["Content-Type"]="application/json";
 const prefs=method==="POST"?"resolution=merge-duplicates,return=minimal":((method==="PATCH"||method==="DELETE")?"return=minimal":null);\n const finalHeaders={...headers};if(prefs)finalHeaders.Prefer=prefs;\n const r=await fetch(SUPABASE_URL+"/rest/v1/"+path,{method,headers:finalHeaders,body:body===null?undefined:JSON.stringify(body)});
 if(!r.ok)throw new Error("credential_storage_failed");
 return r.status===204?null:await r.json().catch(()=>null);
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
  return reply({saved:true});
 }
 if(path==="/api/credentials/verify"&&req.method==="POST"){
  const rows=await admin("api_credentials?select=encrypted_value,encryption_iv,key_version&owner_id=eq."+owner+"&provider=eq.apify&limit=1");
  if(!rows?.length)return reply({error:"尚未配置 API Token。"},404);
  const secret=await decryptValue(rows[0]);let valid=false;
  try{const upstream=await fetch("https://api.apify.com/v2/users/me",{headers:{Authorization:"Bearer "+secret}});valid=upstream.ok}catch{}
  const now=new Date().toISOString();
  await admin("api_credentials?owner_id=eq."+owner+"&provider=eq.apify","PATCH",{status:valid?"verified":"verification_failed",last_verified_at:now,last_error:valid?null:"Token 無效、已撤銷或上游服務暫時不可用。",updated_at:now});
  return reply({valid});
 }
 if(path==="/api/credentials"&&req.method==="DELETE"){
  await admin("api_credentials?owner_id=eq."+owner+"&provider=eq.apify","DELETE");
  return reply({deleted:true});
 }
 return reply({error:"Not found"},404);
}
Deno.serve(async(req)=>{
 const url=new URL(req.url);const base="/functions/v1/harmonia-settings";const path=url.pathname.startsWith(base)?(url.pathname.slice(base.length)||"/"):url.pathname;
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:corsHeaders});
 if(req.method==="GET"&&path==="/"){
  return new Response(html.replace("__PUBLISHABLE_KEY__",PUBLISHABLE_KEY),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer","content-security-policy":"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self' https://ehzdoevqqmmtetulcpbo.supabase.co; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'"}});
 }
 if(path.startsWith("/api/")){
  if(!["GET","POST","PUT","DELETE"].includes(req.method))return reply({error:"Method not allowed"},405);
  try{return await handleApi(req,path)}catch{return reply({error:"服務暫時無法完成操作，請稍後重試。"},500)}
 }
 return reply({error:"Not found"},404);
});
