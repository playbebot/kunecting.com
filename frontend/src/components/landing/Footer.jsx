import { useLang } from "@/i18n";
import { MosaicBand } from "./Mosaic";

export default function Footer({ onNavigate }) {
  const { t } = useLang();
  return (
    <footer
      data-testid="footer"
      className="border-t border-ink/10 bg-cream-deep/60 px-5 pb-10 pt-14 md:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <MosaicBand count={36} className="mb-12" />
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <img
              src="/kunecting-mark.png"
              alt="Kunecting"
              className="h-10 w-10"
            />
            <div>
              <p className="font-display text-xl leading-tight">Kunecting</p>
              <p className="text-sm text-smoke">{t.footer.tagline}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-6">
            <button
              data-testid="footer-nav-services"
              onClick={() => onNavigate("servicios")}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {t.nav.services}
            </button>
            <button
              data-testid="footer-nav-about"
              onClick={() => onNavigate("nosotros")}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {t.nav.about}
            </button>
            <button
              data-testid="footer-nav-contact"
              onClick={() => onNavigate("contacto")}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {t.nav.contact}
            </button>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-ink/10 pt-6 text-xs text-smoke sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Kunecting. {t.footer.rights}
          </p>
          <a
            href="mailto:hey@kunecting.com"
            data-testid="footer-email-link"
            className="transition-colors hover:text-ink"
          >
            hey@kunecting.com
          </a>
        </div>
      </div>
    </footer>
  );
}
