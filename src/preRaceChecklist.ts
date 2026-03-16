import inquirer from 'inquirer';

export interface PreRaceItem {
  id: string;
  category: string;
  description: string;
  tip?: string;
  passed?: boolean;
}

export interface PreRaceResult {
  items: PreRaceItem[];
  allPassed: boolean;
  failedItems: PreRaceItem[];
}

export const PRE_RACE_CHECKLIST_ITEMS: PreRaceItem[] = [
  // Drivetrain
  {
    id: 'chain_clean_lubed',
    category: 'Drivetrain',
    description: 'Chain is clean and freshly lubed (race-day lube applied the night before)',
    tip: 'Use a dry or wax lube for race day — avoid heavy wet lube that attracts grit.',
  },
  {
    id: 'chain_wear_ok',
    category: 'Drivetrain',
    description: 'Chain wear indicator reads below 0.75 (checked with a chain-wear indicator)',
    tip: 'A worn chain causes skipping under load — replace if the indicator reads 0.75 or above.',
  },
  {
    id: 'cassette_clean',
    category: 'Drivetrain',
    description: 'Cassette is clean — no packed grit or worn tooth hooks',
  },
  {
    id: 'chainrings_ok',
    category: 'Drivetrain',
    description: 'Chainring teeth are not excessively worn or shark-finned',
  },
  {
    id: 'shifting_smooth',
    category: 'Drivetrain',
    description: 'Rear and front shifting is crisp and accurate through the full range',
    tip: 'Test all gear combinations the day before; make cable-tension tweaks as needed.',
  },
  // Braking
  {
    id: 'brake_pad_thickness',
    category: 'Braking',
    description: 'Brake pads have adequate material thickness (not worn to backing)',
  },
  {
    id: 'brake_lever_feel',
    category: 'Braking',
    description: 'Both brake levers are firm — no sponginess or excessive travel',
  },
  {
    id: 'brake_rotor_clean',
    category: 'Braking',
    description: 'Rotors/rims are free of oil contamination, cracks, or deep grooves',
    tip: 'Even a fingerprint on a rotor can reduce disc brake power significantly.',
  },
  {
    id: 'brake_cable_housing',
    category: 'Braking',
    description: 'Brake cables and housing show no fraying or kinking',
  },
  // Tires
  {
    id: 'tire_pressure_race',
    category: 'Tires',
    description: 'Tires inflated to your target race pressure (pump on race morning)',
    tip: 'Typical road/tri race pressures: 80–100 psi for clinchers; follow manufacturer guidance.',
  },
  {
    id: 'tire_condition',
    category: 'Tires',
    description: 'Tires are free of cuts, embedded debris, or sidewall damage',
  },
  {
    id: 'tube_sealant',
    category: 'Tires',
    description: 'Spare tube / CO₂ / tubeless sealant is packed in your kit',
    tip: 'Carry one spare tube, two CO₂ cartridges, and a basic multi-tool.',
  },
  // Cockpit
  {
    id: 'aero_bar_tight',
    category: 'Cockpit',
    description: 'Aero bars / extensions are tightened to spec and aligned to your fit',
    tip: 'Use a torque wrench — carbon cockpit parts have low torque limits (usually 4–6 Nm).',
  },
  {
    id: 'saddle_height_position',
    category: 'Cockpit',
    description: 'Saddle height and fore-aft position match your recorded fit measurements',
  },
  {
    id: 'stem_headset_tight',
    category: 'Cockpit',
    description: 'Stem bolts and headset are fully tightened — no play in steering',
  },
  {
    id: 'computer_garmin_mounted',
    category: 'Cockpit',
    description: 'Bike computer / GPS is mounted, charged, and set to race mode',
  },
  // Safety & accessories
  {
    id: 'helmet_buckle',
    category: 'Safety',
    description: 'Helmet strap is adjusted and buckle clicks securely',
  },
  {
    id: 'race_number_mounted',
    category: 'Safety',
    description: 'Race number is securely attached if required on the bike',
  },
];

/**
 * Pre-Race Bike Readiness Checklist
 * Guides triathletes through a structured race-week and race-morning bike inspection.
 */
export class PreRaceChecklist {
  /**
   * Run the interactive pre-race checklist.
   */
  async start(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   PRE-RACE BIKE READINESS CHECKLIST      ║');
    console.log('║   Triathlon Race-Week Prep                ║');
    console.log('╚══════════════════════════════════════════╝\n');
    console.log(
      'Work through each item carefully. Address any failures before race morning.\n'
    );

    const result = await this.runChecklist(PRE_RACE_CHECKLIST_ITEMS);
    this.printResult(result);

    if (result.allPassed) {
      console.log('\n🏁 All systems go! Your bike is race-ready. Good luck out there!\n');
    } else {
      console.log(
        '\n⚠️  Address the failed items before race day. Use the Derailleur Wizards or Chain Wear Guide for drivetrain issues.\n'
      );
    }
  }

  /**
   * Run the checklist and collect pass/fail responses for each item.
   */
  async runChecklist(items: PreRaceItem[]): Promise<PreRaceResult> {
    const categories = [...new Set(items.map((i) => i.category))];
    const checkedItems: PreRaceItem[] = [];

    for (const category of categories) {
      const categoryItems = items.filter((i) => i.category === category);
      console.log(`\n--- ${category.toUpperCase()} ---`);

      for (const item of categoryItems) {
        if (item.tip) {
          console.log(`  💡 Tip: ${item.tip}`);
        }
        const { passed } = await inquirer.prompt<{ passed: boolean }>([
          {
            type: 'confirm',
            name: 'passed',
            message: item.description,
            default: true,
          },
        ]);
        checkedItems.push({ ...item, passed });

        if (!passed) {
          console.log(`  ✗ Flagged: "${item.description}"\n`);
        }
      }
    }

    const failedItems = checkedItems.filter((i) => !i.passed);

    return {
      items: checkedItems,
      allPassed: failedItems.length === 0,
      failedItems,
    };
  }

  private printResult(result: PreRaceResult): void {
    const total = result.items.length;
    const passed = total - result.failedItems.length;

    console.log(`\nPre-race check result: ${passed}/${total} items passed.`);

    if (result.failedItems.length > 0) {
      console.log('\nItems requiring attention:');
      result.failedItems.forEach((item) => {
        console.log(`  ✗ [${item.category}] ${item.description}`);
      });
    } else {
      console.log('  ✅ All items passed!');
    }
  }
}

export default PreRaceChecklist;
