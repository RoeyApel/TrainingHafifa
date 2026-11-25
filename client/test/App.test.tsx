import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../src/App';
import { APP_NAME } from '../src/config/brand';
import { renderWithProviders } from './renderWithProviders';

describe('App', () => {
  it('shows the title bar, the map and the add-force button', () => {
    renderWithProviders(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: APP_NAME }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'מפה' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'הוספת כוח' }),
    ).toBeInTheDocument();
  });
});
