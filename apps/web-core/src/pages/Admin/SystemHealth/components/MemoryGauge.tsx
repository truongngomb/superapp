import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@superapp/ui-kit";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatBytes } from "@superapp/core-logic";
import { useTranslation } from "react-i18next";

interface MemoryGaugeProps {
  total: number;
  used: number;
  active: number;
  available: number;
}

export function MemoryGauge({ total, used, available }: MemoryGaugeProps) {
  const { t } = useTranslation(['system_health']);
  
  const data = [
    { name: t('memory_chart.used'), value: used, color: 'hsl(0 84% 60%)' }, // Red from --color-error
    { name: t('memory_chart.available'), value: available, color: 'hsl(217 91% 60%)' }, // Blue from --color-primary
  ];

  const percentage = Math.round((used / total) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('memory_chart.title')}</CardTitle>
        <CardDescription>{t('memory_chart.description', { percentage })}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] flex flex-col items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                <Cell key={`cell-${index.toString()}`} fill={entry.color} />
              ))}
            </Pie>
             <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--color-background))', 
                borderColor: 'hsl(var(--color-border))',
                borderRadius: '8px' 
              }} 
              formatter={(value: number | undefined) => formatBytes(value ?? 0)}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 text-center">
            <span className="text-3xl font-bold">{percentage.toString()}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
