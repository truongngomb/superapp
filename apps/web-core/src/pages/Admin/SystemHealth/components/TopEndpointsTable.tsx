import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common';
import type { EndpointMetric } from '@superapp/shared-types';

interface TopEndpointsTableProps {
  data: EndpointMetric[];
  type: 'most-requested' | 'slowest';
}

export function TopEndpointsTable({ data, type }: TopEndpointsTableProps) {
  const { t } = useTranslation(['system_health']);
  
  const title = type === 'most-requested' 
    ? t('request_monitoring.top_endpoints')
    : t('request_monitoring.slowest_endpoints');

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%]">{t('request_monitoring.endpoint')}</TableHead>
              <TableHead className="text-right">{t('request_monitoring.requests')}</TableHead>
              <TableHead className="text-right">{t('request_monitoring.avg_duration')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                  {t('collecting_data')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((endpoint, index) => (
                <TableRow key={`${endpoint.path}-${String(index)}`}>
                  <TableCell className="font-medium truncate max-w-[200px]" title={endpoint.path}>
                    {endpoint.path}
                  </TableCell>
                  <TableCell className="text-right">{endpoint.count}</TableCell>
                  <TableCell className="text-right">
                    <span className={type === 'slowest' && endpoint.avgDuration > 500 ? "text-red-500 font-bold" : ""}>
                      {endpoint.avgDuration}ms
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
