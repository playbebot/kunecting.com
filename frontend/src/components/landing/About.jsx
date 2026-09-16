import { motion } from "framer-motion";
import { useLang } from "@/i18n";
import { Reveal } from "./Reveal";
import { FlipTile } from "./Mosaic";

const IMAGE =
  "https://images.pexels.com/photos/4990531/pexels-photo-4990531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function About() {
  const { t } = useLang();
  const a = t.about;
  return (
    <section
      id="nosotros"
      data-testid="about-section"
      className="relative overflow-hidden bg-cream-deep/50 px-5 py-24 md:px-10 md:py-36"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-smoke">
              <span className="h-2 w-2 rounded-[2px] bg-kun-green" />
              {a.eyebrow}
            </p>
            <h2 className="font-display text-2xl leading-snug tracking-tight sm:text-3xl lg:text-4xl">
              {a.statementA}{" "}
              <span className="inline-block rounded-lg bg-kun-amber/40 px-2">
                {a.statementB}
              </span>{" "}
              {a.statementC}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-smoke md:text-lg">
              {a.lead}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative mt-12 max-w-xl">
              <div aria-hidden className="absolute -left-3 -top-3 z-10 flex gap-1.5">
                <FlipTile color="#EC1E24" size={16} />
                <FlipTile color="#FAAF3A" size={16} />
                <FlipTile color="#009147" size={16} />
              </div>
              <div className="overflow-hidden rounded-3xl border border-ink/10 shadow-[0_30px_60px_-30px_rgba(32,30,29,0.4)]">
                <motion.img
                  initial={{ scale: 1.12 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  src={IMAGE}
                  alt={a.imageAlt}
                  data-testid="about-image"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
        <div className="flex flex-col justify-center">
          {a.pillars.map((p, i) => (
            <Reveal key={p.num} delay={i * 0.1}>
              <div
                data-testid={`about-pillar-${i + 1}`}
                className="group border-t border-ink/10 py-8 last:border-b"
              >
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-sm text-smoke">{p.num}</span>
                  <div>
                    <h3 className="font-display text-xl transition-colors group-hover:text-kun-green sm:text-2xl">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-smoke sm:text-base">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
