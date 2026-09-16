import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import { LangContext, translations } from "@/i18n";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import Services from "@/components/landing/Services";
import About from "@/components/landing/About";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

function Landing({ onNavigate }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-cream font-sans text-ink antialiased">
      <div
        aria-hidden
        className="grain pointer-events-none fixed inset-0 z-[70] opacity-[0.05]"
      />
      <Header onNavigate={onNavigate} />
      <main>
        <Hero onNavigate={onNavigate} />
        <Marquee />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer onNavigate={onNavigate} />
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "es";
    const saved = window.localStorage.getItem("kunecting-lang");
    if (saved === "es" || saved === "en") return saved;
    return (navigator.language || "es").toLowerCase().startsWith("es")
      ? "es"
      : "en";
  });
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem("kunecting-lang", lang);
    document.documentElement.lang = lang;
    document.title =
      lang === "es"
        ? "Kunecting — Consultoría tecnológica e IA"
        : "Kunecting — Tech & AI consulting";
  }, [lang]);

  const t = useMemo(() => translations[lang], [lang]);

  const onNavigate = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -72, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing onNavigate={onNavigate} />} />
        </Routes>
      </BrowserRouter>
    </LangContext.Provider>
  );
}
