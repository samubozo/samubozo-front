import React, { createContext, useContext, useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';

const AttendanceContext = createContext();

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

export const AttendanceProvider = ({ children }) => {
  const [attendanceStatus, setAttendanceStatus] = useState({
    isCheckedIn: false,
    checkInTime: null,
    checkOutTime: null,
    todayAttendance: null,
    monthlyAttendance: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 사용자 ID 가져오기 (sessionStorage에서)
  const getUserId = () => {
    return sessionStorage.getItem('USER_EMPLOYEE_NO');
  };

  // 오늘 날짜의 출근 상태 확인
  const checkTodayAttendance = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      const response = await attendanceService.getMonthlyAttendance(
        year,
        month,
      );

      if (response.result) {
        const todayAttendance = response.result.find((attendance) => {
          const attendanceDate = new Date(attendance.checkInTime);
          return attendanceDate.getDate() === today.getDate();
        });

        if (todayAttendance) {
          setAttendanceStatus((prev) => ({
            ...prev,
            isCheckedIn:
              !!todayAttendance.checkInTime && !todayAttendance.checkOutTime,
            checkInTime: todayAttendance.checkInTime,
            checkOutTime: todayAttendance.checkOutTime,
            todayAttendance: todayAttendance,
          }));
        }
      }
    } catch (error) {}
  };

  // 출근 처리
  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await attendanceService.checkIn();

      if (response.result) {
        setAttendanceStatus((prev) => ({
          ...prev,
          isCheckedIn: true,
          checkInTime: response.result.checkInTime,
          todayAttendance: response.result,
        }));
      }
    } catch (error) {
      setError(
        error.response?.data?.statusMessage ||
          '출근 처리 중 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  // 퇴근 처리
  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await attendanceService.checkOut();

      if (response.result) {
        setAttendanceStatus((prev) => ({
          ...prev,
          isCheckedIn: false,
          checkOutTime: response.result.checkOutTime,
          todayAttendance: response.result,
        }));
      }
    } catch (error) {
      setError(
        error.response?.data?.statusMessage ||
          '퇴근 처리 중 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  // 월별 근태 조회
  const getMonthlyAttendance = async (year, month) => {
    try {
      const response = await attendanceService.getMonthlyAttendance(
        year,
        month,
      );

      if (response.result) {
        setAttendanceStatus((prev) => ({
          ...prev,
          monthlyAttendance: response.result,
        }));
      }
    } catch (error) {}
  };

  // 컴포넌트 마운트 시 오늘 출근 상태 확인
  useEffect(() => {
    checkTodayAttendance();
  }, []);

  const value = {
    attendanceStatus,
    loading,
    error,
    handleCheckIn,
    handleCheckOut,
    getMonthlyAttendance,
    checkTodayAttendance,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};
