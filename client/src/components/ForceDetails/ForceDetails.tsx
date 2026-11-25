import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { DetailsList } from '../DetailsList';
import { formatTrainingDate } from '../../utils/formatTrainingDate';
import type { Force } from '../../types/forces/types';

interface ForceDetailsProps {
  force: Force;
  onEdit: (force: Force) => void;
  onDelete: (force: Force) => void;
}

export const ForceDetails: FC<ForceDetailsProps> = ({
  force,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      <Typography variant="overline" color="text.secondary">
        כוח
      </Typography>
      <Typography variant="subtitle1" component="h2" gutterBottom>
        {force.unitName}
      </Typography>
      <DetailsList
        rows={[
          { label: 'מפקד', value: force.commanderName },
          { label: 'לוחמים', value: force.troopsCount },
          { label: 'כלי רכב', value: force.vehiclesCount },
          {
            label: 'תאריך אימון',
            value: formatTrainingDate(force.trainingDate),
          },
        ]}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            onEdit(force);
          }}
        >
          עריכה
        </Button>
        <Button
          size="small"
          color="error"
          onClick={() => {
            onDelete(force);
          }}
        >
          מחיקה
        </Button>
      </Stack>
    </>
  );
};
