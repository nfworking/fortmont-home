"use client";
import { formatBytesBigInt, getStorageColor, getStoragePercent } from "@/utils/storage";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";

type Props = {
  usedBytes?: bigint;
  quotaBytes?: bigint;
};

export function StorageWidget({ usedBytes, quotaBytes }: Props) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const percent = usedBytes != null && quotaBytes != null ? getStoragePercent(usedBytes, quotaBytes) : 0;
  const barColor = getStorageColor(percent);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnimatedWidth(Math.min(percent, 100));
    }, 50);

    return () => window.clearTimeout(timer);
  }, [percent]);

  if (usedBytes == null || quotaBytes == null) {
    return (
      <div className="rounded-xl border p-4 text-sm text-gray-500">
        No storage data available
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 space-y-3 transition-all duration-500">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Storage</h3>

        <span className="text-sm dark:text-white text-black">{percent.toFixed(1)}%</span>
        <Button variant="outline" size="sm" onClick={() => toast.info("Storage upgrade coming soon!")}>
          Upgrade
        </Button>
      </div>

      <div className="text-sm dark:text-white text-black">
        {formatBytesBigInt(usedBytes)} / {formatBytesBigInt(quotaBytes)}
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-full transition-all ease-out duration-1000 ${barColor}`} style={{ width: `${animatedWidth}%` }} />
      </div>

      {percent >= 99 && <div className="text-xs text-red-500">Storage full, please upgrade or delete files</div>}
      {percent >= 90 && percent < 99 && <div className="text-xs text-red-500">Storage almost full</div>}
      {percent >= 70 && percent < 90 && (
        <div className="text-xs text-yellow-600">Storage getting full, consider cleaning up</div>
      )}
    </div>
  );
}