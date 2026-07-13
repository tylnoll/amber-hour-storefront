export function AmbientBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-20 bg-[linear-gradient(180deg,var(--dusk-top)_0%,var(--dusk-mid)_14%,var(--dusk-deep)_34%,var(--night)_60%,var(--night-deep)_100%)]" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-5"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="pointer-events-none fixed -top-[10%] left-1/2 -z-10 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,165,75,0.35)_0%,rgba(232,165,75,0)_70%)] blur-[10px] motion-safe:animate-[driftGlow_14s_ease-in-out_infinite]" />
    </>
  );
}
