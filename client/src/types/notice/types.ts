import type { AlertColor } from '@mui/material/Alert';

export interface Notice {
  severity: AlertColor;
  message: string;
}
