import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ForcesSidebar } from '../../src/components/ForcesSidebar';
import { aForce } from '../fixtures';

const noop = (): void => undefined;

describe('ForcesSidebar', () => {
  it('lists every unit with its training date', () => {
    render(
      <ForcesSidebar
        forces={[
          aForce({ id: 1, unitName: 'גדוד 50' }),
          aForce({ id: 2, unitName: 'גדוד 51', trainingDate: null }),
        ]}
        isLoading={false}
        isError={false}
        selectedId={null}
        onSelect={noop}
      />,
    );

    expect(screen.getByRole('button', { name: /גדוד 50/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /גדוד 51/ })).toBeVisible();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('counts the units in the header', () => {
    const { rerender } = render(
      <ForcesSidebar
        forces={[aForce({ id: 1 }), aForce({ id: 2 })]}
        isLoading={false}
        isError={false}
        selectedId={null}
        onSelect={noop}
      />,
    );
    expect(screen.getByText('2 יחידות')).toBeVisible();

    rerender(
      <ForcesSidebar
        forces={[aForce({ id: 1 })]}
        isLoading={false}
        isError={false}
        selectedId={null}
        onSelect={noop}
      />,
    );
    expect(screen.getByText('יחידה אחת')).toBeVisible();
  });

  it('reports the unit that was clicked', async () => {
    const onSelect = vi.fn();
    const force = aForce({ id: 2, unitName: 'גדוד 51' });
    render(
      <ForcesSidebar
        forces={[aForce({ id: 1 }), force]}
        isLoading={false}
        isError={false}
        selectedId={null}
        onSelect={onSelect}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /גדוד 51/ }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(force);
  });

  it('says so when there are no units', () => {
    render(
      <ForcesSidebar
        forces={[]}
        isLoading={false}
        isError={false}
        selectedId={null}
        onSelect={noop}
      />,
    );

    expect(screen.getByText(/עדיין אין יחידות/)).toBeVisible();
  });

  it('shows an error when the list cannot be loaded', () => {
    render(
      <ForcesSidebar
        forces={undefined}
        isLoading={false}
        isError
        selectedId={null}
        onSelect={noop}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'לא ניתן לטעון את רשימת היחידות',
    );
  });
});
