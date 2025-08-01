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

// 메인 Approval 컴포넌트

// 메인 Approval 컴포넌트
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
      // 신청(POST)
      const response = await approvalService.applyCertificate(form);
      await fetchData();
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
      fetchData();
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

      // 데이터 새로고침
      if (tab === 'leave') {
        fetchData();
      } else if (tab === 'absence') {
        fetchAbsenceDataFromHook();
      } else if (tab === 'certificate') {
        fetchData();
      }
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
    // 항목 필터링 (휴가 탭에서만)
    if (item !== 'all') {
      console.log('휴가 필터링:', { item, rowType: row.type, row });
      if (item === '연차' && row.type !== '연차') return false;
      if (item === '반차' && row.type !== '반차') return false;
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

      // 모든 필드에서 검색
      const searchFields = [
        row.applicant,
        row.approver,
        row.purpose,
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
        row.purpose,
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
      console.log('부재 필터링:', { item, rowType: row.type, row });
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
    } else if (tab === 'absence') {
      fetchAbsenceDataFromHook();
    }
  };

  // 부재 승인 핸들러 추가
  const handleAbsenceApprove = async (absenceId) => {
    // HR 권한 체크
    if (!isHR) {
      setToast({
        message: 'HR 권한이 필요합니다.',
        type: 'error',
      });
      return;
    }

    try {
      setLoading(true); // 로딩 시작
      await approvalService.approveHRAbsence(absenceId);
      setSuccessMessage('부재가 승인되었습니다.');
      setShowSuccessModal(true);

      // 승인 후 데이터 새로고침
      setTimeout(() => {
        fetchAbsenceDataFromHook();
      }, 1000);
    } catch (error) {
      console.error('부재 승인 실패:', error);
      setToast({
        message:
          '부재 승인 중 오류가 발생했습니다: ' +
          (error.message || '알 수 없는 오류'),
        type: 'error',
      });
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 부재 반려 핸들러 추가
  const handleAbsenceReject = async (absenceId, comment) => {
    // HR 권한 체크
    if (!isHR) {
      setToast({
        message: 'HR 권한이 필요합니다.',
        type: 'error',
      });
      return;
    }

    try {
      setLoading(true); // 로딩 시작
      await approvalService.rejectHRAbsence(absenceId, comment);
      setSuccessMessage('부재가 반려되었습니다.');
      setShowSuccessModal(true);

      // 반려 후 데이터 새로고침
      setTimeout(() => {
        fetchAbsenceDataFromHook();
      }, 1000);
    } catch (error) {
      console.error('부재 반려 실패:', error);
      setToast({
        message:
          '부재 반려 중 오류가 발생했습니다: ' +
          (error.message || '알 수 없는 오류'),
        type: 'error',
      });
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 페이징 처리
  const totalRows =
    tab === 'leave'
      ? filteredLeave.length
      : tab === 'certificate'
        ? filteredCert.length
        : filteredAbsence.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  const pagedLeave = filteredLeave.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const pagedCert = filteredCert.slice((page - 1) * pageSize, page * pageSize);
  const pagedAbsence = filteredAbsence.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // PDF 인쇄 함수
  const printPdfFromServer = async (certificateId) => {
    try {
      console.log('=== PDF 인쇄 시작 ===');
      console.log('증명서 ID:', certificateId);

      const res = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/my-print/${certificateId}`,
        { responseType: 'arraybuffer' },
      );

      console.log('PDF 응답 상태:', res.status);
      console.log('PDF 데이터 크기:', res.data.byteLength);

      const contentType = res.headers['content-type'] || 'application/pdf';
      const blob = new Blob([res.data], { type: contentType });
      const fileURL = URL.createObjectURL(blob);

      console.log('Blob 크기:', blob.size);
      console.log('파일 URL:', fileURL);

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
    console.log('선택된 ID들:', selected);
    console.log('증명서 데이터:', certData);

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

    console.log('승인된 증명서 ID들:', approvedIds);

    if (approvedIds.length === 0) {
      setToast({
        message: '승인된 증명서만 인쇄할 수 있습니다.',
        type: 'error',
      });
      return;
    }
    approvedIds.forEach((certificateId) => {
      console.log(`증명서 인쇄 시도: certificateId = ${certificateId}`);
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
            typeToKor={(type) => {
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
              page === idx + 1
                ? styles.paginationBtn + ' ' + styles.paginationBtnActive
                : styles.paginationBtn
            }
            onClick={() => setPage(idx + 1)}
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
                <div
                  className={`${styles.statusBadge} ${
                    detailData.status === '승인'
                      ? styles.statusApproved
                      : detailData.status === '반려'
                        ? styles.statusRejected
                        : styles.statusPending
                  }`}
                >
                  <div className={styles.statusDot}></div>
                  {detailData.status}
                </div>
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
                <div className={styles.detailGrid}>
                  <div className={styles.detailCard}>
                    <div className={styles.detailLabel}>신청자</div>
                    <div className={styles.detailValue}>
                      {detailData.applicant}
                    </div>
                  </div>
                  <div className={styles.detailCard}>
                    <div className={styles.detailLabel}>부서</div>
                    <div className={styles.detailValue}>
                      {detailData.applicantDepartment || detailData.department}
                    </div>
                  </div>
                  {tab === 'leave' ? (
                    <>
                      <div className={styles.detailCard}>
                        <div className={styles.detailLabel}>휴가 유형</div>
                        <div className={styles.detailValue}>
                          {detailData.type}
                        </div>
                      </div>
                      <div className={styles.detailCard}>
                        <div className={styles.detailLabel}>기간</div>
                        <div className={styles.detailValue}>
                          {detailData.period}
                        </div>
                      </div>
                    </>
                  ) : tab === 'certificate' ? (
                    <>
                      <div className={styles.detailCard}>
                        <div className={styles.detailLabel}>증명서 유형</div>
                        <div className={styles.detailValue}>
                          {detailData.type}
                        </div>
                      </div>
                      <div className={styles.detailCard}>
                        <div className={styles.detailLabel}>신청일자</div>
                        <div className={styles.detailValue}>
                          {detailData.applyDate}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.detailCard}>
                        <div className={styles.detailLabel}>부재 유형</div>
                        <div className={styles.detailValue}>
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
                              absenceTypeMap[detailData.type] || detailData.type
                            );
                          })()}
                        </div>
                      </div>
                      <div className={styles.detailCard}>
                        <div className={styles.detailLabel}>긴급도</div>
                        <div className={styles.detailValue}>
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
                      <div className={styles.detailCard}>
                        <div className={styles.detailLabel}>신청일</div>
                        <div className={styles.detailValue}>
                          {detailData.applyDate}
                        </div>
                      </div>
                      <div className={styles.detailCard}>
                        <div className={styles.detailLabel}>시간</div>
                        <div className={styles.detailValue}>
                          {detailData.startTime && detailData.endTime
                            ? `${detailData.startTime.substring(0, 5)} ~ ${detailData.endTime.substring(0, 5)}`
                            : '-'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 기간/용도 (휴가가 아닌 경우만) */}
              {tab !== 'leave' && tab !== 'certificate' && (
                <div className={styles.detailSection}>
                  <div className={styles.detailCard}>
                    <div className={styles.detailLabel}>기간</div>
                    <div className={styles.detailValue}>
                      {detailData.period}
                    </div>
                  </div>
                </div>
              )}

              {/* 사유 (대기 상태일 때만) */}
              {detailData.status === '대기' && (
                <div className={styles.detailSection}>
                  <div className={styles.detailCard}>
                    <div className={styles.detailLabel}>사유</div>
                    <div className={styles.detailValue}>
                      {detailData.reason || '-'}
                    </div>
                  </div>
                </div>
              )}

              {/* 승인/반려 정보 */}
              {(detailData.status === '승인' ||
                detailData.status === '반려') && (
                <div className={styles.detailSection}>
                  {detailData.status === '승인' ? (
                    <>
                      <div
                        className={`${styles.detailLabel} ${styles.approvalLabel}`}
                      >
                        승인 정보
                      </div>
                      <div className={styles.detailCard}>
                        <div className={styles.detailValue}>
                          <div className={styles.approvalInfo}>
                            <span>
                              결재자:{' '}
                              {detailData.approver ||
                                detailData.approverName ||
                                '-'}
                            </span>
                            <span>
                              처리일자: {detailData.processedAt || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`${styles.detailLabel} ${styles.rejectLabel}`}
                      >
                        반려사유
                      </div>
                      <div className={styles.detailCard}>
                        <div className={styles.detailValue}>
                          <div className={styles.rejectInfo}>
                            <span>
                              결재자:{' '}
                              {detailData.approver ||
                                detailData.approverName ||
                                '-'}
                            </span>
                            <span>
                              처리일자: {detailData.processedAt || '-'}
                            </span>
                          </div>
                          <div className={styles.rejectReason}>
                            {detailData.rejectComment || '-'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
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
