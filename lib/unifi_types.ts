

export interface UnifiPage<T> {
  count: number;
  data: T[];
  limit: number;
  offset: number;
  totalCount: number;
}

export interface UnifiAppInfo {
  applicationVersion: string;
}

export interface UnifiSite {
  id: string;
  name: string;
  internalReference?: string;
}

export type UnifiDeviceState =
  | "ONLINE"
  | "OFFLINE"
  | "PENDING_ADOPTION"
  | "UPDATING"
  | "PROVISIONING"
  | "UNKNOWN"
  | (string & {});

export interface UnifiDeviceInterfaceOverview {
  type?: string;
  name?: string;
}

export interface UnifiDeviceOverview {
  id: string;
  name: string;
  model: string;
  supported: boolean;
  macAddress: string;
  ipAddress: string;
  state: UnifiDeviceState;
  firmwareVersion?: string;
  firmwareUpdatable: boolean;
  adoptedAt?: string;
  provisionedAt?: string;
  configurationId: string;
  uplink?: UnifiDeviceInterfaceOverview;
  features?: string[];
  interfaces?: string[];
}

export interface UnifiDeviceStatistics {
  uptimeSec: number;
  lastHeartbeatAt: string;
  nextHeartbeatAt: string;
  loadAverage1Min: number;
  loadAverage5Min: number;
  loadAverage15Min: number;
  cpuUtilizationPct: number;
  memoryUtilizationPct: number;
  uplink?: {
    txRateBps?: number;
    rxRateBps?: number;
  };
  interfaces?: Record<string, unknown>;
}

export interface UnifiClientOverview {
  id: string;
  name?: string;
  connectedAt?: string;
  ipAddress?: string;
  type?: string; 
  access?: unknown;
  macAddress?: string;
  uplinkDeviceId?: string;
}

export interface UnifiActionRequest {
  action: "RESTART" | "LOCATE" | "UNLOCATE" | (string & {});
}

export interface UnifiLegacyUplink {
  rx_bytes?: number;
  tx_bytes?: number;
  "rx_bytes-r"?: number;
  "tx_bytes-r"?: number;
}

export interface UnifiLegacyPort {
  port_idx: number;
  name: string;
  up: boolean;
  enable: boolean;
  speed: number;
  is_uplink?: boolean;
  tx_bytes?: number;
  rx_bytes?: number;
  "tx_bytes-r"?: number;
  "rx_bytes-r"?: number;
  "bytes-r"?: number;
}

export interface UnifiLegacyDevice {
  _id: string;
  mac: string;
  name?: string;
  model?: string;
  type?: string; 
  state?: number;
  uptime?: number;
  tx_bytes?: number; 
  rx_bytes?: number;
  uplink?: UnifiLegacyUplink;
  "system-stats"?: { cpu?: string; mem?: string };
  port_table?: UnifiLegacyPort[];
}

export interface UnifiLegacyDeviceResponse {
  meta: { rc: string };
  data: UnifiLegacyDevice[];
}


export interface UnifiBandwidthSummary {
  available: boolean;
  downRateMbps: number;
  upRateMbps: number;

  totalDownBytes: number;
  totalUpBytes: number;
}

export interface UnifiDashboardSnapshot {
  fetchedAt: string;
  siteId: string;
  sites: UnifiSite[];
  info: UnifiAppInfo | null;
  devices: UnifiDeviceOverview[];
  clients: UnifiClientOverview[];
  deviceStats: Record<string, UnifiDeviceStatistics | null>;
  bandwidth: UnifiBandwidthSummary;
  legacyDevices: UnifiLegacyDevice[];
  summary: {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    totalClients: number;
    wiredClients: number;
    wirelessClients: number;
    avgCpuPct: number | null;
    avgMemPct: number | null;
  };
}