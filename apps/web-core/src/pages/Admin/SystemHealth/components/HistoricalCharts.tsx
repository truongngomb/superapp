import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/common';
import { systemService } from '@/services/system.service';
import type { SystemMetricSnapshot } from '@superapp/shared-types';
import { logger } from '@/utils';

interface FormattedSnapshot extends SystemMetricSnapshot {
  timeLabel: string;
  fullTime: string;
}

export function HistoricalCharts() {
  const { t } = useTranslation(['system_health', 'common']);
  const [data, setData] = useState<FormattedSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await systemService.getHistory(50);
        // Format timestamp for display
        const formatted: FormattedSnapshot[] = history.map(item => ({
          ...item,
          timeLabel: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fullTime: new Date(item.timestamp).toLocaleString(),
        }));
        setData(formatted);
      } catch (error: unknown) {
        logger.error('SystemHealth', 'Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
           <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
           <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
        <Card>
           <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
           <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (data.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t('historical_analytics.title')}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('historical_analytics.traffic_errors')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis 
                    dataKey="timeLabel" 
                    tick={{ fontSize: 12 }} 
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 12 }}
                    stroke="#ef4444"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--color-background))', 
                      borderColor: 'hsl(var(--color-border))',
                      borderRadius: '8px' 
                    }}
                    labelFormatter={(_, payload) => {
                      if (payload.length) {
                        const data = payload[0]?.payload as FormattedSnapshot;
                        return data.fullTime;
                      }
                      return '';
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="total_requests" 
                    name={t('request_monitoring.total_requests')} 
                    fill="hsl(217 91% 60%)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="error_count" 
                    name={t('request_monitoring.error_rate')} 
                    fill="#ef4444" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Latency Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('historical_analytics.latency_performance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorP95" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis 
                    dataKey="timeLabel" 
                    tick={{ fontSize: 12 }} 
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--color-background))', 
                      borderColor: 'hsl(var(--color-border))',
                      borderRadius: '8px' 
                    }}
                    labelFormatter={(_, payload) => {
                      if (payload.length) {
                        const data = payload[0]?.payload as FormattedSnapshot;
                        return data.fullTime;
                      }
                      return '';
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="avg_latency" 
                    name={t('request_monitoring.avg_response_time')} 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorAvg)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="p95_latency" 
                    name="P95 Latency" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorP95)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
