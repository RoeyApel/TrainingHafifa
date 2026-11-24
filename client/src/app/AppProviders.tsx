import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { ReactElement, ReactNode } from 'react';
import { rtlCache } from './rtlCache';
import { theme } from './theme';

interface AppProvidersProps {
  children: ReactNode;
}

/** App-wide context: RTL styling, the MUI theme and the CSS baseline. */
export function AppProviders({ children }: AppProvidersProps): ReactElement {
  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
