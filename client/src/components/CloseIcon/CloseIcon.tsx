import { createSvgIcon } from '@mui/material/utils';

// Material Design path, inlined: the app needs two icons, not the
// @mui/icons-material package of 10,000+ files.
export const CloseIcon = createSvgIcon(
  <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />,
  'Close',
);
