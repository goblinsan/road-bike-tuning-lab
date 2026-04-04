import { TuningOutcomeTracker, outcomeTracker, OutcomeRecord } from '../outcomeTracker';

describe('TuningOutcomeTracker', () => {
  let tracker: TuningOutcomeTracker;

  beforeEach(() => {
    tracker = new TuningOutcomeTracker();
  });

  it('starts with zero outcomes', () => {
    expect(tracker.count()).toBe(0);
    expect(tracker.getOutcomes()).toHaveLength(0);
  });

  it('records a single outcome and increments count', () => {
    tracker.recordOutcome({
      symptom: 'skips_gears',
      wizardType: 'rear',
      startStep: 'indexing',
      completedSteps: ['indexing', 'b_screw'],
      skippedSteps: [],
      resolved: true,
    });

    expect(tracker.count()).toBe(1);
    const outcomes = tracker.getOutcomes();
    expect(outcomes).toHaveLength(1);
    expect(outcomes[0].symptom).toBe('skips_gears');
    expect(outcomes[0].resolved).toBe(true);
  });

  it('assigns a unique id and timestamp to each record', () => {
    tracker.recordOutcome({
      symptom: 'noisy_shifts',
      wizardType: 'rear',
      startStep: 'indexing',
      completedSteps: [],
      skippedSteps: [],
      resolved: false,
    });
    tracker.recordOutcome({
      symptom: 'chain_rub_front',
      wizardType: 'front',
      startStep: 'friction_check',
      completedSteps: [],
      skippedSteps: [],
      resolved: true,
    });

    const [first, second] = tracker.getOutcomes();
    expect(first.id).not.toBe(second.id);
    expect(typeof first.timestamp).toBe('number');
  });

  it('getOutcomes returns a copy (mutations do not affect internal state)', () => {
    tracker.recordOutcome({
      wizardType: 'rear',
      startStep: 'h_limit',
      completedSteps: [],
      skippedSteps: [],
      resolved: true,
    });
    const outcomes = tracker.getOutcomes();
    outcomes.push({} as OutcomeRecord);
    expect(tracker.count()).toBe(1);
  });

  it('getOutcomesForSymptom filters correctly', () => {
    tracker.recordOutcome({
      symptom: 'skips_gears',
      wizardType: 'rear',
      startStep: 'indexing',
      completedSteps: [],
      skippedSteps: [],
      resolved: true,
    });
    tracker.recordOutcome({
      symptom: 'noisy_shifts',
      wizardType: 'rear',
      startStep: 'indexing',
      completedSteps: [],
      skippedSteps: [],
      resolved: false,
    });

    const skips = tracker.getOutcomesForSymptom('skips_gears');
    expect(skips).toHaveLength(1);
    expect(skips[0].symptom).toBe('skips_gears');
  });

  describe('getResolutionRate', () => {
    it('returns null when there are no outcomes', () => {
      expect(tracker.getResolutionRate()).toBeNull();
    });

    it('returns null when no outcomes match the given symptom', () => {
      tracker.recordOutcome({
        symptom: 'noisy_shifts',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: true,
      });
      expect(tracker.getResolutionRate('skips_gears')).toBeNull();
    });

    it('returns 1.0 when all sessions resolved', () => {
      tracker.recordOutcome({
        symptom: 'skips_gears',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: true,
      });
      tracker.recordOutcome({
        symptom: 'skips_gears',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: true,
      });
      expect(tracker.getResolutionRate('skips_gears')).toBe(1.0);
    });

    it('returns 0.5 for a 50/50 split', () => {
      tracker.recordOutcome({
        symptom: 'skips_gears',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: true,
      });
      tracker.recordOutcome({
        symptom: 'skips_gears',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: false,
      });
      expect(tracker.getResolutionRate('skips_gears')).toBe(0.5);
    });

    it('computes overall rate across all symptoms when no symptom is given', () => {
      tracker.recordOutcome({
        symptom: 'skips_gears',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: true,
      });
      tracker.recordOutcome({
        symptom: 'noisy_shifts',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: false,
      });
      expect(tracker.getResolutionRate()).toBe(0.5);
    });
  });

  describe('getUnresolvedReport', () => {
    it('returns an empty object when all sessions resolved', () => {
      tracker.recordOutcome({
        symptom: 'skips_gears',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: true,
      });
      expect(tracker.getUnresolvedReport()).toEqual({});
    });

    it('groups unresolved outcomes by symptom', () => {
      tracker.recordOutcome({
        symptom: 'skips_gears',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: false,
      });
      tracker.recordOutcome({
        symptom: 'skips_gears',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: false,
      });
      tracker.recordOutcome({
        symptom: 'noisy_shifts',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: false,
      });
      const report = tracker.getUnresolvedReport();
      expect(report['skips_gears']).toBe(2);
      expect(report['noisy_shifts']).toBe(1);
    });

    it('uses "unknown" as key when symptom is not set', () => {
      tracker.recordOutcome({
        wizardType: 'rear',
        startStep: 'pre_check',
        completedSteps: [],
        skippedSteps: [],
        resolved: false,
      });
      const report = tracker.getUnresolvedReport();
      expect(report['unknown']).toBe(1);
    });
  });

  it('exported singleton outcomeTracker is a TuningOutcomeTracker instance', () => {
    expect(outcomeTracker).toBeInstanceOf(TuningOutcomeTracker);
  });
});
