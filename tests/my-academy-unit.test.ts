import { describe, expect, it } from 'vitest';
import { NMC_RIT_001 } from '../data/learningUnits/nmcRit001';

describe('My Academy learning unit NMC-RIT-001', () => {
  it('keeps its editorial lineage and internal draft status explicit', () => {
    expect(NMC_RIT_001).toMatchObject({
      id: 'NMC-RIT-001',
      version: '0.1.4',
      contractVersion: '0.2.2',
      sourceDossierVersion: '0.1.2',
      editorialStatus: 'draft',
      visibility: 'internal',
    });
  });

  it('offers three modular activities with equivalent multimodal entry routes', () => {
    expect(NMC_RIT_001.activities).toHaveLength(3);
    expect(NMC_RIT_001.activities.map(activity => activity.order)).toEqual([1, 2, 3]);
    expect(NMC_RIT_001.activities[0].modalities).toEqual(['visual', 'auditory', 'combined']);
    expect(NMC_RIT_001.accessibility.equivalentEntryModalities).toEqual(['visual', 'auditory', 'combined']);
  });

  it('does not score, record, block, or claim execution competence', () => {
    expect(NMC_RIT_001.studioContext).toMatchObject({
      initialAudio: 'off',
      scoring: false,
      recording: false,
      allowFreeExploration: true,
    });
    expect(NMC_RIT_001.conceptCheck.nonBlocking).toBe(true);
    expect(NMC_RIT_001.selfRecord.optional).toBe(true);
    expect(NMC_RIT_001.boundaries.join(' ')).toContain('não mede');
  });

  it('requires deliberate audio activation and accessible controls', () => {
    expect(NMC_RIT_001.accessibility).toMatchObject({
      audioRequiresUserAction: true,
      screenReaderRequired: true,
      keyboardRequired: true,
      visualVolumeMeterRequired: false,
    });
  });
});
