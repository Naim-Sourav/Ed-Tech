import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, UserRound, LogOut, ChevronDown, Flame } from "lucide-react";
import { useAuth } from "./authBridge";

export default function UserMenu() {
  const { user, profile, logOut } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!user) return null;

  const displayName = profile?.name || user.displayName || "শিক্ষার্থী";
  const initial = displayName.trim().charAt(0);

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="focus-ring group flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-1.5 pr-2.5 ring-1 ring-ink/10 transition-all hover:ring-brand/30"
      >
        <span className="ring-conic grid h-8 w-8 place-items-center rounded-full font-bangla text-[14px] font-bold text-white">
          {initial}
        </span>
        <span className="max-w-[88px] truncate text-[13.5px] font-bold text-ink">
          {displayName.split(" ")[0]}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-mist transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 origin-top-right overflow-hidden rounded-3xl bg-white shadow-[0_28px_60px_-20px_rgba(22,18,16,0.35)] ring-1 ring-ink/10"
          >
            <div className="border-b border-ink/6 px-5 py-4">
              <p className="truncate font-bangla text-[15.5px] font-bold text-ink">{displayName}</p>
              <p className="truncate text-[12px] font-medium text-mist">{user.email}</p>
              <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-brand-deep">
                <Flame className="h-3 w-3" fill="currentColor" /> ট্র্যাক: {profile?.track || "HSC"}
              </span>
            </div>
            <div className="p-2">
              {[
                { icon: LayoutDashboard, label: "আমার ড্যাশবোর্ড", href: "#/dashboard" },
                { icon: UserRound, label: "প্রোফাইল সেটিংস", href: "#/dashboard/profile" },
              ].map((item) => (
                <button
                  key={item.label}
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    window.location.hash = item.href;
                  }}
                  className="focus-ring flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13.5px] font-semibold text-ink/75 transition-colors hover:bg-mint/60 hover:text-brand-deep"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
              <button
                role="menuitem"
                onClick={async () => {
                  setOpen(false);
                  await logOut();
                }}
                className="focus-ring flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13.5px] font-semibold text-flag transition-colors hover:bg-flag/8"
              >
                <LogOut className="h-4 w-4" />
                লগ আউট
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
