import { screen } from '@testing-library/react';
import Documentation from './Documentation';
import { renderWithProviders } from '@/test-utils';

describe('Documentation', () => {
  it('renders the main title', () => {
    renderWithProviders(<Documentation />);
    expect(screen.getByText('Features Guide')).toBeInTheDocument();
  });

  it('renders feature sections', () => {
    renderWithProviders(<Documentation />);
    expect(screen.getByText('Debts')).toBeInTheDocument();
    expect(screen.getByText('Payoff Plan')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
