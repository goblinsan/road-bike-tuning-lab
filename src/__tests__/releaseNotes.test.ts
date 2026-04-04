import { RELEASE_NOTES, ReleaseNotesViewer, ReleaseNote } from '../releaseNotes';

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('RELEASE_NOTES data', () => {
  it('has at least one release note', () => {
    expect(RELEASE_NOTES.length).toBeGreaterThan(0);
  });

  it('every note has a non-empty version, date, summary, and at least one change', () => {
    RELEASE_NOTES.forEach((note) => {
      expect(note.version.length).toBeGreaterThan(0);
      expect(note.date.length).toBeGreaterThan(0);
      expect(note.summary.length).toBeGreaterThan(0);
      expect(note.changes.length).toBeGreaterThan(0);
    });
  });

  it('includes the v1.4.0 diagnostics intelligence release', () => {
    const versions = RELEASE_NOTES.map((n) => n.version);
    expect(versions).toContain('1.4.0');
  });

  it('the latest note (index 0) has the highest version number', () => {
    expect(RELEASE_NOTES[0].version).toBe('1.4.0');
  });
});

describe('ReleaseNotesViewer', () => {
  let viewer: ReleaseNotesViewer;

  beforeEach(() => {
    viewer = new ReleaseNotesViewer();
    mockPrompt.mockReset();
  });

  describe('getLatestNote', () => {
    it('returns the first note in RELEASE_NOTES', () => {
      const latest = viewer.getLatestNote();
      expect(latest).toBe(RELEASE_NOTES[0]);
    });
  });

  describe('getAllNotes', () => {
    it('returns all release notes', () => {
      const notes = viewer.getAllNotes();
      expect(notes).toHaveLength(RELEASE_NOTES.length);
    });
  });

  describe('printNote', () => {
    it('does not throw', () => {
      expect(() => viewer.printNote(RELEASE_NOTES[0])).not.toThrow();
    });

    it('handles notes without educationTips', () => {
      const note: ReleaseNote = {
        version: '0.9.0',
        date: '2025-11',
        summary: 'Beta',
        changes: ['Initial beta.'],
      };
      expect(() => viewer.printNote(note)).not.toThrow();
    });
  });

  describe('start', () => {
    it('shows the latest note when "latest" is selected', async () => {
      mockPrompt.mockResolvedValueOnce({ action: 'latest' } as never);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await viewer.start();
      consoleSpy.mockRestore();

      expect(mockPrompt).toHaveBeenCalledTimes(1);
    });

    it('shows all notes when "all" is selected', async () => {
      mockPrompt.mockResolvedValueOnce({ action: 'all' } as never);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await viewer.start();
      consoleSpy.mockRestore();

      expect(mockPrompt).toHaveBeenCalledTimes(1);
    });

    it('does not throw', async () => {
      mockPrompt.mockResolvedValueOnce({ action: 'latest' } as never);
      await expect(viewer.start()).resolves.not.toThrow();
    });
  });
});
