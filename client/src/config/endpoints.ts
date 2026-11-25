/**
 * Same-origin paths for the backend and GeoServer. The dev and preview
 * servers proxy them (see vite.config.ts), so the browser needs no CORS.
 */
export const API_BASE_PATH = '/api';
export const GEOSERVER_BASE_PATH = '/geoserver';
