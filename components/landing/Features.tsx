import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import {
  Archive,
  BarChart3,
  BookMarked,
  BrainCircuit,
  Check,
  Crown,
  Layers,
  Sparkles,
  Swords,
  WifiOff,
} from "lucide-react";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { Reveal, SectionTag, Stagger, StaggerItem, toBn } from "./helpers";

function GlowCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bg = useMotionTemplate`radial-gradient(280px circle at ${mx}px ${my}px, rgba(255,122,54,0.14), transparent 70%)`;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`group relative overflow-hidden rounded-[1.6rem] border border-ink-100 bg-white/80 backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-300/70 hover:shadow-[0_24px_60px_-24px_rgba(255,82,0,0.35)] ${className}`}
    >
      <motion.div style={{ background: bg }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

function IconTile({ grad, icon }: { grad: string; icon: ReactNode }) {
  return (
    <span
      className={`inline-grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${grad} text-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}
    >
      {icon}
    </span>
  );
}

/* mini visuals ------------------------------------------------------ */

function MiniOptionBars() {
  return (
    <div className="mt-6 space-y-2">
      {[72, 46, 88].map((w, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="grid size-6 place-items-center rounded-lg bg-brand-100 text-[11px] font-bold text-brand-700">
            {["ক", "খ", "গ"][i]}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${w}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-500"
            />
          </div>
          <span className="text-xs font-bold text-ink-500">{toBn(w)}%</span>
        </div>
      ))}
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
        <span className="grid size-5 place-items-center rounded-lg bg-emerald-500 text-[11px] font-bold text-white">খ</span>
        <span className="text-xs font-bold text-emerald-700">সঠিক উত্তর — দেখো কতজন ফাঁদে পড়েছে</span>
      </div>
    </div>
  );
}

function MiniRankRows() {
  const rows = [
    ["তানভীর", "from-brand-400 to-amber-600", "1.0"],
    ["নুসরাত", "from-amber-400 to-orange-600", "0.86"],
    ["তুমি", "from-amber-400 to-orange-500", "0.72"],
  ];
  return (
    <div className="relative mt-6 space-y-2">
      {rows.map(([name, grad, frac], i) => (
        <motion.div
          key={name as string}
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 + i * 0.14, duration: 0.6 }}
          className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
            name === "তুমি" ? "border-gold-400/60 bg-gold-50 shadow-md shadow-gold-400/20" : "border-ink-100 bg-white"
          }`}
        >
          <span className={`grid size-7 place-items-center rounded-full bg-gradient-to-br ${grad} text-[11px] font-bold text-white`}>
            {toBn(i + 1)}
          </span>
          <span className="text-[13px] font-bold text-ink-800">{name}</span>
          <div className="ml-auto h-1.5 w-20 overflow-hidden rounded-full bg-ink-100">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Number(frac) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 + i * 0.14 }}
              className={`h-full rounded-full bg-gradient-to-r ${grad}`}
            />
          </div>
        </motion.div>
      ))}
      <motion.span
        initial={{ opacity: 0, y: 8, scale: 0.85 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9, type: "spring", stiffness: 300, damping: 18 }}
        className="absolute -right-1 -top-3 rounded-full bg-gradient-to-r from-gold-400 to-orange-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-orange-500/40"
      >
        ↑ ৩ ধাপ এগিয়েছো!
      </motion.span>
    </div>
  );
}

function MiniAnalytics() {
  const bars = [38, 62, 45, 80, 58, 92, 74, 88];
  return (
    <div className="mt-6 flex items-end gap-1.5">
      {bars.map((h, i) => (
        <div key={i} className="group/bar relative flex-1">
          <motion.div
            initial={{ height: 6 }}
            whileInView={{ height: h * 0.85 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full rounded-md ${i === 5 ? "bg-gradient-to-t from-brand-600 to-amber-400" : "bg-brand-200/80"} transition-colors group-hover/bar:bg-brand-500`}
          />
        </div>
      ))}
      <span className="ml-2 self-start rounded-lg bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
        +৩৪%
      </span>
    </div>
  );
}

function MiniOrbit() {
  return (
    <div className="relative mt-4 h-28">
      <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl shadow-brand-500/40">
        <BookMarked className="size-5" />
      </span>
      {[
        { x: "-118%", y: "-105%", d: 0, c: "bg-rose-400", label: "এক্সাম মোড" },
        { x: "18%", y: "-128%", d: 1.4, c: "bg-emerald-400", label: "অধ্যায় অনুশীলন" },
        { x: "-140%", y: "55%", d: 2.6, c: "bg-sky-400", label: "বুস্টার সেট" },
        { x: "20%", y: "70%", d: 0.8, c: "bg-gold-500", label: "ডেইলি গোল" },
      ].map((n) => (
        <motion.span
          key={n.label}
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="absolute left-1/2 top-1/2"
          style={{ translateX: n.x, translateY: n.y }}
        >
          <span className="animate-float flex items-center gap-1.5 rounded-full border border-ink-100 bg-white px-2.5 py-1 text-[11px] font-bold text-ink-700 shadow-md" style={{ animationDelay: `${n.d}s` }}>
            <span className={`size-1.5 rounded-full ${n.c}`} />
            {n.label}
          </span>
        </motion.span>
      ))}
      <span className="animate-spin-slow absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-brand-300/60" />
    </div>
  );
}

function MiniBoardArchive() {
  const years = ["'১৫", "'১৭", "'১৯", "'২১", "'২৩", "'২৫"];
  return (
    <div className="mt-6 grid grid-cols-3 gap-2" aria-hidden="true">
      {years.map((y, i) => (
        <motion.div
          key={y}
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 + i * 0.08, duration: 0.45 }}
          className="flex items-center justify-between rounded-xl bg-brand-50/70 px-3 py-2.5 ring-1 ring-ink-100 transition-colors group-hover:bg-brand-100/70"
        >
          <span className="font-display text-[14px] font-bold text-ink-950">২০{y.slice(1)}</span>
          <span className="grid size-5 place-items-center rounded-full bg-brand-500 text-white">
            <Check className="size-3" strokeWidth={3.5} />
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function MiniPodium() {
  const rows = [
    { name: "সাদিয়া", h: "h-24", pts: "২,৮৪০", crown: true, bg: "bg-gold-300/40 text-ink-950 ring-gold-400/60" },
    { name: "তুমি", h: "h-16", pts: "২,৭১৫", crown: false, bg: "bg-amber-100 text-ink-950 ring-amber-300" },
    { name: "মেহরাব", h: "h-12", pts: "২,৬৯০", crown: false, bg: "bg-brand-100 text-ink-700 ring-brand-200" },
  ];
  return (
    <div className="mt-6 flex items-end justify-center gap-3 rounded-2xl bg-brand-50/50 p-4 pt-6 ring-1 ring-ink-100" aria-hidden="true">
      {[rows[1], rows[0], rows[2]].map((p, i) => (
        <div key={p.name} className="flex flex-col items-center gap-1.5">
          {p.crown && <Crown className="size-4 text-gold-500" fill="currentColor" />}
          <span className="text-[11px] font-bold text-ink-500">{p.pts}</span>
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: "auto" }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`grid w-20 place-items-center rounded-t-xl ring-1 ${p.bg} ${p.h}`}
          >
            <span className="font-display text-[12px] font-bold">{p.name}</span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28" aria-label="ফিচারস">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionTag icon={<Sparkles className="size-4" />} label="সবকিছু এক প্ল্যাটফর্মে" />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display mt-5 text-4xl font-bold leading-[1.15] tracking-tight text-ink-950 sm:text-5xl">
              প্রস্তুতির যে অস্ত্র লাগে,
              <br />
              <span className="text-gradient">সব এখানেই আছে</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-lg leading-relaxed text-ink-600">
              শুধু পরীক্ষা দেওয়া নয় — তোমার দুর্বলতা ধরো, ট্র্যাক করো, আর পরিকল্পনামতো জয় করো।
            </p>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid gap-5 md:grid-cols-6" gap={0.12}>
          {/* 1 — question bank */}
          <StaggerItem className="md:col-span-4">
            <GlowCard>
              <div className="grid h-full p-7 sm:grid-cols-2 sm:items-center sm:p-8">
                <div>
                  <IconTile grad="from-brand-500 to-brand-700" icon={<Layers className="size-5.5" strokeWidth={2.2} />} />
                  <h3 className="font-display mt-5 text-2xl font-bold text-ink-950">অধ্যায়ভিত্তিক বিশাল প্রশ্ন ব্যাংক</h3>
                  <p className="mt-3 leading-relaxed text-ink-600">
                    বোর্ড, স্কুল-কলেজ টেস্ট ও ভর্তি — তিন স্তরের <span className="font-semibold text-ink-800">৫২,০০০+ প্রশ্ন</span> অধ্যায়, টপিক
                    ও বছর অনুযায়ী সাজানো। প্রতিটি অপশনে দেখো কত শতাংশ শিক্ষার্থী ফাঁদে পড়েছে।
                  </p>
                </div>
                <div className="rounded-2xl border border-ink-100 bg-gradient-to-br from-brand-50/80 to-white p-4 sm:ml-6">
                  <MiniOptionBars />
                </div>
              </div>
            </GlowCard>
          </StaggerItem>

          {/* 2 — explanation */}
          <StaggerItem className="md:col-span-2">
            <GlowCard>
              <div className="flex h-full flex-col p-7 sm:p-8">
                <IconTile grad="from-amber-400 to-orange-600" icon={<BookMarked className="size-5.5" strokeWidth={2.2} />} />
                <h3 className="font-display mt-5 text-2xl font-bold text-ink-950">বই-রেফারেন্সসহ ব্যাখ্যা</h3>
                <p className="mt-3 leading-relaxed text-ink-600">
                  শুধু উত্তর নয় — ধাপে ধাপে সমাধান, পেজ-নম্বরসহ রেফারেন্স, আর মোড়ক টিপ।
                </p>
                <div className="mt-auto pt-5">
                  <div className="rounded-xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-[13px] font-medium leading-relaxed text-amber-900">
                    “T(r+1) = ⁸Cᵣ (-1)ʳ x⁽⁸⁻²ʳ⁾ — x-বর্জিত হতে হলে ৮−২r=০, অর্থাৎ r=৪...”
                    <span className="mt-1.5 block text-[11.5px] font-bold text-amber-600/90">— উচ্চতর গণিত ১ম পত্র, পৃ. ২৮৪</span>
                  </div>
                </div>
              </div>
            </GlowCard>
          </StaggerItem>

          {/* 3 — live exam */}
          <StaggerItem className="md:col-span-2">
            <GlowCard>
              <div className="flex h-full flex-col p-7 sm:p-8">
                <IconTile grad="from-ink-800 to-ink-950" icon={<Swords className="size-5.5" strokeWidth={2.2} />} />
                <h3 className="font-display mt-5 text-2xl font-bold text-ink-950">লাইভ এক্সাম ও দেশসেরা র‍্যাংক</h3>
                <p className="mt-3 leading-relaxed text-ink-600">প্রতিদিনই লাইভ মক — শেষেই মেধাক্রম, পারসেন্টাইল আর সেরাদের বিশ্লেষণ।</p>
                <MiniRankRows />
              </div>
            </GlowCard>
          </StaggerItem>

          {/* 4 — analytics */}
          <StaggerItem className="md:col-span-2">
            <GlowCard>
              <div className="flex h-full flex-col p-7 sm:p-8">
                <IconTile grad="from-emerald-500 to-teal-600" icon={<BarChart3 className="size-5.5" strokeWidth={2.2} />} />
                <h3 className="font-display mt-5 text-2xl font-bold text-ink-950">স্মার্ট অ্যানালিটিক্স</h3>
                <p className="mt-3 leading-relaxed text-ink-600">কোন টপিকে দুর্বল, কত দ্রুত সলভ করছো — সাপ্তাহিক রিপোর্টে সব পরিস্কার।</p>
                <MiniAnalytics />
                <p className="mt-3 flex items-center justify-between text-xs font-semibold text-ink-500">
                  <span>সাপ্তাহিক সঠিকতার হার</span>
                  <span className="text-emerald-600">ধারাবাহিক উন্নতি</span>
                </p>
              </div>
            </GlowCard>
          </StaggerItem>

          {/* 5 — wrong book + revision loops */}
          <StaggerItem className="md:col-span-2">
            <GlowCard>
              <div className="flex h-full flex-col p-7 sm:p-8">
                <IconTile grad="from-rose-500 to-rose-600" icon={<BrainCircuit className="size-5.5" strokeWidth={2.2} />} />
                <h3 className="font-display mt-5 text-2xl font-bold text-ink-950">ভুল বুক ও অ্যাডাপ্টিভ রিভিশন</h3>
                <p className="mt-3 leading-relaxed text-ink-600">
                  প্রতিটি ভুল স্বয়ংক্রিয়ভাবে “ভুল বুকে” জমা হয়, আর স্পেসড-রিপিটিশন লুপে ঠিক সময়েই আবার সামনে চলে আসে।
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["বিন্যাস", "Idioms", "কোষ বিভাজন", "ত্রিকোণমিতি"].map((t) => (
                    <span key={t} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                      ↻ {t}
                    </span>
                  ))}
                </div>
              </div>
            </GlowCard>
          </StaggerItem>

          {/* 6 — offline-ish */}
          <StaggerItem className="md:col-span-6 lg:col-span-2">
            <GlowCard>
              <div className="p-7 sm:p-8">
                <IconTile grad="from-ink-700 to-ink-950" icon={<WifiOff className="size-5.5" strokeWidth={2.2} />} />
                <h3 className="font-display mt-5 text-2xl font-bold text-ink-950">অফলাইনেও অনুশীলন চালু</h3>
                <p className="mt-3 leading-relaxed text-ink-600">সেট ডাউনলোড করো একবার — গ্রামে, রাস্তায়, নেট ছাড়াও পড়া চলবে, পরে সিনক হবে।</p>
                <MiniOrbit />
              </div>
            </GlowCard>
          </StaggerItem>

          {/* 7 — board archive (previous landing page) */}
          <StaggerItem className="md:col-span-3 lg:col-span-2">
            <GlowCard>
              <div className="flex h-full flex-col p-7 sm:p-8">
                <IconTile grad="from-amber-500 to-orange-600" icon={<Archive className="size-5.5" strokeWidth={2.2} />} />
                <h3 className="font-display mt-5 text-2xl font-bold text-ink-950">বোর্ড প্রশ্ন আর্কাইভ</h3>
                <p className="mt-3 leading-relaxed text-ink-600">
                  গত ১৫ বছরের সব বোর্ড ও টপ কলেজের টেস্ট পেপার — প্রতিটি প্রশ্নে বোর্ড-স্ট্যান্ডার্ড সমাধান ও মার্কিং হিন্টস।
                </p>
                <MiniBoardArchive />
              </div>
            </GlowCard>
          </StaggerItem>

          {/* 8 — battle & leaderboard (previous landing page) */}
          <StaggerItem className="md:col-span-3 lg:col-span-2">
            <GlowCard>
              <div className="flex h-full flex-col p-7 sm:p-8">
                <IconTile grad="from-brand-500 to-amber-500" icon={<Swords className="size-5.5" strokeWidth={2.2} />} />
                <h3 className="font-display mt-5 text-2xl font-bold text-ink-950">কুইজ ব্যাটল ও লিডারবোর্ড</h3>
                <p className="mt-3 leading-relaxed text-ink-600">
                  বন্ধুকে ১v১ ব্যাটলে ডাকো, জাতীয় লিডারবোর্ডে নাম তোলো — প্রস্তুতির গেমিফিকেশন যা তোমাকে প্রতিদিন ফিরিয়ে আনবে।
                </p>
                <MiniPodium />
              </div>
            </GlowCard>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
