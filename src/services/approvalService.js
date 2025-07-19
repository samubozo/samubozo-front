import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, VACATION } from '../configs/host-config';

// 임시로 하드코딩 (스테이징 완료 후 host-config.js에서 import로 변경 예정)
const APPROVAL = '/approval-service/approvals';

export const approvalService = {
  // 1. 휴가 신청
  async requestVacation({
    vacationType,
    startDate,
    endDate,
    reason,
    requested_at,
  }) {
    try {
      await axiosInstance.post(`${API_BASE_URL}${VACATION}/requestVacation`, {
        vacationType,
        startDate,
        endDate,
        reason,
        requested_at: requested_at || new Date().toISOString(), // 신청일자 (폼에서 전달받거나 현재 시간)
      });
      return true;
    } catch (error) {
      const msg = error.response?.data || '휴가 신청 실패';
      throw new Error(msg);
    }
  },

  // 2. 휴가 신청 수정 (신규 API)
  async updateVacation(
    vacationId,
    { vacationType, startDate, endDate, reason },
  ) {
    try {
      await axiosInstance.put(`${API_BASE_URL}${VACATION}/${vacationId}`, {
        vacationType,
        startDate,
        endDate,
        reason,
      });
      return true;
    } catch (error) {
      const msg = error.response?.data || '휴가 신청 수정 실패';
      throw new Error(msg);
    }
  },

  // 3. 내 휴가 신청 내역 조회
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

  // 4. 결재 대기 목록 조회
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

  // 5. 휴가 신청 승인
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

  // 6. 휴가 신청 반려
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

  // === HR 담당자용 API ===

  // 7. HR 담당자용 결재 대기 목록 조회
  async getHRPendingApprovals() {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/pending`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 8. HR 담당자용 휴가 요청 승인
  async approveHRVacation(approvalId) {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}${APPROVAL}/${approvalId}/approve`,
      );
      return true;
    } catch (error) {
      const msg = error.response?.data || '승인 처리 실패';
      throw new Error(msg);
    }
  },

  // 9. HR 담당자용 휴가 요청 반려
  async rejectHRVacation(approvalId, comment) {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}${APPROVAL}/${approvalId}/reject`,
        { comment },
      );
      return true;
    } catch (error) {
      const msg = error.response?.data || '반려 처리 실패';
      throw new Error(msg);
    }
  },

  // 10. HR 담당자용 처리한 결재 요청 목록 조회 (신규 API)
  async getProcessedApprovals() {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/processed-by-me`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 11. HR 담당자용 처리한 휴가 신청 내역 조회 (신규 API)
  async getProcessedVacations() {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${VACATION}/processed-approvals`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
