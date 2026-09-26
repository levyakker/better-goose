import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IntlTestWrapper } from '../../i18n/test-utils';
import ProviderSelector from './ProviderSelector';

vi.mock('../../acp/providers', () => ({
  acpListSetupProviderDetails: vi.fn().mockResolvedValue([]),
}));
vi.mock('../../contexts/FeaturesContext', () => ({
  useFeatures: () => ({ localInference: true }),
}));
vi.mock('./LocalModelPicker', () => ({ default: () => <div>Local model setup</div> }));
vi.mock('../ui/Select', () => ({ Select: () => <div>Provider selection</div> }));

describe('ProviderSelector', () => {
  it('allows both setup paths to be selected with the keyboard', async () => {
    const onFirstSelection = vi.fn();
    const user = userEvent.setup();
    render(<ProviderSelector onConfigured={vi.fn()} onFirstSelection={onFirstSelection} />, {
      wrapper: IntlTestWrapper,
    });

    await user.tab();
    const local = screen.getByRole('button', { name: /Use a Local Model/ });
    expect(local).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(local).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Local model setup')).toBeInTheDocument();

    await user.tab();
    const provider = screen.getByRole('button', { name: /Connect to a Provider/ });
    expect(provider).toHaveFocus();
    await user.keyboard(' ');
    expect(provider).toHaveAttribute('aria-pressed', 'true');
    expect(local).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Provider selection')).toBeInTheDocument();
    expect(onFirstSelection).toHaveBeenCalledTimes(2);
  });
});
