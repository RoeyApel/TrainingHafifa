import { describe, expect, it } from 'vitest';
import { toFormValues } from '../../src/mappers/forceFormValues';
import { forceFormSchema } from '../../src/schemas/forceFormSchema';
import { aForce } from '../fixtures';

const filled = {
  unitName: '  גדוד 50 ',
  commanderName: 'רס"ן כהן',
  troopsCount: '120',
  vehiclesCount: '',
  trainingDate: '2026-11-20',
};

describe('forceFormSchema', () => {
  it('turns form strings into API attributes, empty fields into null', () => {
    expect(forceFormSchema.parse(filled)).toEqual({
      unitName: 'גדוד 50',
      commanderName: 'רס"ן כהן',
      troopsCount: 120,
      vehiclesCount: null,
      trainingDate: '2026-11-20',
    });
  });

  it.each([
    ['unitName', '   ', 'שם היחידה הוא שדה חובה'],
    ['unitName', 'א'.repeat(101), 'עד 100 תווים'],
    ['troopsCount', '-3', 'מספר שלם, 0 ומעלה'],
    ['troopsCount', '2.5', 'מספר שלם, 0 ומעלה'],
    ['vehiclesCount', '9999999999', 'מספר גדול מדי'],
    ['trainingDate', 'not a date', 'תאריך לא תקין'],
  ])('rejects %s = %j', (field, value, message) => {
    const result = forceFormSchema.safeParse({ ...filled, [field]: value });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      path: [field],
      message,
    });
  });
});

describe('toFormValues', () => {
  it('prefills from a saved force and round-trips through the schema', () => {
    const force = aForce({ commanderName: null, vehiclesCount: 0 });

    const values = toFormValues(force);

    expect(values).toMatchObject({ commanderName: '', vehiclesCount: '0' });
    expect(forceFormSchema.parse(values)).toMatchObject({
      unitName: force.unitName,
      commanderName: null,
      vehiclesCount: 0,
    });
  });
});
