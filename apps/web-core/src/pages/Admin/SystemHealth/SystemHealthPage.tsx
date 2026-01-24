import { useTranslation } from "react-i18next";
import { 
  Loader2, 
  Cpu, 
  HardDrive, 
  MemoryStick,
  Server,
  Activity
} from "lucide-react";
import { useSystemHealth } from "@/hooks";
import { formatBytes } from "@/utils/format";
import { motion } from "framer-motion";

import { HealthCard } from "./components/HealthCard";
import { CpuChart } from "./components/CpuChart";
import { MemoryGauge } from "./components/MemoryGauge";
import { DiskTable } from "./components/DiskTable";
import { SystemInfo } from "./components/SystemInfo";
import { RequestMonitoringSection } from "./components/RequestMonitoringSection";
import { HistoricalCharts } from "./components/HistoricalCharts";

// Simple Header component just for this page to match PageHeader style but simpler
function Header() {
  const { t } = useTranslation(['system_health', 'common']);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-muted mt-1">{t('subtitle')}</p>
        </div>
      </div>
    </div>
  );
}

export default function SystemHealthPage() {
  const { t } = useTranslation(['system_health', 'common']);
  const { stats, loading, error } = useSystemHealth();

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-destructive">
        <Activity className="w-12 h-12 mb-4" />
        <h2 className="text-lg font-semibold">{t('error_load_failed')}</h2>
        <p className="text-sm opacity-80">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Header />

      <SystemInfo os={stats.os} cpu={stats.cpu} />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthCard
          title={t('cpu_usage')}
          value={`${Math.round(stats.cpu.usage.system).toString()}%`}
          subValue={t('cards.server', { value: Math.round(stats.cpu.usage.server).toString() })}
          icon={Cpu}
          color="text-blue-500"
        />
        <HealthCard
          title={t('memory_usage')}
          value={`${Math.round((stats.memory.used / stats.memory.total) * 100).toString()}%`}
          subValue={`${formatBytes(stats.memory.used)} / ${formatBytes(stats.memory.total)}`}
          icon={MemoryStick}
          color="text-green-500"
        />
        <HealthCard
          title={t('disk_usage')}
          value={`${Math.round(stats.disk[0]?.use || 0).toString()}%`}
          subValue={t('cards.free', { value: formatBytes(stats.disk[0]?.available || 0) })}
          icon={HardDrive}
          color="text-orange-500"
        />
        <HealthCard
          title={t('uptime')}
          value={t('common:n_a')} 
          subValue={t('cards.since_restart')}
          icon={Server}
          color="text-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CpuChart currentLoad={stats.cpu.usage.system} />
        <MemoryGauge 
          total={stats.memory.total} 
          used={stats.memory.used} 
          active={stats.memory.active}
          available={stats.memory.available}
        />
      </div>

      {/* Request Monitoring Section */}
      <RequestMonitoringSection />

      {/* Historical Analytics */}
      <HistoricalCharts />

      {/* Tables Row */}
      <div className="grid grid-cols-1 gap-6">
        <DiskTable disks={stats.disk} />
      </div>
    </motion.div>
  );
}


