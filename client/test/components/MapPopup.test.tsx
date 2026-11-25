import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it } from 'vitest';
import { MapPopup } from '../../src/components/MapPopup';
import { MapProvider } from '../../src/components/MapProvider';
import { MapView } from '../../src/components/MapView';

describe('MapPopup', () => {
  // Regression: StrictMode runs state initializers twice, and an Overlay
  // built with the element in its initializer left the popup detached.
  it('renders its content inside the map overlay under StrictMode', () => {
    render(
      <StrictMode>
        <MapProvider>
          <MapView />
          <MapPopup position={[0, 0]}>
            <p>popup content</p>
          </MapPopup>
        </MapProvider>
      </StrictMode>,
    );

    const content = screen.getByText('popup content');
    expect(content.closest('.ol-overlay-container')).not.toBeNull();
    expect(screen.getByRole('region', { name: 'מפה' }).contains(content)).toBe(
      true,
    );
  });
});
