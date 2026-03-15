import { RiderSetupNotes, FitDelta, RiderSetupSnapshot } from '../riderSetupNotes';

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('RiderSetupNotes.logSnapshot', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('records a snapshot with correct numeric measurements', async () => {
    mockPrompt.mockResolvedValueOnce({
      riderName: 'Alice',
      bikeLabel: 'Cervelo P5',
      saddleHeight: '720',
      saddleSetback: '50',
      handlebarDrop: '-40',
      reachMm: '510',
      aeroBarExtensionLength: '100',
      cleatPosition: '3mm back',
      notes: 'Race fit',
    } as never);

    const module = new RiderSetupNotes();
    const snapshot: RiderSetupSnapshot = await module.logSnapshot();

    expect(snapshot.riderName).toBe('Alice');
    expect(snapshot.bikeLabel).toBe('Cervelo P5');
    expect(snapshot.saddleHeight).toBe(720);
    expect(snapshot.saddleSetback).toBe(50);
    expect(snapshot.handlebarDrop).toBe(-40);
    expect(snapshot.reachMm).toBe(510);
    expect(snapshot.aeroBarExtensionLength).toBe(100);
    expect(snapshot.cleatPosition).toBe('3mm back');
    expect(snapshot.notes).toBe('Race fit');
    expect(snapshot.recordedAt).toBeTruthy();
  });

  it('omits optional fields when left blank', async () => {
    mockPrompt.mockResolvedValueOnce({
      riderName: 'Bob',
      bikeLabel: 'Trek Speed Concept',
      saddleHeight: '730',
      saddleSetback: '55',
      handlebarDrop: '-50',
      reachMm: '520',
      aeroBarExtensionLength: '',
      cleatPosition: '',
      notes: '',
    } as never);

    const module = new RiderSetupNotes();
    const snapshot: RiderSetupSnapshot = await module.logSnapshot();

    expect(snapshot.aeroBarExtensionLength).toBeUndefined();
    expect(snapshot.cleatPosition).toBeUndefined();
    expect(snapshot.notes).toBeUndefined();
  });
});

describe('RiderSetupNotes.logDelta', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('records a fit delta with all required fields', async () => {
    mockPrompt.mockResolvedValueOnce({
      component: 'Saddle height',
      measurement: 'Height',
      previousValue: '715',
      newValue: '720',
      unit: 'mm',
      observedEffect: 'Less knee pain at top of stroke',
    } as never);

    const module = new RiderSetupNotes();
    const delta: FitDelta = await module.logDelta();

    expect(delta.component).toBe('Saddle height');
    expect(delta.measurement).toBe('Height');
    expect(delta.previousValue).toBe('715');
    expect(delta.newValue).toBe('720');
    expect(delta.unit).toBe('mm');
    expect(delta.observedEffect).toBe('Less knee pain at top of stroke');
    expect(delta.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('RiderSetupNotes.viewSnapshots', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('prints message when no snapshots recorded', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const module = new RiderSetupNotes();
    module.viewSnapshots();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('No snapshots recorded yet')
    );
    consoleSpy.mockRestore();
  });

  it('prints snapshots after one is recorded', async () => {
    mockPrompt.mockResolvedValueOnce({
      riderName: 'Carol',
      bikeLabel: 'Specialized Shiv',
      saddleHeight: '700',
      saddleSetback: '48',
      handlebarDrop: '-35',
      reachMm: '500',
      aeroBarExtensionLength: '',
      cleatPosition: '',
      notes: '',
    } as never);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const module = new RiderSetupNotes();
    await module.logSnapshot();
    module.viewSnapshots();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SETUP SNAPSHOTS'));
    consoleSpy.mockRestore();
  });
});

describe('RiderSetupNotes.viewDeltas', () => {
  it('prints message when no deltas recorded', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const module = new RiderSetupNotes();
    module.viewDeltas();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('No fit changes logged yet')
    );
    consoleSpy.mockRestore();
  });
});

describe('RiderSetupNotes.start', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('runs log_snapshot flow without throwing', async () => {
    mockPrompt
      .mockResolvedValueOnce({ action: 'log_snapshot' } as never)
      .mockResolvedValueOnce({
        riderName: 'Dave',
        bikeLabel: 'Canyon Speedmax',
        saddleHeight: '725',
        saddleSetback: '52',
        handlebarDrop: '-45',
        reachMm: '515',
        aeroBarExtensionLength: '',
        cleatPosition: '',
        notes: '',
      } as never);

    const module = new RiderSetupNotes();
    await expect(module.start()).resolves.not.toThrow();
  });

  it('runs log_delta flow without throwing', async () => {
    mockPrompt
      .mockResolvedValueOnce({ action: 'log_delta' } as never)
      .mockResolvedValueOnce({
        component: 'Aero bar extension',
        measurement: 'Extension length',
        previousValue: '80',
        newValue: '100',
        unit: 'mm',
        observedEffect: 'More comfortable aero position',
      } as never);

    const module = new RiderSetupNotes();
    await expect(module.start()).resolves.not.toThrow();
  });

  it('runs view_snapshots flow without throwing', async () => {
    mockPrompt.mockResolvedValueOnce({ action: 'view_snapshots' } as never);

    const module = new RiderSetupNotes();
    await expect(module.start()).resolves.not.toThrow();
  });

  it('runs view_deltas flow without throwing', async () => {
    mockPrompt.mockResolvedValueOnce({ action: 'view_deltas' } as never);

    const module = new RiderSetupNotes();
    await expect(module.start()).resolves.not.toThrow();
  });
});
