"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("saving");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        message: data.get("message"),
      }),
    });

    setStatus(response.ok ? "saved" : "error");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <section className="px-[5vw] py-16">
      <div className="mx-auto w-[min(900px,100%)]">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-2 text-6xl">Talk to us.</h1>
        <p className="mt-4 text-[var(--cream-dim)]">
          Questions about batches, products, or wholesale. We reply in plain language.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-[var(--line)] p-6">
          <input
            name="name"
            required
            placeholder="Name"
            className="focus-ring w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="focus-ring w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
          />
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Your message"
            className="focus-ring w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
          />
          <button type="submit" className="focus-ring btn-primary px-6 py-3">
            Send message
          </button>
          {status === "saved" && <p className="text-sm text-[var(--sage)]">Message sent.</p>}
          {status === "error" && <p className="text-sm text-[var(--gold)]">Could not send message.</p>}
        </form>
      </div>
    </section>
  );
}
