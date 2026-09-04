import { formatCount } from "@/lib/utils";

export default function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="transition-platform rounded-lg border border-line bg-paper px-5 py-4 shadow-card hover:shadow-card-hover">
      <p className="font-display text-display-md text-ink">{formatCount(value)}</p>
      <p className="mt-1 font-sans text-body-sm font-medium text-muted">{label}</p>
    </div>
  );
}
