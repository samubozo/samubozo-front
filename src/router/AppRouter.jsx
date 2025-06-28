import React from 'react';
import Home from '../components/Home';
import MemberCreate from '../components/MemberCreate';

import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/member/create' element={<MemberCreate />} />
      <Route path='/login' element={<LoginPage />} />
    </Routes>
  );
};

export default AppRouter;
