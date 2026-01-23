import NodeCache from 'node-cache';
import type {
  RequestMetric,
  RequestMetrics,
  EndpointMetric,
  ResponseTimeDistribution,
  CurrentMetrics
} from '@superapp/shared-types';

/**
 * Request Metrics Service
 * 
 * Tracks and aggregates HTTP request metrics using in-memory cache.
 * Provides real-time insights into application performance and usage patterns.
 */
class RequestMetricsService {
  private cache: NodeCache;
  private readonly METRICS_KEY = 'request_metrics';
  private readonly WINDOW_SIZE = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly MAX_RECENT_REQUESTS = 50;
  
  constructor() {
    // Initialize cache with TTL of 10 minutes
    this.cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });
    this.initializeMetrics();
  }

  /**
   * Initialize empty metrics structure
   */
  private initializeMetrics(): void {
    const initialMetrics: RequestMetric[] = [];
    this.cache.set(this.METRICS_KEY, initialMetrics);
  }

  /**
   * Record a new request metric
   */
  public recordRequest(metric: RequestMetric): void {
    const metrics = this.cache.get<RequestMetric[]>(this.METRICS_KEY) || [];
    
    // Add new metric
    metrics.push(metric);
    
    // Remove old metrics outside the rolling window
    const now = Date.now();
    const filtered = metrics.filter(m => (now - m.timestamp) < this.WINDOW_SIZE);
    
    this.cache.set(this.METRICS_KEY, filtered);
  }

  /**
   * Get aggregated metrics
   */
  public getMetrics(): RequestMetrics {
    const metrics = this.cache.get<RequestMetric[]>(this.METRICS_KEY) || [];
    const now = Date.now();
    
    // Filter to current window
    const windowMetrics = metrics.filter(m => (now - m.timestamp) < this.WINDOW_SIZE);
    
    if (windowMetrics.length === 0) {
      return this.getEmptyMetrics();
    }

    // Calculate current metrics
    const current = this.calculateCurrentMetrics(windowMetrics, now);
    
    // Calculate distributions
    const statusCodes = this.calculateStatusCodeDistribution(windowMetrics);
    const methods = this.calculateMethodDistribution(windowMetrics);
    const topEndpoints = this.calculateTopEndpoints(windowMetrics);
    const slowestEndpoints = this.calculateSlowestEndpoints(windowMetrics);
    const responseTimes = this.calculateResponseTimeDistribution(windowMetrics);
    
    // Get recent requests (last 50)
    const recentRequests = windowMetrics
      .slice(-this.MAX_RECENT_REQUESTS)
      .reverse();

    return {
      current,
      statusCodes,
      methods,
      topEndpoints,
      slowestEndpoints,
      responseTimes,
      recentRequests
    };
  }

  /**
   * Calculate current metrics (RPS, avg response time, error rate)
   */
  private calculateCurrentMetrics(metrics: RequestMetric[], now: number): CurrentMetrics {
    const totalRequests = metrics.length;
    
    // Calculate time span
    const oldestTimestamp = Math.min(...metrics.map(m => m.timestamp));
    const windowSeconds = (now - oldestTimestamp) / 1000 || 1;
    const requestsPerSecond = Number((totalRequests / windowSeconds).toFixed(2));
    
    // Average response time
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = Math.round(totalDuration / totalRequests);
    
    // Error rate (4xx and 5xx)
    const errors = metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = Number((errors / totalRequests).toFixed(4));

    return {
      totalRequests,
      requestsPerSecond,
      averageResponseTime,
      errorRate
    };
  }

  /**
   * Calculate status code distribution
   */
  private calculateStatusCodeDistribution(metrics: RequestMetric[]): Record<number, number> {
    const distribution: Record<number, number> = {};
    
    for (const metric of metrics) {
      const code = metric.statusCode;
      distribution[code] = (distribution[code] || 0) + 1;
    }
    
    return distribution;
  }

  /**
   * Calculate HTTP method distribution
   */
  private calculateMethodDistribution(metrics: RequestMetric[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const metric of metrics) {
      const method = metric.method;
      distribution[method] = (distribution[method] || 0) + 1;
    }
    
    return distribution;
  }

  /**
   * Calculate top endpoints by request count
   */
  private calculateTopEndpoints(metrics: RequestMetric[], limit = 10): EndpointMetric[] {
    const endpointMap = new Map<string, { count: number; totalDuration: number }>();
    
    for (const metric of metrics) {
      const path = this.normalizePath(metric.path);
      const existing = endpointMap.get(path) || { count: 0, totalDuration: 0 };
      
      endpointMap.set(path, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + metric.duration
      });
    }
    
    const endpoints: EndpointMetric[] = [];
    for (const [path, data] of endpointMap.entries()) {
      endpoints.push({
        path,
        count: data.count,
        avgDuration: Math.round(data.totalDuration / data.count)
      });
    }
    
    // Sort by count descending
    endpoints.sort((a, b) => b.count - a.count);
    
    return endpoints.slice(0, limit);
  }

  /**
   * Calculate slowest endpoints by average duration
   */
  private calculateSlowestEndpoints(metrics: RequestMetric[], limit = 10): EndpointMetric[] {
    const endpointMap = new Map<string, { count: number; totalDuration: number }>();
    
    for (const metric of metrics) {
      const path = this.normalizePath(metric.path);
      const existing = endpointMap.get(path) || { count: 0, totalDuration: 0 };
      
      endpointMap.set(path, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + metric.duration
      });
    }
    
    const endpoints: EndpointMetric[] = [];
    for (const [path, data] of endpointMap.entries()) {
      // Only include endpoints with at least 5 requests for meaningful average
      if (data.count >= 5) {
        endpoints.push({
          path,
          count: data.count,
          avgDuration: Math.round(data.totalDuration / data.count)
        });
      }
    }
    
    // Sort by avgDuration descending
    endpoints.sort((a, b) => b.avgDuration - a.avgDuration);
    
    return endpoints.slice(0, limit);
  }

  /**
   * Calculate response time distribution
   */
  private calculateResponseTimeDistribution(metrics: RequestMetric[]): ResponseTimeDistribution {
    const distribution: ResponseTimeDistribution = {
      fast: 0,
      medium: 0,
      slow: 0,
      verySlow: 0
    };
    
    for (const metric of metrics) {
      if (metric.duration < 100) {
        distribution.fast++;
      } else if (metric.duration < 500) {
        distribution.medium++;
      } else if (metric.duration < 1000) {
        distribution.slow++;
      } else {
        distribution.verySlow++;
      }
    }
    
    return distribution;
  }

  /**
   * Normalize path by removing IDs and query parameters
   * Example: /api/categories/abc123 -> /api/categories/:id
   */
  private normalizePath(path: string): string {
    // Remove query parameters
    const pathWithoutQuery = path.split('?')[0] || path;
    
    // Replace UUIDs and numeric IDs with :id
    const normalized = pathWithoutQuery
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/[0-9a-f]{15}/gi, '/:id') // PocketBase IDs
      .replace(/\/\d+/g, '/:id'); // Numeric IDs
    
    return normalized;
  }

  /**
   * Get empty metrics structure
   */
  private getEmptyMetrics(): RequestMetrics {
    return {
      current: {
        totalRequests: 0,
        requestsPerSecond: 0,
        averageResponseTime: 0,
        errorRate: 0
      },
      statusCodes: {},
      methods: {},
      topEndpoints: [],
      slowestEndpoints: [],
      responseTimes: {
        fast: 0,
        medium: 0,
        slow: 0,
        verySlow: 0
      },
      recentRequests: []
    };
  }

  /**
   * Clear all metrics (useful for testing)
   */
  public clearMetrics(): void {
    this.initializeMetrics();
  }
}

// Export singleton instance
export const requestMetricsService = new RequestMetricsService();
