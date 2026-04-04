import { Symptom, DiagnosisRoute, DIAGNOSIS_ROUTES } from './symptomDiagnosis';
import { TuningOutcomeTracker, OutcomeRecord } from './outcomeTracker';

export interface ScoredDiagnosisRoute extends DiagnosisRoute {
  /**
   * Confidence score between 0 and 1, where 1 means the fix succeeded in 100% of
   * recorded sessions with this symptom.  Null when there is no prior outcome data.
   */
  confidence: number | null;
  /** Number of past sessions that were used to compute the confidence score. */
  sampleSize: number;
}

/**
 * Compute a human-readable label for a confidence score.
 */
export function confidenceLabel(confidence: number | null): string {
  if (confidence === null) return 'No data yet';
  if (confidence >= 0.8) return 'High confidence';
  if (confidence >= 0.5) return 'Moderate confidence';
  return 'Low confidence';
}

/**
 * Adds confidence scores to diagnosis routes based on historical outcome data.
 * Shows users how likely each suggested fix is to resolve their problem.
 */
export class ConfidenceScorer {
  private tracker: TuningOutcomeTracker;

  constructor(tracker: TuningOutcomeTracker) {
    this.tracker = tracker;
  }

  /**
   * Score a single diagnosis route using recorded outcomes for its symptom.
   */
  scoreRoute(route: DiagnosisRoute): ScoredDiagnosisRoute {
    if (!route.symptom) {
      return { ...route, confidence: null, sampleSize: 0 };
    }

    const outcomes = this.tracker.getOutcomesForSymptom(route.symptom);

    // Only count sessions that actually followed this route (same startStep)
    const relevant = outcomes.filter((o) => o.startStep === route.startStep);
    const sampleSize = relevant.length;

    if (sampleSize === 0) {
      return { ...route, confidence: null, sampleSize: 0 };
    }

    const resolvedCount = relevant.filter((o) => o.resolved).length;
    const confidence = resolvedCount / sampleSize;

    return { ...route, confidence, sampleSize };
  }

  /**
   * Return scored routes for a symptom, sorted from highest to lowest confidence.
   * Routes with no data are placed after routes with data.
   */
  getScoredRoutes(symptom?: Symptom): ScoredDiagnosisRoute[] {
    const routes = symptom
      ? DIAGNOSIS_ROUTES.filter((r) => r.symptom === symptom)
      : DIAGNOSIS_ROUTES;

    const scored = routes.map((r) => this.scoreRoute(r));

    return scored.sort((a, b) => {
      if (a.confidence === null && b.confidence === null) return 0;
      if (a.confidence === null) return 1;
      if (b.confidence === null) return -1;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Format a scored route for display in the terminal.
   */
  formatScore(scored: ScoredDiagnosisRoute): string {
    const label = confidenceLabel(scored.confidence);
    if (scored.confidence === null) {
      return `[${label}]`;
    }
    const pct = Math.round(scored.confidence * 100);
    return `[${label} — ${pct}% resolved across ${scored.sampleSize} session(s)]`;
  }
}

export default ConfidenceScorer;
