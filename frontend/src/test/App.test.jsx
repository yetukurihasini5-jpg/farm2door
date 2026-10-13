import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from '../components/common/Button';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { LoadingSpinner, Badge, EmptyState } from '../components/common/LoadingSpinner';

describe('Common UI Components', () => {
  it('renders Button component with children and responds to click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders LoadingSpinner with custom text', () => {
    render(<LoadingSpinner text="Harvesting data..." />);
    expect(screen.getByText('Harvesting data...')).toBeInTheDocument();
  });

  it('renders Badge with correct label and variant', () => {
    render(<Badge variant="success">Organic Certified</Badge>);
    expect(screen.getByText('Organic Certified')).toBeInTheDocument();
  });

  it('renders EmptyState with title and description', () => {
    render(
      <EmptyState
        title="No produce found"
        description="Try searching for another seasonal harvest."
      />
    );
    expect(screen.getByText('No produce found')).toBeInTheDocument();
    expect(screen.getByText('Try searching for another seasonal harvest.')).toBeInTheDocument();
  });

  it('renders OrderStatusBadge for various lifecycle states', () => {
    const { rerender } = render(<OrderStatusBadge status="PENDING" />);
    expect(screen.getByText(/order placed/i)).toBeInTheDocument();

    rerender(<OrderStatusBadge status="ACCEPTED" />);
    expect(screen.getByText(/accepted/i)).toBeInTheDocument();

    rerender(<OrderStatusBadge status="DELIVERED" />);
    expect(screen.getByText(/delivered/i)).toBeInTheDocument();

    rerender(<OrderStatusBadge status="CANCELLED" />);
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
  });
});
