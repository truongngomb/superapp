/**
 * Request Metrics Types
 * Shared types for request monitoring and tracking
 */

export interface RequestMetric {
  timestamp: number;
  method: string;
  path: string;
  statusCode: number;
  duration: number; // milliseconds
  userAgent?: string;
  ip?: string;
}

export interface EndpointMetric {
  path: string;
  count: number;
  avgDuration: number;
}

export interface ResponseTimeDistribution {
  fast: number;      // < 100ms
  medium: number;    // 100-500ms
  slow: number;      // 500-1000ms
  verySlow: number;  // > 1000ms
}

export interface CurrentMetrics {
  totalRequests: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  activeConnections?: number;
}

export interface RequestMetrics {
  current: CurrentMetrics;
  statusCodes: Record<number, number>;
  methods: Record<string, number>;
  topEndpoints: EndpointMetric[];
  slowestEndpoints: EndpointMetric[];
  responseTimes: ResponseTimeDistribution;
  recentRequests?: RequestMetric[];
}
