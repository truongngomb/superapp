import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@superapp/ui-kit";
import { useTranslation } from "react-i18next";
import type { SystemStats } from "@superapp/shared-types";

interface SystemInfoProps {
  os: SystemStats['os'];
  cpu: SystemStats['cpu'];
}

export function SystemInfo({ os, cpu }: SystemInfoProps) {
  const { t } = useTranslation(['system_health']);
  
  const infoItems = [
    { label: t('system_info.os_platform'), value: `${os.distro} ${os.release} (${os.arch})` },
    { label: t('system_info.hostname'), value: os.hostname },
    { label: t('system_info.processor'), value: `${cpu.manufacturer} ${cpu.brand}` },
    { label: t('system_info.cpu_speed'), value: t('system_info.cpu_speed_value', { speed: cpu.speed }) },
    { label: t('system_info.cores', { count: cpu.cores }), value: t('system_info.cores', { count: cpu.cores }) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {infoItems.map((item) => (
        <Card key={item.label}>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">{item.label}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="font-semibold truncate" title={item.value}>{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
