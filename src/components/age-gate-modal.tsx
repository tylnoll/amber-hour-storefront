"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const COOKIE_KEY = "amber_hour_age_verified";

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export function AgeGateModal() {
  const [hasVerified, setHasVerified] = useState(() => {
    if (typeof window === "undefined") return true;
    return Boolean(sessionStorage.getItem(COOKIE_KEY) || getCookie(COOKIE_KEY));
  });
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = !hasVerified && pathname !== "/declined";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[linear-gradient(180deg,var(--dusk-top)_0%,var(--dusk-mid)_20%,var(--dusk-deep)_55%,var(--night-deep)_100%)] p-6">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[rgba(22,17,31,0.72)] p-8 text-center backdrop-blur">
        <p className="eyebrow">Age confirmation</p>
        <h2 className="mt-2 text-4xl">Are you 21 or older?</h2>
        <p className="mt-4 text-[var(--cream-dim)]">
          You must be of legal age to browse and purchase Amber Hour products.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="focus-ring btn-primary px-6 py-3"
            onClick={() => {
              sessionStorage.setItem(COOKIE_KEY, "true");
              document.cookie = `${COOKIE_KEY}=true; Max-Age=${60 * 60 * 24 * 30}; path=/`;
              setHasVerified(true);
            }}
          >
            Yes, I am 21+
          </button>
          <button
            type="button"
            className="focus-ring btn-ghost px-6 py-3"
            onClick={() => router.push("/declined")}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
