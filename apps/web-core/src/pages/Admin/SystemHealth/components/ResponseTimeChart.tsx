import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common';
import type { ResponseTimeDistribution } from '@superapp/shared-types';

interface ResponseTimeChartProps {
  data: ResponseTimeDistribution;
}

export function ResponseTimeChart({ data }: ResponseTimeChartProps) {
  const { t } = useTranslation(['system_health']);

  const chartData = [
    { name: 'Fast', label: t('request_monitoring.fast'), value: data.fast, color: 'hsl(142 76% 36%)' },
    { name: 'Medium', label: t('request_monitoring.medium'), value: data.medium, color: 'hsl(217 91% 60%)' },
    { name: 'Slow', label: t('request_monitoring.slow'), value: data.slow, color: 'hsl(48 96% 53%)' },
    { name: 'Very Slow', label: t('request_monitoring.very_slow'), value: data.verySlow, color: 'hsl(0 84% 60%)' },
  ];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>{t('request_monitoring.response_time_distribution')}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              width={80}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--color-background))',
                borderColor: 'hsl(var(--color-border))',
                borderRadius: '8px'
              }}
              formatter={(value: number | string | Array<number | string> | undefined) => [value, t('request_monitoring.requests')]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) => {
                const item = chartData.find(d => d.name === label);
                return item ? item.label : String(label);
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index.toString()}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
