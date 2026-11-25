import type { Coordinate } from 'ol/coordinate';
import type { IdentifiedFeatureType } from './enums';
import type { Force } from '../forces/types';
import type { TrainingArea } from '../training-areas/types';

/** Prefix of every identify query, to invalidate them after an edit. */
export const IDENTIFY_QUERY_KEY = ['identify'] as const;

/** The one feature a click identifies: the smallest polygon under it. */
export type IdentifiedFeature =
  | { type: IdentifiedFeatureType.Force; force: Force }
  | { type: IdentifiedFeatureType.TrainingArea; area: TrainingArea };

export interface Identify {
  /** The clicked map coordinate; null when the popup is closed. */
  coordinate: Coordinate | null;
  /** Undefined until loaded; null when nothing is under the click. */
  result: IdentifiedFeature | null | undefined;
  isLoading: boolean;
  isError: boolean;
  identify: (coordinate: Coordinate) => void;
  close: () => void;
}
