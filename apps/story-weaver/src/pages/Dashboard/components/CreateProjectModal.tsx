/**
 * CreateProjectModal (Wizard Version)
 * 
 * Multi-step wizard for creating new AI video projects.
 * Steps: Story → Settings → Confirm
 */
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal, Button } from '@superapp/ui-kit';
import { useProjectWizard } from '@/hooks';
import { 
  StepIndicator, 
  StoryInputStep, 
  SettingsStep, 
  ConfirmStep 
} from './wizard';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const CreateProjectModal = ({ open, onOpenChange }: CreateProjectModalProps) => {
  const { t } = useTranslation(['video_projects', 'uikit']);
  
  const {
    currentStep,
    data,
    isSubmitting,
    error,
    nextStep,
    prevStep,
    canGoPrev,
    updateData,
    resetWizard,
    submitProject,
    getPlatformDefaults,
    goToStep,
  } = useProjectWizard();

  const handleClose = () => {
    onOpenChange(false);
    // Delay reset to avoid visual glitch
    setTimeout(resetWizard, 300);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'story': return t('video_projects:wizard.title_story');
      case 'settings': return t('video_projects:wizard.title_settings');
      case 'confirm': return t('video_projects:wizard.title_confirm');
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'story': return t('video_projects:wizard.desc_story');
      case 'settings': return t('video_projects:wizard.desc_settings');
      case 'confirm': return t('video_projects:wizard.desc_confirm');
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {getStepTitle()}
        </span>
      }
      description={getStepDescription()}
      size="lg"
      footer={
        <div className="flex justify-between w-full items-center">
          <div>
            {canGoPrev && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={prevStep}
                className="gap-2"
              >
                <ArrowLeft size={16} /> {t('uikit:back')}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              {t('uikit:cancel')}
            </Button>
            
            {currentStep === 'confirm' ? (
              <Button 
                onClick={submitProject}
                loading={isSubmitting}
                className="gap-2"
              >
                <Sparkles size={16} />
                {t('video_projects:wizard.create_project')}
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                className="gap-2"
              >
                {t('uikit:next')} <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Step Indicator */}
      <StepIndicator 
        currentStep={currentStep} 
        onStepClick={goToStep}
      />

      {/* Step Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="min-h-[300px]"
        >
          {currentStep === 'story' && (
            <StoryInputStep 
              data={data} 
              onUpdate={updateData} 
              error={error}
            />
          )}
          {currentStep === 'settings' && (
            <SettingsStep 
              data={data} 
              onUpdate={updateData}
              getPlatformDefaults={getPlatformDefaults}
            />
          )}
          {currentStep === 'confirm' && (
            <ConfirmStep data={data} />
          )}
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
};
