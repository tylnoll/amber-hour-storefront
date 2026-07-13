import { readStoreData } from "@/lib/store-data";

export async function AnnouncementBar() {
  const data = await readStoreData();
  const text = data.settings.announcement.trim();

  if (!text) return null;

  return (
    <div className="border-b border-[var(--line)] bg-[rgba(22,17,31,0.78)] px-4 py-2 text-center text-sm text-[var(--gold)]">
      {text}
    </div>
  );
}
