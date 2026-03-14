import inquirer from 'inquirer';

export type RearStepId =
  | 'pre_check'
  | 'h_limit'
  | 'l_limit'
  | 'cable_tension'
  | 'indexing'
  | 'b_screw'
  | 'validation';

export interface TuningStep {
  id: RearStepId;
  title: string;
  instructions: string[];
  validationQuestion: string;
  troubleshootingTips: string[];
}

export interface WizardResult {
  completedSteps: RearStepId[];
  skippedSteps: RearStepId[];
  notes: string[];
}

export const REAR_STEPS: TuningStep[] = [
  {
    id: 'pre_check',
    title: 'Pre-Check: Visual Inspection',
    instructions: [
      '1. Inspect the derailleur hanger — it must be perfectly straight. Bend or replace if needed.',
      '2. Check the shift cable for fraying, kinks, or corrosion. Replace if worn.',
      '3. Inspect cable housing for cracks or compression. Replace if damaged.',
      '4. Clean the derailleur pulleys and cassette of old grease and dirt.',
      '5. Lightly lube the chain if dry or stiff.',
    ],
    validationQuestion: 'Is the hanger straight, the cable in good condition, and drivetrain clean?',
    troubleshootingTips: [
      'A bent hanger is the #1 cause of poor shifting — always check this first.',
      'Use a hanger alignment tool for precision. Eyeballing is unreliable.',
      'Frayed cables cause inconsistent cable tension — replace before tuning.',
    ],
  },
  {
    id: 'h_limit',
    title: 'H-Limit Screw (High / Smallest Cog)',
    instructions: [
      '1. Shift to the smallest rear cog (highest gear) and the large chainring.',
      '2. Look at the derailleur from behind — the upper pulley should align directly below the smallest cog.',
      '3. Locate the H-limit screw (usually marked "H" on the derailleur body).',
      '4. Turn the H screw CLOCKWISE to move the derailleur inward (toward larger cogs).',
      '5. Turn COUNTER-CLOCKWISE to allow the chain to move further outward.',
      '6. Goal: the chain should sit quietly on the smallest cog without any tendency to fall outward.',
      '7. Backpedal and check the chain does not rub the next cog.',
    ],
    validationQuestion: 'Does the chain sit cleanly on the smallest cog with no outward drift or noise?',
    troubleshootingTips: [
      'If the chain falls off toward the dropout, turn the H screw clockwise (1/4 turn at a time).',
      'If shifting onto the smallest cog is sluggish, turn the H screw counter-clockwise slightly.',
      'The H screw sets a HARD STOP — it does not set cable tension.',
    ],
  },
  {
    id: 'l_limit',
    title: 'L-Limit Screw (Low / Largest Cog)',
    instructions: [
      '1. Shift to the largest rear cog (lowest gear) and the small chainring.',
      '2. The upper pulley should align directly below the largest cog.',
      '3. Locate the L-limit screw (usually marked "L" on the derailleur body).',
      '4. Turn the L screw CLOCKWISE to move the derailleur outward (away from spokes).',
      '5. Turn COUNTER-CLOCKWISE to allow the chain to move further inward.',
      '6. Goal: the chain should sit on the largest cog without rubbing the spokes or next cog.',
      '7. Manually push the derailleur cage inward beyond the L stop — it should not move past the cog.',
    ],
    validationQuestion:
      'Does the chain sit cleanly on the largest cog with no risk of contacting the spokes?',
    troubleshootingTips: [
      'If the chain rubs or hits the spokes, turn the L screw clockwise to restrict inward movement.',
      'If shifting to the largest cog is sluggish, loosen the L screw slightly (counter-clockwise).',
      'Never skip this step — a chain in the spokes at speed can cause a crash.',
    ],
  },
  {
    id: 'cable_tension',
    title: 'Cable Tension Reset',
    instructions: [
      '1. Shift to the smallest rear cog.',
      '2. Loosen the cable anchor bolt at the derailleur.',
      '3. Pull the cable taut by hand — not excessively tight, just snug.',
      '4. Re-clamp the cable anchor bolt firmly.',
      '5. Turn the barrel adjuster (at the derailleur or shifter) to the middle of its range for fine-tuning.',
      '6. Rotate the cranks and shift through all gears to establish the base tension.',
    ],
    validationQuestion:
      'Is the cable clamped with neutral tension and the barrel adjuster centered in its range?',
    troubleshootingTips: [
      'Overtightening the cable causes poor downshifts (to larger cogs).',
      'Too little cable tension causes hesitant upshifts (to smaller cogs).',
      'Always reset cable tension from scratch when indexing is severely off.',
    ],
  },
  {
    id: 'indexing',
    title: 'Indexing (Cable Tension Fine-Tuning)',
    instructions: [
      '1. Shift to the second-smallest cog (one click from smallest).',
      '2. Listen and watch: the chain should run silently with no hesitation.',
      '3. If the chain hesitates to shift UP (to larger cog): turn the barrel adjuster COUNTER-CLOCKWISE 1/4 turn to add tension.',
      '4. If the chain shifts sluggishly or makes noise coming DOWN (to smaller cog): turn the barrel adjuster CLOCKWISE 1/4 turn to reduce tension.',
      '5. Repeat for each cog across the full cassette.',
      '6. Test at cadence — some indexing issues only appear under pedaling load.',
    ],
    validationQuestion:
      'Does the chain shift cleanly and silently through all rear gears under light pedaling?',
    troubleshootingTips: [
      'Make only 1/4-turn adjustments at a time — small changes have big effects.',
      'If you cannot achieve good indexing across all gears, recheck the hanger alignment.',
      'Shimano derailleurs typically need slightly more cable tension than SRAM.',
      'A worn chain or cassette will prevent perfect indexing — consider replacement.',
    ],
  },
  {
    id: 'b_screw',
    title: 'B-Screw (Upper Pulley Gap)',
    instructions: [
      '1. Shift to the largest rear cog.',
      '2. Look at the gap between the top of the upper jockey pulley and the bottom of the largest cog.',
      '3. The ideal gap is 5-8mm for most systems (check your derailleur specs).',
      '4. Turn the B-screw CLOCKWISE to increase the gap (move derailleur away from cog).',
      '5. Turn COUNTER-CLOCKWISE to decrease the gap.',
      '6. Re-check indexing on the largest cog after any B-screw adjustment.',
    ],
    validationQuestion:
      'Is the upper pulley gap approximately 5-8mm from the largest cog with smooth rotation?',
    troubleshootingTips: [
      'Too small a gap causes the pulley to contact the cog, creating grinding noise.',
      'Too large a gap reduces shifting precision especially on larger cogs.',
      'SRAM AXS and Eagle systems have specific gap requirements — consult the manual.',
    ],
  },
  {
    id: 'validation',
    title: 'Full-Range Gear Validation',
    instructions: [
      '1. Mount the bike on a stand or have a helper hold it.',
      '2. Spin the cranks and shift through every gear from smallest to largest cog.',
      '3. Shift back from largest to smallest.',
      '4. Test rapid sequential shifts (cascade up and down).',
      '5. Apply moderate pedaling resistance and check for any skipping or hesitation.',
      '6. Verify the chain does not rub any cog in the intermediate gears.',
    ],
    validationQuestion:
      'Does the chain shift cleanly through all gears in both directions with no skipping?',
    troubleshootingTips: [
      'If only one transition is problematic, use the barrel adjuster micro-adjustment.',
      'If all gears feel off, return to the cable tension step and start the indexing process again.',
      'Noise only under load may indicate a worn chain, cassette, or chainring.',
    ],
  },
];

/**
 * Rear Derailleur Tuning Wizard
 * Guides users through limit screws, B-screw, and indexing with validation checkpoints.
 */
export class RearDerailleurWizard {
  private result: WizardResult = {
    completedSteps: [],
    skippedSteps: [],
    notes: [],
  };

  /**
   * Run the full wizard, optionally starting from a specific step.
   * @param startFrom - The step ID to begin from (default: first step)
   */
  async start(startFrom?: RearStepId): Promise<WizardResult> {
    console.log('\n========================================');
    console.log('  REAR DERAILLEUR TUNING WIZARD');
    console.log('========================================\n');
    console.log(
      'This wizard will guide you through each adjustment stage with validation checkpoints.\n'
    );

    const startIndex = startFrom
      ? REAR_STEPS.findIndex((s) => s.id === startFrom)
      : 0;

    if (startFrom && startIndex === -1) {
      throw new Error(`Unknown step ID: ${startFrom}`);
    }

    if (startIndex > 0) {
      console.log(`Starting from step: "${REAR_STEPS[startIndex].title}"\n`);
    }

    for (let i = startIndex; i < REAR_STEPS.length; i++) {
      const step = REAR_STEPS[i];
      const shouldContinue = await this.runStep(step, i - startIndex + 1, REAR_STEPS.length - startIndex);
      if (!shouldContinue) {
        console.log('\nWizard exited early. Steps completed so far:');
        this.printSummary();
        return this.result;
      }
    }

    console.log('\n✅ Rear derailleur tuning complete!');
    this.printSummary();
    return this.result;
  }

  private async runStep(step: TuningStep, current: number, total: number): Promise<boolean> {
    console.log(`\n--- Step ${current} of ${total}: ${step.title} ---\n`);
    step.instructions.forEach((line) => console.log(line));
    console.log();

    let validated = false;
    let attempts = 0;

    while (!validated) {
      attempts++;
      const { passed } = await inquirer.prompt<{ passed: boolean }>([
        {
          type: 'confirm',
          name: 'passed',
          message: `✔ Checkpoint: ${step.validationQuestion}`,
          default: true,
        },
      ]);

      if (passed) {
        validated = true;
        this.result.completedSteps.push(step.id);
        console.log(`  ✅ Step validated.\n`);
      } else {
        console.log('\n  ⚠️  Troubleshooting tips:');
        step.troubleshootingTips.forEach((tip) => console.log(`     • ${tip}`));
        console.log();

        if (attempts >= 3) {
          const { action } = await inquirer.prompt<{ action: string }>([
            {
              type: 'list',
              name: 'action',
              message: 'Still having trouble. What would you like to do?',
              choices: [
                { name: 'Review step instructions again', value: 'retry' },
                { name: 'Skip this step and continue', value: 'skip' },
                { name: 'Exit wizard', value: 'exit' },
              ],
            },
          ]);

          if (action === 'skip') {
            this.result.skippedSteps.push(step.id);
            this.result.notes.push(`Step "${step.title}" was skipped after ${attempts} attempts.`);
            console.log(`  ⏭  Step skipped.\n`);
            return true;
          } else if (action === 'exit') {
            return false;
          } else {
            console.log(`\n--- Re-reading: ${step.title} ---\n`);
            step.instructions.forEach((line) => console.log(line));
            console.log();
          }
        }
      }
    }

    return true;
  }

  private printSummary(): void {
    console.log('\n--- Summary ---');
    if (this.result.completedSteps.length > 0) {
      console.log('Completed:', this.result.completedSteps.join(', '));
    }
    if (this.result.skippedSteps.length > 0) {
      console.log('Skipped:', this.result.skippedSteps.join(', '));
    }
    if (this.result.notes.length > 0) {
      console.log('Notes:');
      this.result.notes.forEach((n) => console.log(`  - ${n}`));
    }
  }
}

export default RearDerailleurWizard;
