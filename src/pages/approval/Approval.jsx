import React, { useState, useEffect, useContext } from 'react';
import styles from './Approval.module.scss';
import { useLocation } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';
import ToastNotification from '../../components/ToastNotification';
import VacationRequest from '../attendance/VacationRequest';
import AuthContext from '../../context/UserContext';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, CERTIFICATE } from '../../configs/host-config';
import SuccessModal from '../../components/SuccessModal';

// 분리된 컴포넌트들
import ApprovalTabs from './ApprovalTabs';
import Dropdown from './Dropdown';
import DatePicker from './DatePicker';
import RejectModal from './RejectModal';
import ApprovalTable from './ApprovalTable';
import CertificateModal from './CertificateModal';

// 상수들
import {
  leaveOptions,
  certOptions,
  statusOptions,
  leaveFilterTypes,
  certFilterTypes,
  leaveColumns,
  certColumns,
  vacationTypeMap,
  statusMap,
  hrApprovalStatusOptions,
  absenceOptions,
  urgencyOptions,
  absenceFilterTypes,
  absenceColumns,
  absenceTypeMap,
  urgencyMap,
} from './constants';

// Hooks
import { useApprovalData } from './hooks/useApprovalData';

function Approval() {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const isHR = user?.hrRole === 'Y';

  // 쿼리 파라미터에서 tab 값을 읽어옴
  const params = new URLSearchParams(location.search);
  const initialTab =
    params.get('tab') === 'certificate' ? 'certificate' : 'leave';
  const [tab, setTab] = useState(initialTab);

  // 공통 상태
  const [item, setItem] = useState('all');
  const [status, setStatus] = useState('all');
  const [urgency, setUrgency] = useState('all'); // 부재 긴급도
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [toast, setToast] = useState(null);

  // 성공 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // HR용 결재 상태 필터
  const [approvalStatus, setApprovalStatus] = useState('pending');

  // 휴가 수정 모달 상태
  const [showVacationEdit, setShowVacationEdit] = useState(false);
  const [editVacationData, setEditVacationData] = useState(null);

  // 반려 모달 상태
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  // 상세 정보 모달 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // 모달 상태 추가
  const [showCertModal, setShowCertModal] = useState(false);
  const [certModalLoading, setCertModalLoading] = useState(false);

  // 실시간 업데이트를 위한 상태 추가
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [dataVersion, setDataVersion] = useState(0); // 데이터 버전 관리

  // 부재 수정/삭제 이벤트 감지
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'absenceUpdated') {
        console.log('부재 수정/삭제 감지됨, 데이터 새로고침');
        refreshData();
      }
      if (e.key === 'absenceUpdatedStorage') {
        console.log('부재 승인/반려 감지됨 (storage), 처리완료 탭으로 이동');
        setApprovalStatus('processed');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 증명서 신청 핸들러
  const handleCertModalOpen = () => {
    setShowCertModal(true);
  };
  const handleCertModalClose = () => {
    setShowCertModal(false);
    setCertModalLoading(false);
  };
  const handleCertModalSubmit = async (form) => {
    setCertModalLoading(true);
    try {
      // 증명서 신청 (백엔드에서 자동으로 결재 요청까지 처리)
      await approvalService.applyCertificate(form);

      await fetchData();

      // 신청 후 처리완료 탭으로 자동 이동
      setApprovalStatus('processed');

      // 모달은 CertificateModal에서 성공 후에 닫도록 함
      return true; // 성공 시 true 반환 (CertificateModal에서 성공 모달 표시)
    } catch (error) {
      console.error('증명서 신청 에러:', error);
      throw error; // 에러를 다시 던져서 CertificateModal에서 처리하도록 함
    } finally {
      setCertModalLoading(false);
    }
  };

  // 증명서 수정 핸들러
  const handleCertEdit = async (certificateId, form) => {
    setCertModalLoading(true);
    try {
      const response = await approvalService.updateCertificate(
        certificateId,
        form,
      );
      await fetchData();

      // 수정 후 처리완료 탭으로 자동 이동
      setApprovalStatus('processed');

      return true;
    } catch (error) {
      console.error('증명서 수정 에러:', error);
      throw error;
    } finally {
      setCertModalLoading(false);
    }
  };

  // hooks 사용
  const {
    leaveData,
    setLeaveData,
    certData,
    absenceData: absenceDataFromHook,
    loading,
    fetchData,
    fetchAbsenceData: fetchAbsenceDataFromHook,
    mapLeaveData,
    // 페이징 정보 추가
    totalPages: backendTotalPages,
    totalElements: backendTotalElements,
    currentPage: backendCurrentPage,
    setCurrentPage: setBackendCurrentPage,
  } = useApprovalData(tab, isHR, user, approvalStatus);

  // 필터 조건 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1);
  }, [item, status, dateFrom, dateTo, filterValue, approvalStatus]);

  // 탭 변경 시 필터값 모두 초기화
  useEffect(() => {
    setItem('all');
    setStatus('all');
    setDateFrom('');
    setDateTo('');
    setFilterValue('');
    setSelected([]);
  }, [tab]);

  // 부재 탭에서 approvalStatus 변경 시 데이터 새로고침
  useEffect(() => {
    if (tab === 'absence') {
      console.log('부재 탭에서 approvalStatus 변경 감지:', approvalStatus);
      fetchAbsenceDataFromHook();
    }
  }, [tab, approvalStatus]);

  // 연차/반차 탭에서 approvalStatus 변경 시 데이터 새로고침
  useEffect(() => {
    if (tab === 'leave') {
      console.log('연차/반차 탭에서 approvalStatus 변경 감지:', approvalStatus);
      fetchData();
    }
  }, [tab, approvalStatus]);

  // leaveData 상태 변화 확인
  useEffect(() => {
    console.log('leaveData 상태 변화:', {
      tab,
      leaveDataLength: leaveData.length,
      leaveData: leaveData,
    });
  }, [leaveData, tab]);

  // URL 쿼리(tab)가 바뀌면 탭 상태도 동기화
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlTab = params.get('tab');
    if (urlTab === 'certificate' && tab !== 'certificate') {
      setTab('certificate');
    } else if (urlTab !== 'certificate' && tab !== 'leave') {
      setTab('leave');
    }
  }, [location.search]);

  // 휴가 수정 핸들러

  // 휴가 수정 핸들러
  const handleEditVacation = (row) => {
    if (isHR) {
      return; // HR이면 수정 불가
    }
    const originalData = row.originalData;
    setEditVacationData({
      id: row.id,
      vacationType: originalData.vacationType,
      startDate: originalData.startDate,
      endDate: originalData.endDate,
      reason: originalData.reason,
      period: row.period, // 기간 정보 추가
    });
    setShowVacationEdit(true);
  };

  const closeVacationEdit = () => {
    setShowVacationEdit(false);
    setEditVacationData(null);
  };

  const handleVacationEditComplete = () => {
    closeVacationEdit();
    fetchData(); // hooks의 fetchData 사용
  };

  // 행 클릭 핸들러 - 상세 정보 모달 열기
  const handleRowClick = (row) => {
    setDetailData(row);
    setShowDetailModal(true);
  };

  // HR 담당자용 승인 핸들러
  const handleHRApprove = async (approvalId) => {
    try {
      if (tab === 'leave') {
        await approvalService.approveHRVacation(approvalId);
      } else if (tab === 'certificate') {
        await approvalService.approveCertificate(approvalId);
      } else if (tab === 'absence') {
        await approvalService.approveHRAbsence(approvalId);
      }

      setToast({ message: '승인 처리 완료', type: 'success' });
      // 승인 후 처리완료 탭으로 자동 이동
      setApprovalStatus('processed');

      // 변경사항 발생 시 즉시 데이터 새로고침
      await refreshData();
    } catch (err) {
      setToast({
        message: err.message || '승인 처리 중 오류가 발생했습니다.',
        type: 'error',
      });
    }
  };

  // HR 담당자용 반려 핸들러
  const handleHRReject = (approvalId) => {
    setRejectTargetId(approvalId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async (comment) => {
    setRejectLoading(true);
    try {
      // rejectTargetId가 배열인 경우 (다중 선택)
      const targetIds = Array.isArray(rejectTargetId)
        ? rejectTargetId
        : [rejectTargetId];

      // 탭에 따라 다른 반려 처리
      if (tab === 'leave') {
        // 휴가 반려 (기존 로직)
        for (const id of targetIds) {
          if (isHR) {
            await approvalService.rejectHRVacation(id, comment);
          } else {
            await approvalService.rejectVacation(id, comment);
          }
        }
        const message = `휴가 신청이 반려되었습니다.\n\n반려 완료: ${targetIds.length}건`;
        setSuccessMessage(message);
      } else if (tab === 'absence') {
        // 부재 반려 (새로 추가)
        for (const id of targetIds) {
          if (isHR) {
            await approvalService.rejectHRAbsence(id, comment);
          } else {
            // 일반 사용자는 부재 반려 권한 없음
            throw new Error('일반 사용자는 부재를 반려할 수 없습니다.');
          }
        }
        const message = `부재 신청이 반려되었습니다.\n\n반려 완료: ${targetIds.length}건`;
        setSuccessMessage(message);
      } else if (tab === 'certificate') {
        // 증명서 반려 (새로 추가)
        for (const id of targetIds) {
          if (isHR) {
            await approvalService.rejectCertificate(id, comment);
          } else {
            // 일반 사용자는 증명서 반려 권한 없음
            throw new Error('일반 사용자는 증명서를 반려할 수 없습니다.');
          }
        }
        const message = `증명서 신청이 반려되었습니다.\n\n반려 완료: ${targetIds.length}건`;
        setSuccessMessage(message);
      }

      setShowSuccessModal(true);
      setShowRejectModal(false);
      setRejectTargetId(null);
      setSelected([]);

      // 반려 후 처리완료 탭으로 자동 이동
      setApprovalStatus('processed');

      // 변경사항 발생 시 즉시 데이터 새로고침
      await refreshData();
    } catch (err) {
      setToast({
        message: err.message || '반려 처리 중 오류가 발생했습니다.',
        type: 'error',
      });
    } finally {
      setRejectLoading(false);
    }
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    // 검색 시 페이지를 1로 리셋
    setPage(1);
  };

  // 탭 변경 시 필터 초기화
  useEffect(() => {
    setItem('all');
    setStatus('all');
    setUrgency('all');
    setDateFrom('');
    setDateTo('');
    setFilterValue('');
    setPage(1);
  }, [tab]);

  // Enter 키로 검색 실행
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 실시간 검색 (검색어 입력 시 자동 필터링)
  const handleFilterValueChange = (e) => {
    setFilterValue(e.target.value);
    // 실시간 필터링을 위해 페이지는 1로 유지
    setPage(1);
  };

  // 날짜 비교 헬퍼 함수
  const compareDates = (date1, date2) => {
    if (!date1 || !date2) return 0;

    // 날짜 형식 정규화 (YYYY-MM-DD 형태로)
    const normalizeDate = (dateStr) => {
      if (!dateStr) return '';

      // YYYY.MM.DD 형태를 YYYY-MM-DD로 변환
      if (dateStr.includes('.')) {
        return dateStr.replace(/\./g, '-');
      }

      // 이미 YYYY-MM-DD 형태인 경우
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }

      return dateStr;
    };

    const normalizedDate1 = normalizeDate(date1);
    const normalizedDate2 = normalizeDate(date2);

    return normalizedDate1.localeCompare(normalizedDate2);
  };

  // 필터링 (개선된 버전)
  const filteredLeave = leaveData.filter((row) => {
    console.log('연차/반차 필터링 체크:', {
      rowId: row.id,
      originalStatus: row.originalStatus,
      status: row.status,
      approvalStatus,
      isPending: row.originalStatus === 'PENDING',
      isProcessed: row.originalStatus !== 'PENDING',
    });

    // 항목 필터링 (휴가 탭에서만)
    if (item !== 'all') {
      if (item === '연차' && row.type !== '연차') return false;
      if (item === '반차' && row.type !== '반차') return false;
    }

    // 결재상태 필터링 (모든 사용자)
    if (approvalStatus === 'pending' && row.originalStatus !== 'PENDING')
      return false;
    if (approvalStatus === 'processed' && row.originalStatus === 'PENDING')
      return false;

    // 날짜 범위 필터링
    if (dateFrom && compareDates(row.applyDate, dateFrom) < 0) return false;
    if (dateTo && compareDates(row.applyDate, dateTo) > 0) return false;

    // 검색어 필터링 (통합 검색)
    if (filterValue.trim()) {
      const searchValue = filterValue.trim().toLowerCase();

      // 모든 필드에서 검색
      const searchFields = [
        row.applicant,
        row.approver,
        row.reason,
        row.applicantDepartment,
      ].filter((field) => field); // null/undefined 제거

      // 하나라도 검색어를 포함하면 통과
      const hasMatch = searchFields.some((field) =>
        field.toLowerCase().includes(searchValue),
      );

      if (!hasMatch) return false;
    }
    return true;
  });

  console.log('연차/반차 필터링 결과:', {
    approvalStatus,
    totalData: leaveData.length,
    filteredData: filteredLeave.length,
    filteredItems: filteredLeave,
  });

  // 증명서 데이터 필터링
  const filteredCert = certData.filter((row) => {
    if (item !== 'all') {
      if (item === '재직증명서' && row.type !== '재직증명서') return false;
      if (item === '경력증명서' && row.type !== '경력증명서') return false;
    }

    // 결재상태 필터링 (모든 사용자)
    if (approvalStatus === 'pending' && row.status !== '대기') return false;
    if (approvalStatus === 'processed' && row.status === '대기') return false;

    // 날짜 범위 필터링
    if (dateFrom && compareDates(row.applyDate, dateFrom) < 0) return false;
    if (dateTo && compareDates(row.applyDate, dateTo) > 0) return false;

    // 검색어 필터링 (통합 검색)
    if (filterValue.trim()) {
      const searchValue = filterValue.trim().toLowerCase();

      const searchFields = [
        row.applicant,
        row.approver,
        row.reason,
        row.applicantDepartment,
      ].filter((field) => field);

      const hasMatch = searchFields.some((field) =>
        field.toLowerCase().includes(searchValue),
      );

      if (!hasMatch) return false;
    }
    return true;
  });

  // 부재 데이터 필터링
  const filteredAbsence = absenceDataFromHook.filter((row) => {
    // 항목 필터링 (부재 탭에서만)
    if (item !== 'all') {
      if (item === '병가' && row.type !== '병가') return false;
      if (item === '공가' && row.type !== '공가') return false;
      if (item === '기타' && row.type !== '기타') return false;
    }

    // 긴급도 필터링 (모든 사용자)
    if (urgency !== 'all') {
      const urgencyMap = {
        일반: '일반',
        긴급: '긴급',
      };
      const expectedUrgency = urgencyMap[urgency];
      if (row.urgency !== expectedUrgency) return false;
    }

    // 결재상태 필터링 (모든 사용자) - 원본 상태값으로 비교
    if (approvalStatus === 'pending') {
      // pending 상태일 때는 PENDING인 항목만 표시
      if (row.originalStatus !== 'PENDING') return false;
    }
    if (approvalStatus === 'processed') {
      // processed 상태일 때는 PENDING이 아닌 항목만 표시
      if (row.originalStatus === 'PENDING') return false;
    }

    // 날짜 범위 필터링
    if (dateFrom && compareDates(row.applyDate, dateFrom) < 0) return false;
    if (dateTo && compareDates(row.applyDate, dateTo) > 0) return false;

    // 검색어 필터링 (통합 검색)
    if (filterValue.trim()) {
      const searchValue = filterValue.trim().toLowerCase();

      const searchFields = [
        row.applicant,
        row.approver,
        row.reason,
        row.period,
        row.applicantDepartment,
      ].filter((field) => field);

      const hasMatch = searchFields.some((field) =>
        field.toLowerCase().includes(searchValue),
      );

      if (!hasMatch) return false;
    }
    return true;
  });

  console.log('부재 필터링 결과:', {
    approvalStatus,
    totalData: absenceDataFromHook.length,
    filteredData: filteredAbsence.length,
    filteredItems: filteredAbsence,
  });

  // 버튼 핸들러 (삭제/반려/승인)

  const handleReject = async () => {
    if ((tab !== 'leave' && tab !== 'absence') || selected.length === 0) return;

    // 반려 모달을 열어서 사유를 입력받음
    setRejectTargetId(selected);
    setShowRejectModal(true);
  };
  const handleApprove = async () => {
    if ((tab !== 'leave' && tab !== 'absence') || selected.length === 0) return;
    let successCount = 0;
    let failCount = 0;
    let errorMessages = [];

    for (const id of selected) {
      try {
        if (isHR) {
          if (tab === 'leave') {
            await approvalService.approveHRVacation(id);
          } else if (tab === 'absence') {
            await approvalService.approveHRAbsence(id);
          }
        } else {
          if (tab === 'leave') {
            await approvalService.approveVacation(id);
          } else if (tab === 'absence') {
            // 일반 사용자는 부재 승인 권한 없음
            throw new Error('일반 사용자는 부재를 승인할 수 없습니다.');
          }
        }
        successCount++;
      } catch (err) {
        failCount++;
        errorMessages.push(err.message || '승인 처리 중 오류가 발생했습니다.');
      }
    }

    // 결과 메시지 표시
    if (successCount > 0) {
      setSuccessMessage(
        `${successCount}건 승인 완료${failCount > 0 ? `, ${failCount}건 실패` : ''}`,
      );
      setShowSuccessModal(true);
    }
    if (failCount > 0) {
      setToast({
        message: `일부 처리에 실패했습니다. (${failCount}건 실패)`,
        type: 'error',
      });
    }

    // 선택 해제 및 데이터 새로고침
    setSelected([]);
    if (tab === 'leave') {
      fetchData();
      // 연차 승인 시 근태관리 테이블에 실시간 업데이트 알림
      localStorage.setItem('vacationApproved', Date.now().toString());
      window.dispatchEvent(new CustomEvent('vacationApproved'));
    } else if (tab === 'absence') {
      fetchAbsenceDataFromHook();
    }
  };

  // 부재 승인 핸들러 추가
  const handleAbsenceApprove = async (absenceId) => {
    try {
      await approvalService.approveHRAbsence(absenceId);
      setToast({ message: '부재 승인 처리 완료', type: 'success' });

      // 승인 후 처리완료 탭으로 자동 이동
      console.log('부재 승인 후 처리완료 탭으로 이동');
      setApprovalStatus('processed');

      // 변경사항 발생 시 즉시 데이터 새로고침
      await refreshData();

      // 페이지 새로고침 (강제)
      setTimeout(() => {
        console.log('페이지 새로고침 실행');
        window.location.reload();
      }, 500);
    } catch (err) {
      setToast({
        message: err.message || '부재 승인 처리 중 오류가 발생했습니다.',
        type: 'error',
      });
    }
  };

  // 부재 반려 핸들러 추가
  const handleAbsenceReject = async (absenceId, comment) => {
    try {
      await approvalService.rejectHRAbsence(absenceId, comment);
      setToast({ message: '부재 반려 처리 완료', type: 'success' });

      // 반려 후 처리완료 탭으로 자동 이동
      setApprovalStatus('processed');

      // 변경사항 발생 시 즉시 데이터 새로고침
      await refreshData();

      // 페이지 새로고침 (강제)
      setTimeout(() => {
        console.log('페이지 새로고침 실행');
        window.location.reload();
      }, 500);
    } catch (err) {
      setToast({
        message: err.message || '부재 반려 처리 중 오류가 발생했습니다.',
        type: 'error',
      });
    }
  };

  // 백엔드 페이징 정보 사용
  const totalPages = backendTotalPages || 0;
  const totalElements = backendTotalElements || 0;
  const currentPage = backendCurrentPage || 0;

  // 백엔드에서 이미 페이징된 데이터를 받아오므로 필터링된 데이터를 직접 사용
  const pagedLeave = filteredLeave;
  const pagedCert = filteredCert;
  const pagedAbsence = filteredAbsence;

  // PDF 인쇄 함수
  const printPdfFromServer = async (certificateId) => {
    try {

      const res = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/my-print/${certificateId}`,
        { responseType: 'arraybuffer' },
      );


      const contentType = res.headers['content-type'] || 'application/pdf';
      const blob = new Blob([res.data], { type: contentType });
      const fileURL = URL.createObjectURL(blob);


      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = fileURL;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 100);
      };
    } catch (err) {
      console.error('PDF 인쇄 오류:', err);
    }
  };

  // 인쇄 버튼 클릭 핸들러
  const handlePrintSelected = () => {

    const approvedIds = selected
      .map((selectedId) => {
        const cert = certData.find((row) => row.id === selectedId);
        return cert?.certificateId || cert?.id;
      })
      .filter((certificateId) => {
        const cert = certData.find(
          (row) => (row.certificateId || row.id) === certificateId,
        );
        return cert?.status === '승인' || cert?.status === 'APPROVED';
      });


    if (approvedIds.length === 0) {
      setToast({
        message: '승인된 증명서만 인쇄할 수 있습니다.',
        type: 'error',
      });
      return;
    }
    approvedIds.forEach((certificateId) => {
      printPdfFromServer(certificateId);
    });
  };

  // 부재 통계 조회 함수 추가
  const fetchAbsenceStatistics = async () => {
    try {
      const stats = await approvalService.getAbsenceApprovalStatistics();
      return stats;
    } catch (error) {
      console.error('부재 통계 조회 실패:', error);
      return null;
    }
  };

  const statusToKor = (status) => {
    const s = (status || '').trim().toUpperCase();
    if (s === 'PENDING') return '대기';
    if (s === 'APPROVED') return '승인';
    if (s === 'REJECTED') return '반려';
    return status;
  };

  // 데이터 버전 업데이트 함수 (변경사항 발생 시 호출)
  const updateDataVersion = () => {
    setDataVersion((prev) => prev + 1);
    setLastUpdateTime(Date.now());
    console.log(
      'Approval 페이지 데이터 버전 업데이트:',
      new Date().toLocaleTimeString(),
    );
  };

  // 데이터 새로고침 함수 (실시간 업데이트용)
  const refreshData = async () => {
    try {
      await fetchData();
      updateDataVersion();
      console.log(
        'Approval 페이지 데이터 수동 새로고침 완료:',
        new Date().toLocaleTimeString(),
      );
    } catch (error) {
      console.error('Approval 페이지 데이터 새로고침 실패:', error);
    }
  };

  // 실시간 업데이트 상태 표시를 위한 함수
  const getLastUpdateTimeString = () => {
    const now = Date.now();
    const diff = now - lastUpdateTime;
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) {
      return `${seconds}초 전`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}분 전`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours}시간 전`;
    }
  };

  // 수동 새로고침 버튼 핸들러
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      await refreshData();
      setToast({ message: '데이터가 새로고침되었습니다.', type: 'success' });
    } catch (error) {
      setToast({ message: '새로고침 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.approvalWrap}>
      {/* 증명서 탭에서만 보이는 신청 버튼 - 삭제 */}
      {/* {tab === 'certificate' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 12,
          }}
        >
          <button
            className={styles.approveBtn}
            onClick={() => {
              setEditCertData(null);
              setShowCertModal(true);
            }}
          >
            신청
          </button>
        </div>
      )} */}
      {/* HR 권한 안내 */}
      {isHR && (
        <div className={styles.hrNotice}>
          <div className={styles.hrNoticeContent}>
            <span className={styles.hrBadge}>HR 담당자</span>
            <span className={styles.hrMessage}>
              휴가 요청을 승인하거나 반려할 수 있습니다. 승인 시 연차가 자동으로
              차감되고, 반려 시 연차가 복구됩니다.
            </span>
          </div>
        </div>
      )}

      <ApprovalTabs tab={tab} setTab={setTab} />
      <div className={styles.filterRow}>
        <label className={styles.filterLabel}>항목</label>
        <Dropdown
          options={
            tab === 'leave'
              ? leaveOptions
              : tab === 'certificate'
                ? certOptions
                : absenceOptions
          }
          value={item}
          onChange={setItem}
        />
        <label className={styles.filterLabel}>결재 상태</label>
        <Dropdown
          options={hrApprovalStatusOptions}
          value={approvalStatus}
          onChange={setApprovalStatus}
        />
        {tab === 'absence' && (
          <>
            <label className={styles.filterLabel}>긴급도</label>
            <Dropdown
              options={urgencyOptions}
              value={urgency}
              onChange={setUrgency}
            />
          </>
        )}
        <DatePicker value={dateFrom} onChange={setDateFrom} />
        <span>~</span>
        <DatePicker value={dateTo} onChange={setDateTo} />
        <input
          className={styles.filterInput}
          value={filterValue}
          onChange={handleFilterValueChange}
          onKeyPress={handleKeyPress}
          placeholder='검색어 입력 (신청자, 결재자, 사유, 기간, 부서)'
        />
        <button className={styles.searchBtn} onClick={handleSearch}>
          검색
        </button>
      </div>

      {/* 건수 표시 */}
      <div className={styles.resultCount}>
        총{' '}
        {tab === 'leave'
          ? filteredLeave.length
          : tab === 'certificate'
            ? filteredCert.length
            : filteredAbsence.length}
        건
        {(item !== 'all' ||
          approvalStatus !== 'pending' ||
          urgency !== 'all' ||
          dateFrom ||
          dateTo ||
          filterValue.trim()) && (
          <span className={styles.filterApplied}> (필터 적용됨)</span>
        )}
      </div>

      <div className={styles.tableArea}>
        {tab === 'leave' ? (
          <ApprovalTable
            columns={leaveColumns}
            data={pagedLeave}
            selected={selected}
            setSelected={setSelected}
            onEditVacation={!isHR ? handleEditVacation : null}
            onApprove={
              isHR && approvalStatus === 'pending' ? handleHRApprove : null
            }
            onReject={
              isHR && approvalStatus === 'pending' ? handleHRReject : null
            }
            isHR={isHR}
            onEditCert={null}
            onPrintCert={null}
            onRowClick={handleRowClick}
            statusToKor={statusToKor}
          />
        ) : tab === 'certificate' ? (
          <ApprovalTable
            columns={certColumns}
            data={pagedCert}
            selected={selected}
            setSelected={setSelected}
            onEditVacation={null}
            onApprove={
              isHR && approvalStatus === 'pending' ? handleHRApprove : null
            }
            onReject={
              isHR && approvalStatus === 'pending' ? handleHRReject : null
            }
            isHR={isHR}
            onEditCert={null}
            onPrintCert={(row) => {
              /* 추후 구현 */
            }}
            onRowClick={handleRowClick}
            statusToKor={statusToKor}
          />
        ) : (
          <ApprovalTable
            columns={absenceColumns}
            data={pagedAbsence}
            selected={selected}
            setSelected={setSelected}
            onEditVacation={null}
            onApprove={
              isHR && approvalStatus === 'pending' ? handleAbsenceApprove : null
            }
            onReject={
              isHR && approvalStatus === 'pending' ? handleAbsenceReject : null
            }
            isHR={isHR}
            onEditCert={null}
            onPrintCert={null}
            onRowClick={handleRowClick}
            statusToKor={statusToKor}
            typeToKor={(type) => {
              const absenceTypeMap = {
                BUSINESS_TRIP: '출장',
                TRAINING: '연수',
                SHORT_LEAVE: '외출',
                SICK_LEAVE: '병가',
                OFFICIAL_LEAVE: '공가',
                ETC: '기타',
              };
              return absenceTypeMap[type] || type;
            }}
            urgencyToKor={(urgency) => {
              const urgencyMap = {
                NORMAL: '일반',
                URGENT: '긴급',
              };
              return urgencyMap[urgency] || urgency;
            }}
          />
        )}
      </div>
      <div className={styles.pagination}>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx + 1}
            className={
              currentPage === idx
                ? styles.paginationBtn + ' ' + styles.paginationBtnActive
                : styles.paginationBtn
            }
            onClick={() => {
              setBackendCurrentPage(idx);
              if (tab === 'absence') {
                fetchAbsenceDataFromHook({ page: idx, size: 10 });
              } else {
                fetchData({ page: idx, size: 10 });
              }
            }}
          >
            {idx + 1}
          </button>
        ))}
      </div>
      {/* 디버깅용 콘솔 */}
      <div className={styles.actionRow}>
        {tab === 'certificate' && (
          <>
            <button className={styles.approveBtn} onClick={handleCertModalOpen}>
              신청
            </button>
            <button
              className={styles.deleteBtn}
              onClick={handlePrintSelected}
              disabled={
                selected.length === 0 ||
                !selected.some(
                  (id) =>
                    certData.find((row) => row.id === id)?.status === '승인',
                )
              }
            >
              인쇄
            </button>
          </>
        )}
        {/* 기존 승인/반려 버튼 (휴가 탭, HR만) */}
        {isHR && approvalStatus === 'pending' && tab === 'leave' && (
          <>
            <button
              className={styles.approveBtn}
              onClick={handleApprove}
              disabled={selected.length === 0}
            >
              승인
            </button>
            <button
              className={styles.rejectBtn}
              onClick={handleReject}
              disabled={selected.length === 0}
            >
              반려
            </button>
          </>
        )}
        {/* 부재 탭 승인/반려 버튼 (HR만) */}
        {isHR && approvalStatus === 'pending' && tab === 'absence' && (
          <>
            <button
              className={styles.approveBtn}
              onClick={handleApprove}
              disabled={selected.length === 0}
            >
              승인
            </button>
            <button
              className={styles.rejectBtn}
              onClick={handleReject}
              disabled={selected.length === 0}
            >
              반려
            </button>
          </>
        )}
      </div>

      {/* 휴가 수정 모달 */}
      {showVacationEdit && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={closeVacationEdit}>
              ×
            </button>
            <VacationRequest
              onClose={handleVacationEditComplete}
              editData={editVacationData}
            />
          </div>
        </div>
      )}

      {/* 반려 사유 입력 모달 */}
      <RejectModal
        open={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectTargetId(null);
        }}
        onConfirm={handleRejectConfirm}
        loading={rejectLoading}
      />

      {/* 증명서 신청 모달 */}
      {showCertModal && (
        <CertificateModal
          onSubmit={handleCertModalSubmit}
          onClose={handleCertModalClose}
          loading={certModalLoading}
          certData={certData} // 추가: 중복 검사를 위한 신청 내역 전달
        />
      )}

      {/* 상세 정보 모달 */}
      {showDetailModal && detailData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleSection}>
                <h3 className={styles.modalTitle}>
                  {tab === 'leave'
                    ? '휴가 신청 상세'
                    : tab === 'certificate'
                      ? '증명서 신청 상세'
                      : '부재 신청 상세'}
                </h3>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailData(null);
                }}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* 기본 정보 */}
              <div className={styles.detailSection}>
                <div className={styles.detailTable}>
                  {tab === 'leave' ? (
                    <>
                      <div className={styles.certificateInfo}>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>신청자</div>
                          <div className={styles.infoValue}>
                            {detailData.applicant || '-'}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>부서</div>
                          <div className={styles.infoValue}>
                            {detailData.applicantDepartment ||
                              detailData.department ||
                              '-'}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>휴가 유형</div>
                          <div className={styles.infoValue}>
                            {detailData.type || '-'}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>기간</div>
                          <div className={styles.infoValue}>
                            {detailData.period || '-'}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>신청일자</div>
                          <div className={styles.infoValue}>
                            {detailData.applyDate || '-'}
                          </div>
                        </div>
                        {detailData.reason && (
                          <div className={styles.infoRow}>
                            <div className={styles.infoLabel}>사유</div>
                            <div className={styles.infoValue}>
                              {detailData.reason || '-'}
                            </div>
                          </div>
                        )}
                        {detailData.status === '대기' && (
                          <div className={styles.infoRow}>
                            <div className={styles.infoLabel}>처리상태</div>
                            <div className={styles.infoValue}>
                              <span
                                className={`${styles.statusBadge} ${styles.status대기}`}
                              >
                                대기
                              </span>
                            </div>
                          </div>
                        )}
                        {detailData.status === '승인' && (
                          <>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>결재자</div>
                              <div className={styles.infoValue}>
                                {detailData.approver ||
                                  detailData.approverName ||
                                  '-'}
                              </div>
                            </div>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>처리일자</div>
                              <div className={styles.infoValue}>
                                {detailData.processedAt || '-'}
                              </div>
                            </div>
                          </>
                        )}
                        {detailData.status === '반려' && (
                          <>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>결재자</div>
                              <div className={styles.infoValue}>
                                {detailData.approver ||
                                  detailData.approverName ||
                                  '-'}
                              </div>
                            </div>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>처리일자</div>
                              <div className={styles.infoValue}>
                                {detailData.processedAt || '-'}
                              </div>
                            </div>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>반려사유</div>
                              <div className={styles.infoValue}>
                                {detailData.rejectComment || '-'}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : tab === 'certificate' ? (
                    <>
                      <div className={styles.certificateInfo}>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>신청자</div>
                          <div className={styles.infoValue}>
                            {detailData.applicant || '-'}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>부서</div>
                          <div className={styles.infoValue}>
                            {detailData.applicantDepartment ||
                              detailData.department ||
                              '-'}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>증명서 유형</div>
                          <div className={styles.infoValue}>
                            {detailData.type || '-'}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>신청일자</div>
                          <div className={styles.infoValue}>
                            {detailData.applyDate || '-'}
                          </div>
                        </div>
                        {detailData.status !== '반려' && (
                          <div className={styles.infoRow}>
                            <div className={styles.infoLabel}>용도</div>
                            <div className={styles.infoValue}>
                              {detailData.reason || '-'}
                            </div>
                          </div>
                        )}
                        {detailData.status === '대기' && (
                          <div className={styles.infoRow}>
                            <div className={styles.infoLabel}>처리상태</div>
                            <div className={styles.infoValue}>
                              <span
                                className={`${styles.statusBadge} ${styles.status대기}`}
                              >
                                대기
                              </span>
                            </div>
                          </div>
                        )}
                        {detailData.status === '승인' && (
                          <>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>결재자</div>
                              <div className={styles.infoValue}>
                                {detailData.approver ||
                                  detailData.approverName ||
                                  '-'}
                              </div>
                            </div>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>처리일자</div>
                              <div className={styles.infoValue}>
                                {detailData.processedAt || '-'}
                              </div>
                            </div>
                          </>
                        )}
                        {detailData.status === '반려' && (
                          <>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>결재자</div>
                              <div className={styles.infoValue}>
                                {detailData.approver ||
                                  detailData.approverName ||
                                  '-'}
                              </div>
                            </div>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>처리일자</div>
                              <div className={styles.infoValue}>
                                {detailData.processedAt || '-'}
                              </div>
                            </div>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>반려사유</div>
                              <div className={styles.infoValue}>
                                {detailData.rejectComment || '-'}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.certificateInfo}>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>신청자</div>
                          <div className={styles.infoValue}>
                            {detailData.applicant || '-'}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>부서</div>
                          <div className={styles.infoValue}>
                            {detailData.applicantDepartment ||
                              detailData.department ||
                              '-'}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>부재 유형</div>
                          <div className={styles.infoValue}>
                            {(() => {
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
                              return (
                                absenceTypeMap[detailData.type] ||
                                detailData.type
                              );
                            })()}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>긴급도</div>
                          <div className={styles.infoValue}>
                            {(() => {
                              const urgencyMap = {
                                NORMAL: '일반',
                                URGENT: '긴급',
                              };
                              return (
                                urgencyMap[detailData.urgency] ||
                                detailData.urgency
                              );
                            })()}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>기간</div>
                          <div className={styles.infoValue}>
                            {detailData.period || '-'}
                          </div>
                        </div>
                        <div className={styles.infoRow}>
                          <div className={styles.infoLabel}>신청일</div>
                          <div className={styles.infoValue}>
                            {detailData.applyDate || '-'}
                          </div>
                        </div>
                        {detailData.startTime && detailData.endTime && (
                          <div className={styles.infoRow}>
                            <div className={styles.infoLabel}>시간</div>
                            <div className={styles.infoValue}>
                              {`${detailData.startTime.substring(0, 5)} ~ ${detailData.endTime.substring(0, 5)}`}
                            </div>
                          </div>
                        )}
                        {detailData.reason && (
                          <div className={styles.infoRow}>
                            <div className={styles.infoLabel}>사유</div>
                            <div className={styles.infoValue}>
                              {detailData.reason || '-'}
                            </div>
                          </div>
                        )}
                        {detailData.status === '대기' && (
                          <div className={styles.infoRow}>
                            <div className={styles.infoLabel}>처리상태</div>
                            <div className={styles.infoValue}>
                              <span
                                className={`${styles.statusBadge} ${styles.status대기}`}
                              >
                                대기
                              </span>
                            </div>
                          </div>
                        )}
                        {detailData.status === '승인' && (
                          <>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>결재자</div>
                              <div className={styles.infoValue}>
                                {detailData.approver ||
                                  detailData.approverName ||
                                  '-'}
                              </div>
                            </div>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>처리일자</div>
                              <div className={styles.infoValue}>
                                {detailData.processedAt || '-'}
                              </div>
                            </div>
                          </>
                        )}
                        {detailData.status === '반려' && (
                          <>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>결재자</div>
                              <div className={styles.infoValue}>
                                {detailData.approver ||
                                  detailData.approverName ||
                                  '-'}
                              </div>
                            </div>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>처리일자</div>
                              <div className={styles.infoValue}>
                                {detailData.processedAt || '-'}
                              </div>
                            </div>
                            <div className={styles.infoRow}>
                              <div className={styles.infoLabel}>반려사유</div>
                              <div className={styles.infoValue}>
                                {detailData.rejectComment || '-'}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 성공 모달 */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage('');
            // 성공 모달 닫힐 때 처리완료 탭으로 이동
            if (isHR && tab === 'leave') {
              setApprovalStatus('processed');
            }
          }}
        />
      )}
    </div>
  );
}

export default Approval;
