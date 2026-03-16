import inquirer from 'inquirer';

export interface FitDelta {
  component: string;
  measurement: string;
  previousValue: string;
  newValue: string;
  unit: string;
  observedEffect: string;
  date: string;
}

export interface RiderSetupSnapshot {
  riderName: string;
  bikeLabel: string;
  saddleHeight: number;
  saddleSetback: number;
  handlebarDrop: number;
  reachMm: number;
  aeroBarExtensionLength?: number;
  cleatPosition?: string;
  notes?: string;
  recordedAt: string;
}

/**
 * Rider Setup Notes Module
 * Tracks rider-specific fit changes and their observed effects.
 */
export class RiderSetupNotes {
  private setupHistory: RiderSetupSnapshot[] = [];
  private fitDeltas: FitDelta[] = [];

  /**
   * Run the interactive rider setup notes workflow.
   */
  async start(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   RIDER SETUP NOTES                      ║');
    console.log('║   Fit Deltas & Cockpit Tweaks             ║');
    console.log('╚══════════════════════════════════════════╝\n');
    console.log('Track your fit changes and their effects to build a personal tuning history.\n');

    const { action } = await inquirer.prompt<{
      action: 'log_snapshot' | 'log_delta' | 'view_snapshots' | 'view_deltas';
    }>([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📐 Record current setup snapshot', value: 'log_snapshot' },
          { name: '🔧 Log a fit change (delta)', value: 'log_delta' },
          { name: '📋 View recorded setup snapshots', value: 'view_snapshots' },
          { name: '📝 View fit change history', value: 'view_deltas' },
        ],
      },
    ]);

    switch (action) {
      case 'log_snapshot':
        await this.logSnapshot();
        break;
      case 'log_delta':
        await this.logDelta();
        break;
      case 'view_snapshots':
        this.viewSnapshots();
        break;
      case 'view_deltas':
        this.viewDeltas();
        break;
    }
  }

  /**
   * Interactively record a full setup snapshot.
   */
  async logSnapshot(): Promise<RiderSetupSnapshot> {
    console.log('\n--- RECORD SETUP SNAPSHOT ---\n');
    console.log('Enter your current bike fit measurements.\n');

    const answers = await inquirer.prompt<{
      riderName: string;
      bikeLabel: string;
      saddleHeight: string;
      saddleSetback: string;
      handlebarDrop: string;
      reachMm: string;
      aeroBarExtensionLength: string;
      cleatPosition: string;
      notes: string;
    }>([
      { type: 'input', name: 'riderName', message: 'Rider name:' },
      { type: 'input', name: 'bikeLabel', message: 'Bike label (e.g. "Cervelo P5 Race"):' },
      {
        type: 'input',
        name: 'saddleHeight',
        message: 'Saddle height — bottom bracket centre to saddle top (mm):',
        validate: (v: string) => (!isNaN(parseFloat(v)) ? true : 'Enter a number in mm'),
      },
      {
        type: 'input',
        name: 'saddleSetback',
        message: 'Saddle setback — nose of saddle to BB centre line (mm):',
        validate: (v: string) => (!isNaN(parseFloat(v)) ? true : 'Enter a number in mm'),
      },
      {
        type: 'input',
        name: 'handlebarDrop',
        message: 'Handlebar/pad drop — saddle top to pad height, negative = pads below saddle (mm):',
        validate: (v: string) => (!isNaN(parseFloat(v)) ? true : 'Enter a number in mm'),
      },
      {
        type: 'input',
        name: 'reachMm',
        message: 'Reach — saddle nose to centre of bars/pads (mm):',
        validate: (v: string) => (!isNaN(parseFloat(v)) ? true : 'Enter a number in mm'),
      },
      {
        type: 'input',
        name: 'aeroBarExtensionLength',
        message: 'Aero bar extension length (mm, leave blank if N/A):',
      },
      {
        type: 'input',
        name: 'cleatPosition',
        message: 'Cleat position note (e.g. "3mm back from ball of foot", leave blank if unchanged):',
      },
      { type: 'input', name: 'notes', message: 'Additional notes (optional):' },
    ]);

    const snapshot: RiderSetupSnapshot = {
      riderName: answers.riderName,
      bikeLabel: answers.bikeLabel,
      saddleHeight: parseFloat(answers.saddleHeight),
      saddleSetback: parseFloat(answers.saddleSetback),
      handlebarDrop: parseFloat(answers.handlebarDrop),
      reachMm: parseFloat(answers.reachMm),
      aeroBarExtensionLength: answers.aeroBarExtensionLength
        ? parseFloat(answers.aeroBarExtensionLength)
        : undefined,
      cleatPosition: answers.cleatPosition || undefined,
      notes: answers.notes || undefined,
      recordedAt: new Date().toISOString(),
    };

    this.setupHistory.push(snapshot);
    console.log('\n✅ Setup snapshot recorded.\n');
    this.printSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Interactively log a fit delta (a single component change and its observed effect).
   */
  async logDelta(): Promise<FitDelta> {
    console.log('\n--- LOG FIT CHANGE (DELTA) ---\n');
    console.log('Record a single adjustment and the effect you observed.\n');

    const answers = await inquirer.prompt<{
      component: string;
      measurement: string;
      previousValue: string;
      newValue: string;
      unit: string;
      observedEffect: string;
    }>([
      {
        type: 'input',
        name: 'component',
        message: 'Component changed (e.g. "Saddle height", "Aero bar extension"):',
      },
      {
        type: 'input',
        name: 'measurement',
        message: 'Measurement or dimension changed (e.g. "Height", "Extension length"):',
      },
      { type: 'input', name: 'previousValue', message: 'Previous value:' },
      { type: 'input', name: 'newValue', message: 'New value:' },
      { type: 'input', name: 'unit', message: 'Unit (e.g. mm, cm, degrees):' },
      {
        type: 'input',
        name: 'observedEffect',
        message: 'Observed effect (e.g. "Reduced knee pain at top of pedal stroke"):',
      },
    ]);

    const delta: FitDelta = {
      ...answers,
      date: new Date().toISOString().split('T')[0],
    };

    this.fitDeltas.push(delta);
    console.log('\n✅ Fit change logged.\n');
    this.printDelta(delta);
    return delta;
  }

  viewSnapshots(): void {
    if (this.setupHistory.length === 0) {
      console.log('\nNo snapshots recorded yet. Use "Record current setup snapshot" to add one.\n');
      return;
    }
    console.log(`\n--- SETUP SNAPSHOTS (${this.setupHistory.length}) ---\n`);
    this.setupHistory.forEach((s, i) => {
      console.log(`Snapshot ${i + 1}:`);
      this.printSnapshot(s);
    });
  }

  viewDeltas(): void {
    if (this.fitDeltas.length === 0) {
      console.log('\nNo fit changes logged yet. Use "Log a fit change" to record one.\n');
      return;
    }
    console.log(`\n--- FIT CHANGE HISTORY (${this.fitDeltas.length} entries) ---\n`);
    this.fitDeltas.forEach((d, i) => {
      console.log(`Change ${i + 1}:`);
      this.printDelta(d);
    });
  }

  private printSnapshot(s: RiderSetupSnapshot): void {
    console.log(`  Rider: ${s.riderName}  |  Bike: ${s.bikeLabel}`);
    console.log(`  Recorded: ${s.recordedAt}`);
    console.log(`  Saddle height:   ${s.saddleHeight} mm`);
    console.log(`  Saddle setback:  ${s.saddleSetback} mm`);
    console.log(`  Handlebar drop:  ${s.handlebarDrop} mm`);
    console.log(`  Reach:           ${s.reachMm} mm`);
    if (s.aeroBarExtensionLength !== undefined) {
      console.log(`  Aero extension:  ${s.aeroBarExtensionLength} mm`);
    }
    if (s.cleatPosition) {
      console.log(`  Cleat position:  ${s.cleatPosition}`);
    }
    if (s.notes) {
      console.log(`  Notes:           ${s.notes}`);
    }
    console.log();
  }

  private printDelta(d: FitDelta): void {
    console.log(`  Date:     ${d.date}`);
    console.log(`  Change:   ${d.component} — ${d.measurement}`);
    console.log(`  Before:   ${d.previousValue} ${d.unit}`);
    console.log(`  After:    ${d.newValue} ${d.unit}`);
    console.log(`  Effect:   ${d.observedEffect}`);
    console.log();
  }
}

export default RiderSetupNotes;
