import inquirer from 'inquirer';
import { RearDerailleurWizard } from './rearDerailleurWizard';
import { FrontDerailleurWizard } from './frontDerailleurWizard';
import { SymptomDiagnosis } from './symptomDiagnosis';
import { TestRideChecklist } from './testRideChecklist';
import { PreRaceChecklist } from './preRaceChecklist';
import { ChainWearGuide } from './chainWearGuide';
import { RiderSetupNotes } from './riderSetupNotes';
import { MaintenanceScheduler } from './maintenanceScheduler';
import { Glossary } from './glossary';

export type MainMenuChoice =
  | 'rear_derailleur'
  | 'front_derailleur'
  | 'symptom_diagnosis'
  | 'test_ride_checklist'
  | 'pre_race_checklist'
  | 'chain_wear_guide'
  | 'rider_setup_notes'
  | 'maintenance_scheduler'
  | 'glossary'
  | 'exit';

/**
 * Road Bike Tuning Coach
 * Main entry point that routes users to the appropriate tuning workflow.
 */
export class BikeCoach {
  private mobileMode = false;

  /**
   * Start the interactive coaching session.
   */
  async start(): Promise<void> {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║   ROAD BIKE TUNING COACH             ║');
    console.log('║   Derailleur Tuning Assistant        ║');
    console.log('╚══════════════════════════════════════╝\n');
    console.log('Welcome! This coach guides you through rear and front derailleur tuning.\n');

    const { mobile } = await inquirer.prompt<{ mobile: boolean }>([
      {
        type: 'confirm',
        name: 'mobile',
        message: '📱 Are you using this on a phone near your bike stand? (enables mobile-friendly step display)',
        default: false,
      },
    ]);
    this.mobileMode = mobile;

    if (this.mobileMode) {
      console.log('\n✅ Mobile mode enabled — instructions will be shown one at a time.\n');
    }

    let running = true;
    while (running) {
      const choice = await this.showMainMenu();

      switch (choice) {
        case 'rear_derailleur':
          await new RearDerailleurWizard({ mobileMode: this.mobileMode }).start();
          break;
        case 'front_derailleur':
          await new FrontDerailleurWizard({ mobileMode: this.mobileMode }).start();
          break;
        case 'symptom_diagnosis':
          await new SymptomDiagnosis().start();
          break;
        case 'test_ride_checklist':
          await new TestRideChecklist().start();
          break;
        case 'pre_race_checklist':
          await new PreRaceChecklist().start();
          break;
        case 'chain_wear_guide':
          await new ChainWearGuide().start();
          break;
        case 'rider_setup_notes':
          await new RiderSetupNotes().start();
          break;
        case 'maintenance_scheduler':
          await new MaintenanceScheduler().start();
          break;
        case 'glossary':
          await new Glossary().start();
          break;
        case 'exit':
          running = false;
          break;
      }

      if (running) {
        const { returnToMenu } = await inquirer.prompt<{ returnToMenu: boolean }>([
          {
            type: 'confirm',
            name: 'returnToMenu',
            message: 'Return to the main menu?',
            default: true,
          },
        ]);
        if (!returnToMenu) {
          running = false;
        }
      }
    }

    console.log('\nThank you for using the Road Bike Tuning Coach. Happy riding! 🚴\n');
  }

  private async showMainMenu(): Promise<MainMenuChoice> {
    const { choice } = await inquirer.prompt<{ choice: MainMenuChoice }>([
      {
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
          {
            name: '🔧 Rear Derailleur Wizard  — Limit screws, B-screw, indexing',
            value: 'rear_derailleur',
          },
          {
            name: '🔧 Front Derailleur Wizard — Height, angle, cable tension, limits',
            value: 'front_derailleur',
          },
          {
            name: '🩺 Symptom Quick Diagnosis — Jump to the relevant fix',
            value: 'symptom_diagnosis',
          },
          {
            name: '✅ Test Ride Checklist     — Before/after verification',
            value: 'test_ride_checklist',
          },
          {
            name: '🏁 Pre-Race Checklist      — Triathlon race-week bike prep',
            value: 'pre_race_checklist',
          },
          {
            name: '🔗 Chain Wear Guide        — Wear thresholds & tool recommendations',
            value: 'chain_wear_guide',
          },
          {
            name: '📐 Rider Setup Notes       — Fit deltas & cockpit tweaks',
            value: 'rider_setup_notes',
          },
          {
            name: '🗓️  Maintenance Scheduler   — Periodic checks by mileage/time',
            value: 'maintenance_scheduler',
          },
          {
            name: '📚 Glossary                — Definitions of drivetrain parts & adjustments',
            value: 'glossary',
          },
          {
            name: '👋 Exit',
            value: 'exit',
          },
        ],
      },
    ]);

    return choice;
  }
}

// Main execution
if (require.main === module) {
  const coach = new BikeCoach();
  coach.start().catch((err: Error) => {
    console.error('An error occurred:', err.message);
    process.exit(1);
  });
}

export default BikeCoach;
