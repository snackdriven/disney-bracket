import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../ErrorBoundary';

// A component that throws an error when a prop is set
const ThrowError = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Child Component</div>;
};

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress console.error during tests so the expected errors don't pollute the test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('catches errors and renders the fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong. Try refreshing the page.')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();

    // Verify console.error was called with the caught error
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('clears the error and retries when "Try again" is clicked', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong. Try refreshing the page.')).toBeInTheDocument();

    // Now, we want to simulate the case where the underlying issue is "fixed"
    // and clicking try again will successfully render.
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByText('Try again');
    await user.click(tryAgainButton);

    expect(screen.getByText('Child Component')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong. Try refreshing the page.')).not.toBeInTheDocument();
  });
});
