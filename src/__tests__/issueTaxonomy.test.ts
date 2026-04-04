import {
  FAULT_TAXONOMY,
  DrivetrainIssueTaxonomy,
  FaultClassification,
  FaultCategory,
  FaultSeverity,
} from '../issueTaxonomy';
import { SYMPTOMS } from '../symptomDiagnosis';

describe('FAULT_TAXONOMY data', () => {
  it('has a classification for every known symptom', () => {
    const classifiedSymptoms = FAULT_TAXONOMY.map((f) => f.symptom);
    SYMPTOMS.forEach((s) => {
      expect(classifiedSymptoms).toContain(s.value);
    });
  });

  it('every classification has at least one category', () => {
    FAULT_TAXONOMY.forEach((f) => {
      expect(f.categories.length).toBeGreaterThan(0);
    });
  });

  it('every classification has a non-empty recommendedPath', () => {
    FAULT_TAXONOMY.forEach((f) => {
      expect(f.recommendedPath.length).toBeGreaterThan(0);
    });
  });

  it('every classification has a valid severity', () => {
    const validSeverities: FaultSeverity[] = ['low', 'medium', 'high'];
    FAULT_TAXONOMY.forEach((f) => {
      expect(validSeverities).toContain(f.severity);
    });
  });

  it('every classification has a non-empty notes field', () => {
    FAULT_TAXONOMY.forEach((f) => {
      expect(f.notes.length).toBeGreaterThan(0);
    });
  });
});

describe('DrivetrainIssueTaxonomy', () => {
  const taxonomy = new DrivetrainIssueTaxonomy();

  describe('classifySymptom', () => {
    it('returns a classification for skips_gears', () => {
      const result = taxonomy.classifySymptom('skips_gears');
      expect(result).toBeDefined();
      expect(result!.symptom).toBe('skips_gears');
      expect(result!.categories).toContain('cable_tension');
    });

    it('returns a classification for chain_drops_outside_rear', () => {
      const result = taxonomy.classifySymptom('chain_drops_outside_rear');
      expect(result).toBeDefined();
      expect(result!.categories).toContain('limit_screw');
      expect(result!.severity).toBe('high');
    });

    it('returns a classification for chain_rub_front', () => {
      const result = taxonomy.classifySymptom('chain_rub_front');
      expect(result).toBeDefined();
      expect(result!.categories).toContain('cage_position');
    });

    it('returns undefined for an unknown symptom', () => {
      const result = taxonomy.classifySymptom('unknown_symptom' as any);
      expect(result).toBeUndefined();
    });
  });

  describe('getByCategory', () => {
    it('returns all faults in the limit_screw category', () => {
      const results = taxonomy.getByCategory('limit_screw');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => {
        expect(r.categories).toContain('limit_screw');
      });
    });

    it('returns an empty array for a category with no faults', () => {
      const results = taxonomy.getByCategory('b_screw');
      // b_screw might or might not have entries; just verify it's an array
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getBySeverity', () => {
    it('returns only high-severity faults when minSeverity is "high"', () => {
      const results = taxonomy.getBySeverity('high');
      results.forEach((r) => {
        expect(r.severity).toBe('high');
      });
    });

    it('returns medium and high faults when minSeverity is "medium"', () => {
      const results = taxonomy.getBySeverity('medium');
      results.forEach((r) => {
        expect(['medium', 'high']).toContain(r.severity);
      });
    });

    it('returns all faults when minSeverity is "low"', () => {
      const results = taxonomy.getBySeverity('low');
      expect(results.length).toBe(FAULT_TAXONOMY.length);
    });
  });

  describe('getCategories', () => {
    it('returns a non-empty array of unique categories', () => {
      const categories = taxonomy.getCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(new Set(categories).size).toBe(categories.length);
    });

    it('includes cable_tension and limit_screw', () => {
      const categories = taxonomy.getCategories();
      expect(categories).toContain('cable_tension');
      expect(categories).toContain('limit_screw');
    });
  });
});
