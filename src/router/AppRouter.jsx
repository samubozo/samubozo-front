import React from 'react';
import Home from '../components/Home';

import { Route, Routes } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import Header from '../components/Header';
import Dashboard from '../pages/main/Dashboard';
import LayoutHeader from '../components/LayoutHeader';
import Employee from '../pages/employee/EmployeeTable';
import OrgChart from '../pages/organizationChart/OrgChart';
import Schedule from '../pages/schedule/Schedule';
import Message from '../pages/message/Message';
import AttendanceDashboard from '../pages/attendance/AttendanceDashboard';
import AttendanceHistory from '../pages/attendance/AttendanceHistory';
import VacationRequest from '../pages/attendance/VacationRequest';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      {/* <Route path='/dashboard' element={<Dashboard />} /> */}
      <Route element={<LayoutHeader />}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/employee' element={<Employee />} />
        <Route path='/salary' element={<Employee />} />
        <Route path='/schedule' element={<Schedule />} />
        <Route path='/message' element={<Message />} />
        <Route path='/orgchart' element={<OrgChart />} />
        <Route path='/calendar' element={<Employee />} />
        <Route path='/message' element={<Employee />} />
        <Route path='/attendance' element={<AttendanceDashboard />} />
        <Route path='/attendance/history' element={<AttendanceHistory />} />
        <Route path='/attendance/vacation' element={<VacationRequest />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
