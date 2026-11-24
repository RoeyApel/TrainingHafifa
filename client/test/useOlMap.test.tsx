import { render } from '@testing-library/react';
import type OlMap from 'ol/Map';
import { type ReactElement, StrictMode, useRef } from 'react';
import { describe, expect, it } from 'vitest';
import { useOlMap } from '../src/features/map/hooks/useOlMap';

function renderMapHost(): { maps: OlMap[]; unmount: () => void } {
  const maps: OlMap[] = [];

  function MapHost(): ReactElement {
    const targetRef = useRef<HTMLDivElement>(null);
    maps.push(useOlMap(targetRef));
    return <div ref={targetRef} data-testid="map-target" />;
  }

  const { unmount } = render(
    <StrictMode>
      <MapHost />
    </StrictMode>,
  );
  return { maps, unmount };
}

describe('useOlMap', () => {
  it('keeps one map across StrictMode remounts and attaches it', () => {
    const { maps } = renderMapHost();

    expect(new Set(maps).size).toBe(1);
    const map = maps[0];
    expect(map.getTargetElement()).toHaveAttribute('data-testid', 'map-target');
    expect(map.getLayers().getLength()).toBe(1);
  });

  it('detaches the map on unmount', () => {
    const { maps, unmount } = renderMapHost();

    unmount();

    expect(maps[0].getTarget()).toBeUndefined();
  });
});
