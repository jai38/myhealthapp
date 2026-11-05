import React, { Component, ReactNode } from 'react';
import { GlobalErrorScreen } from './system/GlobalErrorScreen';
import { createSupportCode } from './system/supportCode';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  supportCode: string | null;
  // Bumped on retry so the child tree is re-mounted from scratch.
  attempt: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, supportCode: null, attempt: 0 };
  }

  // The error object is deliberately not stored: its message could carry health data.
  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true, supportCode: createSupportCode() };
  }

  componentDidCatch() {
    // Log the opaque code only. No error message, stack or component data.
    console.error(`ErrorBoundary caught an unhandled error. Support code: ${this.state.supportCode}`);
  }

  handleReset = () => {
    this.setState((s) => ({ hasError: false, supportCode: null, attempt: s.attempt + 1 }));
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <GlobalErrorScreen
          variant="error"
          onRetry={this.handleReset}
          supportCode={this.state.supportCode ?? undefined}
        />
      );
    }

    return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
  }
}
