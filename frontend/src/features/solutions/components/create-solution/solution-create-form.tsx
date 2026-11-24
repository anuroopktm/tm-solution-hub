import React, { useState, useEffect, useMemo } from "react";
import { useSolutionForm } from "../../hooks/use-solution-form";
import type { UseSolutionFormReturn } from "../../hooks/use-solution-form";
import { Stepper } from "@/components/ui/stepper";
import { FORM_STEPS } from "../../constants/form-steps";
import { SolutionFormHeader } from "./solution-form-header";
import {
  SolutionFormValidationAlert,
  STEP_VALIDATION_FIELDS,
} from "./solution-form-validation-alert";
import { StepGeneralInfo } from "./step-general-info";
import { StepTechCapabilities } from "./step-tech-capabilities";
import { StepDeploymentsLinks } from "./step-deployments-links";
import { StepAssetsMedia } from "./step-assets-media";
import { SolutionFormFooter } from "./solution-form-footer";

export type SolutionCreateFormViewProps = UseSolutionFormReturn & {
  initialStep?: number;
};

/**
 * Multi-step presentation view for the Solution creation form.
 * Decoupled into individual step cards and helper components.
 */
export function SolutionCreateFormView({
  register,
  control,
  handleSubmit,
  errors,
  watch,
  trigger,
  isPending,
  categories,
  categoriesLoading,
  users,
  usersLoading,
  techStack,
  handleAddTech,
  handleRemoveTech,
  selectedCategoryIds,
  toggleCategory,
  setValue,
  initialStep = 0,
  capabilities,
  handleAddCapability,
  handleRemoveCapability,
  documents,
  handleAddDocument,
  handleRemoveDocument,
  videos,
  handleAddVideo,
  handleRemoveVideo,
}: SolutionCreateFormViewProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    new Set(Array.from({ length: initialStep }, (_, i) => i)),
  );

  // Technologies & Frameworks sync with MultiSelectCombobox
  const watchedTech = useMemo(() => {
    return (watch ? watch("tech_stack") : techStack) || [];
  }, [watch, techStack]);

  const totalSteps = FORM_STEPS.length;
  const isLastStep = currentStep === totalSteps - 1;

  // Validate the current step fields before advancing
  const validateCurrentStep = async (): Promise<boolean> => {
    if (!trigger) return true;
    const fields = STEP_VALIDATION_FIELDS[currentStep];
    if (!fields || fields.length === 0) return true;

    return await trigger(fields);
  };

  const scrollToTop = () => {
    if (
      typeof window !== "undefined" &&
      typeof window.scrollTo === "function"
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      scrollToTop();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        for (let s = prevStep; s < totalSteps; s++) {
          next.delete(s);
        }
        return next;
      });
      scrollToTop();
    }
  };

  const handleStepClick = async (targetStepIndex: number) => {
    if (targetStepIndex < currentStep) {
      setCurrentStep(targetStepIndex);
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        for (let s = targetStepIndex; s < totalSteps; s++) {
          next.delete(s);
        }
        return next;
      });
      scrollToTop();
      return;
    }

    const isValid = await validateCurrentStep();
    if (isValid) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep(targetStepIndex);
      scrollToTop();
    }
  };

  const [canPublish, setCanPublish] = useState(false);

  useEffect(() => {
    if (!isLastStep) return;

    const timer = setTimeout(() => {
      setCanPublish(true);
    }, 800);

    return () => {
      clearTimeout(timer);
      setCanPublish(false);
    };
  }, [isLastStep]);

  const handlePublish = async () => {
    if (!isLastStep || !canPublish || isPending) return;
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    await handleSubmit();
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Prevent accidental form submission or step advancement when pressing Enter
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onKeyDown={handleFormKeyDown}
      className="space-y-6"
    >
      {/* Top Header */}
      <SolutionFormHeader />

      {/* Stepper Navigation */}
      <Stepper
        steps={FORM_STEPS}
        activeStep={currentStep}
        onStepClick={handleStepClick}
        isStepCompleted={(index) => completedSteps.has(index)}
      />

      {/* Field Validation Alert */}
      <SolutionFormValidationAlert currentStep={currentStep} errors={errors} />

      {/* STEP 0: General Information */}
      {currentStep === 0 && (
        <StepGeneralInfo
          register={register}
          control={control}
          errors={errors}
          isPending={isPending}
          categories={categories}
          categoriesLoading={categoriesLoading}
          users={users}
          usersLoading={usersLoading}
          selectedCategoryIds={selectedCategoryIds}
          toggleCategory={toggleCategory}
        />
      )}

      {/* STEP 1: Tech & Capabilities */}
      {currentStep === 1 && (
        <StepTechCapabilities
          register={register}
          errors={errors}
          isPending={isPending}
          watchedTech={watchedTech}
          handleAddTech={handleAddTech}
          handleRemoveTech={handleRemoveTech}
          capabilitiesList={capabilities}
          appendCapability={handleAddCapability}
          removeCapability={handleRemoveCapability}
        />
      )}

      {/* STEP 2: Deployments & Links */}
      {currentStep === 2 && (
        <StepDeploymentsLinks
          register={register}
          setValue={setValue}
          errors={errors}
          isPending={isPending}
        />
      )}

      {/* STEP 3: Assets & Media */}
      {currentStep === 3 && (
        <StepAssetsMedia
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          isPending={isPending}
          documentsList={documents}
          videosList={videos}
          appendDocument={handleAddDocument}
          removeDocument={handleRemoveDocument}
          appendVideo={handleAddVideo}
          removeVideo={handleRemoveVideo}
        />
      )}

      {/* Navigation Footer */}
      <SolutionFormFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        isPending={isPending}
        canPublish={canPublish}
        onPrev={handlePrev}
        onNext={handleNext}
        onPublish={handlePublish}
      />
    </form>
  );
}

/**
 * Connected Container component that binds `useSolutionForm` hook
 * to `SolutionCreateFormView`.
 */
export function SolutionCreateForm() {
  const formState = useSolutionForm();
  return <SolutionCreateFormView {...formState} />;
}
