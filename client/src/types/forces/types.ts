import type { Geometry as GeoJsonGeometry } from 'geojson';
import type { Polygon } from 'ol/geom';
import {
  type ForceEditorActionType,
  ForceEditorStep,
  type SafetyOutcome,
} from './enums';

/** Key of the list of every active force, to refetch it after an edit. */
export const FORCES_QUERY_KEY = ['forces'] as const;

export const IDLE_EDITOR_STATE: ForceEditorState = {
  step: ForceEditorStep.Idle,
};

export interface ForceAttributes {
  unitName: string;
  commanderName: string | null;
  troopsCount: number | null;
  vehiclesCount: number | null;
  /** YYYY-MM-DD */
  trainingDate: string | null;
}

export interface Force extends ForceAttributes {
  id: number;
  /** In the map's projection. */
  geometry: Polygon;
}

/** Body of POST /forces and PATCH /forces/:id (geometry in EPSG:32636). */
export interface ForceRequestBody extends ForceAttributes {
  geom: GeoJsonGeometry;
}

/** Response of POST /forces and PATCH /forces/:id. */
export interface ForceSaveResult {
  id: number;
  outcome: SafetyOutcome.Approved | SafetyOutcome.Warning;
  message: string;
}

/** A create (`force` is null) or an update, with the polygon in map units. */
export interface SaveForceRequest {
  force: Force | null;
  attributes: ForceAttributes;
  geometry: Polygon;
}

export interface ForceFormValues {
  unitName: string;
  commanderName: string;
  troopsCount: string;
  vehiclesCount: string;
  trainingDate: string;
}

/**
 * A force being added or edited. `force` is null for a new force.
 * `geometry` is a working copy: the original stays untouched until the save
 * succeeds. `draft` keeps the form's text while the user changes the shape.
 */
export interface ForceDraft {
  force: Force | null;
  geometry: Polygon;
  draft: ForceFormValues;
}

export type ForceEditorState =
  | { step: ForceEditorStep.Idle }
  | { step: ForceEditorStep.Drawing }
  | ({ step: ForceEditorStep.Reshaping } & ForceDraft)
  | ({ step: ForceEditorStep.Details } & ForceDraft)
  | { step: ForceEditorStep.ConfirmingDelete; force: Force };

export type ForceEditorAction =
  | { type: ForceEditorActionType.StartDrawing }
  | { type: ForceEditorActionType.Drawn; geometry: Polygon }
  | { type: ForceEditorActionType.StartEditing; force: Force }
  | { type: ForceEditorActionType.ContinueToDetails }
  | { type: ForceEditorActionType.BackToShape; draft: ForceFormValues }
  | { type: ForceEditorActionType.RequestDelete; force: Force }
  | { type: ForceEditorActionType.Reset };
