import { HardDrive, Paperclip, Mail, Upload, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsSection, DetailRow } from "@/components/account/Settingssection";
import { cn } from "@/lib/utils";
import type { AccountStorage } from "./types";

interface StorageSectionProps {
  storage?: AccountStorage | null;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function StorageSection({ storage }: StorageSectionProps) {
  const used = Number(storage?.usedBytes ?? 0);
  const quota = Number(storage?.quotaBytes ?? 0);
  const free = Math.max(0, quota - used);
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;

  // Status-based accent styling
  const isCritical = pct >= 90;
  const isWarning = pct >= 75 && pct < 90;

  const barColor = isCritical
    ? "bg-destructive"
    : isWarning
    ? "bg-amber-500"
    : "bg-primary";

  const badgeBg = isCritical
    ? "bg-destructive/10 text-destructive border-destructive/20"
    : isWarning
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    : "bg-primary/10 text-primary border-primary/20";

  return (
    <SettingsSection
      tag="Usage"
      title="Storage"
      description="Storage quota assigned to your Fortmont account for uploads, attachments, and mailbox data."
    >
      <Card className="bg-card/50 backdrop-blur-md border-border/60 shadow-sm transition-all hover:border-border">
        <CardContent className="p-6 space-y-6">
          
          {/* Main Metric Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Usage
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                  {formatBytes(used)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  of {formatBytes(quota)}
                </span>
              </div>
            </div>

            {/* Percentage Badge */}
            <div className={cn("px-2.5 py-1 rounded-full border text-xs font-semibold tabular-nums", badgeBg)}>
              {pct}% Used
            </div>
          </div>

          {/* Progress Bar & Sub-metrics */}
          <div className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60 p-0.5">
              <div
                className={cn("h-full rounded-full transition-all duration-500 ease-in-out", barColor)}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatBytes(free)} available</span>
              <span>{quota > 0 ? `${100 - pct}% remaining` : "No limit set"}</span>
            </div>
          </div>

          {/* Low Storage Alert (Only renders when approaching limits) */}
          {isWarning || isCritical ? (
            <div className={cn(
              "flex items-center gap-2.5 rounded-lg border p-3 text-xs font-medium",
              isCritical 
                ? "border-destructive/30 bg-destructive/5 text-destructive" 
                : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
            )}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {isCritical 
                  ? "Your storage is almost full. Clear space or upgrade your quota to avoid service disruption."
                  : "You're getting close to your storage limit."}
              </span>
            </div>
          ) : null}

          {/* Usage Breakdown List */}
          <div className="rounded-xl border border-border/50 bg-muted/20 divide-y divide-border/40 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span>Attachments</span>
              </div>
              <span className="text-sm font-mono text-muted-foreground">—</span>
            </div>

            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>Mailbox Data</span>
              </div>
              <span className="text-sm font-mono text-muted-foreground">—</span>
            </div>

            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span>Uploads</span>
              </div>
              <span className="text-sm font-mono text-muted-foreground">—</span>
            </div>
          </div>

        </CardContent>
      </Card>
    </SettingsSection>
  );
}