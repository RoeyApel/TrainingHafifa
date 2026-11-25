import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

/**
 * Emotion cache that mirrors MUI's styles for right-to-left layouts.
 * The theme's `direction` alone only flips some components; this flips every
 * left/right style (margins, paddings, positions).
 */
export const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});
