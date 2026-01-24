import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common';

interface StatusCodeChartProps {
  data: Record<number, number>;
}

export function StatusCodeChart({ data }: StatusCodeChartProps) {
  const { t } = useTranslation(['system_health']);

  // Transform data for Recharts
  const chartData = Object.entries(data).map(([code, count]) => {
    const statusCode = parseInt(code);
    const name = code;
    let color = 'hsl(var(--muted))'; // Default gray

    if (statusCode >= 200 && statusCode < 300) {
      color = 'hsl(142 76% 36%)'; // Green for success
    } else if (statusCode >= 300 && statusCode < 400) {
      color = 'hsl(217 91% 60%)'; // Blue for redirects (Primary)
    } else if (statusCode >= 400 && statusCode < 500) {
      color = 'hsl(48 96% 53%)'; // Yellow for client errors
    } else if (statusCode >= 500) {
      color = 'hsl(0 84% 60%)'; // Red for server errors
    }

    return { name, value: count, color };
  }).sort((a, b) => b.value - a.value); // Sort by count descending

  // If no data, show empty state or placeholder
  if (chartData.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>{t('request_monitoring.status_code_distribution')}</CardTitle>
          <CardDescription>{t('cpu_chart.collecting')}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No data
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>{t('request_monitoring.status_code_distribution')}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                <Cell key={`cell-${String(index)}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{
                backgroundColor: 'hsl(var(--color-background))',
                borderColor: 'hsl(var(--color-border))',
                borderRadius: '8px'
              }}
              itemStyle={{ color: 'hsl(var(--colot-foreground))' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
