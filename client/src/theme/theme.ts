import { createTheme } from '@mui/material/styles';
import { BACKGROUND_COLOR, BRAND_COLOR } from '../config/brand';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: BRAND_COLOR },
    background: { default: BACKGROUND_COLOR },
  },
  typography: {
    fontFamily: ['"Segoe UI"', 'Arial', 'sans-serif'].join(','),
  },
});
