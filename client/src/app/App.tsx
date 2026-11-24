import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';
import { MapView } from '../features/map/components/MapView';
import { APP_NAME } from './brand';

/** The app's single screen: a title bar over a full-height map. */
export function App(): ReactElement {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1">
            {APP_NAME}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, minHeight: 0 }}>
        <MapView />
      </Box>
    </Box>
  );
}
