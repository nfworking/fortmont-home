"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { RefreshCwIcon } from "lucide-react";

import { DashboardPage, DashboardSection } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import { withBearerToken } from "@/lib/fetch-auth";

type ProxyApp = {
  enabled: boolean;
  entryPoints: string[];
  id: string;
  rule: string;
  target: string;
};

type ProxyApiResponse = {
  apps?: ProxyApp[];
  middlewares?: unknown[];
};

export default function ProxyPage() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [apps, setApps] = useState<ProxyApp[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const loadProxyApps = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/proxy/routes`,
        withBearerToken(undefined, accessToken),
      );

      if (!res.ok) {
        setApps([]);
        return;
      }

      const data = (await res.json()) as ProxyApiResponse;
      setApps(Array.isArray(data.apps) ? data.apps : []);
      setLastRefreshedAt(new Date());
    } catch {
      setApps([]);
    } finally {
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadProxyApps();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadProxyApps]);

  return (
    <DashboardPage>
      

      <DashboardSection className="dark:bg-background/80 backdrop-blur-sm "
        title="Proxy apps"
        description={lastRefreshedAt ? `Last refreshed at ${lastRefreshedAt.toLocaleTimeString()}` : "Loading apps..."}
        actions={
          <Button type="button" variant="outline" onClick={() => void loadProxyApps()} disabled={isRefreshing}>
            <RefreshCwIcon className={isRefreshing ? "size-4 animate-spin" : "size-4"} />
            {isRefreshing ? "Refreshing..." : "Refresh now"}
          </Button>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-border/60 dark:bg-background/80 ">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Enabled
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Entry Points
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Rule
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Target
                </th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-muted-foreground text-center" colSpan={5}>
                    {isRefreshing ? "Fetching proxy routes..." : "No proxy apps found."}
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr key={app.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground">
                      <span className={app.enabled ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600" : "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"}>
                        {app.enabled ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {app.entryPoints && app.entryPoints.length > 0 ? app.entryPoints.join(", ") : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{app.id}</td>
                    <td className="px-4 py-3 text-sm text-foreground max-w-xs truncate" title={app.rule}>{app.rule}</td>
                    <td className="px-4 py-3 text-sm text-foreground max-w-xs truncate" title={app.target}>{app.target}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardSection>
    </DashboardPage>
  );
}