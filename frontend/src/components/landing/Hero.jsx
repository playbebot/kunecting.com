import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/i18n";
import { MiniMosaic, FlipTile } from "./Mosaic";

const TILES = [
  { c: "#EC1E24", s: 26, top: "4%", left: "-7%", depth: 46, r: -8 },
  { c: "#FAAF3A", s: 18, top: "12%", left: "90%", depth: 74, r: 12 },
  { c: "#009147", s: 22, top: "68%", left: "95%", depth: 54, r: -6 },
  { c: "#39B44A", s: 14, top: "86%", left: "8%", depth: 84, r: 10 },
  { c: "#F05A26", s: 16, top: "46%", left: "-11%", depth: 62, r: 6 },
  { c: "#8BC540", s: 12, top: "6%", left: "54%", depth: 92, r: -14 },
  { c: "#F69220", s: 20, top: "92%", left: "58%", depth: 48, r: 4 },
];

function FloatingTile({ tile, sx, sy }) {
  const x = useTransform(sx, (v) => v * tile.depth);
  const y = useTransform(sy, (v) => v * tile.depth);
  return (
    <motion.div
      style={{ x, y, top: tile.top, left: tile.left }}
      className="absolute z-10"
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [tile.r, tile.r + 5, tile.r] }}
        transition={{
          duration: 5 + tile.depth / 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <FlipTile color={tile.c} size={tile.s} />
      </motion.div>
    </motion.div>
  );
}

function HeroVisual({ sx, sy, caption }) {
  const xMain = useTransform(sx, (v) => v * 22);
  const yMain = useTransform(sy, (v) => v * 22);
  return (
    <div className="relative">
      <motion.div style={{ x: xMain, y: yMain }} className="relative">
        <div className="absolute -inset-14 rounded-full bg-[radial-gradient(circle_at_center,rgba(250,244,234,0.95),transparent_65%)]" />
        <div className="relative rounded-[2.5rem] border border-ink/10 bg-cream-card/80 p-10 shadow-[0_40px_80px_-40px_rgba(32,30,29,0.35)] backdrop-blur-sm sm:p-14">
          <motion.img
            src="/kunecting-mark.png"
            alt="Isotipo de Kunecting: mosaico de color formando una K"
            data-testid="hero-logo"
            animate={{ y: [0, -12, 0], rotate: [0, 1.2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto w-full max-w-[300px] drop-shadow-xl"
          />
        </div>
      </motion.div>
      {TILES.map((tile, i) => (
        <FloatingTile key={i} tile={tile} sx={sx} sy={sy} />
      ))}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-smoke"
      >
        {caption}
      </motion.p>
    </div>
  );
}

export default function Hero({ onNavigate }) {
  const { t } = useLang();
  const h = t.hero;
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const drift = useTransform(scrollYProgress, [0, 1], [0, 110]);

  const handleMouse = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouse}
      data-testid="hero-section"
      className="relative flex min-h-screen items-center overflow-hidden px-5 pb-24 pt-32 md:px-10"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div style={{ opacity: fade, y: drift }}>
          <div className="mb-10 flex justify-center lg:hidden">
            <motion.img
              src="/kunecting-mark.png"
              alt="Isotipo de Kunecting"
              initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="h-28 w-28 drop-shadow-lg"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 flex items-center gap-3"
          >
            <MiniMosaic />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-smoke sm:text-xs">
              {h.eyebrow}
            </span>
          </motion.div>

          <h1
            data-testid="hero-headline"
            className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {h.lines.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-1">
                <motion.span
                  initial={{ y: "115%", rotate: 2.5 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{
                    duration: 1,
                    delay: 0.25 + i * 0.14,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`block origin-left ${
                    i === 1
                      ? "bg-gradient-to-r from-kun-orangered via-kun-amber to-kun-green bg-clip-text text-transparent"
                      : ""
                  }`}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            data-testid="hero-subheadline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-7 max-w-xl text-base leading-relaxed text-smoke md:text-lg"
          >
            {h.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              data-testid="hero-cta-services"
              onClick={() => onNavigate("servicios")}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-kun-green"
            >
              {h.primary}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              data-testid="hero-cta-contact"
              onClick={() => onNavigate("contacto")}
              className="rounded-full border border-ink/20 px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-cream-card"
            >
              {h.secondary}
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
        >
          <HeroVisual sx={sx} sy={sy} caption={h.caption} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-smoke">
          {h.scroll}
        </span>
        <div className="h-10 w-px overflow-hidden bg-ink/10">
          <motion.div
            animate={{ y: [-20, 40] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-1/2 w-px bg-kun-green"
          />
        </div>
      </motion.div>
    </section>
  );
}
