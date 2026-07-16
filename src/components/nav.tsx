"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useCart } from "@/components/cart-context";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Our Story" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/account", label: "Account" },
];

export function Nav() {
  const { itemCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${scrolled ? "bg-[rgba(22,17,31,0.6)] backdrop-blur" : "bg-transparent"}`}
    >
      <nav className="mx-auto flex h-20 w-[min(1200px,92vw)] items-center justify-between" aria-label="Primary">
        <Link href="/" className="focus-ring font-[var(--font-fraunces)] text-2xl">
          Amber Hour
        </Link>
        <div className="hidden items-center gap-8 text-sm md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="focus-ring opacity-90 hover:opacity-100">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="focus-ring btn-ghost px-4 py-2 text-sm" onClick={openCart}>
            Cart ({isClient ? itemCount : 0})
          </button>
          <button
            type="button"
            className="focus-ring btn-ghost px-3 py-2 text-sm md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            Menu
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-[var(--line)] bg-[rgba(22,17,31,0.95)] p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring rounded-lg px-3 py-2 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
