import { describe, expect, it } from '@jest/globals';
import { assessTrainingSafety } from '../../../src/forces/training-safety.js';
import { SafetyOutcome } from '../../../src/types/forces/enums.js';
import { type TrainingArea } from '../../../src/types/training-areas/types.js';
import {
  TrainingAreaStatus,
  TrainingType,
} from '../../../src/types/training-areas/enums.js';

const area = (overrides: Partial<TrainingArea>): TrainingArea => ({
  areaName: 'שטח',
  trainingType: TrainingType.Dry,
  status: TrainingAreaStatus.Active,
  ...overrides,
});

describe('assessTrainingSafety', () => {
  it('approves a force that overlaps no training area', () => {
    expect(assessTrainingSafety([])).toEqual({
      outcome: SafetyOutcome.Approved,
      message: 'האימון נקבע בהצלחה',
    });
  });

  it('approves a force that overlaps only active non-live-fire areas', () => {
    const result = assessTrainingSafety([
      area({ trainingType: TrainingType.Dry }),
      area({ trainingType: TrainingType.Laser }),
    ]);

    expect(result.outcome).toBe(SafetyOutcome.Approved);
  });

  it('warns when the force overlaps a live-fire area', () => {
    expect(
      assessTrainingSafety([area({ trainingType: TrainingType.LiveFire })]),
    ).toEqual({
      outcome: SafetyOutcome.Warning,
      message: 'התראת בטיחות חמורה',
    });
  });

  it('blocks when the force overlaps an area closed for maintenance', () => {
    expect(
      assessTrainingSafety([area({ status: TrainingAreaStatus.Maintenance })]),
    ).toEqual({
      outcome: SafetyOutcome.Blocked,
      message: 'השטח המבוקש סגור לתחזוקה',
    });
  });

  it('blocks even when a live-fire area is overlapped too', () => {
    const result = assessTrainingSafety([
      area({ trainingType: TrainingType.LiveFire }),
      area({ status: TrainingAreaStatus.Maintenance }),
    ]);

    expect(result.outcome).toBe(SafetyOutcome.Blocked);
  });
});
