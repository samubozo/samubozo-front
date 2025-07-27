import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, VACATION, CERTIFICATE } from '../configs/host-config';

// APPROVAL 상수 정의
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
      console.log('approvalService requestVacation 에러:', error);
      console.log('에러 응답 데이터:', error.response?.data);
      console.log('에러 메시지:', error.message);
      // 원본 에러 객체를 그대로 던져서 원본 정보를 보존
      throw error;
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
        { rejectComment: comment },
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
        { rejectComment: comment },
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

  // 증명서 신청
  async applyCertificate({ type, requestDate, purpose }) {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}${CERTIFICATE}/application`,
        {
          type, // 필드명 수정
          requestDate,
          purpose,
          approverId: 1, // 기본 HR 담당자 ID (실제로는 동적으로 설정해야 함)
        },
        { withCredentials: true },
      );

      // 응답 상태 확인
      if (response.status >= 200 && response.status < 300) {
        return true;
      } else {
        throw new Error('증명서 신청에 실패했습니다.');
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || '증명서 신청 실패';
      throw new Error(msg);
    }
  },

  // HR 전체 증명서 신청 내역 조회
  async getAllCertificates() {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/list/all`,
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 일반 사용자 본인 증명서 신청 내역 조회
  async getMyCertificates() {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/my-list`,
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // HR 증명서 승인
  async approveCertificate(id) {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}${CERTIFICATE}/${id}/approve`,
        {},
        { withCredentials: true },
      );
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || '증명서 승인 실패';
      throw new Error(msg);
    }
  },

  // HR 증명서 반려
  async rejectCertificate(id, rejectComment) {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}${CERTIFICATE}/${id}/reject`,
        { rejectComment },
        { withCredentials: true },
      );
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || '증명서 반려 실패';
      throw new Error(msg);
    }
  },

  // 증명서 상세 조회
  async getCertificateById(id) {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/${id}`,
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || '증명서 상세 조회 실패';
      throw new Error(msg);
    }
  },

  async getAllApprovals({ status, requestType, sortBy, sortOrder } = {}) {
    const params = {};
    if (status) params.status = status;
    if (requestType) params.requestType = requestType;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    // 휴가 신청인 경우 HR용 휴가 조회 API 사용
    if (requestType === 'VACATION') {
      if (status === 'pending') {
        // 대기 중인 휴가 신청 조회
        const response = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL}/pending`,
        );
        return response.data;
      } else if (status === 'processed') {
        // 처리된 휴가 신청 조회 - 기존 API 사용
        console.log('처리된 휴가 신청 조회 API 호출: getProcessedApprovals');
        const response = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL}/processed-by-me`,
        );
        console.log('처리된 휴가 신청 조회 결과:', response.data);

        // 휴가 신청만 필터링 (requestType이 'VACATION'인 것만)
        const vacationData = Array.isArray(response.data)
          ? response.data.filter((item) => item.requestType === 'VACATION')
          : [];
        console.log('휴가 신청만 필터링된 결과:', vacationData);

        return vacationData;
      } else {
        // 전체 휴가 신청 조회 (대기 + 처리된)
        const [pendingRes, processedRes] = await Promise.all([
          axiosInstance.get(`${API_BASE_URL}${APPROVAL}/pending`),
          axiosInstance.get(`${API_BASE_URL}${APPROVAL}/processed-by-me`),
        ]);

        // 휴가 신청만 필터링
        const pendingVacations = Array.isArray(pendingRes.data)
          ? pendingRes.data.filter((item) => item.requestType === 'VACATION')
          : [];
        const processedVacations = Array.isArray(processedRes.data)
          ? processedRes.data.filter((item) => item.requestType === 'VACATION')
          : [];

        return [...pendingVacations, ...processedVacations];
      }
    }

    // 증명서 신청인 경우 approval-service에서 조회
    const response = await axiosInstance.get(`${API_BASE_URL}${APPROVAL}`, {
      params,
    });
    return response.data;
  },
};
