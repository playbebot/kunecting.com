import { motion } from "framer-motion";
import { Bot, Sparkles, Headphones, Workflow } from "lucide-react";
import { useLang } from "@/i18n";
import { Reveal } from "./Reveal";

const ICONS = {
  bot: Bot,
  sparkles: Sparkles,
  headphones: Headphones,
  workflow: Workflow,
};

function ServiceCard({ item, index }) {
  const Icon = ICONS[item.icon];
  return (
    <Reveal delay={(index % 2) * 0.1} className={index % 2 === 1 ? "md:mt-14" : ""}>
      <motion.article
        data-testid={`service-card-${item.id}`}
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="group relative h-full overflow-hidden rounded-3xl border border-ink/10 bg-cream-card p-8 md:p-10"
      >
        <div
          className="absolute inset-x-0 top-0 h-1 origin-left scale-x-[0.15] transition-transform duration-500 ease-out group-hover:scale-x-100"
          style={{ backgroundColor: item.accent }}
        />
        <div className="flex items-start justify-between">
          <span className="font-mono text-sm text-smoke">{item.num}</span>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
            style={{ backgroundColor: `${item.accent}1f` }}
          >
            <Icon className="h-6 w-6" style={{ color: item.accent }} />
          </div>
        </div>
        <h3 className="mt-7 font-display text-xl leading-snug sm:text-2xl">
          {item.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-smoke sm:text-base">
          {item.desc}
        </p>
        <div
          aria-hidden
          className="absolute bottom-6 right-6 flex gap-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        >
          {[0, 1, 2].map((n) => (
            <span
              key={n}
              className="h-2 w-2 rounded-[2px]"
              style={{ backgroundColor: item.accent, opacity: 1 - n * 0.3 }}
            />
          ))}
        </div>
      </motion.article>
    </Reveal>
  );
}

export default function Services() {
  const { t } = useLang();
  const s = t.services;
  return (
    <section
      id="servicios"
      data-testid="services-section"
      className="relative px-5 py-24 md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-16 max-w-2xl md:mb-20">
            <p className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-smoke">
              <span className="h-2 w-2 rounded-[2px] bg-kun-red" />
              {s.eyebrow}
            </p>
            <h2 className="font-display text-2xl leading-snug tracking-tight sm:text-3xl lg:text-4xl">
              {s.title}
            </h2>
            <p className="mt-5 text-base text-smoke md:text-lg">{s.desc}</p>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          {s.items.map((item, i) => (
            <ServiceCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
