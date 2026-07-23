import { describe, expect, it } from 'vitest';
import { validateGearFeedbackForm, isGearFeedbackFormValid } from '../utils/gearFeedbackValidation';

const baseValues = () => ({
  interest: 'high',
  useContexts: ['home-study'],
  priority: 'quality',
  email: '',
  wantsUpdates: false,
});

describe('Gear feedback form validation (client-side, pure)', () => {
  it('passes with all required fields present', () => {
    const errors = validateGearFeedbackForm(baseValues(), true);
    expect(isGearFeedbackFormValid(errors)).toBe(true);
  });

  it('requires an interest level', () => {
    const errors = validateGearFeedbackForm({ ...baseValues(), interest: '' }, true);
    expect(errors.interest).toBeTruthy();
    expect(isGearFeedbackFormValid(errors)).toBe(false);
  });

  it('requires at least one use context', () => {
    const errors = validateGearFeedbackForm({ ...baseValues(), useContexts: [] }, true);
    expect(errors.useContexts).toBeTruthy();
  });

  it('requires a priority', () => {
    const errors = validateGearFeedbackForm({ ...baseValues(), priority: '' }, true);
    expect(errors.priority).toBeTruthy();
  });

  it('does not require an email at all', () => {
    const errors = validateGearFeedbackForm({ ...baseValues(), email: '' }, true);
    expect(errors.email).toBeUndefined();
  });

  it('rejects a malformed email only when one is provided', () => {
    const errors = validateGearFeedbackForm({ ...baseValues(), email: 'not-an-email' }, true);
    expect(errors.email).toBeTruthy();
  });

  it('accepts a well-formed email', () => {
    const errors = validateGearFeedbackForm({ ...baseValues(), email: 'person@example.com' }, true);
    expect(errors.email).toBeUndefined();
  });

  it('returns English messages when isPt is false', () => {
    const errors = validateGearFeedbackForm({ ...baseValues(), interest: '' }, false);
    expect(errors.interest).toMatch(/select/i);
  });

  it('reports all missing-required-field errors together', () => {
    const errors = validateGearFeedbackForm({ interest: '', useContexts: [], priority: '', email: '', wantsUpdates: false }, true);
    expect(Object.keys(errors).sort()).toEqual(['interest', 'priority', 'useContexts']);
  });
});
