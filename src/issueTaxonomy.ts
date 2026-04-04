import { Symptom } from './symptomDiagnosis';
import { RearStepId } from './rearDerailleurWizard';
import { FrontStepId } from './frontDerailleurWizard';

export type FaultCategory =
  | 'cable_tension'
  | 'limit_screw'
  | 'hanger_alignment'
  | 'component_wear'
  | 'cage_position'
  | 'b_screw';

export type FaultSeverity = 'low' | 'medium' | 'high';

export interface FaultClassification {
  symptom: Symptom;
  categories: FaultCategory[];
  severity: FaultSeverity;
  /** Ordered list of step IDs to attempt, from most to least likely to resolve the issue. */
  recommendedPath: Array<RearStepId | FrontStepId>;
  notes: string;
}

/**
 * Taxonomy of common drivetrain faults.
 * Maps every known symptom to one or more fault categories, a severity level,
 * and an ordered adjustment path.
 */
export const FAULT_TAXONOMY: FaultClassification[] = [
  {
    symptom: 'skips_gears',
    categories: ['cable_tension', 'component_wear', 'hanger_alignment'],
    severity: 'high',
    recommendedPath: ['indexing', 'cable_tension', 'pre_check'],
    notes:
      'Gear skipping is most often caused by mis-indexed cable tension. If it persists after indexing, check for chain/cassette wear or a bent hanger.',
  },
  {
    symptom: 'chain_drops_outside_rear',
    categories: ['limit_screw'],
    severity: 'high',
    recommendedPath: ['h_limit', 'indexing'],
    notes:
      'Chain dropping toward the dropout is a classic H-limit screw issue. Safety-critical — must be resolved before riding.',
  },
  {
    symptom: 'chain_drops_inside_rear',
    categories: ['limit_screw'],
    severity: 'high',
    recommendedPath: ['l_limit', 'indexing'],
    notes:
      'Chain falling into the spokes is an L-limit screw issue. Safety-critical — can lock the rear wheel at speed.',
  },
  {
    symptom: 'slow_upshift_rear',
    categories: ['cable_tension'],
    severity: 'medium',
    recommendedPath: ['cable_tension', 'indexing'],
    notes:
      'Slow upshifts almost always indicate insufficient cable tension. Reset the cable and re-index.',
  },
  {
    symptom: 'noisy_shifts',
    categories: ['cable_tension', 'hanger_alignment', 'component_wear'],
    severity: 'medium',
    recommendedPath: ['indexing', 'pre_check', 'b_screw'],
    notes:
      'Noise during shifts often points to poor indexing, but can also mean a bent hanger or a worn drivetrain.',
  },
  {
    symptom: 'chain_rub_front',
    categories: ['cage_position', 'cable_tension'],
    severity: 'medium',
    recommendedPath: ['friction_check', 'cable_tension', 'height'],
    notes:
      'Front derailleur chain rub is usually a cage position or trim issue. Run the full friction-rub check first.',
  },
  {
    symptom: 'chain_rub_small_ring',
    categories: ['limit_screw', 'cage_position'],
    severity: 'low',
    recommendedPath: ['l_limit', 'height'],
    notes:
      'Rubbing on the inner cage plate in the small ring indicates the L-limit screw is set too loose or the cage is mispositioned.',
  },
  {
    symptom: 'chain_drops_chainring',
    categories: ['limit_screw', 'cage_position'],
    severity: 'high',
    recommendedPath: ['h_limit', 'l_limit', 'height'],
    notes:
      'Chain dropping off a chainring usually means a limit screw is set incorrectly or the cage is too high.',
  },
  {
    symptom: 'slow_front_shift',
    categories: ['cable_tension', 'cage_position'],
    severity: 'medium',
    recommendedPath: ['cable_tension', 'height', 'friction_check'],
    notes:
      'Slow front shifting usually means insufficient cable tension; also check cage height and angle.',
  },
];

/**
 * Drivetrain Issue Taxonomy
 * Classifies symptoms into fault categories and provides ordered adjustment paths.
 */
export class DrivetrainIssueTaxonomy {
  /**
   * Return the fault classification for the given symptom, or undefined if not found.
   */
  classifySymptom(symptom: Symptom): FaultClassification | undefined {
    return FAULT_TAXONOMY.find((f) => f.symptom === symptom);
  }

  /**
   * Return all fault classifications for a given category.
   */
  getByCategory(category: FaultCategory): FaultClassification[] {
    return FAULT_TAXONOMY.filter((f) => f.categories.includes(category));
  }

  /**
   * Return all fault classifications at or above the given severity level.
   */
  getBySeverity(minSeverity: FaultSeverity): FaultClassification[] {
    const order: FaultSeverity[] = ['low', 'medium', 'high'];
    const threshold = order.indexOf(minSeverity);
    return FAULT_TAXONOMY.filter((f) => order.indexOf(f.severity) >= threshold);
  }

  /**
   * Return all unique fault categories present in the taxonomy.
   */
  getCategories(): FaultCategory[] {
    const all = FAULT_TAXONOMY.flatMap((f) => f.categories);
    return [...new Set(all)];
  }
}

export default DrivetrainIssueTaxonomy;
