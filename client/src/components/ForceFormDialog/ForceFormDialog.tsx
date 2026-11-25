import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { forceFormSchema } from '../../schemas/forceFormSchema';
import type {
  ForceAttributes,
  ForceFormValues,
} from '../../types/forces/types';

interface ForceFormProps {
  isNew: boolean;
  draft: ForceFormValues;
  saving: boolean;
  onSubmit: (attributes: ForceAttributes) => void;
  onEditShape: (draft: ForceFormValues) => void;
  onCancel: () => void;
}

const ForceForm: FC<ForceFormProps> = ({
  isNew,
  draft,
  saving,
  onSubmit,
  onEditShape,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForceFormValues, unknown, ForceAttributes>({
    resolver: zodResolver(forceFormSchema),
    defaultValues: draft,
  });

  const fieldProps = (name: keyof ForceFormValues) => ({
    ...register(name),
    id: `force-${name}`,
    error: errors[name] !== undefined,
    helperText: errors[name]?.message,
    disabled: saving,
    fullWidth: true,
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
    >
      <DialogTitle>{isNew ? 'כוח חדש' : 'עריכת כוח'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="שם היחידה"
            required
            autoFocus
            {...fieldProps('unitName')}
          />
          <TextField label="שם המפקד" {...fieldProps('commanderName')} />
          <TextField
            label="מספר לוחמים"
            inputMode="numeric"
            {...fieldProps('troopsCount')}
          />
          <TextField
            label="מספר כלי רכב"
            inputMode="numeric"
            {...fieldProps('vehiclesCount')}
          />
          <TextField
            label="תאריך אימון"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            {...fieldProps('trainingDate')}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onEditShape(getValues());
          }}
          disabled={saving}
          sx={{ mr: 'auto' }}
        >
          עריכת הצורה
        </Button>
        <Button onClick={onCancel} disabled={saving}>
          ביטול
        </Button>
        <Button type="submit" variant="contained" loading={saving}>
          שמירה
        </Button>
      </DialogActions>
    </form>
  );
};

/**
 * Render it only while the form step is active: every mount starts a fresh
 * form from `draft`.
 */
export const ForceFormDialog: FC<ForceFormProps> = (props) => {
  return (
    <Dialog
      open
      onClose={props.saving ? undefined : props.onCancel}
      fullWidth
      maxWidth="xs"
    >
      <ForceForm {...props} />
    </Dialog>
  );
};
