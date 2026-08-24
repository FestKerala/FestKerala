import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { TAG_STYLES, type Fest, type Category } from "./types";

function formatDateRange(start: string, end: string) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (start === end)
    return s.toLocaleDateString("en-IN", { ...opts, year: "numeric" });
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${s.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`;
  }
  return `${s.toLocaleDateString("en-IN", opts)} – ${e.toLocaleDateString("en-IN", { ...opts, year: "numeric" })}`;
}

function TagPill({ tag }: { tag: Category }) {
  return (
    <span
      className={`inline-block text-[10.5px] font-medium px-2.5 py-0.5 rounded-full border ${TAG_STYLES[tag]}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {tag}
    </span>
  );
}

export default function FestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fest, setFest] = useState<Fest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("fests")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setFest(data as Fest);
        }
        setLoading(false);
      });
  }, [id]);

  const shareFest = async () => {
    if (!fest) return;
    const shareText = `${fest.fest_name} at ${fest.college_name} — ${formatDateRange(fest.start_date, fest.end_date)}, ${fest.district}.`;
    const shareUrl = window.location.href;
    const shareData = {
      title: `${fest.fest_name} | Fest Kerala`,
      text: shareText,
      url: shareUrl,
    };
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      if ((error as DOMException).name === "AbortError") return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = shareUrl;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch (error) {
      console.error("Unable to share fest", error);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#000" }}
      >
        <p style={{ color: "#444", fontFamily: "var(--font-mono)" }}>Loading…</p>
      </div>
    );
  }

  if (notFound || !fest) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "#000" }}
      >
        <p style={{ color: "#666", fontFamily: "var(--font-mono)" }}>
          Fest not found.
        </p>
        <Link to="/" className="btn-glow">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh" }}>
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5"
        style={{
          background: "rgba(0,0,0,0.94)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid #1e1e1e",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#ccc" }}
          aria-label="Back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
          Fest Kerala
        </span>
        <button
          onClick={shareFest}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{
            color: shareStatus === "copied" ? "#86efac" : "#ccc",
            background: shareStatus === "copied" ? "rgba(34,197,94,0.12)" : "#1a1a1a",
            border: shareStatus === "copied" ? "1px solid rgba(34,197,94,0.35)" : "1px solid #2a2a2a",
          }}
          aria-label="Share"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 16V3m0 0L7 8m5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5 lg:py-8 grid grid-cols-1 lg:grid-cols-[minmax(360px,.9fr)_minmax(0,1.1fr)] lg:border lg:border-[#252525]">
        <section className="relative bg-black lg:min-h-[calc(100vh-116px)] lg:sticky lg:top-[72px] overflow-hidden">
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{ minHeight: "min(72vh, 760px)", background: "#000" }}
        >
          <img
            src={fest.poster_image_url}
            alt={fest.fest_name}
            className="relative w-full h-full block object-contain p-3 lg:p-8"
            style={{ maxHeight: 740 }}
          />
        </div>
        <p className="absolute bottom-3 left-4 text-[10px] tracking-[.18em] text-[#999]" style={{ fontFamily: "var(--font-mono)" }}>FEST KERALA / FEATURED LISTING</p>
        </section>

        <section className="bg-black lg:border-l lg:border-[#252525] p-1 pt-6 lg:p-8 xl:p-11">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {fest.tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>

        <p className="text-[11px] tracking-[.18em] uppercase text-[#d8ff3e] mb-3" style={{ fontFamily: "var(--font-mono)" }}>Kerala college festival</p>
        <h1 className="text-white font-bold leading-[.88] tracking-[-.055em] mb-3" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.3rem, 7vw, 6.8rem)" }}>
          {fest.fest_name}
        </h1>
        <p className="text-base sm:text-lg mb-6 pb-6 border-b border-[#252525]" style={{ color: "#ddd", fontFamily: "var(--font-display)" }}>
          {fest.college_name}
        </p>

        <div className="grid grid-cols-2 border-y border-[#252525] mb-7">
          <div className="py-4 pr-4 border-r border-[#252525]">
            <p className="text-[10.5px] uppercase mb-1" style={{ color: "#666", fontFamily: "var(--font-mono)" }}>Date</p>
            <p style={{ color: "#ccc", fontFamily: "var(--font-display)", fontSize: 14 }}>
              {formatDateRange(fest.start_date, fest.end_date)}
            </p>
          </div>
          <div className="py-4 pl-4">
            <p className="text-[10.5px] uppercase mb-1" style={{ color: "#666", fontFamily: "var(--font-mono)" }}>District</p>
            <p style={{ color: "#ccc", fontFamily: "var(--font-display)", fontSize: 14 }}>
              {fest.district}
            </p>
          </div>
        </div>

        <div className="mb-8 max-w-xl">
          <h2 className="text-[10px] tracking-[.16em] uppercase text-[#d8ff3e] mb-3" style={{ fontFamily: "var(--font-mono)" }}>The brief</h2>
          <p style={{ color: "#999", fontFamily: "var(--font-display)", fontSize: 14, lineHeight: 1.7 }}>
            {fest.description || "No description provided."}
          </p>
        </div>

        <div className="flex items-center gap-3">
        <a
          href={fest.registration_link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-glow inline-flex flex-1 items-center justify-center text-center whitespace-nowrap"
          style={{ textDecoration: "none", padding: "14px 16px", borderRadius: 999, fontSize: 14 }}
        >
          Register / Event Link →
        </a>
        <button onClick={shareFest} className="shrink-0 px-4 py-3 rounded-full text-sm font-semibold text-white border border-[#333] hover:border-[#d8ff3e] transition whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>
          {shareStatus === "copied" ? "Link copied" : "Share fest"}
        </button>
        </div>
        </section>
      </div>
    </div>
  );
}
