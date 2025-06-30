import React from 'react';
import Header from './components/Header';
import Home from './components/Home';
import { Route, Routes } from 'react-router-dom';
import { AuthContextProvider } from './context/UserContext';
import LoginPage from './pages/auth/Login';

import './App.css';

import AppRouter from './router/AppRouter';

const App = () => {
  return (
    <AuthContextProvider>
      <div className='App'>
        <div className='content-wrapper'>
          <AppRouter />
        </div>
      </div>
    </AuthContextProvider>
  );
};

export default App;
