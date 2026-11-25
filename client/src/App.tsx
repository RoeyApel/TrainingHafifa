import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { MapProvider } from './components/MapProvider';
import { APP_NAME } from './config/brand';
import { MapScreen } from './components/MapScreen';

export const App: FC = () => {
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
        <MapProvider>
          <MapScreen />
        </MapProvider>
      </Box>
    </Box>
  );
};
