import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { CloseIcon } from '../CloseIcon';
import { ForceDetails } from '../ForceDetails';
import type { Force } from '../../types/forces/types';
import { MapPopup } from '../MapPopup';
import { TrainingAreaDetails } from '../TrainingAreaDetails';
import type { Identify } from '../../types/identify/types';
import { IdentifiedFeatureType } from '../../types/identify/enums';

const POPUP_WIDTH_PX = 280;
const POPUP_MAX_HEIGHT_PX = 360;

interface FeatureInfoPopupProps {
  identify: Identify;
  onEditForce: (force: Force) => void;
  onDeleteForce: (force: Force) => void;
}

const PopupBody: FC<FeatureInfoPopupProps> = ({
  identify,
  onEditForce,
  onDeleteForce,
}) => {
  if (identify.isError || identify.result === undefined) {
    return <Alert severity="error">לא ניתן לטעון את פרטי המיקום</Alert>;
  }

  const { result } = identify;
  if (result === null) {
    return <Typography variant="body2">אין שטח או כוח בנקודה זו</Typography>;
  }
  return result.type === IdentifiedFeatureType.Force ? (
    <ForceDetails
      force={result.force}
      onEdit={onEditForce}
      onDelete={onDeleteForce}
    />
  ) : (
    <TrainingAreaDetails area={result.area} />
  );
};

export const FeatureInfoPopup: FC<FeatureInfoPopupProps> = (props) => {
  const { coordinate, isLoading, close } = props.identify;
  // Open once the answer is in: the popup is anchored at its bottom, so a
  // spinner that later swaps for the details would grow it out of view and
  // pan the map a second time.
  const isOpen = coordinate !== null && !isLoading;

  return (
    <MapPopup position={isOpen ? coordinate : undefined}>
      {isOpen && (
        <Paper
          elevation={6}
          role="dialog"
          aria-label="פרטי מיקום"
          sx={{
            position: 'relative',
            width: POPUP_WIDTH_PX,
            maxHeight: POPUP_MAX_HEIGHT_PX,
            overflowY: 'auto',
            p: 2,
            pt: 1,
          }}
        >
          <IconButton
            aria-label="סגירה"
            size="small"
            onClick={close}
            // Written for LTR: the RTL cache mirrors it to the left corner.
            sx={{ position: 'absolute', top: 4, right: 4 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <PopupBody {...props} />
        </Paper>
      )}
    </MapPopup>
  );
};
