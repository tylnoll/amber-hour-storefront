"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const FIRST_VISIT_KEY = "amber-hour-first-visit-seen";

export function FirstVisitOffer() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const seen = window.localStorage.getItem(FIRST_VISIT_KEY);
    if (seen) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  function close() {
    window.localStorage.setItem(FIRST_VISIT_KEY, "1");
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(10,8,17,0.72)] px-4"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.aside
            className="w-[min(680px,100%)] rounded-3xl border border-[var(--line)] bg-[linear-gradient(150deg,rgba(196,86,46,0.2),rgba(22,17,31,0.96)_45%)] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <p className="eyebrow">New here?</p>
            <h2 className="mt-2 text-4xl">Welcome to Amber Hour</h2>
            <p className="mt-4 max-w-[48ch] text-[var(--cream-dim)]">
              New customer offer: 15% off your first order over $45 plus free shipping. Create your
              account, fill your cart, and we apply it at checkout.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/account" onClick={close} className="focus-ring btn-primary px-6 py-3">
                Join and unlock offer
              </Link>
              <button type="button" onClick={close} className="focus-ring btn-ghost px-6 py-3">
                Continue browsing
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
