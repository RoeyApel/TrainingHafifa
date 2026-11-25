import { useCallback, useReducer } from 'react';
import { useDeleteForce } from '../api/hooks/useDeleteForce';
import { useSaveForce } from '../api/hooks/useSaveForce';
import { toFormValues } from '../mappers/forceFormValues';
import { forceEditorReducer } from '../state/forceEditorReducer';
import {
  type ForceAttributes,
  type ForceEditorAction,
  type ForceEditorState,
  IDLE_EDITOR_STATE,
} from '../types/forces/types';
import type { Notice } from '../types/notice/types';
import {
  DELETED_NOTICE,
  isShapeRejected,
  noticeForError,
  noticeForSave,
} from '../utils/saveNotices';
import { ForceEditorActionType, ForceEditorStep } from '../types/forces/enums';

interface UseForceEditorOptions {
  onForcesChanged: () => void;
  notify: (notice: Notice) => void;
}

export interface ForceEditor {
  state: ForceEditorState;
  dispatch: (action: ForceEditorAction) => void;
  save: (attributes: ForceAttributes) => void;
  confirmDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export const useForceEditor = ({
  onForcesChanged,
  notify,
}: UseForceEditorOptions): ForceEditor => {
  const [state, dispatch] = useReducer(forceEditorReducer, IDLE_EDITOR_STATE);
  const saveMutation = useSaveForce();
  const deleteMutation = useDeleteForce();

  const afterWrite = useCallback(
    (notice: Notice) => {
      onForcesChanged();
      notify(notice);
      dispatch({ type: ForceEditorActionType.Reset });
    },
    [onForcesChanged, notify],
  );

  const save = useCallback(
    (attributes: ForceAttributes) => {
      if (state.step !== ForceEditorStep.Details) {
        return;
      }
      saveMutation.mutate(
        { force: state.force, attributes, geometry: state.geometry },
        {
          onSuccess: (result) => {
            afterWrite(noticeForSave(result));
          },
          onError: (error) => {
            notify(noticeForError(error));
            // Blocked or invalid polygons: let the user move or fix the shape.
            if (isShapeRejected(error)) {
              dispatch({
                type: ForceEditorActionType.BackToShape,
                draft: toFormValues(attributes),
              });
            }
          },
        },
      );
    },
    [state, saveMutation, afterWrite, notify],
  );

  const confirmDelete = useCallback(() => {
    if (state.step !== ForceEditorStep.ConfirmingDelete) {
      return;
    }
    deleteMutation.mutate(state.force, {
      onSuccess: () => {
        afterWrite(DELETED_NOTICE);
      },
      onError: (error) => {
        notify(noticeForError(error));
        dispatch({ type: ForceEditorActionType.Reset });
      },
    });
  }, [state, deleteMutation, afterWrite, notify]);

  return {
    state,
    dispatch,
    save,
    confirmDelete,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
