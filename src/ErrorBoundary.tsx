import { Component, ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

// React 19 still requires a class component for the error boundary API.
// This is the one exception to the "functional components only" convention.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: '#e0e0f0', textAlign: 'center' }}>
          <p>Something went wrong. Try refreshing the page.</p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: '1rem', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
