const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLISHABLE_KEYS = (() => {
  try { return JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}"); } catch { return {}; }
})();
const PUBLISHABLE_KEY = PUBLISHABLE_KEYS.default || ANON_KEY;

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
  const target=path==="/"?"/login":path;
  return Response.redirect(new URL(target,"https://harmonia.xg-y-52f.workers.dev"),302);
 }
 if(path==="/api/public-config"&&req.method==="GET")return reply({supabaseUrl:SUPABASE_URL,publishableKey:PUBLISHABLE_KEY});
 if(path==="/api/session")return await handleSession(req);
 if(path.startsWith("/api/")){
  if(!["GET","POST","PUT","DELETE"].includes(req.method))return reply({error:"Method not allowed"},405);
  try{return await handleApi(req,path)}catch{return reply({error:"服務暫時無法完成操作，請稍後重試。"},500)}
 }
 return reply({error:"Not found"},404);
});
