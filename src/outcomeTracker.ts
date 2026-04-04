import { Symptom } from './symptomDiagnosis';

export type WizardType = 'rear' | 'front';

export interface OutcomeRecord {
  id: string;
  timestamp: number;
  symptom?: Symptom;
  wizardType: WizardType;
  startStep: string;
  completedSteps: string[];
  skippedSteps: string[];
  resolved: boolean;
}

/**
 * Captures tuning outcome data and unresolved issue reports.
 * Tracks where users succeed or fail in the workflow so that
 * recommendations can be improved over time.
 */
export class TuningOutcomeTracker {
  private outcomes: OutcomeRecord[] = [];
  private nextId = 1;

  /**
   * Record the result of a tuning session.
   */
  recordOutcome(record: Omit<OutcomeRecord, 'id' | 'timestamp'>): OutcomeRecord {
    const entry: OutcomeRecord = {
      id: `outcome-${this.nextId++}`,
      timestamp: Date.now(),
      ...record,
    };
    this.outcomes.push(entry);
    return entry;
  }

  /**
   * Retrieve all recorded outcomes.
   */
  getOutcomes(): OutcomeRecord[] {
    return [...this.outcomes];
  }

  /**
   * Retrieve outcomes filtered by symptom.
   */
  getOutcomesForSymptom(symptom: Symptom): OutcomeRecord[] {
    return this.outcomes.filter((o) => o.symptom === symptom);
  }

  /**
   * Compute the resolution rate (0–1) for a given symptom, or across all
   * recorded outcomes when no symptom is provided.
   * Returns null if there are no matching records.
   */
  getResolutionRate(symptom?: Symptom): number | null {
    const pool = symptom ? this.getOutcomesForSymptom(symptom) : this.outcomes;
    if (pool.length === 0) return null;
    const resolved = pool.filter((o) => o.resolved).length;
    return resolved / pool.length;
  }

  /**
   * Return a summary of unresolved sessions grouped by symptom.
   */
  getUnresolvedReport(): Record<string, number> {
    const report: Record<string, number> = {};
    for (const o of this.outcomes) {
      if (!o.resolved) {
        const key = o.symptom ?? 'unknown';
        report[key] = (report[key] ?? 0) + 1;
      }
    }
    return report;
  }

  /**
   * Return the total number of recorded outcomes.
   */
  count(): number {
    return this.outcomes.length;
  }
}

/** Shared singleton tracker used across the application. */
export const outcomeTracker = new TuningOutcomeTracker();

export default TuningOutcomeTracker;
