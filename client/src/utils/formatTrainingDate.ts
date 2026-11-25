const dateFormat = new Intl.DateTimeFormat('he-IL', { dateStyle: 'medium' });

/** Reads `2026-11-20` as a local calendar day, so no time zone shifts it. */
export const formatTrainingDate = (date: string | null): string | null => {
  return date === null ? null : dateFormat.format(new Date(`${date}T00:00`));
};
