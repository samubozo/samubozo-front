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

  // 날짜 포맷 함수 - 백엔드에서 yyyy.MM.dd 형식으로 오므로 그대로 사용
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // 이미 yyyy.MM.dd 형식이면 그대로 반환
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
      return dateStr;
    }
    // 기존 Date 객체 처리
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
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
  const fetchData = async () => {
    setLoading(true);
    try {
      let arr = [];
      if (tab === 'leave') {
        if (isHR) {
          if (approvalStatus === 'pending') {
            // 대기 중인 결재 조회
            const res = await approvalService.getHRPendingApprovals();
            arr = Array.isArray(res) ? res : res?.result || [];
          } else {
            // 처리한 결재 조회
            const res = await approvalService.getProcessedVacations();
            arr = Array.isArray(res) ? res : res?.result || [];
          }
        } else {
          const res = await approvalService.getMyVacationRequests();
          arr = Array.isArray(res) ? res : res?.result || [];
        }
        setLeaveData(mapLeaveData(arr));
      } else {
        // 증명서 탭의 경우 HR 사용자는 처리한 결재 요청 조회
        if (isHR) {
          const res = await approvalService.getProcessedApprovals();
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
