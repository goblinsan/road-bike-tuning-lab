import {
  GLOSSARY_TERMS,
  Glossary,
  GlossaryTerm,
} from '../glossary';

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('GLOSSARY_TERMS data', () => {
  it('contains at least 20 terms', () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(20);
  });

  it('every term has a non-empty term, category, and definition', () => {
    GLOSSARY_TERMS.forEach((t) => {
      expect(t.term.length).toBeGreaterThan(0);
      expect(t.category.length).toBeGreaterThan(0);
      expect(t.definition.length).toBeGreaterThan(0);
    });
  });

  it('includes core drivetrain part terms', () => {
    const termNames = GLOSSARY_TERMS.map((t) => t.term);
    expect(termNames).toContain('Chain');
    expect(termNames).toContain('Cassette');
    expect(termNames).toContain('Chainring');
    expect(termNames).toContain('Rear Derailleur');
    expect(termNames).toContain('Front Derailleur');
    expect(termNames).toContain('Derailleur Hanger');
    expect(termNames).toContain('Jockey Pulley');
  });

  it('includes core adjustment terms', () => {
    const termNames = GLOSSARY_TERMS.map((t) => t.term);
    expect(termNames).toContain('H-Limit Screw');
    expect(termNames).toContain('L-Limit Screw');
    expect(termNames).toContain('B-Screw');
    expect(termNames).toContain('Indexing');
    expect(termNames).toContain('Cable Tension');
    expect(termNames).toContain('Barrel Adjuster');
  });

  it('includes key tool terms', () => {
    const termNames = GLOSSARY_TERMS.map((t) => t.term);
    expect(termNames).toContain('Torque Wrench');
    expect(termNames).toContain('Chain-Wear Indicator');
    expect(termNames).toContain('Hanger Alignment Tool');
  });

  it('has multiple categories', () => {
    const categories = [...new Set(GLOSSARY_TERMS.map((t) => t.category))];
    expect(categories.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Glossary.findTerms()', () => {
  const glossary = new Glossary();

  it('finds a term by exact name (case-insensitive)', () => {
    const results = glossary.findTerms('chain');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((t) => t.term === 'Chain')).toBe(true);
  });

  it('finds terms matching a keyword in the definition', () => {
    const results = glossary.findTerms('elongation');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns an empty array when no terms match', () => {
    const results = glossary.findTerms('xyznonexistentterm999');
    expect(results).toHaveLength(0);
  });

  it('is case-insensitive for term names', () => {
    const lower = glossary.findTerms('cassette');
    const upper = glossary.findTerms('CASSETTE');
    expect(lower.length).toBe(upper.length);
    expect(lower.length).toBeGreaterThan(0);
  });
});

describe('Glossary.getCategories()', () => {
  const glossary = new Glossary();

  it('returns a list of unique categories', () => {
    const categories = glossary.getCategories();
    const unique = [...new Set(categories)];
    expect(categories.length).toBe(unique.length);
    expect(categories.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Glossary.getTermsByCategory()', () => {
  const glossary = new Glossary();

  it('returns only terms matching the requested category', () => {
    const toolTerms = glossary.getTermsByCategory('Tools');
    expect(toolTerms.length).toBeGreaterThan(0);
    toolTerms.forEach((t) => expect(t.category).toBe('Tools'));
  });

  it('returns an empty array for an unknown category', () => {
    const results = glossary.getTermsByCategory('Nonexistent Category XYZ');
    expect(results).toHaveLength(0);
  });
});

describe('Glossary.start()', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('executes the search flow and prints matching terms', async () => {
    mockPrompt
      .mockResolvedValueOnce({ action: 'search' } as never)
      .mockResolvedValueOnce({ query: 'chain' } as never);

    const glossary = new Glossary();
    await glossary.start();
    // No assertion needed — just verify it does not throw
  });

  it('executes the browse-by-category flow', async () => {
    mockPrompt
      .mockResolvedValueOnce({ action: 'browse_category' } as never)
      .mockResolvedValueOnce({ category: 'Tools' } as never);

    const glossary = new Glossary();
    await glossary.start();
  });

  it('executes the view-all flow', async () => {
    mockPrompt.mockResolvedValueOnce({ action: 'view_all' } as never);

    const glossary = new Glossary();
    await glossary.start();
  });

  it('handles a search that returns no results gracefully', async () => {
    mockPrompt
      .mockResolvedValueOnce({ action: 'search' } as never)
      .mockResolvedValueOnce({ query: 'xyznonexistentterm999' } as never);

    const glossary = new Glossary();
    await glossary.start(); // must not throw
  });
});
