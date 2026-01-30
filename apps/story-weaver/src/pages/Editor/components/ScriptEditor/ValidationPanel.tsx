/**
 * ValidationPanel Component
 * 
 * Displays script validation issues (errors, warnings, info).
 * Collapsible panel with visual indicators.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, Badge } from '@superapp/ui-kit';
import type { ScriptValidationResult, ScriptValidationIssue } from '@/types/scene-script';
import { VALIDATION_SEVERITY } from '@/types/scene-script';

interface ValidationPanelProps {
  validation: ScriptValidationResult;
  className?: string;
}

const severityConfig = {
  [VALIDATION_SEVERITY.ERROR]: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    label: 'error',
  },
  [VALIDATION_SEVERITY.WARNING]: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    label: 'warning',
  },
  [VALIDATION_SEVERITY.INFO]: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    label: 'info',
  },
};

const IssueItem = ({ issue }: { issue: ScriptValidationIssue }) => {
  const { t } = useTranslation(['video_projects']);
  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div className={`flex gap-3 p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
      <Icon className={`w-5 h-5 ${config.color} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {issue.sceneOrder && (
            <Badge variant="secondary" size="sm" className="shrink-0">
              {t('video_projects:editor.scene_label', { index: issue.sceneOrder })}
            </Badge>
          )}
          <span className="text-sm font-medium truncate">{issue.message}</span>
        </div>
        {issue.suggestion && (
          <p className="text-xs text-muted-foreground mt-1">
            💡 {issue.suggestion}
          </p>
        )}
      </div>
    </div>
  );
};

export const ValidationPanel = ({ validation, className }: ValidationPanelProps) => {
  const { t } = useTranslation(['video_projects', 'uikit']);
  const [isExpanded, setIsExpanded] = useState(true);

  const errorCount = validation.issues.filter(i => i.severity === VALIDATION_SEVERITY.ERROR).length;
  const warningCount = validation.issues.filter(i => i.severity === VALIDATION_SEVERITY.WARNING).length;
  const infoCount = validation.issues.filter(i => i.severity === VALIDATION_SEVERITY.INFO).length;

  const hasIssues = validation.issues.length > 0;

  // Duration progress
  const durationPercent = Math.min(
    (validation.totalDuration / validation.targetDuration) * 100,
    150
  );
  const isDurationOk = durationPercent >= 80 && durationPercent <= 120;

  return (
    <Card className={`overflow-hidden ${className ?? ''}`}>
      {/* Header */}
      <button
        onClick={() => { setIsExpanded(!isExpanded); }}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {validation.isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium">
            {t('video_projects:script.validation_title')}
          </span>
          
          {/* Issue counts */}
          <div className="flex gap-2">
            {errorCount > 0 && (
              <Badge variant="danger" size="sm">
                {String(errorCount)} {t('video_projects:script.errors')}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="warning" size="sm">
                {String(warningCount)} {t('video_projects:script.warnings')}
              </Badge>
            )}
            {infoCount > 0 && !hasIssues && (
              <Badge variant="secondary" size="sm">
                {String(infoCount)} {t('video_projects:script.info')}
              </Badge>
            )}
            {!hasIssues && (
              <Badge variant="success" size="sm">
                {t('video_projects:script.all_good')}
              </Badge>
            )}
          </div>
        </div>

        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-border p-4 space-y-4">
              {/* Duration Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t('video_projects:script.duration_label')}
                    </span>
                  </div>
                  <span className={isDurationOk ? 'text-emerald-500' : 'text-amber-500'}>
                    {String(validation.totalDuration)}{t('video_projects:script.seconds_short')} / {String(validation.targetDuration)}{t('video_projects:script.seconds_short')}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-colors ${
                      durationPercent > 120
                        ? 'bg-red-500'
                        : durationPercent < 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${String(Math.min(durationPercent, 100))}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Issues List */}
              {hasIssues && (
                <div className="space-y-2">
                  {validation.issues.map((issue, index) => (
                    <IssueItem key={`${issue.sceneId ?? 'global'}-${issue.field}-${String(index)}`} issue={issue} />
                  ))}
                </div>
              )}

              {/* All Good Message */}
              {!hasIssues && (
                <div className="flex items-center justify-center gap-2 py-4 text-emerald-500">
                  <CheckCircle2 size={20} />
                  <span>{t('video_projects:script.validation_passed')}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
