"use client";

import { useSyncExternalStore } from "react";

function toLocalDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function BlogPostTimestamp({ createdAt, updatedAt }: { createdAt: string; updatedAt?: string }) {
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const createdLabel = isClient ? toLocalDate(createdAt) : new Date(createdAt).toISOString();
  const updatedLabel = updatedAt
    ? isClient
      ? toLocalDate(updatedAt)
      : new Date(updatedAt).toISOString()
    : "";

  return (
    <p className="mt-8 border-t border-[var(--line)] pt-4 text-sm text-[var(--cream-dim)]">
      Created {createdLabel}
      {updatedAt ? ` · (edited) ${updatedLabel}` : ""}
    </p>
  );
}
