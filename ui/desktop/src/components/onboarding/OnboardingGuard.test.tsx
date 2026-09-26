import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { IntlTestWrapper } from '../../i18n/test-utils';
import OnboardingGuard from './OnboardingGuard';
import { acpReadDefaults } from '../../acp/providers';

vi.mock('../../acp/providers', () => ({
  acpReadDefaults: vi.fn(),
}));
vi.mock('../ConfigContext', () => ({
  useConfig: () => ({ upsert: vi.fn() }),
}));
vi.mock('../ModelAndProviderContext', () => ({
  useModelAndProvider: () => ({ getFallbackModelAndProvider: vi.fn() }),
}));
vi.mock('./ProviderSelector', () => ({ default: () => <div>Provider setup</div> }));

describe('OnboardingGuard', () => {
  it('shows a status while checking and then renders the app', async () => {
    let finishCheck!: (value: { providerId: string | null; modelId: string | null }) => void;
    vi.mocked(acpReadDefaults).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishCheck = resolve;
        })
    );

    render(
      <MemoryRouter>
        <OnboardingGuard>
          <div>Chat</div>
        </OnboardingGuard>
      </MemoryRouter>,
      { wrapper: IntlTestWrapper }
    );

    expect(screen.getByRole('status')).toHaveTextContent('Checking...');
    expect(screen.queryByText('Chat')).not.toBeInTheDocument();
    finishCheck({ providerId: 'configured', modelId: null });
    expect(await screen.findByText('Chat')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
