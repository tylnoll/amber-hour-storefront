export function TrustStrip() {
  const items = [
    "Third-party lab tested, batch by batch",
    "Grown and infused in-house",
    "Under 0.3% THC, every batch",
    "Free shipping over your threshold",
  ];

  return (
    <section className="border-y border-[var(--line)] px-[5vw] py-10" aria-label="Trust signals">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-12 gap-y-6 text-sm text-[var(--cream-dim)]">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}
