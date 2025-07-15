<<<<<<< HEAD
import { createRoot } from 'react-dom/client';
import './index.css';
=======
import React from 'react';
import { createRoot } from 'react-dom/client';
>>>>>>> 0f3bf6a90fd3e8e6cefcefc59b6c54af4ec757d7
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

<<<<<<< HEAD
createRoot(document.getElementById('root')).render(
  // 라우터를 사용하려는 컴포넌트를 BrowserRouter로 감싸주세요.
=======
// React 19의 createRoot API 사용
const root = createRoot(document.getElementById('root'));

root.render(
>>>>>>> 0f3bf6a90fd3e8e6cefcefc59b6c54af4ec757d7
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
