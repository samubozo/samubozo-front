import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, ATTENDANCE, VACATION } from '../configs/host-config';

export const attendanceService = {
  // 출근 기록
  checkIn: async () => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}${ATTENDANCE}/check-in`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 퇴근 기록
  checkOut: async () => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}${ATTENDANCE}/check-out`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 외출 기록
  goOut: async () => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}${ATTENDANCE}/go-out`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 복귀 기록
  returnFromOut: async () => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}${ATTENDANCE}/return`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 남은 근무시간 조회
  getRemainingWorkTime: async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${ATTENDANCE}/remaining-work-time`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 월별 근태 조회
  getMonthlyAttendance: async (year, month) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${ATTENDANCE}/monthly/${year}/${month}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 오늘의 출근 상태 조회
  getTodayAttendance: async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${ATTENDANCE}/today`,
      );
      if (response.status === 200 && response.data.result) {
        return response.data.result;
      }
      return {
        checkInTime: null,
        checkOutTime: null,
        goOutTime: null,
        returnTime: null,
        isLate: false, // 지각 여부 추가
      };
    } catch (error) {
      return {
        checkInTime: null,
        checkOutTime: null,
        goOutTime: null,
        returnTime: null,
        isLate: false, // 지각 여부 추가
      };
    }
  },

  // 부재 등록
  registerAbsence: async (absenceData) => {
    // absenceData: { type, startDate, endDate, time, reason }
    const response = await axiosInstance.post(
      `${API_BASE_URL}${ATTENDANCE}/absence`,
      absenceData,
    );
    return response.data;
  },

  // 내 부재 목록 조회 (userId 없이 /my 엔드포인트 사용)
  getAbsences: async ({ year, month }) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await axiosInstance.get(
      `${API_BASE_URL}${ATTENDANCE}/absence/my`,
      { params },
    );
    return response.data;
  },

  // 단일 부재 상세 조회
  getAbsenceById: async (absenceId) => {
    const response = await axiosInstance.get(
      `${API_BASE_URL}${ATTENDANCE}/absence/${absenceId}`,
    );
    return response.data;
  },

  // 부재 수정
  updateAbsence: async (absenceId, updateData) => {
    const response = await axiosInstance.put(
      `${API_BASE_URL}${ATTENDANCE}/absence/${absenceId}`,
      updateData,
    );
    return response.data;
  },

  // 부재 삭제
  deleteAbsence: async (absenceId) => {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}${ATTENDANCE}/absence/${absenceId}`,
    );
    return response.data;
  },

  // 근태 기록 수정 (백엔드에 해당 API가 없으므로 프론트엔드에서 구현)
  updateAttendance: async (attendanceId, updateData) => {
    try {
      // 실제로는 백엔드 API를 호출해야 하지만, 현재 백엔드에 해당 API가 없으므로
      // 프론트엔드에서 임시로 처리
      console.log('근태 수정 데이터:', { attendanceId, updateData });

      return {
        success: true,
        message: '근태 기록이 수정되었습니다.',
        result: {
          attendanceId,
          ...updateData,
        },
      };
    } catch (error) {
      throw error;
    }
  },

  // 근태 기록 삭제 (백엔드에 해당 API가 없으므로 프론트엔드에서 구현)
  deleteAttendance: async (attendanceId) => {
    try {
      // 실제로는 백엔드 API를 호출해야 하지만, 현재 백엔드에 해당 API가 없으므로
      // 프론트엔드에서 임시로 처리
      console.log('근태 삭제:', attendanceId);

      return {
        success: true,
        message: '근태 기록이 삭제되었습니다.',
        result: {
          attendanceId,
        },
      };
    } catch (error) {
      throw error;
    }
  },

  // 연차 현황 조회
  getVacationBalance: async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${VACATION}/balance`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 월별 개인 근태 통계 조회 (실제 백엔드 API)
  getPersonalStats: async (year, month) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${ATTENDANCE}/personal-stats/${year}/${month}`,
      );
      return response.data; // 실제 백엔드 응답 구조에 맞게 반환
    } catch (error) {
      throw error;
    }
  },
};
