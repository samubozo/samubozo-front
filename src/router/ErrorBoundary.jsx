import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 404 에러는 host-config 기준으로 처리
    if (error.message && error.message.includes('404')) {
      const clientHostName = window.location.hostname;

      if (clientHostName === 'localhost') {
        // 개발 환경: 404 에러를 경고로 표시
        console.warn('404 에러 (개발 환경):', error.message);
      } else {
        // 프로덕션 환경: 404 에러를 조용히 처리
        console.log('404 에러 조용히 처리됨 (프로덕션)');
      }
      return { hasError: false }; // 에러가 없었다고 처리
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 404 에러는 host-config 기준으로 처리
    if (error.message && error.message.includes('404')) {
      const clientHostName = window.location.hostname;

      if (clientHostName === 'localhost') {
        // 개발 환경: 404 에러 상세 정보 표시
        console.warn('404 에러 상세 정보 (개발 환경):', error, errorInfo);
      }
    } else {
      // 다른 에러는 기존대로 처리
      console.error('Uncaught error:', error, errorInfo);
      window.location.href = '/error.html';
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
