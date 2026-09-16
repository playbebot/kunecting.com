import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLang } from "@/i18n";

export default function Header({ onNavigate }) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { id: "servicios", label: t.nav.services, testid: "nav-link-services" },
    { id: "nosotros", label: t.nav.about, testid: "nav-link-about" },
    { id: "contacto", label: t.nav.contact, testid: "nav-link-contact" },
  ];

  const go = (id) => {
    setOpen(false);
    onNavigate(id);
  };

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        scrolled ? "border-ink/10 bg-cream/85" : "border-transparent bg-cream/60"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-10">
        <button
          data-testid="header-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5"
        >
          <img src="/kunecting-mark.png" alt="Kunecting" className="h-9 w-9" />
          <span className="font-display text-xl tracking-tight">Kunecting</span>
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <button
              key={l.id}
              data-testid={l.testid}
              onClick={() => go(l.id)}
              className="group relative text-sm font-medium text-ink/80 transition-colors hover:text-ink"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-kun-green transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div
            data-testid="language-selector"
            className="flex items-center rounded-full border border-ink/15 bg-cream-card p-1"
          >
            {["es", "en"].map((l) => (
              <button
                key={l}
                data-testid={`lang-toggle-${l}`}
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  lang === l ? "bg-ink text-cream" : "text-smoke hover:text-ink"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            data-testid="header-cta"
            onClick={() => go("contacto")}
            className="hidden rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-kun-green md:block"
          >
            {t.nav.cta}
          </button>
          <button
            data-testid="mobile-menu-button"
            onClick={() => setOpen(!open)}
            className="text-ink md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-ink/10 bg-cream/95 md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <button
                  key={l.id}
                  data-testid={`mobile-${l.testid}`}
                  onClick={() => go(l.id)}
                  className="rounded-xl px-4 py-3 text-left font-display text-lg hover:bg-cream-card"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
