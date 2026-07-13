import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";

export function Footer() {
  return (
    <footer className="px-[5vw] pb-10 pt-20">
      <div className="mx-auto w-[min(1200px,100%)]">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[var(--line)] pb-10">
          <h2 className="max-w-sm text-5xl">Ready to start winding down?</h2>
          <NewsletterForm />
        </div>

        <div className="flex flex-wrap justify-between gap-8 pt-10">
          <div>
            <p className="eyebrow mb-4">Shop</p>
            <ul className="space-y-2 text-[var(--cream-dim)]">
              <li><Link href="/shop/honey" className="focus-ring">Honey</Link></li>
              <li><Link href="/shop/tea" className="focus-ring">Tea Blends</Link></li>
              <li><Link href="/shop/candles" className="focus-ring">Candles</Link></li>
              <li><Link href="/shop/balms-roll-ons" className="focus-ring">Balms and Roll-Ons</Link></li>
              <li><Link href="/bundles/evening-ritual-set" className="focus-ring">Gift Sets</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Learn</p>
            <ul className="space-y-2 text-[var(--cream-dim)]">
              <li><Link href="/about" className="focus-ring">Our Story</Link></li>
              <li><Link href="/lab-reports" className="focus-ring">Lab Reports</Link></li>
              <li><Link href="/blog" className="focus-ring">Blog</Link></li>
              <li><Link href="/shipping-returns" className="focus-ring">Shipping and Returns</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Company</p>
            <ul className="space-y-2 text-[var(--cream-dim)]">
              <li><Link href="/contact" className="focus-ring">Contact</Link></li>
              <li><Link href="/account" className="focus-ring">Account</Link></li>
              <li><Link href="/privacy" className="focus-ring">Privacy</Link></li>
              <li><Link href="/terms" className="focus-ring">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-4 text-xs text-[var(--cream-dim)]">
          <p>
            This product has not been evaluated by the FDA. Not intended to diagnose, treat,
            cure, or prevent any disease.
          </p>
          <p>21+ only. Must be of legal age to purchase.</p>
        </div>
      </div>
    </footer>
  );
}
