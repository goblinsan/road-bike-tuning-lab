import { ConfidenceScorer, confidenceLabel, ScoredDiagnosisRoute } from '../confidenceScoring';
import { TuningOutcomeTracker } from '../outcomeTracker';
import { DIAGNOSIS_ROUTES, DiagnosisRoute } from '../symptomDiagnosis';

function makeTracker(): TuningOutcomeTracker {
  return new TuningOutcomeTracker();
}

describe('confidenceLabel', () => {
  it('returns "No data yet" for null', () => {
    expect(confidenceLabel(null)).toBe('No data yet');
  });

  it('returns "High confidence" for 0.8 and above', () => {
    expect(confidenceLabel(0.8)).toBe('High confidence');
    expect(confidenceLabel(1.0)).toBe('High confidence');
  });

  it('returns "Moderate confidence" for 0.5–0.79', () => {
    expect(confidenceLabel(0.5)).toBe('Moderate confidence');
    expect(confidenceLabel(0.79)).toBe('Moderate confidence');
  });

  it('returns "Low confidence" for below 0.5', () => {
    expect(confidenceLabel(0)).toBe('Low confidence');
    expect(confidenceLabel(0.49)).toBe('Low confidence');
  });
});

describe('ConfidenceScorer.scoreRoute', () => {
  it('returns null confidence and sampleSize 0 when there are no outcomes', () => {
    const tracker = makeTracker();
    const scorer = new ConfidenceScorer(tracker);
    const route = DIAGNOSIS_ROUTES.find((r) => r.symptom === 'skips_gears')!;
    const scored = scorer.scoreRoute(route);
    expect(scored.confidence).toBeNull();
    expect(scored.sampleSize).toBe(0);
  });

  it('only considers outcomes that match both symptom and startStep', () => {
    const tracker = makeTracker();
    // Record an outcome for the wrong startStep — should not affect score
    tracker.recordOutcome({
      symptom: 'skips_gears',
      wizardType: 'rear',
      startStep: 'b_screw', // different from route.startStep = 'indexing'
      completedSteps: [],
      skippedSteps: [],
      resolved: true,
    });

    const scorer = new ConfidenceScorer(tracker);
    const route = DIAGNOSIS_ROUTES.find((r) => r.symptom === 'skips_gears')!;
    expect(route.startStep).toBe('indexing');

    const scored = scorer.scoreRoute(route);
    expect(scored.confidence).toBeNull(); // no matching outcomes
    expect(scored.sampleSize).toBe(0);
  });

  it('returns 1.0 confidence when all relevant outcomes resolved', () => {
    const tracker = makeTracker();
    for (let i = 0; i < 3; i++) {
      tracker.recordOutcome({
        symptom: 'skips_gears',
        wizardType: 'rear',
        startStep: 'indexing',
        completedSteps: [],
        skippedSteps: [],
        resolved: true,
      });
    }

    const scorer = new ConfidenceScorer(tracker);
    const route = DIAGNOSIS_ROUTES.find((r) => r.symptom === 'skips_gears')!;
    const scored = scorer.scoreRoute(route);

    expect(scored.confidence).toBe(1.0);
    expect(scored.sampleSize).toBe(3);
  });

  it('returns 0.5 confidence for a 50/50 split', () => {
    const tracker = makeTracker();
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

    const scorer = new ConfidenceScorer(tracker);
    const route = DIAGNOSIS_ROUTES.find((r) => r.symptom === 'skips_gears')!;
    const scored = scorer.scoreRoute(route);

    expect(scored.confidence).toBe(0.5);
  });
});

describe('ConfidenceScorer.getScoredRoutes', () => {
  it('returns scored routes for all diagnosis routes when no symptom given', () => {
    const tracker = makeTracker();
    const scorer = new ConfidenceScorer(tracker);
    const routes = scorer.getScoredRoutes();
    expect(routes).toHaveLength(DIAGNOSIS_ROUTES.length);
  });

  it('returns only the route for the given symptom', () => {
    const tracker = makeTracker();
    const scorer = new ConfidenceScorer(tracker);
    const routes = scorer.getScoredRoutes('skips_gears');
    expect(routes).toHaveLength(1);
    expect(routes[0].symptom).toBe('skips_gears');
  });

  it('places routes with confidence data before routes without', () => {
    const tracker = makeTracker();
    // Give 'skips_gears' some data
    tracker.recordOutcome({
      symptom: 'skips_gears',
      wizardType: 'rear',
      startStep: 'indexing',
      completedSteps: [],
      skippedSteps: [],
      resolved: true,
    });

    const scorer = new ConfidenceScorer(tracker);
    const routes = scorer.getScoredRoutes();

    const withData = routes.filter((r) => r.confidence !== null);
    const withoutData = routes.filter((r) => r.confidence === null);

    // withData entries should appear first
    const firstWithoutIdx = routes.findIndex((r) => r.confidence === null);
    const lastWithIdx = routes.map((r) => r.confidence).lastIndexOf(withData[0]?.confidence);

    if (withData.length > 0 && withoutData.length > 0) {
      expect(firstWithoutIdx).toBeGreaterThan(lastWithIdx);
    }
  });
});

describe('ConfidenceScorer.formatScore', () => {
  it('formats a null confidence correctly', () => {
    const tracker = makeTracker();
    const scorer = new ConfidenceScorer(tracker);
    const route = DIAGNOSIS_ROUTES[0];
    const scored = scorer.scoreRoute(route);
    const formatted = scorer.formatScore(scored);
    expect(formatted).toContain('No data yet');
  });

  it('includes the percentage and sample size when data is present', () => {
    const tracker = makeTracker();
    tracker.recordOutcome({
      symptom: 'skips_gears',
      wizardType: 'rear',
      startStep: 'indexing',
      completedSteps: [],
      skippedSteps: [],
      resolved: true,
    });
    const scorer = new ConfidenceScorer(tracker);
    const route = DIAGNOSIS_ROUTES.find((r) => r.symptom === 'skips_gears')!;
    const scored = scorer.scoreRoute(route);
    const formatted = scorer.formatScore(scored);
    expect(formatted).toContain('100%');
    expect(formatted).toContain('1 session');
  });
});
