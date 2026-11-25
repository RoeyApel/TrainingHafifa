import { describe, expect, it } from 'vitest';
import { toFormValues } from '../../src/mappers/forceFormValues';
import { forceEditorReducer } from '../../src/state/forceEditorReducer';
import {
  type ForceEditorState,
  IDLE_EDITOR_STATE as IDLE,
} from '../../src/types/forces/types';
import { aForce, square } from '../fixtures';
import {
  ForceEditorActionType,
  ForceEditorStep,
} from '../../src/types/forces/enums';

describe('forceEditorReducer', () => {
  it('adds a force: idle → drawing → details with an empty form', () => {
    const geometry = square();

    const drawing = forceEditorReducer(IDLE, {
      type: ForceEditorActionType.StartDrawing,
    });
    const details = forceEditorReducer(drawing, {
      type: ForceEditorActionType.Drawn,
      geometry,
    });

    expect(details).toEqual({
      step: ForceEditorStep.Details,
      force: null,
      geometry,
      draft: toFormValues(),
    });
  });

  it('edits a copy of the polygon, so a cancelled edit leaves the force unchanged', () => {
    const force = aForce();

    const state = forceEditorReducer(IDLE, {
      type: ForceEditorActionType.StartEditing,
      force,
    });

    expect(state.step).toBe('reshaping');
    if (state.step !== ForceEditorStep.Reshaping) return;
    expect(state.geometry).not.toBe(force.geometry);
    expect(state.geometry.getCoordinates()).toEqual(
      force.geometry.getCoordinates(),
    );
    expect(state.draft.unitName).toBe(force.unitName);
  });

  it('keeps the typed draft when going back to change the shape', () => {
    const force = aForce();
    const reshaping = forceEditorReducer(IDLE, {
      type: ForceEditorActionType.StartEditing,
      force,
    });
    const details = forceEditorReducer(reshaping, {
      type: ForceEditorActionType.ContinueToDetails,
    });
    const draft = { ...toFormValues(force), unitName: 'גדוד 51' };

    const back = forceEditorReducer(details, {
      type: ForceEditorActionType.BackToShape,
      draft,
    });

    expect(back).toMatchObject({
      step: ForceEditorStep.Reshaping,
      force,
      draft,
    });
  });

  it('ignores actions that do not fit the current step', () => {
    const drawing: ForceEditorState = { step: ForceEditorStep.Drawing };

    expect(
      forceEditorReducer(drawing, {
        type: ForceEditorActionType.RequestDelete,
        force: aForce(),
      }),
    ).toBe(drawing);
    expect(
      forceEditorReducer(IDLE, {
        type: ForceEditorActionType.ContinueToDetails,
      }),
    ).toBe(IDLE);
  });

  it('returns to idle on reset from any step', () => {
    const confirming = forceEditorReducer(IDLE, {
      type: ForceEditorActionType.RequestDelete,
      force: aForce(),
    });

    expect(
      forceEditorReducer(confirming, { type: ForceEditorActionType.Reset }),
    ).toBe(IDLE);
  });
});
