"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCwIcon } from "lucide-react";

import { DashboardHero, DashboardPage, DashboardSection } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";

type Cert = {
  main: string;
  not_after: string;
  resolver: string;
  sans: string[];
};

type ProxyApiResponse = {
  certs?: Cert[];
};

export default function ProxyPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const loadCerts = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST ?? ""}/api/proxy/certs`);

      if (!res.ok) {
        setCerts([]);
        return;
      }

      const data = (await res.json()) as ProxyApiResponse;
      setCerts(Array.isArray(data.certs) ? data.certs : []);
      setLastRefreshedAt(new Date());
    } catch {
      setCerts([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadCerts();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadCerts]);

  return (
    <DashboardPage>

      <DashboardSection className="dark:bg-background/80 backdrop-blur-sm "
        title="Certificates"
        description={lastRefreshedAt ? `Last refreshed at ${lastRefreshedAt.toLocaleTimeString()}` : "Loading certificates..."}
        actions={
          <Button type="button" variant="outline" onClick={() => void loadCerts()} disabled={isRefreshing}>
            <RefreshCwIcon className={isRefreshing ? "size-4 animate-spin" : "size-4"} />
            {isRefreshing ? "Refreshing..." : "Refresh now"}
          </Button>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-background/40 backdrop-blur">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Main Domain
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Resolver
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Expiration (Not After)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  SANs
                </th>
              </tr>
            </thead>

            <tbody>
              {certs.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={4}>
                    {isRefreshing ? "Fetching certificates..." : "No certificates found."}
                  </td>
                </tr>
              ) : (
                certs.map((cert) => (
                  <tr
                    key={`${cert.main}-${cert.not_after}`}
                    className="border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{cert.main}</td>

                    <td className="px-4 py-3 text-sm text-foreground">
                      <span className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                        {cert.resolver}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-foreground">
                      {new Date(cert.not_after).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>

                    <td className="max-w-xs truncate px-4 py-3 text-sm text-muted-foreground" title={cert.sans.join(", ")}>
                      {cert.sans && cert.sans.length > 0 ? cert.sans.join(", ") : "-"}
                    </td>
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