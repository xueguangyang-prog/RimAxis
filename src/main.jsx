import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, useMotionValue, useTransform } from "motion/react";
import "./index.css";

function Brand() {
  return <div className="flex items-center gap-3">
    <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-violet-200 via-indigo-400 to-cyan-300 font-black text-slate-950 shadow-[0_0_30px_#8b5cf655]">H</div>
    <div><strong className="text-sm tracking-[.18em]">HARMONIA</strong><small className="mt-1 block text-[9px] tracking-[.22em] text-violet-200/50">GLOBAL INTELLIGENCE</small></div>
  </div>;
}

/* Aceternity-inspired source components: BackgroundBeams, CardSpotlight, MovingBorder */
function BackgroundBeams() {
  const paths = useMemo(() => Array.from({ length: 8 }, (_, i) =>
    `M ${-380 + i * 7} -189 C ${-380 + i * 7} -189 -312 216 152 343 S 684 875 684 875`), []);
  return <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-40">
    <svg viewBox="0 0 696 316" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>{paths.map((_, i) => <motion.linearGradient key={i} id={`beam-${i}`} animate={{ x1: ["0%", "100%"], x2: ["0%", "95%"], y1: ["0%", "100%"], y2: ["0%", `${(93 + i) % 100}%`] }} transition={{ duration: 12 + i * 1.2, repeat: Infinity, ease: "easeInOut" }}>
        <stop offset="0%" stopColor="#18CCFC" stopOpacity="0" /><stop offset="32%" stopColor="#6344F5" /><stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
      </motion.linearGradient>)}</defs>
      {paths.map((d, i) => <path key={i} d={d} stroke={`url(#beam-${i})`} strokeWidth=".8" strokeOpacity=".55" fill="none" />)}
    </svg>
  </div>;
}

function CardSpotlight({ children, className = "" }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const mask = useTransform([x, y], ([a, b]) => `radial-gradient(350px circle at ${a}px ${b}px, white, transparent 80%)`);
  const [active, setActive] = useState(false);
  return <section className={`spotlight-card ${className}`} onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); x.set(e.clientX-r.left); y.set(e.clientY-r.top); }} onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)}>
    <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-violet-500 mix-blend-screen" style={{ maskImage: mask, opacity: active ? 0.2 : 0 }} />
    <div className="relative z-10">{children}</div>
  </section>;
}

function MovingBorderButton({ children, className = "", ...props }) {
  return <button className={`moving-border ${className}`} {...props}>
    <span className="moving-border-glow" aria-hidden />
    <span className="relative z-10 flex h-full w-full items-center justify-center rounded-[10px] bg-gradient-to-r from-violet-700 via-indigo-600 to-cyan-700 px-5 text-white">{children}</span>
  </button>;
}

function App() {
  const settings = location.pathname === "/settings";
  const [config, setConfig] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [credential, setCredential] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [token, setToken] = useState("");
  const [detail, setDetail] = useState("正在讀取憑據狀態…");

  async function api(path, options = {}) {
    const response = await fetch("/api" + path, { ...options, credentials: "same-origin", headers: { "content-type": "application/json", ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({ error: "伺服器回應格式錯誤" }));
    if (!response.ok) throw new Error(data.error || "請求失敗");
    return data;
  }
  async function refresh() {
    try {
      const data = await api("/credentials");
      setCredential(data.credential || null); setLoaded(true);
      const c = data.credential;
      setDetail(!c ? "尚未保存 API Token。" : (c.last_verified_at ? "最近驗證：" + new Date(c.last_verified_at).toLocaleString() : "尚未驗證") + (c.last_error ? " · " + c.last_error : "") + "。密鑰不會回傳至瀏覽器。");
    } catch (e) {
      if (/登入已失效|401/.test(e.message)) { location.replace("/login"); return; }
      setDetail(e.message); setError(true); setLoaded(true);
    }
  }
  useEffect(() => { fetch("/api/public-config").then(r => r.json()).then(setConfig).catch(() => { setError(true); setMessage("無法載入登入設定。"); }); }, []);
  useEffect(() => { if (settings) refresh(); }, [settings]);

  async function submit(e) {
    e.preventDefault(); if (!config) return;
    setBusy("auth"); setError(false); setMessage("正在安全驗證…");
    try {
      const response = await fetch(signup ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password", {
        method: "POST", headers: { apikey: config.publishableKey, "content-type": "application/json" }, body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || data.message || data.error_description || "登入失敗");
      if (!data.access_token) { setMessage("帳戶已建立，請依電子郵件完成驗證後登入。"); return; }
      await api("/session", { method: "POST", headers: { Authorization: "Bearer " + data.access_token } });
      location.assign("/settings");
    } catch (e) { setError(true); setMessage(e.message); } finally { setBusy(""); }
  }
  async function logout() { await api("/session", { method: "DELETE" }).catch(() => {}); location.replace("/login"); }
  async function save() {
    if (token.trim().length < 12) { setError(true); setMessage("請輸入有效的 API Token。"); return; }
    setBusy("save"); setError(false); setMessage("正在加密保存並驗證…");
    try {
      await api("/credentials", { method: "PUT", body: JSON.stringify({ token: token.trim() }) });
      setToken(""); const result = await api("/credentials/verify", { method: "POST" });
      setMessage(result.valid ? "密鑰保存成功，連線驗證通過。" : "密鑰已保存，但驗證未通過。"); setError(!result.valid); await refresh();
    } catch (e) { setError(true); setMessage(e.message); await refresh(); } finally { setBusy(""); }
  }
  async function verify() {
    setBusy("verify"); setError(false); setMessage("正在重新驗證…");
    try { const result = await api("/credentials/verify", { method: "POST" }); setMessage(result.valid ? "連線驗證通過。" : "驗證未通過。"); setError(!result.valid); await refresh(); }
    catch (e) { setError(true); setMessage(e.message); } finally { setBusy(""); }
  }
  async function remove() {
    if (!window.confirm("確定刪除此 API 密鑰？")) return;
    setBusy("remove");
    try { await api("/credentials", { method: "DELETE" }); setToken(""); setMessage("API 密鑰已刪除。"); setError(false); await refresh(); }
    catch (e) { setError(true); setMessage(e.message); } finally { setBusy(""); }
  }

  const feedback = message && <p role="status" className={`mt-4 min-h-5 text-xs leading-6 ${error ? "text-rose-300" : "text-violet-200"}`}>{message}</p>;
  if (!settings) return <main className="grid min-h-screen place-items-center px-4 py-8">
    <BackgroundBeams />
    <CardSpotlight className="w-full max-w-[450px] rounded-3xl border border-violet-300/20 bg-gradient-to-br from-[#1b1630]/95 to-[#0d0d1c]/95 p-7 shadow-2xl sm:p-9">
      <Brand /><p className="mt-9 text-[10px] font-bold tracking-[.23em] text-violet-200">SECURE WORKSPACE</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">{signup ? "建立你的工作空間" : "歡迎回到 Harmonia"}</h1>
      <p className="mt-3 text-sm leading-7 text-violet-100/60">{signup ? "建立帳戶以安全管理外部服務連線。" : "登入後管理外部資料服務與 API 連線憑據。"}</p>
      <form onSubmit={submit} className="mt-7 space-y-5">
        <label className="block text-xs text-violet-100/90">電子郵件<input className="field-input mt-2" type="email" required autoComplete="username" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="block text-xs text-violet-100/90">密碼<input className="field-input mt-2" type="password" required autoComplete={signup ? "new-password" : "current-password"} placeholder="輸入密碼" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <MovingBorderButton className="h-12 w-full" disabled={busy === "auth" || !config}>{busy === "auth" ? "請稍候…" : signup ? "建立帳戶" : "登入工作區"}</MovingBorderButton>
      </form>
      <button className="mt-4 w-full py-3 text-xs text-violet-200" onClick={() => { setSignup(!signup); setMessage(""); setError(false); }}>{signup ? "已有帳戶？返回登入" : "尚未有帳戶？建立帳戶"}</button>
      {feedback}
      <div className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-6 text-violet-100/45">登入憑據由 Supabase Auth 驗證。API Token 不會儲存在瀏覽器本地，也不會顯示於網址。</div>
    </CardSpotlight>
  </main>;

  return <div className="min-h-screen md:grid md:grid-cols-[245px_1fr]">
    <BackgroundBeams />
    <aside className="border-b border-white/10 bg-[#090916]/80 p-4 backdrop-blur-xl md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:p-6">
      <Brand /><p className="mb-3 mt-12 px-3 text-[10px] tracking-[.2em] text-violet-100/40 max-md:hidden">WORKSPACE</p>
      <div className="rounded-xl border border-violet-300/20 bg-gradient-to-r from-violet-500/20 to-cyan-500/10 p-3 text-sm max-md:hidden">✧　API 連線設定</div>
      <p className="absolute bottom-6 hidden text-[11px] leading-6 text-violet-100/40 md:block">Harmonia Workspace<br />安全管理外部服務憑據</p>
    </aside>
    <main className="min-w-0">
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#090916]/50 px-5 backdrop-blur-xl md:h-16 md:px-11"><span className="text-xs text-violet-100/55">工作區　/　API 連線設定</span><button onClick={logout} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] text-violet-100/80">登出</button></header>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-11 md:py-14">
        <p className="text-[10px] font-bold tracking-[.23em] text-violet-200">SETTINGS / INTEGRATIONS</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">API 連線設定</h1>
        <p className="mb-8 mt-3 max-w-2xl text-sm leading-7 text-violet-100/55">集中管理 Harmonia 外部資料服務的連線憑據。Token 僅在提交時傳送至伺服器，保存後不會再次顯示。</p>
        <CardSpotlight className="rounded-3xl border border-violet-300/20 bg-gradient-to-br from-[#1b1630]/95 to-[#0d0d1c]/95 p-5 shadow-2xl md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-white">外部服務憑據</h2><p className="mt-2 text-xs text-violet-100/45">管理資料發現服務的授權狀態</p></div><span className={`rounded-full border px-3 py-2 text-[10px] ${credential?.status === "verified" ? "border-emerald-400/40 text-emerald-300" : credential?.status === "verification_failed" ? "border-rose-400/40 text-rose-300" : "border-white/15 text-violet-100/70"}`}>{credential?.status === "verified" ? "已連線" : credential?.status === "verification_failed" ? "驗證失敗" : credential ? "已配置" : loaded ? "未配置" : "讀取中"}</span></div>
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#080816]/70 p-4"><div className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-xl text-violet-200">◎</div><div><p className="text-sm font-semibold text-white">採集服務 API</p><p className="mt-1 text-[10px] text-violet-100/45">用於全球企業與地點資料發現</p></div><span className="ml-auto rounded-full border border-white/15 px-3 py-2 text-[10px] text-violet-100/70">API TOKEN</span></div>
          <label className="block text-xs text-violet-100/90">API Token<input className="field-input mt-2" type="password" autoComplete="new-password" placeholder="輸入新的 API Token" value={token} onChange={e => setToken(e.target.value)} /></label>
          <p className="mt-3 text-[11px] leading-6 text-violet-100/45">保存後由伺服器使用 AES-256-GCM 加密。主密鑰由 Supabase Vault 管理；瀏覽器不保存 Token。</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <MovingBorderButton className="col-span-2 h-11 sm:min-w-40" disabled={!!busy || !token.trim()} onClick={save}>{busy === "save" ? "保存中…" : "保存並驗證"}</MovingBorderButton>
            <button className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-xs text-violet-100 disabled:opacity-40" disabled={!!busy || !credential} onClick={verify}>{busy === "verify" ? "驗證中…" : "重新驗證"}</button>
            <button className="h-11 rounded-xl border border-rose-400/30 bg-rose-400/5 px-4 text-xs text-rose-200 disabled:opacity-40" disabled={!!busy || !credential} onClick={remove}>{busy === "remove" ? "刪除中…" : "刪除密鑰"}</button>
          </div>
          <p className="mt-5 text-[11px] leading-6 text-violet-100/60">{detail}</p>{feedback}
          <div className="mt-5 rounded-xl border border-cyan-300/15 bg-cyan-400/5 p-4 text-[11px] leading-6 text-violet-100/60"><b className="text-violet-200">安全提示</b><br />驗證失敗不會啟動採集任務；密鑰狀態與採集任務分開管理。</div>
        </CardSpotlight>
        <p className="mt-6 text-[10px] text-violet-100/35">HARMONIA WORKSPACE · PRIVATE CONNECTIONS</p>
      </div>
    </main>
  </div>;
}

createRoot(document.getElementById("root")).render(<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28 }}><App /></motion.div>);
