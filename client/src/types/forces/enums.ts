export enum SafetyOutcome {
  Approved = 'approved',
  Warning = 'warning',
  /** Never in a response body: the server answers 409 instead. */
  Blocked = 'blocked',
}

/** The steps of adding or editing a force. */
export enum ForceEditorStep {
  Idle = 'idle',
  Drawing = 'drawing',
  Reshaping = 'reshaping',
  Details = 'details',
  ConfirmingDelete = 'confirmingDelete',
}

export enum ForceEditorActionType {
  StartDrawing = 'startDrawing',
  Drawn = 'drawn',
  StartEditing = 'startEditing',
  ContinueToDetails = 'continueToDetails',
  BackToShape = 'backToShape',
  RequestDelete = 'requestDelete',
  Reset = 'reset',
}

/** What the sketch layer lets the user do with the polygon. */
export enum SketchMode {
  Draw = 'draw',
  Modify = 'modify',
  View = 'view',
}
