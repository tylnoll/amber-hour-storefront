export default function AboutPage() {
  return (
    <section className="px-[5vw] py-16">
      <article className="mx-auto w-[min(980px,100%)] space-y-10">
        <header>
          <p className="eyebrow">Our story</p>
          <h1 className="mt-2 text-6xl">Amber Hour is built around one belief.</h1>
          <p className="mt-4 text-[var(--cream-dim)]">
            Evening is a ritual worth designing, not just something that happens.
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">The ritual concept</h2>
          <p className="mt-3 text-[var(--cream-dim)]">
            We map products to moments: tea at 7pm, candle at 8pm, roll-on at 9pm, honey anytime.
            Short sequence, clear signal, repeatable calm.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">Sourcing and farm</h2>
          <p className="mt-3 text-[var(--cream-dim)]">
            Small-batch extraction, batch-level testing, and transparent COAs. No overblown claims.
            Concrete formulas and clear labeling.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">Founder note</h2>
          <p className="mt-3 text-[var(--cream-dim)]">
            Replace this paragraph with your own founder note. Keep it plainspoken. Keep it true.
          </p>
        </section>
      </article>
    </section>
  );
}
