import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { DetailsList } from '../DetailsList';
import {
  TRAINING_AREA_STATUS_LABELS,
  TRAINING_TYPE_LABELS,
  type TrainingArea,
} from '../../types/training-areas/types';

interface TrainingAreaDetailsProps {
  area: TrainingArea;
}

export const TrainingAreaDetails: FC<TrainingAreaDetailsProps> = ({ area }) => {
  return (
    <>
      <Typography variant="overline" color="text.secondary">
        שטח אימונים
      </Typography>
      <Typography variant="subtitle1" component="h2" gutterBottom>
        {area.areaName}
      </Typography>
      <DetailsList
        rows={[
          {
            label: 'סוג אימון',
            value: TRAINING_TYPE_LABELS[area.trainingType],
          },
          { label: 'סטטוס', value: TRAINING_AREA_STATUS_LABELS[area.status] },
        ]}
      />
    </>
  );
};
