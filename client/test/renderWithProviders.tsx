import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { AppProviders } from '../src/AppProviders';

export const renderWithProviders = (ui: ReactElement): RenderResult => {
  return render(<AppProviders>{ui}</AppProviders>);
};
