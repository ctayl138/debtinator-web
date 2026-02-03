import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

describe('renderWithProviders', () => {
  it('renders with default route', () => {
    renderWithProviders(<div data-testid="child">Hello</div>);
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('renders with custom route option', () => {
    renderWithProviders(<div data-testid="child">With route</div>, { route: '/payoff' });
    expect(screen.getByTestId('child')).toHaveTextContent('With route');
  });
});
