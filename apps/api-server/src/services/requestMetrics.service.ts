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
import { adminPb } from '../config/index.js';
import { CollectionNames } from '../database/collections/index.js';
import { createLogger, logger } from '../utils/index.js';

const log = createLogger('RequestMetricsService');

export async function fixMetricsSchema() {
  try {
    const collection = await adminPb.collections.getOne(CollectionNames.SYSTEM_METRICS_SNAPSHOTS);
    
    // Use type assertion for schema property since it's generic in SDK
    const schema = (collection.schema || []) as Array<{ name: string; required: boolean }>;
    let changed = false;

    // Fields to ensure are NOT required (can be 0)
    const fieldsToFix = ['error_count', 'total_requests', 'avg_latency', 'p95_latency'];

    for (const fieldName of fieldsToFix) {
      const field = schema.find(f => f.name === fieldName);
      if (field && field.required) {
        field.required = false;
        logger.info('System', `Fixing schema: Removing 'required' from ${fieldName}`);
        changed = true;
      }
    }

    if (changed) {
      await adminPb.collections.update(collection.id, { schema });
      logger.info('System', 'Metrics schema updated successfully.');
    } else {
      logger.info('System', 'Metrics schema is already correct.');
    }
  } catch (error) {
    logger.error('System', 'Failed to fix metrics schema', error as Error);
  }
}

/**
 * Request Metrics Service
 * 
 * Tracks and aggregates HTTP request metrics using in-memory cache.
 * Provides real-time insights into application performance and usage patterns.
 */
class RequestMetricsService {
  private cache: NodeCache;
  private readonly METRICS_KEY = 'request_metrics';
  private readonly SNAPSHOT_KEY = 'snapshot_metrics'; // New bucket for snapshot
  private readonly WINDOW_SIZE = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly MAX_RECENT_REQUESTS = 50;
  
  constructor() {
    // Initialize cache with TTL of 10 minutes for Window, but we need longer for Snapshot bucket if interval > 10m
    // We'll set stdTTL to 0 (infinite) and handle cleanup manually to be safe for 60m+ intervals
    this.cache = new NodeCache({ stdTTL: 0, checkperiod: 600 });
    this.initializeMetrics();
  }

  /**
   * Initialize empty metrics structure
   */
  private initializeMetrics(): void {
    const initialMetrics: RequestMetric[] = [];
    if (!this.cache.get(this.METRICS_KEY)) {
        this.cache.set(this.METRICS_KEY, initialMetrics);
    }
    if (!this.cache.get(this.SNAPSHOT_KEY)) {
        this.cache.set(this.SNAPSHOT_KEY, []); // Init snapshot bucket
    }
  }

  /**
   * Record a new request metric
   */
  public recordRequest(metric: RequestMetric): void {
    // 1. Update Window Metrics (Real-time)
    const metrics = this.cache.get<RequestMetric[]>(this.METRICS_KEY) || [];
    metrics.push(metric);
    
    // Remove old metrics outside the rolling window
    const now = Date.now();
    const filtered = metrics.filter(m => (now - m.timestamp) < this.WINDOW_SIZE);
    this.cache.set(this.METRICS_KEY, filtered);

    // 2. Update Snapshot Metrics (Long-term accumulation)
    const snapshotMetrics = this.cache.get<RequestMetric[]>(this.SNAPSHOT_KEY) || [];
    // Store minimal data if needed, but for now we store full metric.
    // Optimization: In high load, map to lighter object here.
    snapshotMetrics.push(metric); 
    this.cache.set(this.SNAPSHOT_KEY, snapshotMetrics);
  }

  // ... (getMetrics and calculate methods remain unchanged) ...

  /**
   * Create a snapshot of aggregated metrics and save to Database
   * Called by SchedulerService
   */
  public async createSnapshot(): Promise<void> {
    const rawMetrics = this.cache.get<RequestMetric[]>(this.SNAPSHOT_KEY) || [];
    
    if (rawMetrics.length === 0) {
        log.info('No metrics to snapshot.');
        return;
    }

    log.info(`Creating snapshot from ${String(rawMetrics.length)} requests...`);

    // 1. Aggregate Data
    const total_requests = rawMetrics.length;
    const errors = rawMetrics.filter(m => m.statusCode >= 500).length; // Count system errors
    const totalDuration = rawMetrics.reduce((sum, m) => sum + m.duration, 0);
    const avg_latency = Math.round(totalDuration / total_requests);
    
    // Calculate P95
    const sortedDurations = rawMetrics.map(m => m.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(sortedDurations.length * 0.95);
    const p95_latency = sortedDurations[p95Index] || 0;

    // Top Endpoints
    const topEndpoints = this.calculateTopEndpoints(rawMetrics, 10); // Reuse logic

    const snapshotData = {
        timestamp: new Date().toISOString(),
        total_requests,
        avg_latency,
        error_count: errors,
        p95_latency,
        top_endpoints: topEndpoints // JSON field
    };
    
    // Debug log
    log.info('Snapshot Data Preview:', { total_requests, avg_latency, error_count: errors });

    // 2. Save to DB
    try {
        await adminPb.collection(CollectionNames.SYSTEM_METRICS_SNAPSHOTS).create(snapshotData);
        
        // 3. Reset Bucket ONLY after successful save
        this.cache.set(this.SNAPSHOT_KEY, []);
        log.info('Snapshot saved to DB and bucket reset.');
    } catch (error) {
        log.error('Failed to save snapshot to DB:', error);
        // Do NOT reset bucket on error, allowing retry or manual inspection.
        throw error;
    }
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
