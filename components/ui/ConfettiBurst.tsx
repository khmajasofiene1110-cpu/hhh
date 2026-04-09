"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ConfettiBurst.module.css";

const COLORS = [
  "#7c3aed",
  "#a78bfa",
  "#22c55e",
  "#facc15",
  "#f472b6",
  "#38bdf8",
];

type ConfettiBurstProps = {
  active: boolean;
  onDone?: () => void;
  pieceCount?: number;
};

export function ConfettiBurst({
  active,
  onDone,
  pieceCount = 18,
}: ConfettiBurstProps) {
  const [nonce, setNonce] = useState(0);
  const onDoneRef = useRef(onDone);

  const show = useMemo(() => active || nonce > 0, [active, nonce]);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!active) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNonce((n) => n + 1);
    const t = window.setTimeout(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNonce(0);
      onDoneRef.current?.();
    }, 1600);
    return () => window.clearTimeout(t);
  }, [active]);

  if (!show) return null;

  return (
    <div className={styles.overlay} aria-hidden>
      {Array.from({ length: pieceCount }, (_, i) => (
        <span
          key={i}
          className={styles.piece}
          style={
            {
              left: `${8 + (i % 6) * 14}%`,
              background: COLORS[i % COLORS.length],
              animationDelay: `${i * 35}ms`,
              "--spin": `${i * 47}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
