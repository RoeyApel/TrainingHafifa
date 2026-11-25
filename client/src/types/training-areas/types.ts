import { TrainingAreaStatus, TrainingType } from './enums';

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  [TrainingType.LiveFire]: 'אש חיה',
  [TrainingType.Laser]: 'לייזר',
  [TrainingType.Dry]: 'יבש',
};

export const TRAINING_AREA_STATUS_LABELS: Record<TrainingAreaStatus, string> = {
  [TrainingAreaStatus.Active]: 'פעיל',
  [TrainingAreaStatus.Maintenance]: 'בתחזוקה',
};

export interface TrainingArea {
  id: number;
  areaName: string;
  trainingType: TrainingType;
  status: TrainingAreaStatus;
}
