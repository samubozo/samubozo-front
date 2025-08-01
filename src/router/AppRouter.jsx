import React from 'react';
import Home from '../components/Home';

import { Route, Routes, Navigate } from 'react-router-dom';
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
import PasswordFind from '../pages/auth/PasswordFind';
import PasswordUpdate from '../pages/auth/PasswordUpdate';
import PrivateRouter from './PrivateRouter';

// 루트 경로 조건부 라우팅 컴포넌트
const RootRoute = () => {
  const accessToken = sessionStorage.getItem('ACCESS_TOKEN');

  if (accessToken) {
    // 로그인된 경우 Dashboard로 리다이렉트
    return <Navigate to='/dashboard' replace />;
  } else {
    // 로그인되지 않은 경우 Login 페이지로
    return <Login />;
  }
};

const AppRouter = () => {
  return (
    <Routes>
      {/* 루트 경로 - 로그인 세션에 따라 조건부 라우팅 */}
      <Route path='/' element={<RootRoute />} />
      {/* 회원가입 */}
      <Route path='/signup' element={<Signup />} />
      {/* 비밀번호 찾기 */}
      <Route path='/passwordFind' element={<PasswordFind />} />
      {/* 비밀번호 수정 */}
      <Route path='/passwordUpdate' element={<PasswordUpdate />} />
      <Route element={<LayoutHeader />}>
        {/* 메인 페이지 */}
        <Route
          path='/dashboard'
          element={<PrivateRouter element={<Dashboard />} />}
        />
        {/* 인사 관리 */}
        <Route
          path='/employee'
          element={<PrivateRouter element={<Employee />} />}
        />
        <Route
          path='/payroll'
          element={<PrivateRouter element={<PayrollManagement />} />}
        />
        <Route
          path='/attendance'
          element={<PrivateRouter element={<AttendanceDashboard />} />}
        />
        <Route
          path='/schedule'
          element={<PrivateRouter element={<Schedule />} />}
        />
        {/* 메시지 관리 */}
        <Route
          path='/message'
          element={<PrivateRouter element={<Message />} />}
        />
        {/* 조직도 */}
        <Route
          path='/orgchart'
          element={<PrivateRouter element={<OrgChart />} />}
        />
        {/* 전자 결재 */}
        <Route
          path='/approval'
          element={<PrivateRouter element={<Approval />} />}
        />
      </Route>
    </Routes>
  );
};

export default AppRouter;
