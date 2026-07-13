"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { labReports } from "@/lib/lab-reports";

export default function LabReportsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return labReports;

    return labReports.filter(
      (report) =>
        report.batchNumber.toLowerCase().includes(q) || report.productName.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <section className="px-[5vw] py-16">
      <div className="mx-auto w-[min(1100px,100%)]">
        <p className="eyebrow">Transparency</p>
        <h1 className="mt-2 text-6xl">Lab reports</h1>
        <p className="mt-4 text-[var(--cream-dim)]">
          Search by batch number to match your package label to its COA.
        </p>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search batch or product"
          className="focus-ring mt-6 w-full max-w-md rounded-full border border-[var(--line)] bg-transparent px-5 py-3"
        />

        <div className="mt-8 space-y-3">
          {filtered.map((report) => (
            <article key={report.batchNumber} className="rounded-xl border border-[var(--line)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg">{report.productName}</p>
                  <p className="text-sm text-[var(--cream-dim)]">
                    Batch {report.batchNumber} · THC {report.thcPercent} · Tested {report.testedOn}
                  </p>
                </div>
                <Link href={report.pdfUrl} target="_blank" className="focus-ring btn-ghost px-4 py-2 text-sm">
                  Open COA PDF
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
