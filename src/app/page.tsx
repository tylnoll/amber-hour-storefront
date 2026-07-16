import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { RitualTimelineItem } from "@/components/ritual-timeline-item";
import { TrustStrip } from "@/components/trust-strip";

export default function Home() {
  return (
    <>
      <section className="flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow motion-safe:animate-[rise_900ms_ease_200ms_forwards] motion-reduce:opacity-100">
          Welcome!
        </p>
        <h1 className="mt-5 max-w-[16ch] text-6xl leading-[0.95] md:text-8xl">
          Welcome to Amber Hour.
        </h1>
        <p className="mt-6 max-w-[38ch] text-lg text-[var(--cream-dim)]">
          Small-batch THC/CBD products made with care.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="focus-ring btn-primary px-8 py-4">
            Shop now
          </Link>
          <Link href="/account" className="focus-ring btn-ghost px-8 py-4">
            Join and track orders
          </Link>
        </div>
        <div className="mt-16 flex gap-[3vw]">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-12 w-[2px] bg-[linear-gradient(180deg,var(--gold),transparent)] motion-safe:animate-[dripFall_3.4s_ease-in_infinite]"
              style={{ animationDelay: `${index * 0.9}s` }}
            />
          ))}
        </div>
      </section>

      <section className="px-[5vw] py-24" id="ritual">
        <Reveal className="mx-auto w-[min(1200px,100%)]">
          <p className="eyebrow">07:00 PM - 10:00 PM</p>
          <h2 className="mt-3 text-5xl">Easy products, clear labels, no mystery.</h2>
          <p className="mt-4 max-w-2xl text-[var(--cream-dim)]">
            We keep things simple: what plant line was used, what batch it came from, and how to
            use it at home.
          </p>
        </Reveal>

        <Reveal className="mx-auto mt-12 w-[min(1200px,100%)] border-t border-[var(--line)]">
          <RitualTimelineItem
            time="7:00"
            moment="Steep"
            title="Wind Down Tea"
            tag="Chamomile · Lavender"
            description="Loose-leaf tea dusted with CBD isolate so it dissolves clean. No oily film, just a soft floral steep to close out the day."
            href="/shop/tea"
            cta="Shop tea blends"
          />
          <RitualTimelineItem
            time="8:00"
            moment="Light & Melt"
            title="Two-Way Candle"
            tag="Burn it · Then wear it"
            description="Low-melt soy wax warmed just past body temperature. Burn for ambiance, then use the pool as massage oil."
            href="/shop/candles"
            cta="Shop candles"
          />
          <RitualTimelineItem
            time="9:00"
            moment="Apply"
            title="Roll-On Balm"
            tag="Quickest option"
            description="Three rolls on the wrist or neck for a fast, no-fuss CBD option."
            href="/shop/balms-roll-ons"
            cta="Shop roll-ons"
          />
          <RitualTimelineItem
            time="Any"
            moment="time"
            title="Raw CBD Honey"
            tag="Never boiled"
            description="Warmed gently so cannabinoids stay intact. Stir into tea, spread on toast, or take by the spoonful."
            href="/shop/honey"
            cta="Shop honey"
          />
        </Reveal>
      </section>

      <section className="px-[5vw] py-12" id="bundle">
        <Reveal className="mx-auto grid w-[min(1200px,100%)] gap-10 rounded-[28px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(196,86,46,0.16),rgba(232,165,75,0.06))] p-8 md:grid-cols-2 md:p-14">
          <div className="flex min-h-64 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(232,165,75,0.5),rgba(74,42,69,0.4)_60%,rgba(22,17,31,0.9))]">
            <div className="h-9 w-3 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[linear-gradient(180deg,#fff2c9,var(--gold)_60%,var(--ember))] shadow-[0_0_40px_10px_rgba(232,165,75,0.5)] motion-safe:animate-[flicker_2.6s_ease-in-out_infinite]" />
          </div>
          <div>
            <p className="eyebrow">Build your own set</p>
            <h2 className="mt-3 text-5xl">Build your own evening arc.</h2>
            <p className="mt-4 text-[var(--cream-dim)]">
              Pick tea, candle, balm, and honey individually to personalize your own routine.
            </p>
            <ul className="mt-6 space-y-2 text-[var(--cream-dim)]">
              <li>Wind Down Tea - 20-bag tin</li>
              <li>Two-Way Candle - 8 oz</li>
              <li>Roll-On Balm - 10 ml</li>
              <li>Raw CBD Honey - 4 oz jar</li>
            </ul>
            <Link href="/shop" className="focus-ring btn-primary mt-8 inline-block px-8 py-4">
              Shop all products
            </Link>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <TrustStrip />
      </Reveal>
    </>
  );
}
