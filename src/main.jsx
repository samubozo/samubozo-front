import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

// Prism.js 언어 모듈 에러 숨기기
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    args[0].includes('Could not find the language')
  ) {
    return; // Prism.js 언어 모듈 에러는 무시
  }
  originalError.apply(console, args);
};

// React 19의 createRoot API 사용
const root = createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter future={{ v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>,
);
