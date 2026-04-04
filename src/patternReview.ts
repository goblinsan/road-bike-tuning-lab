import inquirer from 'inquirer';
import { TuningOutcomeTracker, OutcomeRecord } from './outcomeTracker';
import { Symptom } from './symptomDiagnosis';

export interface PatternInsight {
  type: 'top_unresolved' | 'low_confidence' | 'frequent_skip' | 'high_resolution';
  symptomOrStep: string;
  count: number;
  message: string;
}

export interface MonthlyReport {
  periodLabel: string;
  totalSessions: number;
  resolvedSessions: number;
  unresolvedSessions: number;
  overallResolutionRate: number | null;
  insights: PatternInsight[];
}

const MS_PER_DAY = 86_400_000;

/**
 * Generate a label like "2026-04" for the month that contains a given timestamp.
 */
export function monthLabel(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Monthly Tuning Pattern Review
 * Aggregates outcome data from the past 30 days and surfaces refinement insights
 * so the workflow can be continuously improved based on real usage.
 */
export class TuningPatternReview {
  private tracker: TuningOutcomeTracker;

  constructor(tracker: TuningOutcomeTracker) {
    this.tracker = tracker;
  }

  /**
   * Generate a monthly report from outcomes within the last `days` days (default 30).
   */
  generateReport(days = 30): MonthlyReport {
    const cutoff = Date.now() - days * MS_PER_DAY;
    const outcomes = this.tracker.getOutcomes().filter((o) => o.timestamp >= cutoff);

    const total = outcomes.length;
    const resolved = outcomes.filter((o) => o.resolved).length;
    const unresolved = total - resolved;
    const resolutionRate = total > 0 ? resolved / total : null;

    const periodLabel = monthLabel(Date.now());

    const insights: PatternInsight[] = [
      ...this.topUnresolvedInsights(outcomes),
      ...this.frequentSkipInsights(outcomes),
      ...this.highResolutionInsights(outcomes),
    ];

    return {
      periodLabel,
      totalSessions: total,
      resolvedSessions: resolved,
      unresolvedSessions: unresolved,
      overallResolutionRate: resolutionRate,
      insights,
    };
  }

  /**
   * Identify the symptoms with the most unresolved sessions (top 3).
   */
  private topUnresolvedInsights(outcomes: OutcomeRecord[]): PatternInsight[] {
    const counts: Record<string, number> = {};
    for (const o of outcomes) {
      if (!o.resolved) {
        const key = o.symptom ?? 'unknown';
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom, count]) => ({
        type: 'top_unresolved' as const,
        symptomOrStep: symptom,
        count,
        message: `"${symptom}" had ${count} unresolved session(s) — consider expanding troubleshooting guidance.`,
      }));
  }

  /**
   * Identify steps that users skipped most often (top 3).
   */
  private frequentSkipInsights(outcomes: OutcomeRecord[]): PatternInsight[] {
    const counts: Record<string, number> = {};
    for (const o of outcomes) {
      for (const step of o.skippedSteps) {
        counts[step] = (counts[step] ?? 0) + 1;
      }
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([step, count]) => ({
        type: 'frequent_skip' as const,
        symptomOrStep: step,
        count,
        message: `Step "${step}" was skipped ${count} time(s) — instructions may need simplification.`,
      }));
  }

  /**
   * Identify symptoms with high resolution rates (≥ 80%, at least 3 sessions).
   */
  private highResolutionInsights(outcomes: OutcomeRecord[]): PatternInsight[] {
    const bySymptom: Record<string, OutcomeRecord[]> = {};
    for (const o of outcomes) {
      const key = o.symptom ?? 'unknown';
      if (!bySymptom[key]) bySymptom[key] = [];
      bySymptom[key].push(o);
    }

    return Object.entries(bySymptom)
      .filter(([, records]) => records.length >= 3)
      .map(([symptom, records]) => {
        const rate = records.filter((r) => r.resolved).length / records.length;
        return { symptom, rate, count: records.length };
      })
      .filter(({ rate }) => rate >= 0.8)
      .map(({ symptom, rate, count }) => ({
        type: 'high_resolution' as const,
        symptomOrStep: symptom,
        count,
        message: `"${symptom}" resolved in ${Math.round(rate * 100)}% of ${count} session(s) — recommended path is effective.`,
      }));
  }

  /**
   * Interactive monthly review — prints the report and surfaces workflow suggestions.
   */
  async start(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   MONTHLY TUNING PATTERN REVIEW          ║');
    console.log('╚══════════════════════════════════════════╝\n');
    console.log(
      'Aggregating outcome data from the past 30 days to surface workflow improvements.\n'
    );

    const report = this.generateReport();
    this.printReport(report);
  }

  /**
   * Print a formatted report to stdout.
   */
  printReport(report: MonthlyReport): void {
    console.log(`📅 Period: ${report.periodLabel}`);
    console.log(`📊 Total sessions   : ${report.totalSessions}`);
    console.log(`✅ Resolved         : ${report.resolvedSessions}`);
    console.log(`❌ Unresolved       : ${report.unresolvedSessions}`);

    if (report.overallResolutionRate !== null) {
      const pct = Math.round(report.overallResolutionRate * 100);
      console.log(`📈 Resolution rate  : ${pct}%`);
    } else {
      console.log('📈 Resolution rate  : No data yet');
    }

    console.log();

    if (report.insights.length === 0) {
      console.log('ℹ️  Not enough data for insights yet. Complete more sessions to unlock pattern analysis.\n');
      return;
    }

    console.log('🔍 Insights:\n');
    report.insights.forEach((insight) => {
      const icon =
        insight.type === 'high_resolution'
          ? '🌟'
          : insight.type === 'frequent_skip'
          ? '⏭ '
          : '⚠️ ';
      console.log(`  ${icon} ${insight.message}`);
    });
    console.log();
  }
}

export default TuningPatternReview;
