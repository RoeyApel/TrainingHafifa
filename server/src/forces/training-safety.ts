import { type TrainingArea } from '../types/training-areas/types.js';
import {
  TrainingAreaStatus,
  TrainingType,
} from '../types/training-areas/enums.js';
import {
  SAFETY_MESSAGES,
  type SafetyAssessment,
} from '../types/forces/types.js';
import { SafetyOutcome } from '../types/forces/enums.js';

/** Maintenance wins over live fire: a blocked save never happens. */
export function assessTrainingSafety(
  overlappingAreas: TrainingArea[],
): SafetyAssessment {
  const outcome = decideOutcome(overlappingAreas);
  return { outcome, message: SAFETY_MESSAGES[outcome] };
}

function decideOutcome(overlappingAreas: TrainingArea[]): SafetyOutcome {
  if (
    overlappingAreas.some(
      (area) => area.status === TrainingAreaStatus.Maintenance,
    )
  ) {
    return SafetyOutcome.Blocked;
  }
  if (
    overlappingAreas.some((area) => area.trainingType === TrainingType.LiveFire)
  ) {
    return SafetyOutcome.Warning;
  }
  return SafetyOutcome.Approved;
}
