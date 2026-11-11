export type ErrorSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ErrorCategory =
  | "DATABASE"
  | "AUTHENTICATION"
  | "PAYMENT_ORDER"
  | "CART"
  | "IMAGE_UPLOAD"
  | "EXTERNAL_SERVICE"
  | "VALIDATION"
  | "SECURITY"
  | "RUNTIME"
  | "NETWORK";

export type ErrorStatus = "UNRESOLVED" | "INVESTIGATING" | "RESOLVED" | "IGNORED";

export interface ErrorResolutionNote {
  id: string;
  author: string;
  note: string;
  createdAt: string;
}

export interface AppErrorEvent {
  id: string;
  fingerprint: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  stack?: string;
  route?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  requestId?: string;
  occurrenceCount: number;
  firstSeen: string;
  lastSeen: string;
  status: ErrorStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes: ErrorResolutionNote[];
  environment: "production" | "development" | "test";
  metadata?: Record<string, any>;
  clientIp?: string;
  userAgent?: string;
}

export interface ErrorKPIs {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  unresolved: number;
  investigating: number;
  resolved: number;
}

export interface ServiceHealthStatus {
  name: string;
  category: "database" | "storage" | "auth" | "orders" | "email" | "api";
  status: "healthy" | "degraded" | "unavailable" | "unknown";
  latencyMs: number;
  lastChecked: string;
  details?: string;
}

export interface SystemHealthReport {
  overall: "healthy" | "degraded" | "unavailable";
  timestamp: string;
  uptimeSeconds: number;
  memoryUsageMb: number;
  activeErrorsCount: number;
  services: ServiceHealthStatus[];
}

