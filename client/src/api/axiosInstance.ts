import axios, { AxiosError } from 'axios';
import { API_BASE_PATH, GEOSERVER_BASE_PATH } from '../config/endpoints';
import { HttpError } from './httpError';

const REQUEST_TIMEOUT_MS = 15_000;

/** NestJS error bodies: `message` is a string, or a list for validation. */
const isErrorBody = (body: unknown): body is { message: string | string[] } => {
  return typeof body === 'object' && body !== null && 'message' in body;
};

const toHttpError = (error: AxiosError): HttpError | AxiosError => {
  const { response } = error;
  if (!response) {
    return error;
  }
  const body: unknown = response.data;
  if (!isErrorBody(body)) {
    return new HttpError(response.status, response.statusText);
  }
  const message = Array.isArray(body.message)
    ? body.message.join('; ')
    : body.message;
  return new HttpError(response.status, message);
};

const createInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: { Accept: 'application/json' },
  });
  instance.interceptors.response.use(undefined, (error: unknown) => {
    if (error instanceof AxiosError) {
      return Promise.reject(toHttpError(error));
    }
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  });
  return instance;
};

/** The backend, same-origin through the dev/preview proxy (no CORS). */
export default createInstance(API_BASE_PATH);
export const geoserverInstance = createInstance(GEOSERVER_BASE_PATH);
