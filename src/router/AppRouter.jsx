import React from 'react';
import Home from '../components/Home';

import { Route, Routes } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import Header from '../components/Header';
import Dashboard from '../pages/main/Dashboard';
import LayoutHeader from '../components/LayoutHeader';
import Employee from '../pages/employee/EmployeeTable';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      {/* <Route path='/dashboard' element={<Dashboard />} /> */}
      <Route element={<LayoutHeader />}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/employee' element={<Employee />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
