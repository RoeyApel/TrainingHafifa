import type { ForceAttributes, ForceFormValues } from '../types/forces/types';

export const toFormValues = (attributes?: ForceAttributes): ForceFormValues => {
  return {
    unitName: attributes?.unitName ?? '',
    commanderName: attributes?.commanderName ?? '',
    troopsCount: attributes?.troopsCount?.toString() ?? '',
    vehiclesCount: attributes?.vehiclesCount?.toString() ?? '',
    trainingDate: attributes?.trainingDate ?? '',
  };
};
