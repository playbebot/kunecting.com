import { useMemo } from "react";
import { BRAND_COLORS } from "./Mosaic";

const CELL_COUNT = 300;

export default function MosaicField() {
  const tiles = useMemo(
    () =>
      Array.from({ length: CELL_COUNT }, (_, i) => ({
        brand: (i * 37) % 19 === 0,
        color: BRAND_COLORS[(i * 11) % BRAND_COLORS.length],
        delay: ((i * 13) % 60) * 0.02,
      })),
    [],
  );
  return (
    <div
      aria-hidden
      data-testid="hero-mosaic-field"
      className="mosaic-field absolute inset-0 hidden lg:grid"
    >
      {tiles.map((t, i) => (
        <div
          key={i}
          className={`mosaic-cell${t.brand ? " mosaic-cell--brand" : ""}`}
          style={{ "--cell": t.color, animationDelay: `${t.delay}s` }}
        />
      ))}
    </div>
  );
}
