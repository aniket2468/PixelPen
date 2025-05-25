"use client";
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.warn('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if it's a DOM manipulation error
    const isDOMError = error?.message?.includes('removeChild') || 
                      error?.message?.includes('appendChild') ||
                      error?.message?.includes('insertBefore') ||
                      error?.message?.includes('parentNode');

    if (isDOMError) {
      console.warn('DOM manipulation error caught and handled gracefully:', error.message);
      
      // For DOM errors, try to recover automatically after a short delay
      setTimeout(() => {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }, 100);
      
      return;
    }

    // For other errors, store them in state
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Check if it's a DOM error that we can recover from
      const isDOMError = this.state.error?.message?.includes('removeChild') || 
                        this.state.error?.message?.includes('appendChild') ||
                        this.state.error?.message?.includes('insertBefore') ||
                        this.state.error?.message?.includes('parentNode');

      if (isDOMError) {
        // For DOM errors, render children normally (the error should be resolved by now)
        return this.props.children;
      }

      // For other errors, show error UI
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2 style={{ color: '#dc3545' }}>Something went wrong</h2>
          <p style={{ color: '#6c757d' }}>
            An unexpected error occurred. Please refresh the page to continue.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#007bff' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '10px'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary }; 