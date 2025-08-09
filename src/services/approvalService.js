import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, VACATION, CERTIFICATE } from '../configs/host-config';

// APPROVAL 상수 정의
const APPROVAL = '/approval-service/approvals';

export const approvalService = {
  // ===== 공통 조회 API들 =====

  // 1. 특정 사용자가 특정 날짜에 승인된 휴가의 종류를 조회
  async getApprovedLeaveType(userId, date) {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/leaves/approved-type`,
        {
          params: { userId, date },
        },
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '승인된 휴가 종류 조회 실패';
      throw new Error(msg);
    }
  },

  // 2. 특정 사용자가 특정 날짜에 승인된 휴가가 있는지 확인
  async hasApprovedLeave(userId, date) {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/leaves/approved`,
        {
          params: { userId, date },
        },
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '승인된 휴가 확인 실패';
      throw new Error(msg);
    }
  },

  // 3. 모든 결재 요청 목록 조회 (필터링 지원)
  async getAllApprovalRequests(requestType = null) {
    try {
      const params = {};
      if (requestType) {
        params.requestType = requestType;
      }
      const response = await axiosInstance.get(`${API_BASE_URL}${APPROVAL}`, {
        params,
      });
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '결재 요청 목록 조회 실패';
      throw new Error(msg);
    }
  },

  // 4. 특정 ID를 가진 결재 요청 조회
  async getApprovalRequestById(id) {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/${id}`,
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '결재 요청 조회 실패';
      throw new Error(msg);
    }
  },

  // 5. 특정 타입의 결재 요청 목록 조회
  async getApprovalRequestsByType(requestType) {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/requests/${requestType}`,
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '타입별 결재 요청 조회 실패';
      throw new Error(msg);
    }
  },

  // ===== 공통 승인/반려 API들 =====

  // 6. 공통 승인 처리 (모든 타입에 사용)
  async approveApprovalRequest(id, employeeNo) {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}${APPROVAL}/${id}/approve`,
        {},
        {
          headers: {
            'X-User-Employee-No': employeeNo,
          },
        },
      );
      return true;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '승인 처리 실패';
      throw new Error(msg);
    }
  },

  // 7. 공통 반려 처리 (모든 타입에 사용)
  async rejectApprovalRequest(id, rejectComment) {
    try {
      await axiosInstance.put(`${API_BASE_URL}${APPROVAL}/${id}/reject`, {
        rejectComment,
      });
      return true;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '반려 처리 실패';
      throw new Error(msg);
    }
  },

  // ===== 휴가 관련 API들 =====

  // 8. 휴가 신청
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
        requested_at: requested_at || new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.log('approvalService requestVacation 에러:', error);
      console.log('에러 응답 데이터:', error.response?.data);
      console.log('에러 메시지:', error.message);
      throw error;
    }
  },

  // 9. 휴가 신청 수정
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

  // 10. 내 휴가 신청 내역 조회 (페이징 처리)
  async getMyVacationRequests(page = 0, size = 10, sort = null) {
    try {
      const params = { page, size };
      if (sort) params.sort = sort;

      const response = await axiosInstance.get(
        `${API_BASE_URL}${VACATION}/my-requests`,
        { params },
      );

      // 수정 전: return response.data;
      // 수정 후: response.data.result 객체를 반환하여 content 배열과 페이징 정보에 접근할 수 있도록 함
      return response.data.result;
    } catch (error) {
      // 에러 처리는 그대로 유지
      throw error;
    }
  },

  // 11. 결재 대기 목록 조회
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

  // 12. 휴가 신청 승인 (기존 API 유지)
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

  // 13. 휴가 신청 반려 (기존 API 유지)
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

  // ===== HR용 API들 =====

  // 14. HR용 결재 대기 목록 조회 (페이징 지원)
  async getHRPendingApprovals(page = 0, size = 10, sort = null) {
    try {
      const params = {
        page,
        size,
      };

      if (sort) {
        params.sort = sort;
      }

      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/pending`,
        { params },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // HR용 처리된 결재 목록 조회
  async getHRProcessedApprovals() {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/processed`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // HR용 전체 결재 목록 조회
  async getHRAllApprovals() {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${APPROVAL}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 15. HR 휴가 신청 승인 (공통 API 사용)
  async approveHRVacation(approvalId) {
    return this.approveApprovalRequest(approvalId, null); // employeeNo는 헤더에서 자동 설정
  },

  // 16. HR 휴가 신청 반려 (공통 API 사용)
  async rejectHRVacation(approvalId, comment) {
    return this.rejectApprovalRequest(approvalId, comment);
  },

  // 17. 처리된 결재 목록 조회
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

  // 18. 처리된 휴가 신청 목록 조회
  async getProcessedVacations() {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${VACATION}/processed`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== 증명서 관련 API들 =====

  // 19. 증명서 신청
  async applyCertificate({ type, requestDate, purpose }) {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}${CERTIFICATE}/application`,
        {
          type,
          requestDate,
          purpose,
        },
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      // 409 Conflict 에러 처리 (중복 신청)
      if (error.response?.status === 409) {
        // 에러 응답 구조를 더 정확히 파악
        let msg = '이미 유효한 동일한 유형의 증명서가 존재합니다.';

        if (error.response?.data) {
          // 다양한 응답 구조 시도
          msg =
            error.response.data.statusMessage ||
            error.response.data.message ||
            error.response.data.error ||
            error.response.data.toString() ||
            msg;
        }

        throw new Error(msg);
      }

      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '증명서 신청 실패';
      throw new Error(msg);
    }
  },

  // 20. 증명서 수정
  async updateCertificate(id, { type, requestDate, purpose }) {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}${CERTIFICATE}/my-certificate/${id}`,
        {
          type,
          requestDate,
          purpose,
        },
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '증명서 수정 실패';
      throw new Error(msg);
    }
  },

  // 21. 모든 증명서 조회 (HR용)
  async getAllCertificates() {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/list/all`,
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '증명서 목록 조회 실패';
      throw new Error(msg);
    }
  },

  // 22. 내 증명서 조회
  async getMyCertificates(page = 0, size = 100, sort = null) {
    try {
      const params = { page, size };
      if (sort) params.sort = sort;
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/my-list`,
        {
          withCredentials: true,
          params,
        },
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '내 증명서 조회 실패';
      throw new Error(msg);
    }
  },

  // 23. HR 증명서 승인 (공통 API 사용)
  async approveCertificate(id) {
    return this.approveApprovalRequest(id, null);
  },

  // 24. HR 증명서 반려 (공통 API 사용)
  async rejectCertificate(id, rejectComment) {
    return this.rejectApprovalRequest(id, rejectComment);
  },

  // 25. 증명서 상세 조회
  async getCertificateById(id) {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/${id}`,
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '증명서 상세 조회 실패';
      throw new Error(msg);
    }
  },

  // 26. 새로운 증명서 결재 요청 생성
  async requestCertificateApproval(certificateData) {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}${CERTIFICATE}/certificate`,
        certificateData,
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '증명서 결재 요청 실패';
      throw new Error(msg);
    }
  },

  // ===== 부재 관련 API들 =====

  // 26. 부재 결재 요청 생성
  async requestAbsenceApproval(absenceData) {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}${APPROVAL}/absence`,
        absenceData,
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '부재 결재 요청 실패';
      throw new Error(msg);
    }
  },

  // 27. HR 부재 결재 승인 (공통 API 사용)
  async approveHRAbsence(absenceId) {
    return this.approveApprovalRequest(absenceId, null);
  },

  // 28. HR 부재 결재 반려 (공통 API 사용)
  async rejectHRAbsence(absenceId, comment) {
    return this.rejectApprovalRequest(absenceId, comment);
  },

  // 29. 부재 결재 요청 목록 조회 (페이징)
  async getAbsenceApprovals(page = 0, size = 10, sort = null) {
    try {
      const params = { page, size };
      if (sort) params.sort = sort;
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/absence`,
        { params },
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '부재 결재 목록 조회 실패';
      throw new Error(msg);
    }
  },

  // 30. 대기 중인 부재 결재 요청 조회 (HR용)
  async getPendingAbsenceApprovals(page = 0, size = 10, sort = null) {
    try {
      const params = { page, size };
      if (sort) params.sort = sort;
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/absence/pending`,
        { params },
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '대기 중인 부재 결재 조회 실패';
      throw new Error(msg);
    }
  },

  // 31. 처리된 부재 결재 요청 조회
  async getProcessedAbsenceApprovals(page = 0, size = 10, sort = null) {
    try {
      const params = { page, size };
      if (sort) params.sort = sort;
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/absence/processed`,
        { params },
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '처리된 부재 결재 조회 실패';
      throw new Error(msg);
    }
  },

  // 32. 내 부재 결재 요청 조회
  async getMyAbsenceApprovals(page = 0, size = 10, sort = null) {
    try {
      const params = { page, size };
      if (sort) params.sort = sort;
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/absence/my`,
        { params },
      );
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.statusMessage ||
        error.response?.data?.message ||
        '내 부재 결재 조회 실패';
      throw new Error(msg);
    }
  },

  // 33. 내가 처리한 부재 결재 요청 조회
  async getAbsenceApprovalsProcessedByMe(page = 0, size = 10) {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/absence/processed-by-me`,
        {
          params: { page, size },
        },
      );
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || '처리한 부재 결재 조회 실패';
      throw new Error(msg);
    }
  },

  // 34. 부재 결재 통계 조회
  async getAbsenceApprovalStatistics() {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL}/absence/statistics`,
      );
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || '부재 결재 통계 조회 실패';
      throw new Error(msg);
    }
  },

  // ===== 기존 호환성 유지 메서드 =====

  // 35. 기존 getAllApprovals 메서드 (호환성 유지)
  async getAllApprovals({
    status,
    requestType,
    sortBy,
    sortOrder,
    page = 0,
    size = 10,
  } = {}) {
    const params = {};
    if (status) params.status = status;
    if (requestType) params.requestType = requestType;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;

    // 휴가 신청인 경우 HR용 휴가 조회 API 사용
    if (requestType === 'VACATION') {
      if (status === 'pending') {
        // 대기 중인 휴가 신청 조회 (페이징 지원)
        const response = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL}/pending`,
          { params: { page, size } },
        );
        return response.data;
      } else if (status === 'processed') {
        // 처리된 휴가 신청 조회 - getApprovalsWithFilters 사용
        const response = await approvalService.getApprovalsWithFilters({
          status: 'PROCESSED',
          requestType: 'VACATION',
          page,
          size,
        });

        // 응답 구조에 따라 데이터 추출
        const content = response?.content || response || [];
        return response;
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

    // requestType이 명시적으로 지정된 경우 getAllApprovalRequests 사용
    if (requestType) {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL}/requests/${requestType}`,
        );
        return response.data;
      } catch (error) {
        console.error(`requestType ${requestType} 조회 실패:`, error);
        return [];
      }
    }

    // 증명서 신청인 경우 approval-service에서 조회
    const response = await axiosInstance.get(`${API_BASE_URL}${APPROVAL}`, {
      params,
    });
    return response.data;
  },

  // ===== 새로운 통합 API 메서드들 =====

  // 36. 새로운 통합 API를 사용한 결재 내역 조회 (페이징 지원)
  async getApprovalsWithFilters({
    applicantId,
    status,
    requestType,
    page = 0,
    size = 10,
    sort = null,
  } = {}) {
    try {
      const params = {};
      if (applicantId) params.applicantId = applicantId;
      if (status) params.status = status;
      if (requestType) params.requestType = requestType;
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;
      if (sort) params.sort = sort;

      const response = await axiosInstance.get(`${API_BASE_URL}${APPROVAL}`, {
        params,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || '결재 내역 조회 실패';
      throw new Error(msg);
    }
  },

  // 37. HR용 대기중 결재 조회 (새로운 API 사용)
  async getHRPendingApprovalsNew(applicantId = null, requestType = null) {
    try {
      const params = { status: 'PENDING' };
      if (applicantId) params.applicantId = applicantId;
      if (requestType) params.requestType = requestType;

      const response = await axiosInstance.get(`${API_BASE_URL}${APPROVAL}`, {
        params,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || '대기중 결재 조회 실패';
      throw new Error(msg);
    }
  },

  // 38. HR용 처리완료 결재 조회 (새로운 API 사용)
  async getHRProcessedApprovalsNew(applicantId = null, requestType = null) {
    try {
      const params = { status: 'PROCESSED' };
      if (applicantId) params.applicantId = applicantId;
      if (requestType) params.requestType = requestType;

      const response = await axiosInstance.get(`${API_BASE_URL}${APPROVAL}`, {
        params,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || '처리완료 결재 조회 실패';
      throw new Error(msg);
    }
  },

  // 39. 특정 직원의 증명서 결재 내역 조회 (새로운 API 사용)
  async getEmployeeCertificates(employeeId, status = null) {
    try {
      const params = {
        applicantId: employeeId,
        requestType: 'CERTIFICATE',
      };
      if (status) params.status = status;

      const response = await axiosInstance.get(`${API_BASE_URL}${APPROVAL}`, {
        params,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || '직원 증명서 내역 조회 실패';
      throw new Error(msg);
    }
  },
};
