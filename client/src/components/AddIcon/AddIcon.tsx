import { createSvgIcon } from '@mui/material/utils';

// Material Design path, inlined: the app needs two icons, not the
// @mui/icons-material package of 10,000+ files.
export const AddIcon = createSvgIcon(
  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />,
  'Add',
);
