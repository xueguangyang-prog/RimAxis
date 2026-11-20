const SUPABASE_URL = "https://ehzdoevqqmmtetulcpbo.supabase.co";
const SUPABASE_KEY = "";

const html = String.raw`<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Harmonia｜API 密鑰管理</title>
<style>
:root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#161616;background:#f4f4f4;font-synthesis:none}
*{box-sizing:border-box}body{margin:0;min-height:100vh}.shell{display:grid;grid-template-columns:248px 1fr;min-height:100vh}
aside{background:#161616;color:#f4f4f4;padding:24px 16px}.brand{font-size:19px;font-weight:650;letter-spacing:.2px;padding:8px 12px 30px}
.navlabel{color:#a8a8a8;font-size:12px;padding:12px}.navitem{display:flex;gap:12px;align-items:center;padding:12px;border-left:3px solid #0f62fe;background:#262626;font-size:14px}
main{min-width:0}.top{height:56px;background:#fff;border-bottom:1px solid #e0e0e0;display:flex;align-items:center;justify-content:space-between;padding:0 32px;font-size:13px}
.content{max-width:920px;padding:44px 32px;margin:0 auto}.eyebrow{font-size:12px;color:#6f6f6f;margin-bottom:10px}.heading{font-size:28px;font-weight:400;margin:0 0 10px}.intro{font-size:14px;color:#525252;line-height:1.6;margin:0 0 32px}
.panel{background:#fff;padding:24px 24px 28px;margin-bottom:16px}.panelhead{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:8px}.panel h2{font-size:16px;font-weight:600;margin:0}.muted{font-size:13px;color:#6f6f6f;line-height:1.55}
.status{font-size:12px;padding:4px 8px;background:#e8e8e8;color:#525252}.status.ok{background:#defbe6;color:#0e6027}.status.bad{background:#fff1f1;color:#a2191f}
label{display:block;font-size:13px;margin:22px 0 8px}input{width:100%;height:48px;padding:0 14px;border:1px solid #8d8d8d;background:#fff;border-radius:0;font:inherit;font-size:14px}input:focus{outline:2px solid #0f62fe;outline-offset:-2px}
.actions{display:flex;gap:12px;margin-top:18px;flex-wrap:wrap}button{height:40px;padding:0 16px;border:0;background:#0f62fe;color:#fff;font-size:14px;cursor:pointer}button.secondary{background:#e0e0e0;color:#161616}button.danger{background:transparent;color:#da1e28;padding:0 8px}button:disabled{opacity:.5;cursor:wait}
.help{margin-top:16px;font-size:12px;color:#6f6f6f;line-height:1.6}.notice{padding:12px 16px;background:#edf5ff;border-left:3px solid #0f62fe;font-size:13px;line-height:1.6;margin:20px 0}
.login{max-width:420px;margin:12vh auto;padding:32px;background:white}.login h1{font-size:24px;font-weight:400}.login input{margin-bottom:12px}
.message{font-size:13px;margin-top:14px;min-height:18px;color:#525252}.hidden{display:none!important}
@media(max-width:720px){.shell{grid-template-columns:1fr}aside{padding:12px 16px}.brand{padding:6px 8px 12px}.navlabel{display:none}.navitem{padding:10px}.content{padding:28px 16px}.top{padding:0 16px}.panel{padding:18px 16px}}
</style>
</head>
<body>
<div id="login" class="login">
<div class="eyebrow">HARMONIA WORKSPACE</div><h1>登入 Harmonia</h1>
<p class="muted">登入後管理你的外部服務連線憑據。</p>
<form id="loginForm"><label for="email">電子郵件</label><input id="email" type="email" autocomplete="username" required>
<label for="password">密碼</label><input id="password" type="password" autocomplete="current-password" required>
<button id="loginButton" type="submit">登入</button><div id="loginMessage" class="message"></div></form>
</div>
<div id="app" class="shell hidden">
<aside><div class="brand">Harmonia</div><div class="navlabel">工作區</div><div class="navitem"><span>⚙</span><span>設定 / API 密鑰</span></div></aside>
<main><header class="top"><span>設定　/　API 密鑰</span><button class="secondary" id="logout">登出</button></header>
<section class="content"><div class="eyebrow">設定中心</div><h1 class="heading">API 密鑰管理</h1>
<p class="intro">集中管理 Harmonia 外部資料服務的連線憑據。密鑰只會在提交時傳送至伺服器，保存後不會再次顯示。</p>
<div class="panel"><div class="panelhead"><h2>採集服務 API</h2><span id="status" class="status">讀取中</span></div>
<p class="muted">用於全球企業與地點資料發現。連線驗證成功後，才會允許後續採集任務使用。</p>
<div class="notice">安全提示：請使用新生成的 API Token。密鑰會在服務端使用 AES-256-GCM 加密後保存；資料庫只保存密文。</div>
<label for="apiToken">API Token</label><input id="apiToken" type="password" autocomplete="new-password" placeholder="貼上新的 API Token" spellcheck="false">
<div class="actions"><button id="saveVerify">保存並驗證</button><button id="verify" class="secondary">重新驗證</button><button id="remove" class="danger">刪除密鑰</button></div>
<div id="detail" class="help">正在讀取憑據狀態…</div><div id="message" class="message" role="status"></div>
</div>
<div class="muted">密鑰狀態與採集任務分開管理。驗證失敗不會啟動採集；後續可在此頁擴充其他服務提供商。</div>
</section></main></div>
<script>
const API = "";
let accessToken = "";
const $ = id => document.getElementById(id);
async function authFetch(path, options={}) {
 const headers = new Headers(options.headers || {});
 headers.set("Authorization", "Bearer " + accessToken);
 if(options.body && !headers.has("Content-Type")) headers.set("Content-Type","application/json");
 const r = await fetch(API + path, {...options,headers});
 const data = await r.json().catch(()=>({error:"伺服器回應格式錯誤"}));
 if(!r.ok) throw new Error(data.error || "請求失敗");
 return data;
}
function setMessage(text, bad=false){$("message").textContent=text;$("message").style.color=bad?"#a2191f":"#525252"}
function showApp(){ $("login").classList.add("hidden"); $("app").classList.remove("hidden"); loadStatus(); }
function showLogin(){ $("app").classList.add("hidden"); $("login").classList.remove("hidden"); }
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault(); $("loginButton").disabled=true; $("loginMessage").textContent="正在登入…";
 try{
  const r=await fetch("https://ehzdoevqqmmtetulcpbo.supabase.co/auth/v1/token?grant_type=password",{method:"POST",headers:{"Content-Type":"application/json","apikey":"sb_publishable_VqMW_gbCheRRti-ntdSlUg_1AHVOvaO"},body:JSON.stringify({email:$("email").value,password:$("password").value})});
  const d=await r.json(); if(!r.ok) throw new Error(d.msg||d.message||"登入失敗");
  accessToken=d.access_token; showApp();
 }catch(e){$("loginMessage").textContent=e.message}finally{$("loginButton").disabled=false}
});
async function loadStatus(){
 try{
  const d=await authFetch("/api/credentials"); const c=d.credential;
  if(!c){$("status").textContent="未配置";$("status").className="status";$("detail").textContent="尚未保存 API Token。";return}
  const labels={saved:"已保存，待驗證",verified:"已連線",verification_failed:"驗證失敗",disabled:"已停用"};
  $("status").textContent=labels[c.status]||"已配置";$("status").className="status "+(c.status==="verified"?"ok":c.status==="verification_failed"?"bad":"");
  $("detail").textContent=(c.last_verified_at?"最近驗證："+new Date(c.last_verified_at).toLocaleString():"尚未驗證")+(c.last_error?"；原因："+c.last_error:"")+"。已保存的密鑰不會回傳明文。";
 }catch(e){setMessage(e.message,true)}
}
$("saveVerify").addEventListener("click",async()=>{
 const token=$("apiToken").value.trim();if(!token){setMessage("請先輸入 API Token。",true);return}
 $("saveVerify").disabled=true;setMessage("正在加密保存並驗證…");
 try{await authFetch("/api/credentials",{method:"PUT",body:JSON.stringify({token})});$("apiToken").value="";const v=await authFetch("/api/credentials/verify",{method:"POST"});setMessage(v.valid?"密鑰保存成功，連線驗證通過。":"密鑰已保存，但驗證未通過。",!v.valid);await loadStatus()}
 catch(e){setMessage(e.message,true);await loadStatus()}finally{$("saveVerify").disabled=false}
});
$("verify").addEventListener("click",async()=>{ $("verify").disabled=true;setMessage("正在驗證…");try{const d=await authFetch("/api/credentials/verify",{method:"POST"});setMessage(d.valid?"連線驗證通過。":"驗證失敗。",!d.valid);await loadStatus()}catch(e){setMessage(e.message,true)}finally{$("verify").disabled=false}});
$("remove").addEventListener("click",async()=>{if(!confirm("確定刪除此服務的 API 密鑰？"))return;$("remove").disabled=true;try{await authFetch("/api/credentials",{method:"DELETE"});setMessage("密鑰已刪除。");$("apiToken").value="";await loadStatus()}catch(e){setMessage(e.message,true)}finally{$("remove").disabled=false}});
$("logout").addEventListener("click",()=>{accessToken="";showLogin();$("password").value="";});
</script>
</body></html>`;

function json(data, status=200) {
 return new Response(JSON.stringify(data), {status, headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
}
function hexToBytes(hex) { if(!/^[0-9a-f]{64}$/i.test(hex)) throw new Error("encryption_key_not_configured"); return Uint8Array.from(hex.match(/.{2}/g),x=>parseInt(x,16)); }
async function cryptoKey(env) { return crypto.subtle.importKey("raw",hexToBytes(env.HARMONIA_ENCRYPTION_KEY),"AES-GCM",false,["encrypt","decrypt"]); }
async function encryptToken(token,env) {
 const iv=crypto.getRandomValues(new Uint8Array(12)); const key=await cryptoKey(env);
 const ciphertext=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(token));
 return {encrypted_value:btoa(String.fromCharCode(...new Uint8Array(ciphertext))),encryption_iv:btoa(String.fromCharCode(...iv))};
}
async function decryptToken(row,env) {
 const key=await cryptoKey(env); const iv=Uint8Array.from(atob(row.encryption_iv),c=>c.charCodeAt(0));
 const data=Uint8Array.from(atob(row.encrypted_value),c=>c.charCodeAt(0));
 const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,data);
 return new TextDecoder().decode(plain);
}
async function supa(path,token,options={}) {
 const r=await fetch(SUPABASE_URL+"/rest/v1/"+path,{...options,headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+token,"Content-Type":"application/json",...(options.headers||{})}});
 if(!r.ok) throw new Error("database_request_failed");
 return r;
}
async function requireUser(request) {
 const bearer=request.headers.get("authorization")||"";
 if(!bearer.startsWith("Bearer ")) throw new Error("unauthorized");
 const token=bearer.slice(7);
 const r=await fetch(SUPABASE_URL+"/auth/v1/user",{headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+token}});
 if(!r.ok) throw new Error("unauthorized");
 const user=await r.json(); if(!user.id) throw new Error("unauthorized");
 return {token,user};
}
async function handleApi(request,env,url) {
 let auth;
 try { auth=await requireUser(request); } catch { return json({error:"登入已失效，請重新登入。"},401); }
 const token=auth.token;
 if(url.pathname==="/api/credentials" && request.method==="GET"){
  const r=await supa("api_credentials?select=provider,status,last_verified_at,last_error,updated_at&provider=eq.apify&limit=1",token);
  const rows=await r.json(); return json({credential:rows[0]||null});
 }
 if(url.pathname==="/api/credentials" && request.method==="PUT"){
  let body;try{body=await request.json()}catch{return json({error:"請求格式錯誤。"},400)}
  if(typeof body.token!=="string"||body.token.trim().length<12||body.token.length>4096) return json({error:"API Token 格式不正確。"},400);
  let enc;try{enc=await encryptToken(body.token.trim(),env)}catch{return json({error:"服務端加密配置尚未就緒。"},503)}
  const payload={provider:"apify",...enc,key_version:1,status:"saved",last_verified_at:null,last_error:null,updated_at:new Date().toISOString()};
  const r=await supa("api_credentials?on_conflict=owner_id,provider",token,{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(payload)});
  return json({saved:true});
 }
 if(url.pathname==="/api/credentials/verify" && request.method==="POST"){
  const r=await supa("api_credentials?select=encrypted_value,encryption_iv,key_version&provider=eq.apify&limit=1",token);
  const rows=await r.json(); if(!rows.length)return json({error:"尚未配置 API Token。"},404);
  let secret;try{secret=await decryptToken(rows[0],env)}catch{return json({error:"密鑰解密失敗，請重新保存。"},500)}
  let valid=false;
  try{const check=await fetch("https://api.apify.com/v2/users/me",{headers:{Authorization:"Bearer "+secret}});valid=check.ok;}catch{}
  const now=new Date().toISOString();
  const patch={status:valid?"verified":"verification_failed",last_verified_at:now,last_error:valid?null:"Token 無效、已撤銷或上游服務暫時不可用。",updated_at:now};
  await supa("api_credentials?provider=eq.apify",token,{method:"PATCH",body:JSON.stringify(patch),headers:{Prefer:"return=minimal"}});
  return json({valid});
 }
 if(url.pathname==="/api/credentials" && request.method==="DELETE"){
  await supa("api_credentials?provider=eq.apify",token,{method:"DELETE",headers:{Prefer:"return=minimal"}});
  return json({deleted:true});
 }
 return json({error:"Not found"},404);
}
export default {
 async fetch(request,env) {
  const url=new URL(request.url);
  if(request.method==="GET" && (url.pathname==="/"||url.pathname==="/settings/api-keys")){
   return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer","content-security-policy":"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self' https://ehzdoevqqmmtetulcpbo.supabase.co; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'"}});
  }
  if(url.pathname.startsWith("/api/")) {
   if(request.method!=="GET"&&request.method!=="PUT"&&request.method!=="POST"&&request.method!=="DELETE")return json({error:"Method not allowed"},405);
   return handleApi(request,env,url);
  }
  return new Response("Not found",{status:404});
 }
};