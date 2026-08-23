"use client";

import { useEffect } from "react";

/**
 * Two behaviours the design board implements itself, ported so the markup
 * converted from it works unchanged:
 *
 *  - `data-hover` / `data-active`: the board's `style-hover` / `style-active`
 *    attributes. Hundreds of elements use them, so this delegates from the
 *    document rather than wrapping every node in a component.
 *  - `data-parallax`: the board's own applyParallax(), same formula and the
 *    same rAF throttle, so the drift matches the design exactly.
 *
 * Mounted once in the locale layout.
 */

function parseDecls(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  let depth = 0;
  let current = "";
  const parts: string[] = [];
  for (const ch of css) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === ";" && depth === 0) {
      parts.push(current);
      current = "";
    } else current += ch;
  }
  parts.push(current);
  for (const decl of parts) {
    const i = decl.indexOf(":");
    if (i === -1) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (prop) out[prop] = val;
  }
  return out;
}

export function DesignFx() {
  useEffect(() => {
    // ---- hover / active ----
    // Remember what the element had inline before we touched it, so leaving
    // restores the design's base style instead of blanking the property.
    const saved = new WeakMap<HTMLElement, Record<string, string>>();

    function apply(el: HTMLElement, css: string) {
      const decls = parseDecls(css);
      if (!saved.has(el)) {
        const before: Record<string, string> = {};
        for (const prop of Object.keys(decls)) {
          before[prop] = el.style.getPropertyValue(prop);
        }
        saved.set(el, before);
      }
      for (const [prop, val] of Object.entries(decls)) {
        el.style.setProperty(prop, val);
      }
    }

    function restore(el: HTMLElement) {
      const before = saved.get(el);
      if (!before) return;
      for (const [prop, val] of Object.entries(before)) {
        if (val) el.style.setProperty(prop, val);
        else el.style.removeProperty(prop);
      }
      saved.delete(el);
    }

    function closestHover(target: EventTarget | null): HTMLElement | null {
      if (!(target instanceof Element)) return null;
      return target.closest<HTMLElement>("[data-hover]");
    }

    function onOver(e: MouseEvent) {
      const el = closestHover(e.target);
      if (!el) return;
      // Ignore moves between descendants of the same hover target.
      if (el.contains(e.relatedTarget as Node)) return;
      apply(el, el.dataset.hover ?? "");
    }

    function onOut(e: MouseEvent) {
      const el = closestHover(e.target);
      if (!el) return;
      if (el.contains(e.relatedTarget as Node)) return;
      restore(el);
    }

    function onDown(e: MouseEvent) {
      if (!(e.target instanceof Element)) return;
      const el = e.target.closest<HTMLElement>("[data-active]");
      if (el) apply(el, el.dataset.active ?? "");
    }

    function onUp() {
      document.querySelectorAll<HTMLElement>("[data-active]").forEach(restore);
    }

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);

    // ---- parallax (design board's applyParallax, unchanged formula) ----
    let raf: number | null = null;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function applyParallax() {
      const depth = reduce ? 0 : 1;
      const vh = window.innerHeight || 900;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        if (!depth) {
          el.style.transform = "";
          return;
        }
        const host = el.parentElement;
        if (!host) return;
        const r = host.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        const shift = progress * parseFloat(el.dataset.parallax || "0") * depth;
        el.style.transform = `translate3d(0,${shift.toFixed(2)}px,0)`;
      });
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        applyParallax();
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    applyParallax();

    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
