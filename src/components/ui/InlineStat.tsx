import { formatCount } from "@/lib/utils";

export default function InlineStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-headline-sm text-ink">{formatCount(value)}</p>
      <p className="font-sans text-body-sm font-medium text-muted">{label}</p>
    </div>
  );
}
