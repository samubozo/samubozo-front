import React from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Footer from './components/Footer';
import { Route, Routes } from 'react-router-dom';
import MemberCreate from './components/MemberCreate';
import { AuthContextProvider } from './context/UserContext';
import LoginPage from './pages/auth/LoginPage';

import './App.css';

import AppRouter from './router/AppRouter';

const App = () => {
  return (
    <AuthContextProvider>
      <div className='App'>
        <Header />
        <div className='content-wrapper'>
          <AppRouter />
        </div>
        <Footer />
      </div>
    </AuthContextProvider>
  );
};

export default App;
