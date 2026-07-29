import Image from "next/image";

import { cn } from "@/lib/utils";

export type FileFlowLogoProps = Readonly<{
  className?: string;
  compact?: boolean;
  decorative?: boolean;
  label?: string;
  priority?: boolean;
}>;

const logoDimensions = {
  compact: { height: 40, width: 64 },
  full: { height: 40, width: 212 },
} as const;

export function FileFlowLogo({
  className,
  compact = false,
  decorative = true,
  label = "FileFlow",
  priority = false,
}: FileFlowLogoProps) {
  const dimensions = compact ? logoDimensions.compact : logoDimensions.full;

  return (
    <Image
      alt={decorative ? "" : label}
      aria-hidden={decorative || undefined}
      className={cn("block h-10 w-auto", className)}
      height={dimensions.height}
      priority={priority}
      src={compact ? "/brand/fileflow-mark.svg" : "/brand/fileflow-logo.svg"}
      width={dimensions.width}
    />
  );
}
