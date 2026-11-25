import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Force } from '../../types/forces/types';
import { formatTrainingDate } from '../../utils/formatTrainingDate';
import { ForceFootprint } from '../ForceFootprint';

const SIDEBAR_WIDTH_PX = 300;
/** On a phone the list sits under the map, so it takes a slice of the height. */
const SIDEBAR_STACKED_HEIGHT = '35%';
const SELECTED_MARKER_WIDTH_PX = 4;
const SINGLE_UNIT_LABEL = 'יחידה אחת';

interface ForcesSidebarProps {
  forces: Force[] | undefined;
  isLoading: boolean;
  isError: boolean;
  /** The force the map was last zoomed to, if any. */
  selectedId: number | null;
  onSelect: (force: Force) => void;
}

const countLabel = (count: number): string => {
  return count === 1 ? SINGLE_UNIT_LABEL : `${String(count)} יחידות`;
};

const SidebarBody: FC<ForcesSidebarProps> = ({
  forces,
  isLoading,
  isError,
  selectedId,
  onSelect,
}) => {
  if (isLoading) {
    return (
      <CircularProgress
        size={24}
        aria-label="טוען"
        sx={{ display: 'block', mx: 'auto', my: 3 }}
      />
    );
  }
  if (isError || !forces) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        לא ניתן לטעון את רשימת היחידות
      </Alert>
    );
  }
  if (forces.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        עדיין אין יחידות. לחצו על ״הוספת כוח״ כדי לשבץ את הראשונה.
      </Typography>
    );
  }
  return (
    <List disablePadding>
      {forces.map((force) => {
        const trainingDate = formatTrainingDate(force.trainingDate);
        return (
          <ListItemButton
            key={force.id}
            selected={force.id === selectedId}
            onClick={() => {
              onSelect(force);
            }}
            sx={{
              gap: 1.5,
              px: 2,
              py: 1,
              borderBottom: 1,
              borderColor: 'divider',
              borderInlineStart: SELECTED_MARKER_WIDTH_PX,
              borderInlineStartStyle: 'solid',
              borderInlineStartColor: 'transparent',
              '&.Mui-selected': {
                // sx maps palette names only for the physical border colors.
                borderInlineStartColor: (theme) => theme.palette.primary.main,
              },
            }}
          >
            <ForceFootprint polygon={force.geometry} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {force.unitName}
              </Typography>
              {force.commanderName && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {force.commanderName}
                </Typography>
              )}
              {trainingDate && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', fontVariantNumeric: 'tabular-nums' }}
                  noWrap
                >
                  {trainingDate}
                </Typography>
              )}
            </Box>
          </ListItemButton>
        );
      })}
    </List>
  );
};

export const ForcesSidebar: FC<ForcesSidebarProps> = (props) => {
  return (
    <Box
      component="aside"
      aria-label="יחידות מתאמנות"
      sx={{
        flexShrink: 0,
        width: { md: SIDEBAR_WIDTH_PX },
        height: { xs: SIDEBAR_STACKED_HEIGHT, md: 1 },
        overflowY: 'auto',
        bgcolor: 'background.paper',
        borderTop: { xs: 1, md: 0 },
        borderInlineEnd: { md: 1 },
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          px: 2,
          py: 1.5,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" component="h2">
          יחידות מתאמנות
        </Typography>
        {props.forces && props.forces.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            {countLabel(props.forces.length)}
          </Typography>
        )}
      </Box>
      <SidebarBody {...props} />
    </Box>
  );
};
