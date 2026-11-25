import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { FC } from 'react';
import type { Force } from '../../types/forces/types';

interface DeleteForceDialogProps {
  force: Force;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteForceDialog: FC<DeleteForceDialogProps> = ({
  force,
  deleting,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open onClose={deleting ? undefined : onCancel}>
      <DialogTitle>מחיקת כוח</DialogTitle>
      <DialogContent>
        <DialogContentText>
          למחוק את הכוח &quot;{force.unitName}&quot; מהמפה?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={deleting}>
          ביטול
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          loading={deleting}
        >
          מחיקה
        </Button>
      </DialogActions>
    </Dialog>
  );
};
