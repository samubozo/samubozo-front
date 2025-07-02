import React from 'react';
import Home from '../components/Home';

import { Route, Routes } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import Header from '../components/Header';
import Dashboard from '../pages/main/Dashboard';
import LayoutHeader from '../components/LayoutHeader';
import Employee from '../pages/employee/EmployeeTable';
import PayrollManagement from '../pages/payroll/PayrollManagement';
import OrgChart from '../pages/organizationChart/OrgChart';
import Schedule from '../pages/schedule/Schedule';
import Message from '../pages/message/Message';
import AttendanceDashboard from '../pages/attendance/AttendanceDashboard';
import Approval from '../pages/approval/Approval';


const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      {/* <Route path='/dashboard' element={<Dashboard />} /> */}
      <Route element={<LayoutHeader />}>
        {/* 메인 페이지 */}
        <Route path='/dashboard' element={<Dashboard />} />
        {/* 인사 관리 */}
        <Route path='/employee' element={<Employee />} />

        <Route path='/attendance' element={<AttendanceDashboard />} />
        <Route path='/salary' element={<PayrollManagement />} />
        <Route path='/schedule' element={<Schedule />} />
        {/* 메시지 관리 */}
        <Route path='/message' element={<Message />} />
        {/* 조직도 */}
        <Route path='/orgchart' element={<OrgChart />} />
        {/* 전자 결재 */}
        <Route path='/approval' element={<Approval />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
