import inquirer from 'inquirer';

export interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
  alsoSee?: string[];
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Drivetrain parts
  {
    term: 'Chain',
    category: 'Drivetrain Parts',
    definition:
      'The roller chain that transfers pedalling power from the chainring to the cassette. Measured for elongation (wear) and replaced when stretched beyond 0.75%.',
    alsoSee: ['Cassette', 'Chainring'],
  },
  {
    term: 'Cassette',
    category: 'Drivetrain Parts',
    definition:
      'The set of sprockets (cogs) mounted on the rear wheel hub. Gear numbers refer to the number of teeth on each cog — more teeth = easier gear.',
    alsoSee: ['Chain', 'Rear Derailleur'],
  },
  {
    term: 'Chainring',
    category: 'Drivetrain Parts',
    definition:
      'The large toothed disc(s) attached to the crank arms at the pedals. Most road bikes have one (1x) or two (2x) chainrings. More teeth = harder gear.',
    alsoSee: ['Chain', 'Front Derailleur'],
  },
  {
    term: 'Rear Derailleur',
    category: 'Drivetrain Parts',
    definition:
      'The mechanism on the right side of the rear dropout that moves the chain between cassette cogs. It has a cage with two jockey pulleys and is controlled by the right shifter.',
    alsoSee: ['Derailleur Hanger', 'Jockey Pulley', 'Cassette'],
  },
  {
    term: 'Front Derailleur',
    category: 'Drivetrain Parts',
    definition:
      'The mechanism attached to the frame near the bottom bracket that moves the chain between chainrings. It has an outer and inner cage plate that guide the chain.',
    alsoSee: ['Chainring', 'Cage Plate'],
  },
  {
    term: 'Derailleur Hanger',
    category: 'Drivetrain Parts',
    definition:
      'A replaceable metal bracket that attaches the rear derailleur to the frame dropout. Designed to bend or break to protect the frame in a crash. Must be perfectly straight for accurate shifting.',
    alsoSee: ['Rear Derailleur'],
  },
  {
    term: 'Jockey Pulley',
    category: 'Drivetrain Parts',
    definition:
      'One of the two small toothed wheels inside the rear derailleur cage. The upper (guide) pulley sits close to the cassette; the lower (tension) pulley maintains chain tension.',
    alsoSee: ['Rear Derailleur', 'B-Screw'],
  },
  {
    term: 'Cage Plate',
    category: 'Drivetrain Parts',
    definition:
      'The inner or outer metal plate of the front derailleur cage that guides the chain when shifting. The chain should clear each plate by approximately 1 mm in normal gear combinations.',
    alsoSee: ['Front Derailleur'],
  },
  {
    term: 'Bottom Bracket',
    category: 'Drivetrain Parts',
    definition:
      'The bearing assembly inside the frame that the crank arms rotate around. The centre of the bottom bracket is the reference point for saddle height and reach measurements.',
  },
  {
    term: 'Crank Arm',
    category: 'Drivetrain Parts',
    definition:
      'The lever arms that connect the pedals to the chainring. Crank length (e.g. 170 mm, 172.5 mm) affects pedalling leverage and fit.',
    alsoSee: ['Chainring', 'Bottom Bracket'],
  },
  // Cables and housing
  {
    term: 'Shift Cable',
    category: 'Cables & Housing',
    definition:
      'The stainless-steel inner wire that runs from the shifter to the derailleur. Pulling the cable moves the derailleur; releasing cable tension allows it to spring back.',
    alsoSee: ['Cable Housing', 'Barrel Adjuster'],
  },
  {
    term: 'Cable Housing',
    category: 'Cables & Housing',
    definition:
      'The outer sleeve that encases and guides the shift or brake cable. Compressed or kinked housing reduces cable movement and causes poor shifting.',
    alsoSee: ['Shift Cable'],
  },
  {
    term: 'Barrel Adjuster',
    category: 'Cables & Housing',
    definition:
      'A threaded cylindrical fitting at the derailleur or shifter that allows fine cable tension adjustments without tools. Turning COUNTER-CLOCKWISE adds tension; CLOCKWISE reduces tension.',
    alsoSee: ['Cable Tension', 'Indexing'],
  },
  // Adjustments
  {
    term: 'Indexing',
    category: 'Adjustments',
    definition:
      'The process of fine-tuning cable tension so each click of the shifter moves the chain exactly one cog. Adjusted with the barrel adjuster in 1/4-turn increments.',
    alsoSee: ['Barrel Adjuster', 'Cable Tension'],
  },
  {
    term: 'Cable Tension',
    category: 'Adjustments',
    definition:
      'The amount of pull on the shift cable between the shifter and derailleur. Too little tension causes sluggish upshifts; too much causes sluggish downshifts or over-shifting.',
    alsoSee: ['Barrel Adjuster', 'Indexing'],
  },
  {
    term: 'H-Limit Screw',
    category: 'Adjustments',
    definition:
      'A small screw on the derailleur body (usually marked "H") that sets the maximum outward travel of the derailleur. For the rear derailleur it prevents the chain from falling off the smallest cog. For the front derailleur it limits outward movement on the large chainring.',
    alsoSee: ['L-Limit Screw'],
  },
  {
    term: 'L-Limit Screw',
    category: 'Adjustments',
    definition:
      'A small screw on the derailleur body (usually marked "L") that sets the maximum inward travel of the derailleur. For the rear derailleur it prevents the chain from contacting the spokes. For the front derailleur it prevents rubbing on the inner plate in the small ring.',
    alsoSee: ['H-Limit Screw'],
  },
  {
    term: 'B-Screw',
    category: 'Adjustments',
    definition:
      'A screw on the rear derailleur that adjusts the angle of the derailleur body relative to the cassette, controlling the gap between the upper jockey pulley and the largest cog. The ideal gap is 5–8 mm for most systems.',
    alsoSee: ['Jockey Pulley', 'Rear Derailleur'],
  },
  {
    term: 'Torque Spec',
    category: 'Adjustments',
    definition:
      'The manufacturer-specified tightening force for a bolt, measured in Newton-metres (Nm). Always use a torque wrench on carbon components (typically 4–6 Nm for cockpit parts, 40 Nm for cassette lockring).',
    alsoSee: ['Torque Wrench'],
  },
  {
    term: 'Chain Wear',
    category: 'Adjustments',
    definition:
      'The gradual elongation of chain links due to wear. Measured with a chain-wear indicator as a decimal percentage (0.5, 0.75, 1.0). Replace the chain at 0.75; replace chain and cassette together at 1.0.',
    alsoSee: ['Chain', 'Cassette'],
  },
  // Tools
  {
    term: 'Torque Wrench',
    category: 'Tools',
    definition:
      'A wrench that measures and limits tightening force in Newton-metres (Nm). Essential for carbon parts that can crack if overtightened.',
    alsoSee: ['Torque Spec'],
  },
  {
    term: 'Chain-Wear Indicator',
    category: 'Tools',
    definition:
      'A small gauge tool (e.g. Park Tool CC-4) that measures chain elongation. Insert the hooked end between chain links; the indicator drops to 0.5 or 0.75 if the chain has reached that wear level.',
    alsoSee: ['Chain Wear'],
  },
  {
    term: 'Hanger Alignment Tool',
    category: 'Tools',
    definition:
      'A long arm tool that threads into the derailleur hanger and references the rim to check whether the hanger is perfectly perpendicular to the wheel. A bent hanger is the #1 cause of poor shifting.',
    alsoSee: ['Derailleur Hanger'],
  },
  {
    term: 'Cassette Lockring Tool',
    category: 'Tools',
    definition:
      'A splined tool that fits into the cassette lockring, used with a chain whip to remove and install the cassette. Torque to approximately 40 Nm when installing.',
    alsoSee: ['Cassette'],
  },
  {
    term: 'Hex Key (Allen Key)',
    category: 'Tools',
    definition:
      'An L-shaped or T-handle tool used to tighten or loosen hex socket bolts (e.g. stem bolts, saddle clamp, derailleur cable anchor). Common sizes for derailleurs: 4 mm and 5 mm.',
  },
  {
    term: 'Feeler Gauge',
    category: 'Tools',
    definition:
      'A thin blade of known thickness used to measure small gaps, such as the clearance between the front derailleur cage and the chainring (1–3 mm). A business card (~0.3 mm) or playing card (~0.25 mm) can substitute.',
    alsoSee: ['Front Derailleur'],
  },
];

/**
 * Visual Glossary for Drivetrain Parts and Adjustments
 * Provides searchable definitions to reduce terminology confusion during tuning.
 */
export class Glossary {
  /**
   * Run the interactive glossary browser.
   */
  async start(): Promise<void> {
    console.log('\n========================================');
    console.log('  DRIVETRAIN GLOSSARY');
    console.log('========================================\n');
    console.log('Definitions for parts and adjustments used throughout the tuning wizards.\n');

    const { action } = await inquirer.prompt<{
      action: 'search' | 'browse_category' | 'view_all';
    }>([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like to explore the glossary?',
        choices: [
          { name: '🔍 Search for a term', value: 'search' },
          { name: '📂 Browse by category', value: 'browse_category' },
          { name: '📖 View all terms', value: 'view_all' },
        ],
      },
    ]);

    switch (action) {
      case 'search':
        await this.searchTerm();
        break;
      case 'browse_category':
        await this.browseByCategory();
        break;
      case 'view_all':
        this.printTerms(GLOSSARY_TERMS);
        break;
    }
  }

  /**
   * Find glossary terms whose term name contains the query string (case-insensitive).
   */
  findTerms(query: string): GlossaryTerm[] {
    const q = query.toLowerCase();
    return GLOSSARY_TERMS.filter(
      (t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
    );
  }

  /**
   * Get all unique categories in the glossary.
   */
  getCategories(): string[] {
    return [...new Set(GLOSSARY_TERMS.map((t) => t.category))];
  }

  /**
   * Get all terms in a specific category.
   */
  getTermsByCategory(category: string): GlossaryTerm[] {
    return GLOSSARY_TERMS.filter((t) => t.category === category);
  }

  private async searchTerm(): Promise<void> {
    const { query } = await inquirer.prompt<{ query: string }>([
      {
        type: 'input',
        name: 'query',
        message: 'Enter a term or keyword to search:',
        validate: (v: string) => (v.trim().length > 0 ? true : 'Please enter a search term.'),
      },
    ]);

    const results = this.findTerms(query.trim());

    if (results.length === 0) {
      console.log(`\n⚠️  No terms found matching "${query}". Try a shorter keyword.\n`);
      return;
    }

    console.log(`\nFound ${results.length} result(s) for "${query}":\n`);
    this.printTerms(results);
  }

  private async browseByCategory(): Promise<void> {
    const categories = this.getCategories();

    const { category } = await inquirer.prompt<{ category: string }>([
      {
        type: 'list',
        name: 'category',
        message: 'Select a category:',
        choices: categories,
      },
    ]);

    const terms = this.getTermsByCategory(category);
    console.log(`\n--- ${category.toUpperCase()} (${terms.length} terms) ---\n`);
    this.printTerms(terms);
  }

  private printTerms(terms: GlossaryTerm[]): void {
    terms.forEach((t) => {
      console.log(`📌 ${t.term}  [${t.category}]`);
      console.log(`   ${t.definition}`);
      if (t.alsoSee && t.alsoSee.length > 0) {
        console.log(`   See also: ${t.alsoSee.join(', ')}`);
      }
      console.log();
    });
  }
}

export default Glossary;
