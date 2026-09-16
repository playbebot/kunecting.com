import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export const BRAND_COLORS = [
  "#EC1E24",
  "#F05A26",
  "#F69220",
  "#FAAF3A",
  "#8BC540",
  "#39B44A",
  "#009147",
  "#0C6B37",
  "#69BC45",
];

export function FlipTile({ color, size = 16, className = "" }) {
  const [c, setC] = useState(color);
  return (
    <motion.div
      onHoverStart={() =>
        setC(BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)])
      }
      whileHover={{ scale: 1.3, rotate: 8 }}
      transition={{ type: "spring", stiffness: 400, damping: 16 }}
      style={{ backgroundColor: c, width: size, height: size }}
      className={`rounded-[3px] transition-colors duration-300 ${className}`}
    />
  );
}

export function MosaicBand({ count = 28, className = "" }) {
  const tiles = useMemo(
    () =>
      Array.from(
        { length: count },
        (_, i) => BRAND_COLORS[(i * 5 + 2) % BRAND_COLORS.length],
      ),
    [count],
  );
  return (
    <div aria-hidden className={`flex flex-wrap gap-1.5 ${className}`}>
      {tiles.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.02, duration: 0.45 }}
        >
          <FlipTile color={c} size={14} />
        </motion.div>
      ))}
    </div>
  );
}

export function MiniMosaic({ className = "" }) {
  return (
    <span aria-hidden className={`grid shrink-0 grid-cols-2 gap-[3px] ${className}`}>
      {["#EC1E24", "#FAAF3A", "#39B44A", "#0C6B37"].map((c) => (
        <span
          key={c}
          className="h-2 w-2 rounded-[2px]"
          style={{ backgroundColor: c }}
        />
      ))}
    </span>
  );
}
