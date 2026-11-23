export enum SafetyOutcome {
  /** Overlaps an area closed for maintenance: must not be saved. */
  Blocked = 'blocked',
  /** Overlaps a live-fire area: saved, but the user must be warned. */
  Warning = 'warning',
  Approved = 'approved',
}
