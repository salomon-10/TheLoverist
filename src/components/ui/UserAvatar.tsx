import Image from "next/image";
import { cx } from "@/lib/utils";

const SIZES = { sm: 32, md: 44, lg: 88 } as const;

export default function UserAvatar({
  src,
  name,
  size = "md",
  className
}: {
  src?: string | null;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const px = SIZES[size];
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        sizes={`${px}px`}
        className={cx("rounded-full object-cover ring-1 ring-line", className)}
      />
    );
  }

  return (
    <div
      style={{ width: px, height: px }}
      className={cx(
        "flex items-center justify-center rounded-full bg-ink font-display text-paper ring-1 ring-line",
        className
      )}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
