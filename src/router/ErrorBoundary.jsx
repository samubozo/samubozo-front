import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    window.location.href = '/error.html';
  }

  render() {
    if (this.state.hasError) {
      return null; 
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
