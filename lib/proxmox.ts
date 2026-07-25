

// ── Types ──────────────────────────────────────────────────────────────────
export type PveNode = {
  node: string;
  status: "online" | "offline" | string;
  cpu: number;        // fraction 0–1
  maxcpu: number;
  mem: number;        // bytes used
  maxmem: number;
  disk: number;       // bytes used (root fs)
  maxdisk: number;
  uptime: number;     // seconds
};

export type PveGuest = {
  vmid: number;
  name: string;
  status: "running" | "stopped" | string;
  type: "qemu" | "lxc";
  node: string;
  cpu?: number;
  mem?: number;
  maxmem?: number;
  uptime?: number;
  netin?: number;
  netout?: number;
};

export type PveStorage = {
  storage: string;
  node: string;
  type: string;
  used: number;
  total: number;
  avail: number;
  active: number;
  enabled: number;
  shared: number;
};

export type ClusterSummary = {
  nodes: PveNode[];
  guests: PveGuest[];
  storage: PveStorage[];
  // Derived totals
  totalVMs: number;
  runningVMs: number;
  totalLXC: number;
  runningLXC: number;
  cpuUsage: number;       
  memUsedBytes: number;
  memTotalBytes: number;
  diskUsedBytes: number;
  diskTotalBytes: number;
  netInBytes: number;
  netOutBytes: number;
};

