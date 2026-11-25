import { toFormValues } from '../mappers/forceFormValues';
import {
  type ForceEditorAction,
  type ForceEditorState,
  IDLE_EDITOR_STATE,
} from '../types/forces/types';
import { ForceEditorActionType, ForceEditorStep } from '../types/forces/enums';

/** Actions that don't fit the current step are ignored. */
export const forceEditorReducer = (
  state: ForceEditorState,
  action: ForceEditorAction,
): ForceEditorState => {
  switch (action.type) {
    case ForceEditorActionType.StartDrawing:
      return state.step === ForceEditorStep.Idle
        ? { step: ForceEditorStep.Drawing }
        : state;
    case ForceEditorActionType.Drawn:
      return state.step === ForceEditorStep.Drawing
        ? {
            step: ForceEditorStep.Details,
            force: null,
            geometry: action.geometry,
            draft: toFormValues(),
          }
        : state;
    case ForceEditorActionType.StartEditing:
      return state.step === ForceEditorStep.Idle
        ? {
            step: ForceEditorStep.Reshaping,
            force: action.force,
            geometry: action.force.geometry.clone(),
            draft: toFormValues(action.force),
          }
        : state;
    case ForceEditorActionType.ContinueToDetails:
      return state.step === ForceEditorStep.Reshaping
        ? { ...state, step: ForceEditorStep.Details }
        : state;
    case ForceEditorActionType.BackToShape:
      return state.step === ForceEditorStep.Details
        ? { ...state, step: ForceEditorStep.Reshaping, draft: action.draft }
        : state;
    case ForceEditorActionType.RequestDelete:
      return state.step === ForceEditorStep.Idle
        ? { step: ForceEditorStep.ConfirmingDelete, force: action.force }
        : state;
    case ForceEditorActionType.Reset:
      return IDLE_EDITOR_STATE;
  }
};
