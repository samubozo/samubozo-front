import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, VACATION } from '../configs/host-config';

export const approvalService = {
  // 1. 휴가 신청
  async requestVacation({ vacationType, startDate, endDate, reason }) {
    try {
      await axiosInstance.post(`${API_BASE_URL}${VACATION}/requestVacation`, {
        vacationType,
        startDate,
        endDate,
        reason,
      });
      return true;
    } catch (error) {
      const msg = error.response?.data || '휴가 신청 실패';
      throw new Error(msg);
    }
  },

  // 2. 내 휴가 신청 내역 조회
  async getMyVacationRequests() {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${VACATION}/my-requests`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. 결재 대기 목록 조회
  async getPendingApprovals() {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${VACATION}/pending-approvals`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. 휴가 신청 승인
  async approveVacation(vacationId) {
    try {
      await axiosInstance.post(
        `${API_BASE_URL}${VACATION}/${vacationId}/approve`,
      );
      return true;
    } catch (error) {
      const msg = error.response?.data || '승인 처리 실패';
      throw new Error(msg);
    }
  },

  // 5. 휴가 신청 반려
  async rejectVacation(vacationId, comment) {
    try {
      await axiosInstance.post(
        `${API_BASE_URL}${VACATION}/${vacationId}/reject`,
        { comment },
      );
      return true;
    } catch (error) {
      const msg = error.response?.data || '반려 처리 실패';
      throw new Error(msg);
    }
  },
};
