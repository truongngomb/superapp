import { AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardHeader, CardContent, Toggle } from '@/components/common';

export function GeneralSettings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">System Maintenance</h2>
              <p className="text-sm text-muted-foreground">General system health and maintenance</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center text-amber-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-amber-900 dark:text-amber-100">Maintenance Mode</div>
                <div className="text-xs text-amber-700 dark:text-amber-400">Block all non-admin access to the portal</div>
              </div>
            </div>
            <Toggle checked={false} onChange={() => {}} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
