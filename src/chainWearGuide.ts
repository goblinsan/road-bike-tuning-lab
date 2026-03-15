import inquirer from 'inquirer';

export interface ChainWearReading {
  wearPercent: number;
  recommendation: ChainWearRecommendation;
}

export type ChainWearRecommendation = 'good' | 'monitor' | 'replace_chain' | 'replace_chain_and_cassette';

export interface MaintenanceTool {
  name: string;
  purpose: string;
  notes?: string;
}

export const CHAIN_WEAR_THRESHOLDS = {
  GOOD: 0.5,
  MONITOR: 0.75,
  REPLACE_CHAIN: 1.0,
} as const;

export const RECOMMENDED_TOOLS: MaintenanceTool[] = [
  {
    name: 'Chain-wear indicator (checker)',
    purpose: 'Measures chain elongation as a percentage',
    notes: 'Park Tool CC-4 or similar. Gives a direct 0.5 / 0.75 / 1.0 reading.',
  },
  {
    name: 'Chain breaker / chain tool',
    purpose: 'Removes and installs chain pins or master links',
    notes: 'Park Tool CT-5 or CT-3.3 for most 10–12-speed chains.',
  },
  {
    name: 'Cassette lockring tool',
    purpose: 'Removes and installs cassette lockring',
    notes: 'Match the spline pattern to your cassette brand (Shimano/SRAM/Campagnolo).',
  },
  {
    name: 'Chain cleaning device',
    purpose: 'Degreases chain in place using a solvent bath',
    notes: 'Park Tool CM-5.3 or a simple drip-clean with degreaser works well.',
  },
  {
    name: 'Torque wrench',
    purpose: 'Ensures cassette lockring is torqued correctly (typically 40 Nm)',
  },
];

export const CASSETTE_WEAR_SIGNS: string[] = [
  'Hooked or shark-finned teeth visible on frequently used cogs',
  'Chain skips under load even after a new chain is installed',
  'Teeth are noticeably asymmetric or thin compared to less-used cogs',
  'Surface pitting or corrosion on steel cogs (titanium cogs are more susceptible)',
];

/**
 * Determine a chain-wear recommendation based on a measured wear percentage.
 */
export function getChainWearRecommendation(wearPercent: number): ChainWearRecommendation {
  if (wearPercent < CHAIN_WEAR_THRESHOLDS.GOOD) {
    return 'good';
  } else if (wearPercent < CHAIN_WEAR_THRESHOLDS.MONITOR) {
    return 'monitor';
  } else if (wearPercent < CHAIN_WEAR_THRESHOLDS.REPLACE_CHAIN) {
    return 'replace_chain';
  } else {
    return 'replace_chain_and_cassette';
  }
}

/**
 * Chain Wear & Cassette Health Guide
 * Provides replacement thresholds and tool recommendations for drivetrain longevity.
 */
export class ChainWearGuide {
  /**
   * Run the interactive chain wear and cassette health guide.
   */
  async start(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   CHAIN WEAR & CASSETTE HEALTH GUIDE     ║');
    console.log('╚══════════════════════════════════════════╝\n');
    console.log('Keeping your drivetrain healthy extends component life and prevents');
    console.log('dangerous chain drops during a race.\n');

    const { action } = await inquirer.prompt<{
      action: 'check_wear' | 'view_thresholds' | 'view_tools' | 'cassette_signs';
    }>([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🔍 Check my chain wear reading', value: 'check_wear' },
          { name: '📊 View replacement thresholds', value: 'view_thresholds' },
          { name: '🛠️  View recommended tools', value: 'view_tools' },
          { name: '🔎 Cassette wear signs to watch for', value: 'cassette_signs' },
        ],
      },
    ]);

    switch (action) {
      case 'check_wear':
        await this.checkWear();
        break;
      case 'view_thresholds':
        this.printThresholds();
        break;
      case 'view_tools':
        this.printTools();
        break;
      case 'cassette_signs':
        this.printCassetteSigns();
        break;
    }
  }

  /**
   * Interactively ask the user for their chain wear reading and give a recommendation.
   */
  async checkWear(): Promise<ChainWearReading> {
    console.log('\n--- CHAIN WEAR CHECK ---\n');
    console.log('Use a chain-wear indicator (e.g. Park Tool CC-4) to measure your chain.');
    console.log('The indicator shows elongation as a decimal percentage (e.g. 0.5, 0.75, 1.0).\n');

    const { wearInput } = await inquirer.prompt<{ wearInput: string }>([
      {
        type: 'input',
        name: 'wearInput',
        message: 'Enter your chain wear reading (e.g. 0.5, 0.75, or 1.0):',
        validate: (val: string) => {
          const num = parseFloat(val);
          if (isNaN(num) || num < 0) {
            return 'Please enter a valid non-negative number (e.g. 0.5 or 0.75).';
          }
          return true;
        },
      },
    ]);

    const wearPercent = parseFloat(wearInput);
    const recommendation = getChainWearRecommendation(wearPercent);

    const reading: ChainWearReading = { wearPercent, recommendation };
    this.printWearRecommendation(reading);
    return reading;
  }

  private printWearRecommendation(reading: ChainWearReading): void {
    console.log(`\nChain wear reading: ${reading.wearPercent}`);

    switch (reading.recommendation) {
      case 'good':
        console.log('✅ Chain is in good condition. Continue with regular cleaning and lubing.');
        break;
      case 'monitor':
        console.log(
          '⚠️  Chain is approaching the replacement threshold. Monitor closely and plan a replacement soon.'
        );
        console.log('   Replace before the next major race or at the 0.75 mark.');
        break;
      case 'replace_chain':
        console.log('🔴 Chain should be replaced now (≥ 0.75).');
        console.log('   A new chain on a good cassette will shift cleanly immediately.');
        break;
      case 'replace_chain_and_cassette':
        console.log('🔴 Chain AND cassette should be replaced (wear ≥ 1.0).');
        console.log(
          '   Installing a new chain on a heavily worn cassette causes skipping — replace both together.'
        );
        break;
    }
    console.log();
  }

  private printThresholds(): void {
    console.log('\n--- CHAIN WEAR REPLACEMENT THRESHOLDS ---\n');
    console.log('  < 0.50  ✅  Good — no action needed');
    console.log('  0.50 – 0.74  ⚠️   Monitor — replace soon (before next race)');
    console.log('  0.75 – 0.99  🔴  Replace chain now');
    console.log('  ≥ 1.00  🔴  Replace chain AND cassette together\n');
    console.log(
      'Note: For 12-speed drivetrains many manufacturers recommend replacement at 0.5 due to finer tolerances.\n'
    );
  }

  private printTools(): void {
    console.log('\n--- RECOMMENDED TOOLS ---\n');
    RECOMMENDED_TOOLS.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   Purpose: ${tool.purpose}`);
      if (tool.notes) {
        console.log(`   Notes: ${tool.notes}`);
      }
      console.log();
    });
  }

  private printCassetteSigns(): void {
    console.log('\n--- CASSETTE WEAR SIGNS ---\n');
    console.log('Inspect your cassette visually and by feel. Signs of excessive wear:\n');
    CASSETTE_WEAR_SIGNS.forEach((sign, index) => {
      console.log(`  ${index + 1}. ${sign}`);
    });
    console.log('\n💡 If any of these apply, replace the cassette with the next chain.\n');
  }
}

export default ChainWearGuide;
