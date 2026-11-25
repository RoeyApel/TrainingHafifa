import { HttpError } from '../api/httpError';
import type { Notice } from '../types/notice/types';
import { SafetyOutcome } from '../types/forces/enums';
import type { ForceSaveResult } from '../types/forces/types';

const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

/**
 * The server answers in English; the user reads Hebrew, so the message is
 * chosen by outcome. Colors follow the spec: green, orange, red.
 */
const SAFETY_NOTICES: Record<SafetyOutcome, Notice> = {
  [SafetyOutcome.Approved]: {
    severity: 'success',
    message: 'האימון שובץ בהצלחה',
  },
  [SafetyOutcome.Warning]: {
    severity: 'warning',
    message: 'אזהרת בטיחות חמורה: השטח הוא שטח אש חיה',
  },
  [SafetyOutcome.Blocked]: {
    severity: 'error',
    message: 'השטח המבוקש סגור לתחזוקה',
  },
};

export const noticeForSave = (result: ForceSaveResult): Notice => {
  return SAFETY_NOTICES[result.outcome];
};

export const DELETED_NOTICE: Notice = {
  severity: 'success',
  message: 'הכוח נמחק',
};

/** True when the user can fix the failure by changing the polygon. */
export const isShapeRejected = (error: unknown): boolean => {
  return (
    error instanceof HttpError &&
    (error.status === HTTP_CONFLICT || error.status === HTTP_BAD_REQUEST)
  );
};

const GEOMETRY_ERROR_PREFIX = 'geom must be';
const SELF_INTERSECTION_MARKER = 'Self-intersection';

/**
 * The server's geometry errors are technical and in English: tell the user
 * what to do about the shape instead.
 */
const geometryErrorNotice = (serverMessage: string): Notice => {
  return {
    severity: 'error',
    message: serverMessage.includes(SELF_INTERSECTION_MARKER)
      ? 'הצורה שציירתם חוצה את עצמה. ערכו את הצורה כך שהקווים לא יחתכו'
      : 'הצורה שציירתם אינה תקינה. ערכו את הצורה או ציירו אותה מחדש',
  };
};

export const noticeForError = (error: unknown): Notice => {
  if (!(error instanceof HttpError)) {
    return { severity: 'error', message: 'אין תקשורת עם השרת' };
  }
  switch (error.status) {
    case HTTP_CONFLICT:
      return SAFETY_NOTICES[SafetyOutcome.Blocked];
    case HTTP_BAD_REQUEST:
      if (error.message.startsWith(GEOMETRY_ERROR_PREFIX)) {
        return geometryErrorNotice(error.message);
      }
      return {
        severity: 'error',
        message: `נתונים לא תקינים: ${error.message}`,
      };
    case HTTP_NOT_FOUND:
      return { severity: 'error', message: 'הכוח לא נמצא, ייתכן שנמחק' };
    default:
      return { severity: 'error', message: 'השמירה נכשלה, נסו שוב' };
  }
};
