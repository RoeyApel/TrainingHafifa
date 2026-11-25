import type Feature from 'ol/Feature';

/** GeoServer feature ids look like `force_deployment.7`; returns 7. */
export const parseFeatureId = (feature: Feature): number => {
  const featureId = String(feature.getId());
  const id = Number(featureId.slice(featureId.lastIndexOf('.') + 1));
  if (!Number.isSafeInteger(id)) {
    throw new Error(`Unexpected GeoServer feature id: ${featureId}`);
  }
  return id;
};
