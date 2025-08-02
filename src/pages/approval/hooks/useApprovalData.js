import { useState, useEffect } from 'react';
import { approvalService } from '../../../services/approvalService';
import {
  vacationTypeMap,
  statusMap,
  absenceTypeMap,
  urgencyMap,
} from '../constants';

export const useApprovalData = (
  tab,
  isHR,
  user,
  approvalStatus = 'pending',
) => {
  const [leaveData, setLeaveData] = useState([]);
  const [certData, setCertData] = useState([]);
  const [absenceData, setAbsenceData] = useState([]); // 부재 데이터 상태 추가
  const [loading, setLoading] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);

  // 날짜 포맷 함수 - ISO 날짜 문자열을 YYYY-MM-DD 형태로 변환
  const formatDate = (dateStr) => {
    if (!dateStr) return '';

    // ISO 날짜 문자열인 경우 (예: 2025-07-27T22:02:51.518708)
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }

    // 이미 YYYY-MM-DD 형태인 경우
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    return dateStr;
  };

  // 데이터 매핑 함수
  const mapLeaveData = (arr) => {
    return arr.map((row) => ({
      id: isHR ? row.id : row.vacationId,
      type: vacationTypeMap[row.vacationType] || row.vacationType,
      reason: row.reason,
      applicant: isHR ? row.applicantName : user.userName,
      department: isHR ? row.department : user.department,
      applicantDepartment:
        row.applicantDepartment || row.department || user.department,
      applyDate: formatDate(row.requestedAt),
      period:
        row.period ||
        (row.startDate && row.endDate
          ? `${row.startDate} ~ ${row.endDate}`
          : ''),
      endDate: row.endDate,
      approver: row.approverName || row.approver || '',
      processedAt: row.processedAt || row.approvedAt || row.rejectedAt || '',
      status:
        statusMap[(row.vacationStatus || row.status || '').toUpperCase()] ||
        '대기',
      rejectComment:
        row.rejectComment ||
        (row.vacationStatus === 'REJECTED' ? row.reason : ''), // 반려 사유 추가 (임시 해결책)
      originalData: row,
    }));
  };

  // 매핑 맵들 정의
  const vacationTypeMap = {
    ANNUAL_LEAVE: '연차',
    HALF_DAY_LEAVE: '반차',
    SICK_LEAVE: '병가',
    OFFICIAL_LEAVE: '공가',
    PERSONAL_LEAVE: '개인휴가',
  };

  const absenceTypeMap = {
    BUSINESS_TRIP: '출장',
    TRAINING: '연수',
    ANNUAL_LEAVE: '연차',
    HALF_DAY_LEAVE: '반차',
    SHORT_LEAVE: '외출',
    SICK_LEAVE: '병가',
    OFFICIAL_LEAVE: '공가',
    ETC: '기타',
  };

  const urgencyMap = {
    NORMAL: '일반',
    URGENT: '긴급',
  };

  const statusMap = {
    PENDING: '대기',
    APPROVED: '승인',
    REJECTED: '반려',
  };

  // 부재 데이터 매핑 함수 추가
  const mapAbsenceData = (arr) => {
    return arr.map((row) => {
      // absenceType과 urgency 필드 찾기
      const absenceType = row.absenceType || row.type || row.absence_type;
      const urgency = row.urgency || row.urgency_type;

      return {
        id: row.id,
        type: absenceTypeMap[absenceType] || absenceType || '',
        urgency: urgencyMap[urgency] || urgency || '',
        reason: row.reason,
        applicant: row.applicantName || user.userName,
        applicantDepartment:
          row.applicantDepartment ||
          row.department ||
          row.applicantDepartmentName ||
          user.department ||
          '부서 정보 없음',
        applyDate: formatDate(row.requestedAt),
        period:
          row.period ||
          (row.startDate && row.endDate
            ? `${row.startDate} ~ ${row.endDate}`
            : ''),
        startTime: row.startTime || '',
        endTime: row.endTime || '',
        approver: row.approverName || row.approver || '',
        processedAt: formatDate(
          row.processedAt || row.approvedAt || row.rejectedAt || '',
        ),
        status: statusMap[(row.status || '').toUpperCase()] || '대기',
        rejectComment: row.rejectComment || '',
        originalData: row,
      };
    });
  };

  // 한글 변환 함수 (증명서용)
  const typeToKor = (type) => {
    const t = (type || '').trim().toUpperCase();
    if (t === 'EMPLOYMENT') return '재직증명서';
    if (t === 'CAREER') return '경력증명서';
    if (t === 'RETIREMENT') return '퇴직증명서';
    return type;
  };

  const statusToKor = (status) => {
    const s = (status || '').trim().toUpperCase();
    if (s === 'PENDING') return '대기';
    if (s === 'APPROVED') return '승인';
    if (s === 'REJECTED') return '반려';
    return status;
  };

  // 부재 데이터 불러오기 함수 추가
  const fetchAbsenceData = async ({
    status = approvalStatus === 'pending'
      ? 'pending'
      : approvalStatus === 'processed'
        ? 'processed'
        : 'all',
    page = 0,
    size = 10,
  } = {}) => {
    setLoading(true);
    try {
      let arr = [];
      if (isHR) {
        // HR 사용자는 상태에 따라 다른 API 호출
        if (status === 'pending') {
          const res = await approvalService.getPendingAbsenceApprovals(
            page,
            size,
          );
          arr = res?.content || res?.result || [];
        } else if (status === 'processed') {
          const res = await approvalService.getProcessedAbsenceApprovals(
            page,
            size,
          );
          arr = res?.content || res?.result || [];
        } else {
          const res = await approvalService.getAbsenceApprovals(page, size);
          arr = res?.content || res?.result || [];
        }
      } else {
        // 일반 사용자는 본인 부재 결재 요청만 조회
        const res = await approvalService.getMyAbsenceApprovals(page, size);
        arr = res?.content || res?.result || [];
      }

      const mappedData = mapAbsenceData(arr);
      setAbsenceData(mappedData);
    } catch (error) {
      setAbsenceData([]);
    } finally {
      setLoading(false);
    }
  };

  // 데이터 불러오기
  const fetchData = async ({
    status = approvalStatus === 'pending'
      ? 'pending'
      : approvalStatus === 'processed'
        ? 'processed'
        : 'all',
    sortBy = 'requestedAt',
    sortOrder = 'desc',
    requestType = tab === 'leave' ? 'VACATION' : undefined, // 연차/반차 탭에서만 VACATION 타입 필터링
  } = {}) => {
    setLoading(true);
    try {
      let arr = [];
      if (tab === 'leave') {
        if (isHR) {
          // HR 사용자는 통합 API로 전체 결재 내역을 받아옴
          const res = await approvalService.getAllApprovals({
            status: status === 'all' ? undefined : status,
            sortBy,
            sortOrder,
            requestType: 'VACATION', // 명시적으로 VACATION만 조회
          });
          arr = Array.isArray(res) ? res : res?.result || [];

          // 클라이언트 사이드에서 VACATION 타입만 필터링 (백엔드 필터링이 작동하지 않을 경우 대비)
          arr = arr.filter((item) => item.requestType === 'VACATION');
        } else {
          const res = await approvalService.getMyVacationRequests();
          arr = Array.isArray(res) ? res : res?.result || [];
        }
        const mappedData = mapLeaveData(arr);
        setLeaveData(mappedData);
      } else if (tab === 'certificate') {
        // 증명서 탭의 경우 모든 사용자가 본인 증명서 내역 조회
        const res = await approvalService.getMyCertificates();
        arr = Array.isArray(res)
          ? res
          : res?.result?.content || res?.result || [];
        // 증명서 데이터도 매핑 (CertificateResDto 구조에 맞게)
        const mappedCertData = arr.map((row) => ({
          ...row,
          id: row.certificateId, // id 필드 추가
          type: typeToKor(row.type), // 한글 변환 적용 (화면 표시용)
          originalType: row.type, // 원본 타입 보존 (중복 검사용)
          status: statusToKor(row.status), // 항상 한글 변환 적용
          applicant: row.applicantName || '',
          applicantDepartment: row.departmentName || '',
          applyDate: row.requestDate || '',
          approver: row.approverName || '',
          processedAt: formatDate(
            row.approveDate || row.rejectedAt || row.processedAt || '',
          ),
          reason: row.reason || '', // reason 필드 추가
          rejectComment:
            row.rejectComment || (row.status === 'REJECTED' ? row.reason : ''), // 반려 사유 수정
        }));
        setCertData(mappedCertData);
      } else if (tab === 'absence') {
        // 부재 탭의 경우 fetchAbsenceData 함수 사용
        await fetchAbsenceData({ status });
      }
    } catch (e) {
      setLeaveData([]);
      setCertData([]);
      setAbsenceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 초기 로드
    fetchData();

    // 연차/반차 탭일 때 모든 사용자에게 자동 새로고침 (10초마다)
    if (tab === 'leave') {
      const interval = setInterval(fetchData, 10000);
      setAutoRefreshInterval(interval);

      return () => {
        clearInterval(interval);
        setAutoRefreshInterval(null);
      };
    }

    // 증명서 탭일 때도 자동 새로고침 (5초마다)
    if (tab === 'certificate') {
      const interval = setInterval(fetchData, 5000);
      setAutoRefreshInterval(interval);

      return () => {
        clearInterval(interval);
        setAutoRefreshInterval(null);
      };
    }
  }, [tab, isHR, user, approvalStatus]);

  return {
    leaveData,
    setLeaveData,
    certData,
    absenceData, // 부재 데이터 추가
    loading,
    fetchData,
    fetchAbsenceData, // 부재 데이터 조회 함수 추가
    mapLeaveData,
    autoRefreshInterval,
  };
};
