import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Globe, 
  Clock, 
  AlertTriangle 
} from "lucide-react";
import { useRequestMetrics } from '@/hooks/useRequestMetrics';
import { RequestStatsCard } from './RequestStatsCard';
import { StatusCodeChart } from './StatusCodeChart';
import { TopEndpointsTable } from './TopEndpointsTable';
import { ResponseTimeChart } from './ResponseTimeChart';

export function RequestMonitoringSection() {
  const { t } = useTranslation(['system_health']);
  const { metrics, isLoading } = useRequestMetrics();

  if (isLoading || !metrics) {
    return null; // Or skeleton
  }

  const { current, statusCodes, topEndpoints, slowestEndpoints, responseTimes } = metrics;

  return (
    <div className="space-y-6 pt-6 border-t border-border">
      <h2 className="text-xl font-bold">{t('request_monitoring.title')}</h2>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RequestStatsCard
          title={t('request_monitoring.total_requests')}
          value={current.totalRequests}
          icon={Globe}
          color="text-blue-500"
        />
        <RequestStatsCard
          title={t('request_monitoring.requests_per_second')}
          value={current.requestsPerSecond}
          icon={Activity}
          color="text-green-500"
        />
        <RequestStatsCard
          title={t('request_monitoring.avg_response_time')}
          value={`${current.averageResponseTime.toString()}ms`}
          icon={Clock}
          color="text-orange-500"
        />
        <RequestStatsCard
          title={t('request_monitoring.error_rate')}
          value={`${(current.errorRate * 100).toFixed(2)}%`}
          icon={AlertTriangle}
          color="text-red-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusCodeChart data={statusCodes} />
        <ResponseTimeChart data={responseTimes} />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopEndpointsTable data={topEndpoints} type="most-requested" />
        <TopEndpointsTable data={slowestEndpoints} type="slowest" />
      </div>
    </div>
  );
}
