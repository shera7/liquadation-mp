import { STATUS_LABELS } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
  const info = STATUS_LABELS[status] ?? STATUS_LABELS.IN_STOCK;

  return (
    <span className="inline-flex items-center gap-1.5 bg-white shadow-sm ring-1 ring-black/5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-graphite">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: info.dot }} />
      {info.label}
    </span>
  );
}
