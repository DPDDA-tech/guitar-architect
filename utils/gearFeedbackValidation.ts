// Pure, framework-free validation for the Gear public consultation form.
// Used by GearProductFeedbackModal.tsx and covered directly by Vitest,
// independent of any DOM/jsdom environment.

export interface GearFeedbackFormValues {
  interest: string;
  useContexts: string[];
  priority: string;
  email: string;
  wantsUpdates: boolean;
}

export interface GearFeedbackFormErrors {
  interest?: string;
  useContexts?: string;
  priority?: string;
  email?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateGearFeedbackForm(values: GearFeedbackFormValues, isPt: boolean): GearFeedbackFormErrors {
  const errors: GearFeedbackFormErrors = {};

  if (!values.interest) {
    errors.interest = isPt ? 'Selecione seu nível de interesse.' : 'Select your level of interest.';
  }
  if (values.useContexts.length === 0) {
    errors.useContexts = isPt ? 'Selecione ao menos um contexto de uso.' : 'Select at least one use context.';
  }
  if (!values.priority) {
    errors.priority = isPt ? 'Selecione a prioridade principal.' : 'Select the main priority.';
  }
  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = isPt ? 'Informe um e-mail válido.' : 'Enter a valid email address.';
  }

  return errors;
}

export function isGearFeedbackFormValid(errors: GearFeedbackFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
