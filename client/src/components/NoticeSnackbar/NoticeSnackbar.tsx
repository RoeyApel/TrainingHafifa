import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import type { FC } from 'react';
import type { Notice } from '../../types/notice/types';

const AUTO_HIDE_MS = 6_000;

interface NoticeSnackbarProps {
  notice: Notice | null;
  onClose: () => void;
}

export const NoticeSnackbar: FC<NoticeSnackbarProps> = ({
  notice,
  onClose,
}) => {
  return (
    <Snackbar
      open={notice !== null}
      autoHideDuration={AUTO_HIDE_MS}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {/* Keeps the last notice rendered while the snackbar fades out. */}
      <Alert
        severity={notice?.severity}
        variant="filled"
        onClose={onClose}
        sx={{ width: 1 }}
      >
        {notice?.message}
      </Alert>
    </Snackbar>
  );
};
