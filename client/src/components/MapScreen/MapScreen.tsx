import Box from '@mui/material/Box';
import { useState, type FC } from 'react';
import type { Notice } from '../../types/notice/types';
import { NoticeSnackbar } from '../NoticeSnackbar';
import { DeleteForceDialog } from '../DeleteForceDialog';
import { ForceEditorToolbar } from '../ForceEditorToolbar';
import { ForceFormDialog } from '../ForceFormDialog';
import { ForceSketchLayer } from '../ForceSketchLayer';
import { useForceEditor } from '../../hooks/useForceEditor';
import type { Force, ForceEditorState } from '../../types/forces/types';
import { FeatureInfoPopup } from '../FeatureInfoPopup';
import { ForcesSidebar } from '../ForcesSidebar';
import { useForces } from '../../api/hooks/useForces';
import { useIdentify } from '../../api/hooks/useIdentify';
import { useFitToGeometry } from '../../hooks/useFitToGeometry';
import { useGeoServerLayers } from '../../hooks/useGeoServerLayers';
import { MapView } from '../MapView';
import { useMapClick } from '../../hooks/useMapClick';
import { useMapZoom } from '../../hooks/useMapZoom';
import {
  ForceEditorActionType,
  ForceEditorStep,
  SketchMode,
} from '../../types/forces/enums';

const sketchModeFor = (state: ForceEditorState): SketchMode => {
  switch (state.step) {
    case ForceEditorStep.Drawing:
      return SketchMode.Draw;
    case ForceEditorStep.Reshaping:
      return SketchMode.Modify;
    default:
      return SketchMode.View;
  }
};

export const MapScreen: FC = () => {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [selectedForceId, setSelectedForceId] = useState<number | null>(null);
  const { refreshForces } = useGeoServerLayers();
  const identify = useIdentify();
  const forces = useForces();
  const fitToGeometry = useFitToGeometry();
  const editor = useForceEditor({
    onForcesChanged: refreshForces,
    notify: setNotice,
  });
  const { state, dispatch } = editor;

  // While drawing or editing, clicks belong to the polygon, not to identify.
  useMapClick(identify.identify, state.step === ForceEditorStep.Idle);

  // The popup is anchored to a spot that moves under the user when zooming.
  useMapZoom(identify.close);

  const showForce = (force: Force) => {
    setSelectedForceId(force.id);
    identify.close();
    fitToGeometry(force.geometry);
  };
  const startEditing = (force: Force) => {
    identify.close();
    dispatch({ type: ForceEditorActionType.StartEditing, force });
  };
  const requestDelete = (force: Force) => {
    identify.close();
    dispatch({ type: ForceEditorActionType.RequestDelete, force });
  };
  const cancel = () => {
    dispatch({ type: ForceEditorActionType.Reset });
  };

  const hasShape =
    state.step === ForceEditorStep.Reshaping ||
    state.step === ForceEditorStep.Details;

  return (
    <Box
      sx={{
        display: 'flex',
        // Phones: the map on top, the list under it. Wider: the list beside it.
        flexDirection: { xs: 'column-reverse', md: 'row' },
        width: 1,
        height: 1,
      }}
    >
      <ForcesSidebar
        forces={forces.data}
        isLoading={forces.isPending}
        isError={forces.isError}
        selectedId={selectedForceId}
        onSelect={showForce}
      />
      <Box sx={{ position: 'relative', flex: 1, minWidth: 0, minHeight: 0 }}>
        <MapView />
        <ForceSketchLayer
          mode={sketchModeFor(state)}
          polygon={hasShape ? state.geometry : null}
          onDrawn={(geometry) => {
            dispatch({ type: ForceEditorActionType.Drawn, geometry });
          }}
        />
        <FeatureInfoPopup
          identify={identify}
          onEditForce={startEditing}
          onDeleteForce={requestDelete}
        />
        <ForceEditorToolbar state={state} dispatch={dispatch} />
        {state.step === ForceEditorStep.Details && (
          <ForceFormDialog
            isNew={state.force === null}
            draft={state.draft}
            saving={editor.isSaving}
            onSubmit={editor.save}
            onEditShape={(draft) => {
              dispatch({ type: ForceEditorActionType.BackToShape, draft });
            }}
            onCancel={cancel}
          />
        )}
        {state.step === ForceEditorStep.ConfirmingDelete && (
          <DeleteForceDialog
            force={state.force}
            deleting={editor.isDeleting}
            onConfirm={editor.confirmDelete}
            onCancel={cancel}
          />
        )}
        <NoticeSnackbar
          notice={notice}
          onClose={() => {
            setNotice(null);
          }}
        />
      </Box>
    </Box>
  );
};
