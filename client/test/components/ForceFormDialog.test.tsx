import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ForceFormDialog } from '../../src/components/ForceFormDialog';
import { toFormValues } from '../../src/mappers/forceFormValues';
import { aForce } from '../fixtures';
import { renderWithProviders } from '../renderWithProviders';

const renderForm = (draft = toFormValues()) => {
  const handlers = {
    onSubmit: vi.fn(),
    onEditShape: vi.fn(),
    onCancel: vi.fn(),
  };
  renderWithProviders(
    <ForceFormDialog isNew draft={draft} saving={false} {...handlers} />,
  );
  return handlers;
};

describe('ForceFormDialog', () => {
  it('requires a unit name and does not submit without one', async () => {
    const { onSubmit } = renderForm();

    await userEvent.click(screen.getByRole('button', { name: 'שמירה' }));

    expect(
      await screen.findByText('שם היחידה הוא שדה חובה'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits parsed attributes', async () => {
    const { onSubmit } = renderForm();

    await userEvent.type(
      screen.getByRole('textbox', { name: /שם היחידה/ }),
      'גדוד 50',
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: 'מספר לוחמים' }),
      '40',
    );
    await userEvent.click(screen.getByRole('button', { name: 'שמירה' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        unitName: 'גדוד 50',
        troopsCount: 40,
        commanderName: null,
      }),
      expect.anything(),
    );
  });

  it('hands the typed values back when going to edit the shape', async () => {
    const { onEditShape } = renderForm(toFormValues(aForce()));

    const commander = screen.getByRole('textbox', { name: 'שם המפקד' });
    await userEvent.clear(commander);
    await userEvent.type(commander, 'סרן לוי');
    await userEvent.click(screen.getByRole('button', { name: 'עריכת הצורה' }));

    expect(onEditShape).toHaveBeenCalledWith(
      expect.objectContaining({
        commanderName: 'סרן לוי',
        unitName: 'גדוד 50',
      }),
    );
  });
});
