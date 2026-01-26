import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@superapp/ui-kit';
import type { ResponseTimeDistribution } from '@superapp/shared-types';

interface ResponseTimeChartProps {
  data: ResponseTimeDistribution;
}

interface CustomBarProps {
  payload: {
    color: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow other props for spreading
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
            <Bar 
              dataKey="value" 
              barSize={32}
              shape={(props: unknown) => {
                const { payload, ...rest } = props as CustomBarProps;
                return <Rectangle {...rest} fill={payload.color} radius={[0, 4, 4, 0]} />;
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
