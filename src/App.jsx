import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  Feather, Search, Plus, Wallet, User, Briefcase,
  Star, CheckCircle2, Clock, ChevronLeft, Send,
  ShieldCheck, X, ChevronRight, LogOut, Loader2
} from "lucide-react";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
`;

function HandaSeal({ size = 16, color = "#C97A44" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" fill={color} />
    </svg>
  );
}

function Chip({ children, tone = "default" }) {
  const tones = {
    default: "bg-[#232a44] text-[#B9C0D4]",
    copper: "bg-[#C97A44]/15 text-[#DE9A66]",
    malachite: "bg-[#3FA77E]/15 text-[#5FC59A]",
    amber: "bg-[#E3A857]/15 text-[#E3A857]",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Loading({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#8891A6]">
      <Loader2 size={22} className="animate-spin mb-2" />
      <span className="text-xs">{label}</span>
    </div>
  );
}

function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("client");
  const [form, setForm] = useState({
    email: "", password: "", fullName: "", phone: "", specialty: "", rate: "", bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: signErr } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (signErr) throw signErr;
        const userId = data.user?.id;
        if (userId) {
          const { error: profErr } = await supabase.from("profiles").insert({
            id: userId,
            full_name: form.fullName,
            role,
            phone: form.phone,
            specialty: role === "writer" ? form.specialty : null,
            rate: role === "writer" ? form.rate : null,
            bio: role === "writer" ? form.bio : null,
          });
          if (profErr) throw profErr;
        }
        if (data.session) onAuthed();
        else setError("Check your email to confirm your account, then log in.");
      } else {
        const { error: loginErr } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (loginErr) throw loginErr;
        onAuthed();
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#12172B] flex justify-center">
      <style>{FONT_IMPORT}</style>
      <div className="w-full max-w-[420px] min-h-screen flex flex-col px-5 pt-14 pb-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-[#C97A44] flex items-center justify-center">
            <Feather size={17} color="#12172B" strokeWidth={2.5} />
          </div>
          <div className="text-[#F3ECDD] text-xl" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
            PenKwacha
          </div>
        </div>

        <h1 className="text-[#F3ECDD] text-2xl mb-1" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-[#8891A6] text-sm mb-6">
          {mode === "login" ? "Log in to see real jobs and bids." : "Real account, real jobs — no placeholder data."}
        </p>

        {mode === "signup" && (
          <div className="flex gap-2 mb-4">
            {["client", "writer"].map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 rounded-lg py-2.5 text-xs font-medium transition ${role === r ? "bg-[#C97A44] text-[#12172B]" : "bg-[#1B2138] text-[#8891A6] border border-white/5"}`}>
                {r === "client" ? "I'm hiring" : "I'm writing"}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {mode === "signup" && (
            <>
              <input placeholder="Full name" value={form.fullName} onChange={update("fullName")}
                className="w-full bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44]" />
              <input placeholder="Phone number" value={form.phone} onChange={update("phone")}
                className="w-full bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44]" />
            </>
          )}
          <input placeholder="Email" value={form.email} onChange={update("email")} type="email"
            className="w-full bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44]" />
          <input placeholder="Password" value={form.password} onChange={update("password")} type="password"
            className="w-full bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44]" />

          {mode === "signup" && role === "writer" && (
            <>
              <input placeholder="Specialty (e.g. Crypto & Fintech)" value={form.specialty} onChange={update("specialty")}
                className="w-full bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44]" />
              <input placeholder="Rate (e.g. K250/article)" value={form.rate} onChange={update("rate")}
                className="w-full bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44]" />
              <textarea placeholder="Short bio" value={form.bio} onChange={update("bio")} rows={3}
                className="w-full bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44] resize-none" />
            </>
          )}
        </div>

        {error && <p className="text-[#E3A857] text-xs mt-3">{error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#C97A44] disabled:opacity-60 text-[#12172B] rounded-lg py-3 mt-5 text-sm font-medium active:scale-95 transition">
          {loading ? <Loader2 size={14} className="animate-spin" /> : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          className="text-[#8891A6] text-xs mt-4 text-center">
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
    }function TopBar({ profile, onWallet, onLogout }) {
  return (
    <div className="sticky top-0 z-20 bg-[#12172B]/95 backdrop-blur border-b border-white/5">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C97A44] flex items-center justify-center">
            <Feather size={16} color="#12172B" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[#F3ECDD] text-lg leading-none" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
              PenKwacha
            </div>
            <div className="text-[10px] text-[#8891A6] tracking-wide">
              {profile?.full_name ? `Hi, ${profile.full_name.split(" ")[0]}` : "write it. earn it."}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onWallet} className="flex items-center gap-1.5 bg-[#1B2138] border border-white/10 rounded-full pl-2 pr-3 py-1.5 active:scale-95 transition">
            <Wallet size={14} color="#C97A44" />
            <span className="text-[#F3ECDD] text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Escrow</span>
          </button>
          <button onClick={onLogout} className="p-2 bg-[#1B2138] border border-white/10 rounded-full active:scale-95 transition">
            <LogOut size={14} color="#8891A6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onOpen }) {
  return (
    <button onClick={() => onOpen(job)} className="w-full text-left bg-[#1B2138] border border-white/5 rounded-2xl p-4 mb-3 active:scale-[0.98] transition relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[10px] flex flex-col justify-between py-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-[#12172B] -ml-1" />)}
      </div>
      <div className="pl-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[#F3ECDD] text-sm font-medium leading-snug pr-2">{job.title}</h3>
          <div className="shrink-0 mt-0.5"><HandaSeal size={12} /></div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.category && <Chip>{job.category}</Chip>}
          {job.deadline && <Chip tone="amber"><Clock size={10} /> {job.deadline}</Chip>}
          <Chip tone={job.status === "open" ? "malachite" : "default"}>{job.status}</Chip>
        </div>
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-white/5">
          <div className="text-[#DE9A66] text-base" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {job.currency === "ZMW" ? "K" : ""}{job.budget}{job.currency !== "ZMW" ? ` ${job.currency}` : ""}
          </div>
          <div className="text-[#8891A6] text-[11px] text-right">{new Date(job.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    </button>
  );
}

function WriterCard({ writer }) {
  const initials = (writer.full_name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-full bg-[#1B2138] border border-white/5 rounded-2xl p-4 mb-3">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3FA77E] to-[#12172B] flex items-center justify-center shrink-0">
          <span className="text-[#F3ECDD] text-sm" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[#F3ECDD] text-sm font-medium">{writer.full_name}</h3>
            {writer.verified && <HandaSeal size={12} color="#3FA77E" />}
          </div>
          <div className="text-[#8891A6] text-xs mt-0.5">{writer.specialty || "Freelance writer"}</div>
          {writer.rate && (
            <div className="text-[#DE9A66] text-xs mt-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{writer.rate}</div>
          )}
        </div>
      </div>
    </div>
  );
      }function JobDetail({ job, profile, onClose, onBidPlaced }) {
  const [bidAmount, setBidAmount] = useState("");
  const [note, setNote] = useState("");
  const [placed, setPlaced] = useState(false);
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from("bids")
        .select("*, profiles(full_name)")
        .eq("job_id", job.id)
        .order("created_at", { ascending: false });
      if (!err) setBids(data || []);
      setLoadingBids(false);
    })();
  }, [job.id]);

  async function submitBid() {
    setError("");
    const { error: err } = await supabase.from("bids").insert({
      job_id: job.id,
      writer_id: profile.id,
      amount: Number(bidAmount),
      note,
    });
    if (err) { setError(err.message); return; }
    setPlaced(true);
    onBidPlaced?.();
  }

  return (
    <div className="fixed inset-0 z-30 bg-[#12172B] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/5">
        <button onClick={onClose} className="p-1 -ml-1"><ChevronLeft size={20} color="#F3ECDD" /></button>
        <span className="text-[#F3ECDD] text-sm font-medium">Job details</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-[#F3ECDD] text-lg leading-snug" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>{job.title}</h2>
          <HandaSeal size={18} />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.category && <Chip>{job.category}</Chip>}
          {job.deadline && <Chip tone="amber"><Clock size={10} /> due in {job.deadline}</Chip>}
        </div>
        <p className="text-[#B9C0D4] text-sm leading-relaxed mt-4">{job.description}</p>
        <div className="flex items-center justify-between mt-5 bg-[#1B2138] rounded-xl p-4 border border-white/5">
          <div>
            <div className="text-[#8891A6] text-[11px]">Budget</div>
            <div className="text-[#DE9A66] text-xl" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {job.currency === "ZMW" ? "K" : ""}{job.budget}{job.currency !== "ZMW" ? ` ${job.currency}` : ""}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[#F3ECDD] text-sm font-medium mb-3">
            {loadingBids ? "Loading bids…" : `${bids.length} writer${bids.length === 1 ? "" : "s"} bid`}
          </h3>

          {profile.role === "writer" && !placed && (
            <div className="bg-[#1B2138] rounded-xl p-4 border border-white/5">
              <label className="text-[#8891A6] text-xs">Your bid (ZMW)</label>
              <input value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder={`e.g. ${job.budget}`} inputMode="numeric"
                className="w-full bg-[#12172B] border border-white/10 rounded-lg px-3 py-2 mt-1 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44]" />
              <label className="text-[#8891A6] text-xs mt-3 block">Note to client</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Briefly say why you're a fit…" rows={3}
                className="w-full bg-[#12172B] border border-white/10 rounded-lg px-3 py-2 mt-1 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44] resize-none" />
              {error && <p className="text-[#E3A857] text-xs mt-2">{error}</p>}
              <button onClick={submitBid} disabled={!bidAmount}
                className="w-full flex items-center justify-center gap-2 bg-[#C97A44] disabled:bg-[#3a3f52] disabled:text-[#8891A6] text-[#12172B] rounded-lg py-2.5 mt-4 text-sm font-medium active:scale-95 transition">
                <Send size={14} /> Submit bid
              </button>
            </div>
          )}

          {placed && (
            <div className="bg-[#3FA77E]/10 border border-[#3FA77E]/30 rounded-xl p-4 flex items-center gap-3 mb-3">
              <CheckCircle2 size={20} color="#3FA77E" />
              <div className="text-[#F3ECDD] text-sm">Bid submitted</div>
            </div>
          )}

          {bids.map((b) => (
            <div key={b.id} className="bg-[#1B2138] border border-white/5 rounded-xl p-3 mb-2 flex items-center justify-between">
              <div>
                <div className="text-[#F3ECDD] text-sm">{b.profiles?.full_name || "Writer"}</div>
                {b.note && <div className="text-[#8891A6] text-xs mt-0.5">{b.note}</div>}
              </div>
              <div className="text-[#DE9A66] text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>K{b.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
                    }function PostJobSheet({ profile, onClose, onPosted }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("ZMW");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("jobs").insert({
      client_id: profile.id,
      title, category, budget: Number(budget) || 0, currency, deadline, description,
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    onPosted?.();
  }

  return (
    <div className="fixed inset-0 z-30 bg-[#12172B] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/5">
        <button onClick={onClose} className="p-1 -ml-1"><X size={20} color="#F3ECDD" /></button>
        <span className="text-[#F3ECDD] text-sm font-medium">Post a job</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {!done ? (
          <>
            <div className="flex gap-1.5 mb-6">
              {[0, 1, 2].map((s) => <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-[#C97A44]" : "bg-[#232a44]"}`} />)}
            </div>
            {step === 0 && (
              <div>
                <h3 className="text-[#F3ECDD] text-base font-medium mb-1">What do you need written?</h3>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Blog posts for a fintech launch"
                  className="w-full bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44] mt-3" />
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. Copywriting)"
                  className="w-full bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44] mt-2" />
              </div>
            )}
            {step === 1 && (
              <div>
                <h3 className="text-[#F3ECDD] text-base font-medium mb-1">Budget & deadline</h3>
                <div className="flex gap-2 mt-3">
                  <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Amount" inputMode="numeric"
                    className="flex-1 bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44]" />
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-[#1B2138] border border-white/10 rounded-lg px-2 text-[#F3ECDD] text-sm">
                    <option>ZMW</option>
                    <option>USDT</option>
                    <option>ETH</option>
                    <option>BNB</option>
                  </select>
                </div>
                <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="Deadline (e.g. 5 days)"
                  className="w-full bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44] mt-2" />
              </div>
            )}
            {step === 2 && (
              <div>
                <h3 className="text-[#F3ECDD] text-base font-medium mb-1">Brief</h3>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Describe the work…"
                  className="w-full bg-[#1B2138] border border-white/10 rounded-lg px-3 py-3 text-[#F3ECDD] text-sm outline-none focus:border-[#C97A44] resize-none mt-3" />
              </div>
            )}
            {error && <p className="text-[#E3A857] text-xs mt-3">{error}</p>}
            <button onClick={() => step < 2 ? setStep(step + 1) : submit()} disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#C97A44] disabled:opacity-60 text-[#12172B] rounded-lg py-3 mt-6 text-sm font-medium active:scale-95 transition">
              {saving ? <Loader2 size={14} className="animate-spin" /> : step < 2 ? "Continue" : "Post job"} {!saving && <ChevronRight size={14} />}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center pt-10">
            <HandaSeal size={40} />
            <h3 className="text-[#F3ECDD] text-lg mt-4" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Job posted</h3>
            <p className="text-[#8891A6] text-sm mt-2 max-w-[26ch]">It's live in the database now — writers can bid on it.</p>
            <button onClick={onClose} className="bg-[#1B2138] border border-white/10 text-[#F3ECDD] rounded-lg py-2.5 px-6 mt-6 text-sm active:scale-95 transition">Done</button>
          </div>
        )}
      </div>
    </div>
  );function WalletSheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-30 bg-[#12172B] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/5">
        <button onClick={onClose} className="p-1 -ml-1"><X size={20} color="#F3ECDD" /></button>
        <span className="text-[#F3ECDD] text-sm font-medium">How escrow works</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="flex items-start gap-2 bg-[#3FA77E]/10 border border-[#3FA77E]/20 rounded-xl p-4">
          <ShieldCheck size={18} color="#3FA77E" className="shrink-0 mt-0.5" />
          <p className="text-[#5FC59A] text-sm leading-relaxed">
            Payments are currently handled manually while PenKwacha is early: once a bid is accepted,
            the client sends payment directly (mobile money or crypto) and it's released to the writer
            on approval. Automated in-app escrow is the next thing we build once there's real volume.
          </p>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab, onPost }) {
  const items = [
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "writers", label: "Writers", icon: User },
    { id: "post", label: "Post", icon: Plus, isAction: true },
    { id: "search", label: "Search", icon: Search },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1B2138]/95 backdrop-blur border-t border-white/5 flex items-center justify-around py-2 px-2">
      {items.map((it) => {
        const Icon = it.icon;
        if (it.isAction) {
          return (
            <button key={it.id} onClick={onPost} className="flex flex-col items-center justify-center -mt-6">
              <div className="w-12 h-12 rounded-full bg-[#C97A44] flex items-center justify-center shadow-lg active:scale-90 transition">
                <Icon size={20} color="#12172B" />
              </div>
            </button>
          );
        }
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} className="flex flex-col items-center gap-1 px-3 py-1">
            <Icon size={18} color={active ? "#C97A44" : "#8891A6"} />
            <span className={`text-[10px] ${active ? "text-[#C97A44]" : "text-[#8891A6]"}`}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MainApp({ session, profile }) {
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [writers, setWriters] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingWriters, setLoadingWriters] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [showPost, setShowPost] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  async function loadJobs() {
    setLoadingJobs(true);
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    setJobs(data || []);
    setLoadingJobs(false);
  }
  async function loadWriters() {
    setLoadingWriters(true);
    const { data } = await supabase.from("profiles").select("*").eq("role", "writer");
    setWriters(data || []);
    setLoadingWriters(false);
  }

  useEffect(() => { loadJobs(); loadWriters(); }, []);

  return (
    <div className="w-full min-h-screen bg-[#12172B] flex justify-center">
      <style>{FONT_IMPORT}</style>
      <div className="w-full max-w-[420px] min-h-screen bg-[#12172B] relative flex flex-col">
        <TopBar profile={profile} onWallet={() => setShowWallet(true)} onLogout={() => supabase.auth.signOut()} />

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
          {tab === "jobs" && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[#F3ECDD] text-sm font-medium">
                  {profile.role === "writer" ? "Open jobs" : "All jobs"}
                </h2>
                <span className="text-[#8891A6] text-xs">{jobs.length} total</span>
              </div>
              {loadingJobs ? <Loading label="Loading jobs…" /> : jobs.length === 0 ? (
                <p className="text-[#8891A6] text-sm text-center py-10">No jobs yet — be the first to post one.</p>
              ) : jobs.map((j) => <JobCard key={j.id} job={j} onOpen={setActiveJob} />)}
            </>
          )}
          {tab === "writers" && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[#F3ECDD] text-sm font-medium">Writers on PenKwacha</h2>
                <span className="text-[#8891A6] text-xs">{writers.length} shown</span>
              </div>
              {loadingWriters ? <Loading label="Loading writers…" /> : writers.length === 0 ? (
                <p className="text-[#8891A6] text-sm text-center py-10">No writers signed up yet.</p>
              ) : writers.map((w) => <WriterCard key={w.id} writer={w} />)}
            </>
          )}
          {tab === "search" && (
            <div className="flex flex-col items-center text-center pt-16">
              <Search size={28} color="#8891A6" />
              <p className="text-[#8891A6] text-sm mt-3 max-w-[24ch]">Search coming soon.</p>
            </div>
          )}
        </div>

        <BottomNav tab={tab} setTab={setTab} onPost={() => setShowPost(true)} />

        {activeJob && (
          <JobDetail job={activeJob} profile={profile} onClose={() => setActiveJob(null)} onBidPlaced={loadJobs} />
        )}
        {showPost && (
          <PostJobSheet profile={profile} onClose={() => { setShowPost(false); loadJobs(); }} onPosted={loadJobs} />
        )}
        {showWallet && <WalletSheet onClose={() => setShowWallet(false)} />}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    setLoadingProfile(true);
    supabase.from("profiles").select("*").eq("id", session.user.id).single()
      .then(({ data }) => { setProfile(data); setLoadingProfile(false); });
  }, [session]);

  if (session === undefined) {
    return <div className="w-full min-h-screen bg-[#12172B]"><Loading label="Loading…" /></div>;
  }
  if (!session) {
    return <AuthScreen onAuthed={() => {}} />;
  }
  if (loadingProfile || !profile) {
    return <div className="w-full min-h-screen bg-[#12172B]"><Loading label="Setting up your account…" /></div>;
  }

  return <MainApp session={session} profile={profile} />;
                  }
}
