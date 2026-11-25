import { z } from 'zod';
import type { ForceAttributes, ForceFormValues } from '../types/forces/types';

/** VARCHAR(100) columns of force_deployment. */
const MAX_NAME_LENGTH = 100;
/** Largest value of the INTEGER count columns. */
const MAX_COUNT = 2_147_483_647;

const optionalText = z
  .string()
  .trim()
  .max(MAX_NAME_LENGTH, `עד ${MAX_NAME_LENGTH} תווים`)
  .transform((value) => value || null);

const optionalCount = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d+$/.test(value), 'מספר שלם, 0 ומעלה')
  .transform((value) => (value === '' ? null : Number(value)))
  .refine((value) => value === null || value <= MAX_COUNT, 'מספר גדול מדי');

const optionalDate = z
  .string()
  .refine(
    (value) => value === '' || !Number.isNaN(Date.parse(value)),
    'תאריך לא תקין',
  )
  .transform((value) => value || null);

/** Form fields are strings; parsing turns them into API attributes. */
export const forceFormSchema = z.object({
  unitName: z
    .string()
    .trim()
    .min(1, 'שם היחידה הוא שדה חובה')
    .max(MAX_NAME_LENGTH, `עד ${MAX_NAME_LENGTH} תווים`),
  commanderName: optionalText,
  troopsCount: optionalCount,
  vehiclesCount: optionalCount,
  trainingDate: optionalDate,
}) satisfies z.ZodType<ForceAttributes, ForceFormValues>;
