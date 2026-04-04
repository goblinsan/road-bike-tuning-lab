import inquirer from 'inquirer';

export interface ReleaseNote {
  version: string;
  date: string;
  summary: string;
  changes: string[];
  educationTips?: string[];
}

/**
 * Chronologically ordered release notes (newest first).
 */
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '1.4.0',
    date: '2026-04',
    summary: 'Diagnostics Intelligence and Feedback Loop',
    changes: [
      'Added Tuning Outcome Tracker — the app now records whether each session resolved your issue (Issue #16).',
      'Built a Drivetrain Issue Taxonomy that classifies every symptom by fault category and severity (Issue #17).',
      'Confidence scores now appear beside each diagnosis recommendation, showing resolution rates from past sessions (Issue #18).',
      'New Monthly Pattern Review screen surfaces insights from aggregated outcome data to help refine guidance (Issue #19).',
      'Release Notes viewer added so returning users can see what has changed and learn new tips (this screen — Issue #20).',
    ],
    educationTips: [
      'After a tuning session you will be asked whether your issue was resolved — your answer improves future recommendations.',
      'Confidence scores start at "No data yet" and build up as more sessions are recorded.',
      'The Pattern Review menu item is a great starting point when you notice recurring problems.',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-03',
    summary: 'Symptom-Based Quick Diagnosis',
    changes: [
      'Added Symptom Quick Diagnosis — describe your problem and jump directly to the relevant wizard step.',
      'Introduced nine symptom categories covering both rear and front derailleur issues.',
    ],
    educationTips: [
      'Use Symptom Quick Diagnosis instead of running the full wizard when you already know what feels wrong.',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-02',
    summary: 'Pre-Race Checklist and Chain Wear Guide',
    changes: [
      'Added race-week Pre-Race Checklist tailored for triathletes.',
      'Added Chain Wear Guide with tool recommendations and wear thresholds.',
    ],
    educationTips: [
      'Run the Pre-Race Checklist at least 48 hours before a race so there is time to make any adjustments.',
      'Replace your chain at 0.75% wear to avoid accelerated cassette wear.',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-01',
    summary: 'Maintenance Scheduler and Glossary',
    changes: [
      'Added Recurring Maintenance Scheduler — enter your mileage and see which tasks are due.',
      'Added Drivetrain Glossary with searchable definitions.',
    ],
  },
  {
    version: '1.0.0',
    date: '2025-12',
    summary: 'Initial release',
    changes: [
      'Rear Derailleur Tuning Wizard with limit screws, B-screw, and indexing.',
      'Front Derailleur Tuning Wizard with height, angle, cable tension, and limits.',
      'Test Ride Checklist for pre- and post-tuning verification.',
      'Rider Setup Notes for fit deltas and cockpit tweaks.',
    ],
  },
];

/**
 * Release Notes Viewer
 * Documents changes clearly so returning users understand improvements.
 */
export class ReleaseNotesViewer {
  /**
   * Return the latest (most recent) release note.
   */
  getLatestNote(): ReleaseNote {
    return RELEASE_NOTES[0];
  }

  /**
   * Return all release notes.
   */
  getAllNotes(): ReleaseNote[] {
    return RELEASE_NOTES;
  }

  /**
   * Run the interactive release notes browser.
   */
  async start(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   RELEASE NOTES & WHAT\'S NEW             ║');
    console.log('╚══════════════════════════════════════════╝\n');

    const { action } = await inquirer.prompt<{
      action: 'latest' | 'all';
    }>([
      {
        type: 'list',
        name: 'action',
        message: 'Which release notes would you like to see?',
        choices: [
          { name: "🆕 What's new in the latest release", value: 'latest' },
          { name: '📜 Full release history', value: 'all' },
        ],
      },
    ]);

    if (action === 'latest') {
      this.printNote(this.getLatestNote());
    } else {
      RELEASE_NOTES.forEach((note) => this.printNote(note));
    }
  }

  /**
   * Print a single release note to stdout.
   */
  printNote(note: ReleaseNote): void {
    console.log(`\n── v${note.version}  (${note.date})  ${note.summary} ──\n`);

    console.log('Changes:');
    note.changes.forEach((c) => console.log(`  • ${c}`));

    if (note.educationTips && note.educationTips.length > 0) {
      console.log('\n💡 Tips for this release:');
      note.educationTips.forEach((t) => console.log(`  ℹ️  ${t}`));
    }

    console.log();
  }
}

export default ReleaseNotesViewer;
