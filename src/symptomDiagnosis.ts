import inquirer from 'inquirer';
import { RearDerailleurWizard, RearStepId } from './rearDerailleurWizard';
import { FrontDerailleurWizard, FrontStepId } from './frontDerailleurWizard';
import { outcomeTracker } from './outcomeTracker';
import { ConfidenceScorer } from './confidenceScoring';

export type Symptom =
  | 'skips_gears'
  | 'chain_rub_front'
  | 'noisy_shifts'
  | 'chain_drops_outside_rear'
  | 'chain_drops_inside_rear'
  | 'slow_upshift_rear'
  | 'chain_rub_small_ring'
  | 'chain_drops_chainring'
  | 'slow_front_shift';

export interface SymptomEntry {
  value: Symptom;
  label: string;
  description: string;
}

export interface DiagnosisRoute {
  symptom: Symptom;
  derailleur: 'rear' | 'front';
  startStep: RearStepId | FrontStepId;
  explanation: string;
}

export const SYMPTOMS: SymptomEntry[] = [
  {
    value: 'skips_gears',
    label: 'Skips or slips gears (rear)',
    description: 'Chain jumps or skips over cogs during pedaling',
  },
  {
    value: 'chain_drops_outside_rear',
    label: 'Chain falls off toward dropout (rear)',
    description: 'Chain drops off the smallest cog toward the wheel dropout',
  },
  {
    value: 'chain_drops_inside_rear',
    label: 'Chain falls into spokes (rear)',
    description: 'Chain drops off the largest cog toward the spokes',
  },
  {
    value: 'slow_upshift_rear',
    label: 'Slow or hesitant upshift (rear)',
    description: 'Chain hesitates when shifting to a smaller rear cog',
  },
  {
    value: 'noisy_shifts',
    label: 'Noisy or grinding shifts',
    description: 'Grinding or crunching noise during gear changes',
  },
  {
    value: 'chain_rub_front',
    label: 'Chain rubs front derailleur cage',
    description: 'Friction or rubbing noise from the front derailleur cage',
  },
  {
    value: 'chain_rub_small_ring',
    label: 'Chain rubs on small chainring (inner plate)',
    description: 'Rubbing on the inner cage plate specifically in the small ring',
  },
  {
    value: 'chain_drops_chainring',
    label: 'Chain drops off a chainring (front)',
    description: 'Chain falls off either the large or small chainring',
  },
  {
    value: 'slow_front_shift',
    label: 'Slow or hesitant front shift',
    description: 'Chain moves slowly or hesitates when switching chainrings',
  },
];

export const DIAGNOSIS_ROUTES: DiagnosisRoute[] = [
  {
    symptom: 'skips_gears',
    derailleur: 'rear',
    startStep: 'indexing',
    explanation:
      'Gear skipping is a classic indexing issue. Starting at the indexing step to fine-tune cable tension.',
  },
  {
    symptom: 'chain_drops_outside_rear',
    derailleur: 'rear',
    startStep: 'h_limit',
    explanation:
      'Chain dropping outward at the rear means the H-limit screw needs adjustment.',
  },
  {
    symptom: 'chain_drops_inside_rear',
    derailleur: 'rear',
    startStep: 'l_limit',
    explanation:
      'Chain dropping toward spokes means the L-limit screw is set too loose.',
  },
  {
    symptom: 'slow_upshift_rear',
    derailleur: 'rear',
    startStep: 'cable_tension',
    explanation:
      'Slow upshifts indicate insufficient cable tension. Starting at cable tension reset.',
  },
  {
    symptom: 'noisy_shifts',
    derailleur: 'rear',
    startStep: 'indexing',
    explanation:
      'Noisy shifts often indicate the indexing is off. Starting at the indexing step.',
  },
  {
    symptom: 'chain_rub_front',
    derailleur: 'front',
    startStep: 'friction_check',
    explanation:
      'Front derailleur chain rub — running through the full friction-rub avoidance check.',
  },
  {
    symptom: 'chain_rub_small_ring',
    derailleur: 'front',
    startStep: 'l_limit',
    explanation:
      'Rub on the inner cage plate in the small ring indicates the L-limit screw needs adjustment.',
  },
  {
    symptom: 'chain_drops_chainring',
    derailleur: 'front',
    startStep: 'h_limit',
    explanation:
      'Chain dropping off a chainring — starting at the H-limit screw check for the front.',
  },
  {
    symptom: 'slow_front_shift',
    derailleur: 'front',
    startStep: 'cable_tension',
    explanation:
      'Slow front shifting usually means insufficient cable tension. Starting at the cable tension step.',
  },
];

/**
 * Symptom-Based Quick Diagnosis
 * Allows users to describe their problem and jump directly to the relevant tuning step.
 */
export class SymptomDiagnosis {
  /**
   * Interactive symptom selection and routing to the correct wizard step.
   */
  async start(): Promise<void> {
    console.log('\n========================================');
    console.log('  SYMPTOM-BASED QUICK DIAGNOSIS');
    console.log('========================================\n');
    console.log(
      'Describe what you are experiencing and we will jump directly to the relevant fix.\n'
    );

    const scorer = new ConfidenceScorer(outcomeTracker);

    const { selectedSymptom } = await inquirer.prompt<{ selectedSymptom: Symptom }>([
      {
        type: 'list',
        name: 'selectedSymptom',
        message: 'What symptom are you experiencing?',
        choices: SYMPTOMS.map((s) => ({
          name: `${s.label} — ${s.description}`,
          value: s.value,
        })),
      },
    ]);

    const route = this.findRoute(selectedSymptom);

    if (!route) {
      console.log('\n⚠️  No specific route found for that symptom. Starting full wizard from the beginning.\n');
      await this.runRearWizard();
      return;
    }

    const scored = scorer.scoreRoute(route);
    console.log(`\n💡 Diagnosis: ${route.explanation}`);
    console.log(`   ${scorer.formatScore(scored)}`);
    console.log(
      `\n➡️  Jumping to: ${route.derailleur === 'rear' ? 'Rear' : 'Front'} Derailleur Wizard — Step: "${route.startStep}"\n`
    );

    const { proceed } = await inquirer.prompt<{ proceed: boolean }>([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Ready to proceed to the relevant step?',
        default: true,
      },
    ]);

    if (!proceed) {
      console.log('Returning to main menu...');
      return;
    }

    let wizardResult: { completedSteps: string[]; skippedSteps: string[]; notes: string[] };

    if (route.derailleur === 'rear') {
      wizardResult = await this.runRearWizard(route.startStep as RearStepId);
    } else {
      wizardResult = await this.runFrontWizard(route.startStep as FrontStepId);
    }

    const { resolved } = await inquirer.prompt<{ resolved: boolean }>([
      {
        type: 'confirm',
        name: 'resolved',
        message: '✅ Did the wizard resolve your issue?',
        default: true,
      },
    ]);

    outcomeTracker.recordOutcome({
      symptom: selectedSymptom,
      wizardType: route.derailleur,
      startStep: String(route.startStep),
      completedSteps: wizardResult.completedSteps,
      skippedSteps: wizardResult.skippedSteps,
      resolved,
    });

    if (resolved) {
      console.log('\n🎉 Great — outcome recorded. This will help improve future recommendations.\n');
    } else {
      console.log('\n📝 Outcome recorded. Consider trying an alternative step or checking component wear.\n');
    }
  }

  /**
   * Find the diagnosis route for a given symptom.
   */
  findRoute(symptom: Symptom): DiagnosisRoute | undefined {
    return DIAGNOSIS_ROUTES.find((r) => r.symptom === symptom);
  }

  private async runRearWizard(startFrom?: RearStepId): Promise<{ completedSteps: string[]; skippedSteps: string[]; notes: string[] }> {
    const wizard = new RearDerailleurWizard();
    return wizard.start(startFrom);
  }

  private async runFrontWizard(startFrom?: FrontStepId): Promise<{ completedSteps: string[]; skippedSteps: string[]; notes: string[] }> {
    const wizard = new FrontDerailleurWizard();
    return wizard.start(startFrom);
  }
}

export default SymptomDiagnosis;
