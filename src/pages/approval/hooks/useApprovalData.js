import { useState, useEffect, useCallback } from 'react';
import { approvalService } from '../../../services/approvalService';
import {
  vacationTypeMap,
  statusMap,
  absenceTypeMap,
  urgencyMap,
} from '../constants';

/**
 * 결재 관련 데이터를 관리하는 커스텀 훅
 * @param {string} tab - 현재 선택된 탭 ('leave', 'certificate', 'absence')
 * @param {boolean} isHR - HR 담당자 여부
 * @param {object} user - 현재 로그인한 사용자 정보
 * @param {string} approvalStatus - 결재 상태 필터 ('pending', 'processed', 'all')
 * @returns {object} 결재 데이터, 로딩 상태, 데이터 조회 함수 등
 */
export const useApprovalData = (
  tab,
  isHR,
  user,
  approvalStatus = 'pending',
) => {
  // --- 상태 관리 ---
  const [leaveData, setLeaveData] = useState([]);
  const [certData, setCertData] = useState([]);
  const [absenceData, setAbsenceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);

  // 페이징 상태
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // --- 데이터 포맷팅 및 매핑 함수 ---

  // 날짜를 'YYYY-MM-DD' 형식으로 변환
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    return dateStr.replace(/\./g, '-');
  };

  // 기간을 'YYYY-MM-DD' 또는 'YYYY-MM-DD ~ YYYY-MM-DD' 형식으로 변환
  const formatPeriod = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
    return startDate === endDate
      ? formattedStart
      : `${formattedStart} ~ ${formattedEnd}`;
  };

  // 휴가 API 응답 데이터를 화면 표시용으로 변환
  const mapLeaveData = (arr = []) => {
    return arr.map((row) => ({
      id: row.id || row.vacationId,
      type: vacationTypeMap[row.vacationType] || row.vacationType,
      reason: row.reason,
      applicant: isHR ? row.applicantName : user.userName,
      department: isHR ? row.department : user.department,
      applicantDepartment:
        row.applicantDepartment || row.department || user.department,
      applyDate: formatDate(row.requestedAt),
      period: formatPeriod(row.startDate, row.endDate),
      endDate: row.endDate,
      approver: row.approverName || row.approver || '',
      processedAt: row.processedAt || row.approvedAt || row.rejectedAt || '',
      status:
        statusMap[(row.vacationStatus || row.status || '').toUpperCase()] ||
        '대기',
      originalStatus: row.vacationStatus || row.status || '',
      rejectComment: row.rejectComment || '',
      originalData: row, // 원본 데이터 보존
    }));
  };

  // 부재 API 응답 데이터를 화면 표시용으로 변환
  const mapAbsenceData = (arr = []) => {
    return arr.map((row) => ({
      id: row.id,
      type: absenceTypeMap[row.absenceType] || row.absenceType || '',
      urgency: urgencyMap[row.urgency] || row.urgency || '',
      reason: row.reason,
      applicant: row.applicantName || user.userName,
      applicantDepartment:
        row.applicantDepartment || row.department || user.department || '',
      applyDate: formatDate(row.requestedAt),
      period: formatPeriod(row.startDate, row.endDate),
      startTime: row.startTime || '',
      endTime: row.endTime || '',
      approver: row.approverName || row.approver || '',
      processedAt: formatDate(row.processedAt || ''),
      status: statusMap[(row.status || '').toUpperCase()] || '대기',
      originalStatus: row.status || '',
      rejectComment: row.rejectComment || '',
      originalData: row,
    }));
  };

  // 증명서 API 응답 데이터를 화면 표시용으로 변환
  const mapCertData = (arr = []) => {
    const typeToKor = (type) => {
      const t = (type || '').trim().toUpperCase();
      if (t === 'EMPLOYMENT') return '재직증명서';
      if (t === 'CAREER') return '경력증명서';
      return type;
    };
    const statusToKor = (status) => {
      const s = (status || '').trim().toUpperCase();
      if (s === 'PENDING') return '대기';
      if (s === 'APPROVED') return '승인';
      if (s === 'REJECTED') return '반려';
      return status;
    };
    return arr.map((row) => ({
      ...row,
      id: row.certificateId,
      type: typeToKor(row.type),
      status: statusToKor(row.status),
      applicant: row.applicantName || '',
      applicantDepartment: row.departmentName || '',
      applyDate: row.requestDate || '',
      approver: row.approverName || '',
      processedAt: formatDate(row.approveDate || row.processedAt || ''),
      reason: row.purpose || '',
      rejectComment: row.rejectComment || '',
    }));
  };

  // --- 데이터 조회 함수 ---

  // 부재 데이터 조회 로직
  const fetchAbsenceData = useCallback(
    async ({ page = 0, size = 100 } = {}) => {
      setLoading(true);
      try {
        let response;
        if (isHR) {
          if (approvalStatus === 'pending') {
            response = await approvalService.getPendingAbsenceApprovals(
              page,
              size,
            );
          } else if (approvalStatus === 'processed') {
            response = await approvalService.getProcessedAbsenceApprovals(
              page,
              size,
            );
          } else {
            response = await approvalService.getAbsenceApprovals(page, size);
          }
        } else {
          response = await approvalService.getMyAbsenceApprovals(page, size);
        }

        const content = response?.content || [];
        setAbsenceData(mapAbsenceData(content));
        setTotalPages(response?.totalPages || 0);
        setTotalElements(response?.totalElements || 0);
        setCurrentPage(response?.number || 0);
      } catch (error) {
        console.error('부재 데이터 조회 에러:', error);
        setAbsenceData([]);
      } finally {
        setLoading(false);
      }
    },
    [isHR, approvalStatus],
  );

  // 메인 데이터 조회 함수 (탭에 따라 분기)
  const fetchData = useCallback(
    async ({ page = 0, size = 10 } = {}) => {
      setLoading(true);
      try {
        let response;

        if (tab === 'leave') {
          if (isHR) {
            response = await approvalService.getAllApprovals({
              status: approvalStatus === 'all' ? undefined : approvalStatus,
              requestType: 'VACATION',
              page,
              size,
            });
          } else {
            response = await approvalService.getMyVacationRequests(
              page,
              size,
              'startDate,desc',
            );
          }

          // API 응답 구조(배열 또는 객체)에 따라 데이터 추출
          let content = [];
          if (Array.isArray(response)) {
            content = response;
          } else if (response?.content) {
            content = response.content;
          }

          // HR의 경우, API 응답에 다른 타입이 섞여있을 수 있으므로 VACATION만 필터링
          const vacationContent = isHR
            ? content.filter((item) => item.requestType === 'VACATION')
            : content;

          setLeaveData(mapLeaveData(vacationContent));

          // 페이징 정보 설정
          if (response && !Array.isArray(response)) {
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
            setCurrentPage(response.number || 0);
          } else {
            // 배열 응답(페이징 미지원)의 경우, 클라이언트에서 페이징 정보 설정
            setTotalPages(1);
            setTotalElements(vacationContent.length);
            setCurrentPage(0);
          }
        } else if (tab === 'certificate') {
          response = await approvalService.getMyCertificates(page, size);
          const content = response?.content || [];
          setCertData(mapCertData(content));
          if (response) {
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
            setCurrentPage(response.number || 0);
          }
        } else if (tab === 'absence') {
          await fetchAbsenceData({ page, size });
          return; // 부재 데이터는 별도 함수에서 처리 후 종료
        }
      } catch (e) {
        console.error(`${tab} 데이터 조회 실패:`, e);
        setLeaveData([]);
        setCertData([]);
        setAbsenceData([]);
      } finally {
        setLoading(false);
      }
    },
    [tab, isHR, user, approvalStatus, fetchAbsenceData],
  );

  // --- useEffect 훅 ---

  // 탭, 권한, 필터 상태가 변경될 때마다 데이터를 다시 조회
  useEffect(() => {
    // 필터 조건이 변경될 때만 페이지를 0으로 리셋
    setCurrentPage(0);
    fetchData({ page: 0 });

    // 자동 새로고침 설정
    clearInterval(autoRefreshInterval);
    if (tab === 'leave' || tab === 'certificate') {
      const interval = setInterval(
        () => fetchData({ page: currentPage }),
        10000,
      );
      setAutoRefreshInterval(interval);
      return () => clearInterval(interval);
    }
  }, [tab, isHR, user, approvalStatus]);

  return {
    leaveData,
    setLeaveData,
    certData,
    absenceData,
    loading,
    fetchData,
    fetchAbsenceData,
    mapLeaveData,
    totalPages,
    totalElements,
    currentPage,
    setCurrentPage,
  };
};
