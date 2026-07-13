import Link from "next/link";

export default function DeclinedPage() {
  return (
    <section className="px-[5vw] py-24">
      <div className="mx-auto w-[min(700px,100%)] rounded-2xl border border-[var(--line)] p-8 text-center">
        <h1 className="text-5xl">Thanks for stopping by.</h1>
        <p className="mt-4 text-[var(--cream-dim)]">
          Amber Hour is only available to visitors 21 and older.
        </p>
        <Link href="/" className="focus-ring btn-ghost mt-8 inline-block px-6 py-3">
          Return home
        </Link>
      </div>
    </section>
  );
}
