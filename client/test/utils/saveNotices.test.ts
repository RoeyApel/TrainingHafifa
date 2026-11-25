import { describe, expect, it } from 'vitest';
import {
  isShapeRejected,
  noticeForError,
  noticeForSave,
} from '../../src/utils/saveNotices';
import { SafetyOutcome } from '../../src/types/forces/enums';
import { HttpError } from '../../src/api/httpError';

describe('save notices', () => {
  it('shows approved in green and live-fire warnings in orange', () => {
    const base = { id: 1, message: 'from server' };

    expect(noticeForSave({ ...base, outcome: SafetyOutcome.Approved })).toEqual(
      { severity: 'success', message: 'האימון שובץ בהצלחה' },
    );
    expect(
      noticeForSave({ ...base, outcome: SafetyOutcome.Warning }).severity,
    ).toBe('warning');
  });

  it('shows a 409 (maintenance area) in red', () => {
    expect(noticeForError(new HttpError(409, 'closed'))).toEqual({
      severity: 'error',
      message: 'השטח המבוקש סגור לתחזוקה',
    });
  });

  it('explains a self-intersecting polygon in plain Hebrew', () => {
    const notice = noticeForError(
      new HttpError(
        400,
        'geom must be a valid GeoJSON Polygon in EPSG:32636: Self-intersection at (695016.7, 3556390.9)',
      ),
    );

    expect(notice).toEqual({
      severity: 'error',
      message: 'הצורה שציירתם חוצה את עצמה. ערכו את הצורה כך שהקווים לא יחתכו',
    });
  });

  it('gives a generic shape message for other geometry problems', () => {
    const notice = noticeForError(
      new HttpError(
        400,
        'geom must be a valid GeoJSON Polygon in EPSG:32636: not a GeoJSON Polygon',
      ),
    );

    expect(notice.message).toBe(
      'הצורה שציירתם אינה תקינה. ערכו את הצורה או ציירו אותה מחדש',
    );
  });

  it("includes the server's reason for other invalid data", () => {
    const notice = noticeForError(
      new HttpError(400, 'unitName must be a string'),
    );

    expect(notice.message).toContain('unitName must be a string');
  });

  it('reports a network failure without an HTTP status', () => {
    expect(noticeForError(new TypeError('fetch failed')).message).toBe(
      'אין תקשורת עם השרת',
    );
  });

  it('sends the user back to the shape only when the shape was rejected', () => {
    expect(isShapeRejected(new HttpError(409, ''))).toBe(true);
    expect(isShapeRejected(new HttpError(400, ''))).toBe(true);
    expect(isShapeRejected(new HttpError(502, ''))).toBe(false);
    expect(isShapeRejected(new Error('boom'))).toBe(false);
  });
});
