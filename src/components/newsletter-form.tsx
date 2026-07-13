"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("saving");

    const response = await fetch("/api/newsletter", {
      method: "POST",
      body: JSON.stringify({ email: formData.get("email") }),
      headers: { "Content-Type": "application/json" },
    });

    setStatus(response.ok ? "saved" : "error");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form className="flex flex-wrap gap-2" onSubmit={onSubmit}>
      <input
        className="focus-ring min-w-60 rounded-full border border-[var(--line)] bg-transparent px-5 py-3"
        type="email"
        name="email"
        placeholder="Your email"
        required
      />
      <button type="submit" className="focus-ring btn-primary px-6 py-3">
        Join
      </button>
      {status === "saved" && <p className="w-full text-sm text-[var(--sage)]">Thanks. You are in.</p>}
      {status === "error" && (
        <p className="w-full text-sm text-[var(--gold)]">Could not submit. Try again in a moment.</p>
      )}
    </form>
  );
}
