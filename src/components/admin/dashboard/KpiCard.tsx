import Link from "next/link";

interface KpiCardProps {
  label: string;
  value: number | string;
  href: string;
  accent: string;
  icon: React.ReactNode;
}

export default function KpiCard({ label, value, href, accent, icon }: KpiCardProps) {
  return (
    <Link
      href={href}
      className="bg-white border border-line rounded-sm p-5 hover:border-amber hover:shadow-sm transition-all flex items-start justify-between"
    >
      <div>
        <div className="text-3xl font-display font-800 text-graphite">{value}</div>
        <div className="text-sm text-steel mt-1">{label}</div>
      </div>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        {icon}
      </div>
    </Link>
  );
}
