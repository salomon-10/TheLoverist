import { cx } from "@/lib/utils";

export default function PageContainer({
  children,
  width = "reading",
  className
}: {
  children: React.ReactNode;
  width?: "reading" | "column" | "canvas";
  className?: string;
}) {
  const maxWidth = width === "reading" ? "max-w-reading" : width === "column" ? "max-w-column" : "max-w-canvas";
  return (
    <div className={cx("mx-auto w-full px-margin-mobile md:px-margin-desktop", maxWidth, className)}>{children}</div>
  );
}
