import { useEffect, useLayoutEffect, useRef, useState } from "react";

const CURSOR_PINK = "#e91e63";

/** Custom ♀ cursor: inline SVG, centered hotspot, rAF DOM updates (no per-move React state). */
export function FemaleSymbolCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [useCustomCursor, setUseCustomCursor] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setUseCustomCursor(mq.matches);
  }, []);

  useLayoutEffect(() => {
    if (!useCustomCursor) return;

    const el = rootRef.current;
    if (!el) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlCursor = html.style.cursor;
    const prevBodyCursor = body.style.cursor;

    html.style.cursor = "none";
    body.style.cursor = "none";

    let raf = 0;

    const paint = (clientX: number, clientY: number) => {
      el.style.visibility = "visible";
      el.style.left = `${clientX}px`;
      el.style.top = `${clientY}px`;
    };

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => paint(e.clientX, e.clientY));
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      html.style.cursor = prevHtmlCursor;
      body.style.cursor = prevBodyCursor;
    };
  }, [useCustomCursor]);

  if (!useCustomCursor) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 2147483647,
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        color: CURSOR_PINK,
        lineHeight: 0,
        visibility: "hidden",
      }}
    >
      <svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        role="presentation"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="7.85"
          r="4.4"
          stroke="currentColor"
          strokeWidth={2.35}
        />
        <line
          x1="12"
          y1="12.2"
          x2="12"
          y2="22"
          stroke="currentColor"
          strokeWidth={2.35}
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="18"
          x2="18"
          y2="18"
          stroke="currentColor"
          strokeWidth={2.35}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
