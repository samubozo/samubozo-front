import { useState, useEffect } from 'react';
import { approvalService } from '../../../services/approvalService';
import { vacationTypeMap, statusMap } from '../constants';

export const useApprovalData = (
  tab,
  isHR,
  user,
  approvalStatus = 'pending',
) => {
  const [leaveData, setLeaveData] = useState([]);
  const [certData, setCertData] = useState([]);
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

  // 한글 변환 함수
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
    console.log(
      'fetchData 호출 - approvalStatus:',
      approvalStatus,
      'status:',
      status,
    );
    setLoading(true);
    try {
      let arr = [];
      if (tab === 'leave') {
        if (isHR) {
          // HR 사용자는 통합 API로 전체 결재 내역을 받아옴
          console.log(
            'HR 사용자 데이터 조회 - status:',
            status,
            'requestType:',
            requestType,
          );
          const res = await approvalService.getAllApprovals({
            status: status === 'all' ? undefined : status,
            sortBy,
            sortOrder,
            requestType,
          });
          console.log('HR 사용자 조회 결과:', res);
          arr = Array.isArray(res) ? res : res?.result || [];
        } else {
          const res = await approvalService.getMyVacationRequests();
          arr = Array.isArray(res) ? res : res?.result || [];
        }
        const mappedData = mapLeaveData(arr);
        setLeaveData(mappedData);
      } else {
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
          rejectComment:
            row.rejectComment || (row.status === 'REJECTED' ? row.purpose : ''), // 반려 사유 추가 (임시 해결책)
        }));
        setCertData(mappedCertData);
      }
    } catch (e) {
      setLeaveData([]);
      setCertData([]);
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
  }, [tab, isHR, user, approvalStatus]);

  return {
    leaveData,
    setLeaveData,
    certData,
    loading,
    fetchData,
    mapLeaveData,
    autoRefreshInterval,
  };
};
