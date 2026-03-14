import inquirer from 'inquirer';

export interface ChecklistItem {
  id: string;
  category: string;
  description: string;
  passed?: boolean;
}

export interface ChecklistResult {
  phase: 'before' | 'after';
  items: ChecklistItem[];
  allPassed: boolean;
  failedItems: ChecklistItem[];
}

export const BEFORE_RIDE_ITEMS: ChecklistItem[] = [
  {
    id: 'tire_pressure',
    category: 'Tires',
    description: 'Tire pressure is within the recommended range (check sidewall for max PSI)',
  },
  {
    id: 'tire_integrity',
    category: 'Tires',
    description: 'No visible cuts, bulges, or embedded objects in the tires',
  },
  {
    id: 'wheel_secure',
    category: 'Wheels',
    description: 'Quick-release levers or thru-axles are fully tightened and secure',
  },
  {
    id: 'wheel_true',
    category: 'Wheels',
    description: 'Wheels spin without significant wobble or brake contact',
  },
  {
    id: 'brake_function',
    category: 'Brakes',
    description: 'Both brakes engage firmly before the lever reaches the handlebar',
  },
  {
    id: 'brake_pads',
    category: 'Brakes',
    description: 'Brake pads are aligned with the rim/rotor and show adequate thickness',
  },
  {
    id: 'chain_lubed',
    category: 'Drivetrain',
    description: 'Chain is clean and lightly lubricated — not dry or excessively wet',
  },
  {
    id: 'cable_free',
    category: 'Cables',
    description: 'Shift and brake cables move freely with no snags or sharp bends',
  },
  {
    id: 'stem_tight',
    category: 'Cockpit',
    description: 'Stem bolts are tight — handlebar does not rotate when held between knees',
  },
  {
    id: 'saddle_secure',
    category: 'Cockpit',
    description: 'Saddle and seat post are secure with no play',
  },
];

export const AFTER_RIDE_ITEMS: ChecklistItem[] = [
  {
    id: 'gear_range_full',
    category: 'Shifting',
    description: 'Chain shifted cleanly through every rear cog in both directions',
  },
  {
    id: 'no_skipping',
    category: 'Shifting',
    description: 'No gear skipping or chain jumping under normal pedaling load',
  },
  {
    id: 'front_shift_up',
    category: 'Shifting',
    description: 'Chain shifted up to the large chainring promptly without hesitation',
  },
  {
    id: 'front_shift_down',
    category: 'Shifting',
    description: 'Chain shifted down to the small chainring smoothly without dropping',
  },
  {
    id: 'no_chain_rub',
    category: 'Shifting',
    description: 'No chain rub on the front derailleur cage in any normal gear combination',
  },
  {
    id: 'no_drivetrain_noise',
    category: 'Drivetrain',
    description: 'Drivetrain runs quietly — no grinding, clicking, or rattling sounds',
  },
  {
    id: 'brakes_responsive',
    category: 'Brakes',
    description: 'Brakes provided confident, progressive stopping power during the ride',
  },
  {
    id: 'no_wheel_rub',
    category: 'Wheels',
    description: 'No brake pad or fender contact with the wheels during the ride',
  },
  {
    id: 'descents_confident',
    category: 'Safety',
    description: 'High-speed descents felt stable and brakes were effective',
  },
  {
    id: 'overall_feel',
    category: 'Overall',
    description: 'Overall bike handling and ride quality felt normal and safe',
  },
];

/**
 * Before/After Test Ride Checklist
 * Standardizes a verification ride to confirm tuning quality safely.
 */
export class TestRideChecklist {
  /**
   * Run the full before/after checklist workflow.
   */
  async start(): Promise<void> {
    console.log('\n========================================');
    console.log('  TEST RIDE CHECKLIST');
    console.log('========================================\n');
    console.log('This checklist ensures safe tuning verification before and after a test ride.\n');

    const { phase } = await inquirer.prompt<{ phase: 'before' | 'after' | 'both' }>([
      {
        type: 'list',
        name: 'phase',
        message: 'Which checklist would you like to run?',
        choices: [
          { name: 'Before Ride — Pre-ride safety check', value: 'before' },
          { name: 'After Ride — Tuning confirmation', value: 'after' },
          { name: 'Both — Full before and after', value: 'both' },
        ],
      },
    ]);

    if (phase === 'before' || phase === 'both') {
      const beforeResult = await this.runChecklist('before', BEFORE_RIDE_ITEMS);
      this.printResult(beforeResult);

      if (!beforeResult.allPassed) {
        const { continueAnyway } = await inquirer.prompt<{ continueAnyway: boolean }>([
          {
            type: 'confirm',
            name: 'continueAnyway',
            message:
              '⚠️  Some pre-ride items did not pass. Do you want to proceed with the test ride anyway?',
            default: false,
          },
        ]);
        if (!continueAnyway) {
          console.log(
            '\n🛑 Test ride postponed. Please address the failed items before riding.\n'
          );
          return;
        }
      }
    }

    if (phase === 'both') {
      console.log('\n✅ Pre-ride check complete. Go take your test ride and come back to verify.\n');
      await inquirer.prompt([
        {
          type: 'confirm',
          name: 'returnedFromRide',
          message: 'Have you completed your test ride and are ready for the after-ride check?',
          default: true,
        },
      ]);
    }

    if (phase === 'after' || phase === 'both') {
      const afterResult = await this.runChecklist('after', AFTER_RIDE_ITEMS);
      this.printResult(afterResult);

      if (afterResult.allPassed) {
        console.log('\n🎉 Excellent! Your bike is tuned and confirmed ready for riding.\n');
      } else {
        console.log('\n⚠️  Some items need attention. Review the failed items above and re-tune as needed.\n');
        console.log('Tip: Use the Symptom Diagnosis or Derailleur Wizards to address specific issues.\n');
      }
    }
  }

  /**
   * Run an interactive checklist for the given phase.
   */
  async runChecklist(phase: 'before' | 'after', items: ChecklistItem[]): Promise<ChecklistResult> {
    const phaseLabel = phase === 'before' ? 'PRE-RIDE SAFETY CHECK' : 'POST-RIDE TUNING CONFIRMATION';
    console.log(`\n--- ${phaseLabel} ---\n`);

    const checkedItems: ChecklistItem[] = [];

    for (const item of items) {
      const { passed } = await inquirer.prompt<{ passed: boolean }>([
        {
          type: 'confirm',
          name: 'passed',
          message: `[${item.category}] ${item.description}`,
          default: true,
        },
      ]);

      checkedItems.push({ ...item, passed });

      if (!passed) {
        console.log(`  ⚠️  Note: "${item.description}" — address this before riding.\n`);
      }
    }

    const failedItems = checkedItems.filter((i) => !i.passed);

    return {
      phase,
      items: checkedItems,
      allPassed: failedItems.length === 0,
      failedItems,
    };
  }

  private printResult(result: ChecklistResult): void {
    const total = result.items.length;
    const passed = total - result.failedItems.length;
    const label = result.phase === 'before' ? 'Pre-ride' : 'Post-ride';

    console.log(`\n${label} result: ${passed}/${total} items passed.`);

    if (result.failedItems.length > 0) {
      console.log('\nFailed items:');
      result.failedItems.forEach((item) => {
        console.log(`  ✗ [${item.category}] ${item.description}`);
      });
    } else {
      console.log('  ✅ All items passed!');
    }
  }
}

export default TestRideChecklist;
