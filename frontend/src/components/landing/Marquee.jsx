import { useLang } from "@/i18n";
import { MiniMosaic } from "./Mosaic";

export default function Marquee() {
  const { t } = useLang();
  const items = t.marquee;
  return (
    <section
      data-testid="marquee-section"
      aria-hidden
      className="overflow-hidden border-y border-ink/10 bg-cream-card/60 py-6"
    >
      <div className="animate-marquee flex w-max">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center gap-10 pr-10">
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-10">
                <span className="whitespace-nowrap font-display text-2xl text-ink/85 sm:text-3xl">
                  {item}
                </span>
                <MiniMosaic />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
