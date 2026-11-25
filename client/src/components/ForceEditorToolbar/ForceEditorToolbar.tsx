import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { AddIcon } from '../AddIcon';
import type {
  ForceEditorAction,
  ForceEditorState,
} from '../../types/forces/types';
import {
  ForceEditorActionType,
  ForceEditorStep,
} from '../../types/forces/enums';

const EDGE_OFFSET = 16;

interface ForceEditorToolbarProps {
  state: ForceEditorState;
  dispatch: (action: ForceEditorAction) => void;
}

interface HintBarProps {
  hint: string;
  onCancel: () => void;
  onContinue?: () => void;
}

const HintBar: FC<HintBarProps> = ({ hint, onCancel, onContinue }) => {
  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: EDGE_OFFSET,
        insetInline: 0,
        mx: 'auto',
        width: 'fit-content',
        maxWidth: `calc(100% - ${EDGE_OFFSET * 2}px)`,
        px: 2,
        py: 1,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="body2">{hint}</Typography>
        {onContinue && (
          <Button variant="contained" size="small" onClick={onContinue}>
            המשך
          </Button>
        )}
        <Button size="small" onClick={onCancel}>
          ביטול
        </Button>
      </Stack>
    </Paper>
  );
};

export const ForceEditorToolbar: FC<ForceEditorToolbarProps> = ({
  state,
  dispatch,
}) => {
  const cancel = () => {
    dispatch({ type: ForceEditorActionType.Reset });
  };

  switch (state.step) {
    case ForceEditorStep.Idle:
      return (
        <Fab
          color="primary"
          variant="extended"
          onClick={() => {
            dispatch({ type: ForceEditorActionType.StartDrawing });
          }}
          sx={{
            position: 'absolute',
            bottom: EDGE_OFFSET * 2,
            right: EDGE_OFFSET,
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          הוספת כוח
        </Fab>
      );
    case ForceEditorStep.Drawing:
      return (
        <HintBar
          hint="לחצו על המפה כדי לסמן את פינות השטח, לחיצה כפולה לסיום"
          onCancel={cancel}
        />
      );
    case ForceEditorStep.Reshaping:
      return (
        <HintBar
          hint="גררו את הקודקודים כדי לשנות את השטח"
          onCancel={cancel}
          onContinue={() => {
            dispatch({ type: ForceEditorActionType.ContinueToDetails });
          }}
        />
      );
    default:
      return null;
  }
};
