import React from 'react';
import Header from './components/Header';
import Home from './components/Home';
import { Route, Routes } from 'react-router-dom';
import { AuthContextProvider } from './context/UserContext';
import { WeatherProvider } from './context/WeatherContext';
import LoginPage from './pages/auth/Login';

import './App.css';

import AppRouter from './router/AppRouter';
import ErrorBoundary from './router/ErrorBoundary';

const App = () => {
  return (
    <AuthContextProvider>
      <WeatherProvider>
        <div className='App'>
          <div className='content-wrapper'>
            <ErrorBoundary>
              <AppRouter />
            </ErrorBoundary>
          </div>
        </div>
      </WeatherProvider>
    </AuthContextProvider>
  );
};

export default App;
