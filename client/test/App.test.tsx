import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../src/app/App';
import { APP_NAME } from '../src/app/brand';
import { renderWithProviders } from './renderWithProviders';

describe('App', () => {
  it('shows the title bar and the map', () => {
    renderWithProviders(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: APP_NAME }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'מפה' })).toBeInTheDocument();
  });
});
