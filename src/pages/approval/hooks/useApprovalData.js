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

  // 날짜 포맷 함수 - 백엔드에서 온 값을 그대로 반환
  const formatDate = (dateStr) => {
    return dateStr || '';
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
      originalData: row,
    }));
  };

  // 데이터 불러오기
  const fetchData = async ({
    status = approvalStatus === 'pending'
      ? 'pending'
      : approvalStatus === 'processed'
        ? 'processed'
        : 'all', // <-- 수정된 부분
    sortBy = 'requestedAt',
    sortOrder = 'desc',
    requestType = 'VACATION',
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
            requestType,
          });
          arr = Array.isArray(res) ? res : res?.result || [];
        } else {
          const res = await approvalService.getMyVacationRequests();
          arr = Array.isArray(res) ? res : res?.result || [];
        }
        setLeaveData(mapLeaveData(arr));
      } else {
        // 증명서 탭의 경우 HR 사용자는 처리한 결재 요청 조회
        if (isHR) {
          const res = await approvalService.getAllApprovals({
            status: status === 'all' ? undefined : status,
            sortBy,
            sortOrder,
            requestType: 'CERTIFICATE',
          });
          arr = Array.isArray(res) ? res : res?.result || [];
        }
        // 증명서 데이터도 매핑
        const mappedCertData = arr.map((row) => ({
          ...row,
          applicantDepartment: row.applicantDepartment || row.department || '',
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
    fetchData();
  }, [tab, isHR, user, approvalStatus]);

  return {
    leaveData,
    setLeaveData,
    certData,
    loading,
    fetchData,
    mapLeaveData,
  };
};
