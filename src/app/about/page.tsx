export default function AboutPage() {
  return (
    <section className="px-[5vw] py-16">
      <article className="mx-auto w-[min(980px,100%)] space-y-10">
        <header>
          <p className="eyebrow">Our story</p>
          <h1 className="mt-2 text-6xl">A student-built family THC/CBD shop.</h1>
          <p className="mt-4 text-[var(--cream-dim)]">
            I am a college pre-med student who believes hemp and THC products are a big part of the
            future of wellness and medical support.
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">How Amber Hour started</h2>
          <p className="mt-3 text-[var(--cream-dim)]">
            It started in our backyard garden. I began growing plants, learning each harvest, and
            experimenting with small home batches. My mom loves baking and also saw health benefits
            from THC, so we teamed up and built Amber Hour together.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">Our batch philosophy</h2>
          <p className="mt-3 text-[var(--cream-dim)]">
            We sell small batches that change between harvests. For every batch, we list the
            seeds/plants used so you always know exactly what bud line is behind your product.
            No mystery flower, no vague labels.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">What you can expect next</h2>
          <p className="mt-3 text-[var(--cream-dim)]">
            We also post plant progress updates during each grow cycle so customers can follow the
            next batch from sprout to finished product.
          </p>
        </section>
      </article>
    </section>
  );
}
