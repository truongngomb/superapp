import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@superapp/ui-kit";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface CpuChartProps {
  currentLoad: number;
}

export function CpuChart({ currentLoad }: CpuChartProps) {
  const { t } = useTranslation(['system_health']);
  const [data, setData] = useState<{ time: string; load: number }[]>([]);

  useEffect(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    
    // eslint-disable-next-line
    setData(prev => {
      const newData = [...prev, { time: timeStr, load: currentLoad }];
      // Keep only last 20 points
      if (newData.length > 20) return newData.slice(newData.length - 20);
      return newData;
    });
  }, [currentLoad]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{t('cpu_chart.title')}</CardTitle>
        <CardDescription>{t('cpu_chart.description')}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            {t('cpu_chart.collecting')}
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }} 
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--color-background))', 
                    borderColor: 'hsl(var(--color-border))',
                    borderRadius: '8px' 
                  }} 
                />
                <Line
                  type="monotone"
                  dataKey="load"
                  stroke="hsl(217 91% 60%)"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
