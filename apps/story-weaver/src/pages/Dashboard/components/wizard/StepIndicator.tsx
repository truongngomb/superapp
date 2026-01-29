/**
 * StepIndicator Component
 * 
 * Visual indicator showing wizard progress.
 */
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WizardStep } from '@/hooks/useProjectWizard';

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

const STEPS: { key: WizardStep; labelKey: string }[] = [
  { key: 'story', labelKey: 'video_projects:wizard.steps.story' },
  { key: 'settings', labelKey: 'video_projects:wizard.steps.settings' },
  { key: 'confirm', labelKey: 'video_projects:wizard.steps.confirm' },
];

export const StepIndicator = ({ currentStep, onStepClick }: StepIndicatorProps) => {
  const { t } = useTranslation(['video_projects']);
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  const handleStepClick = (step: WizardStep) => {
    if (onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isClickable = Boolean(onStepClick && index < currentIndex);

        // Build class names manually to avoid cn type issues
        let buttonClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all';
        if (isCompleted) buttonClasses += ' bg-primary text-primary-foreground';
        if (isCurrent) buttonClasses += ' bg-primary/20 text-primary border-2 border-primary animate-pulse';
        if (!isCompleted && !isCurrent) buttonClasses += ' bg-muted text-muted-foreground';
        if (isClickable) buttonClasses += ' cursor-pointer hover:scale-110';

        let labelClasses = 'ml-2 text-sm hidden sm:inline';
        if (isCurrent) labelClasses += ' font-semibold text-foreground';
        if (!isCurrent) labelClasses += ' text-muted-foreground';

        const connectorClasses = `w-8 sm:w-12 h-0.5 mx-2 ${index < currentIndex ? 'bg-primary' : 'bg-muted'}`;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step Circle */}
            <button
              type="button"
              onClick={() => { if (isClickable) handleStepClick(step.key); }}
              disabled={!isClickable}
              className={buttonClasses}
            >
              {isCompleted ? <Check size={16} /> : index + 1}
            </button>
            
            {/* Step Label */}
            <span className={labelClasses}>
              {t(step.labelKey)}
            </span>
            
            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div className={connectorClasses} />
            )}
          </div>
        );
      })}
    </div>
  );
};
