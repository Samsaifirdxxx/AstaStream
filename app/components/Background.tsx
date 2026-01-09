"use client";

import { useEffect, useRef } from "react";

export function Background() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handler = (event: PointerEvent) => {
      const { clientX, clientY } = event;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;
      node.style.setProperty("--mx", `${x}%`);
      node.style.setProperty("--my", `${y}%`);
    };
    window.addEventListener("pointermove", handler, { passive: true });
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  return (
    <>
      <div className="glow" aria-hidden="true" />
      <div className="gridlines" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <div ref={ref} className="shine" aria-hidden="true" />
    </>
  );
}

