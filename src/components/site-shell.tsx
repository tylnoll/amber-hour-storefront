"use client";

import { AmbientBackground } from "@/components/ambient-background";
import { AgeGateModal } from "@/components/age-gate-modal";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-context";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AmbientBackground />
      <Nav />
      <main className="pt-20">{children}</main>
      <Footer />
      <CartDrawer />
      <AgeGateModal />
    </CartProvider>
  );
}
