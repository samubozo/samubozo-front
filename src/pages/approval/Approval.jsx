import React, { useState, useEffect, useContext } from 'react';
import styles from './Approval.module.scss';
import { useLocation } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';
import ToastNotification from '../../components/ToastNotification';
import VacationRequest from '../attendance/VacationRequest';
import AuthContext from '../../context/UserContext';
import axiosInstance from '../../configs/axios-config';

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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [toast, setToast] = useState(null);

  // HR용 결재 상태 필터
  const [approvalStatus, setApprovalStatus] = useState('pending');

  // 휴가 수정 모달 상태
  const [showVacationEdit, setShowVacationEdit] = useState(false);
  const [editVacationData, setEditVacationData] = useState(null);

  // 반려 모달 상태
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  // 모달 상태 추가
  const [showCertModal, setShowCertModal] = useState(false);
  const [editCertData, setEditCertData] = useState(null); // 수정 시 데이터
  const [certModalMode, setCertModalMode] = useState('create'); // 'create' | 'edit'
  const [certModalLoading, setCertModalLoading] = useState(false);

  // 증명서 신청/수정 핸들러
  const handleCertModalOpen = (mode, data) => {
    setCertModalMode(mode);
    setEditCertData(data || null);
    setShowCertModal(true);
  };
  const handleCertModalClose = () => {
    setShowCertModal(false);
    setEditCertData(null);
    setCertModalMode('create');
    setCertModalLoading(false);
  };
  const handleCertModalSubmit = async (form) => {
    setCertModalLoading(true);
    try {
      if (certModalMode === 'create') {
        // 신청(POST)
        await approvalService.applyCertificate(form);
        // handleCertModalClose(); // 성공 모달에서만 닫히도록 수정
      } else if (certModalMode === 'edit' && editCertData) {
        // 수정(PUT)
        await approvalService.editCertificate(editCertData.id, form);
        setToast({ message: '증명서 수정 완료', type: 'success' });
        handleCertModalClose();
      }
      fetchData();
      // handleCertModalClose(); // 성공 모달에서만 닫히도록 수정
    } catch (e) {
      setToast({ message: '처리 중 오류가 발생했습니다.', type: 'error' });
      setCertModalLoading(false);
    }
  };

  // hooks 사용
  const {
    leaveData,
    setLeaveData,
    certData,
    loading,
    fetchData,
    mapLeaveData,
  } = useApprovalData(tab, isHR, user, approvalStatus);

  // 필터/탭 변경 시 page를 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [
    item,
    status,
    dateFrom,
    dateTo,
    filterType,
    filterValue,
    tab,
    approvalStatus,
  ]);

  // 탭 변경 시 필터값 모두 초기화
  useEffect(() => {
    setItem('all');
    setStatus('all');
    setDateFrom('');
    setDateTo('');
    setFilterType('all');
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

  // HR 담당자용 승인 핸들러
  const handleHRApprove = async (approvalId) => {
    try {
      await approvalService.approveHRVacation(approvalId);
      setToast({ message: '승인 처리 완료', type: 'success' });
      // 승인 후 데이터만 새로고침 (상태 변경 없이)
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
      await approvalService.rejectHRVacation(rejectTargetId, comment);
      setToast({ message: '반려 처리 완료', type: 'success' });
      setShowRejectModal(false);
      setRejectTargetId(null);
      // 반려 후 데이터만 새로고침 (상태 변경 없이)
      fetchData();
    } catch (err) {
      setToast({
        message: err.message || '반려 처리 중 오류가 발생했습니다.',
        type: 'error',
      });
    } finally {
      setRejectLoading(false);
    }
  };

  // 필터링 (간단 예시)
  const filteredLeave = leaveData
    .filter((row) => {
      if (item !== 'all' && row.type !== item) return false;
      if (status !== 'all' && row.status !== status) return false;
      if (dateFrom && row.applyDate < dateFrom.replace(/-/g, '.')) return false;
      if (dateTo && row.applyDate > dateTo.replace(/-/g, '.')) return false;
      if (filterType !== 'all' && filterValue) {
        if (filterType === 'applicant' && !row.applicant.includes(filterValue))
          return false;
        if (filterType === 'approver' && !row.approver.includes(filterValue))
          return false;
        if (filterType === 'reason' && !row.reason.includes(filterValue))
          return false;
        if (filterType === 'period' && !row.period.includes(filterValue))
          return false;
        if (
          filterType === 'applicantDepartment' &&
          !row.applicantDepartment.includes(filterValue)
        )
          return false;
      }
      return true;
    })
    // HR 담당자 결재상태별 강제 필터링
    .filter((row) => {
      if (isHR && approvalStatus === 'pending') {
        return row.status === '대기';
      }
      if (isHR && approvalStatus === 'processed') {
        return row.status !== '대기'; // 처리완료는 '승인' 또는 '반려'
      }
      return true;
    });
  const filteredCert = certData.filter((row) => {
    if (item !== 'all' && row.type !== item) return false;
    if (status !== 'all' && row.status !== status) return false;
    if (dateFrom && row.applyDate < dateFrom.replace(/-/g, '.')) return false;
    if (dateTo && row.applyDate > dateTo.replace(/-/g, '.')) return false;
    if (filterType !== 'all' && filterValue) {
      if (filterType === 'applicant' && !row.applicant.includes(filterValue))
        return false;
      if (filterType === 'approver' && !row.approver.includes(filterValue))
        return false;
      if (filterType === 'purpose' && !row.purpose.includes(filterValue))
        return false;
      if (
        filterType === 'applicantDepartment' &&
        !row.applicantDepartment.includes(filterValue)
      )
        return false;
    }
    return true;
  });

  // 버튼 핸들러 (삭제/반려/승인)
  const handleDelete = async () => {
    setSelected([]);
    // TODO: 실제 삭제 API 연동 필요
    fetchData(); // hooks의 fetchData 사용
  };
  const handleReject = async () => {
    if (tab !== 'leave' || selected.length === 0) return;
    for (const id of selected) {
      try {
        if (isHR) {
          await approvalService.rejectHRVacation(id, '사유 입력 필요');
        } else {
          await approvalService.rejectVacation(id, '사유 입력 필요');
        }
      } catch (err) {
        setToast({
          message: err.message || '반려 처리 중 오류가 발생했습니다.',
          type: 'error',
        });
      }
    }
    setToast({ message: '반려 처리 완료', type: 'success' });
    setSelected([]);
    fetchData(); // hooks의 fetchData 사용
  };
  const handleApprove = async () => {
    if (tab !== 'leave' || selected.length === 0) return;
    let successCount = 0;
    let failCount = 0;
    for (const id of selected) {
      try {
        if (isHR) {
          await approvalService.approveHRVacation(id);
        } else {
          await approvalService.approveVacation(id);
        }
        successCount++;
      } catch (err) {
        failCount++;
        setToast({
          message: err.message || '승인 처리 중 오류가 발생했습니다.',
          type: 'error',
        });
      }
    }
    if (successCount > 0) {
      setToast({
        message: `연차 차감 완료! (${successCount}건 승인됨)`,
        type: 'success',
      });
    }
    setSelected([]);
    fetchData(); // hooks의 fetchData 사용
  };

  // 페이징 처리
  const totalRows =
    tab === 'leave' ? filteredLeave.length : filteredCert.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  const pagedLeave = filteredLeave.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const pagedCert = filteredCert.slice((page - 1) * pageSize, page * pageSize);

  // PDF 인쇄 함수
  const printPdfFromServer = async (certificateId) => {
    try {
      const res = await axiosInstance.get(
        `/certificate/my-print/${certificateId}`,
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
      setToast({ message: 'PDF 인쇄 중 오류 발생', type: 'error' });
    }
  };

  // 인쇄 버튼 클릭 핸들러
  const handlePrintSelected = () => {
    const approvedIds = selected.filter(
      (id) => certData.find((row) => row.id === id)?.status === '승인',
    );
    if (approvedIds.length === 0) {
      setToast({
        message: '승인된 증명서만 인쇄할 수 있습니다.',
        type: 'error',
      });
      return;
    }
    approvedIds.forEach((id) => printPdfFromServer(id));
  };

  const statusToKor = (status) => {
    const s = (status || '').trim().toUpperCase();
    if (s === 'PENDING') return '대기';
    if (s === 'APPROVED') return '승인';
    if (s === 'REJECTED') return '반려';
    return status;
  };

  useEffect(() => {
    console.log('certData:', certData);
    console.log('selected:', selected);
  }, [certData, selected]);

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
          options={tab === 'leave' ? leaveOptions : certOptions}
          value={item}
          onChange={setItem}
        />
        <label className={styles.filterLabel}>상태</label>
        <Dropdown options={statusOptions} value={status} onChange={setStatus} />
        {isHR && tab === 'leave' && (
          <>
            <label className={styles.filterLabel}>결재 상태</label>
            <Dropdown
              options={hrApprovalStatusOptions}
              value={approvalStatus}
              onChange={setApprovalStatus}
            />
          </>
        )}
        <DatePicker value={dateFrom} onChange={setDateFrom} />
        <span>~</span>
        <DatePicker value={dateTo} onChange={setDateTo} />
        <label className={styles.filterLabel}>
          {tab === 'leave' ? '검색' : '검색'}
        </label>
        <Dropdown
          options={tab === 'leave' ? leaveFilterTypes : certFilterTypes}
          value={filterType}
          onChange={setFilterType}
        />
        <input
          className={styles.filterInput}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder='검색어 입력'
        />
        <button className={styles.searchBtn}>검색</button>
      </div>
      <div className={styles.tableArea}>
        <ApprovalTable
          columns={tab === 'leave' ? leaveColumns : certColumns}
          data={tab === 'leave' ? pagedLeave : pagedCert}
          selected={selected}
          setSelected={setSelected}
          onEditVacation={tab === 'leave' && !isHR ? handleEditVacation : null}
          onApprove={
            tab === 'leave' && isHR && approvalStatus === 'pending'
              ? handleHRApprove
              : null
          }
          onReject={
            tab === 'leave' && isHR && approvalStatus === 'pending'
              ? handleHRReject
              : null
          }
          isHR={isHR}
          // 증명서 탭에서만 수정/인쇄 버튼 활성화
          onEditCert={
            tab === 'certificate'
              ? (row) => {
                  setEditCertData(row);
                  setShowCertModal(true);
                }
              : null
          }
          onPrintCert={
            tab === 'certificate'
              ? (row) => {
                  /* 추후 구현 */
                }
              : null
          }
        />
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
            <button
              className={styles.approveBtn}
              onClick={() => handleCertModalOpen('create', null)}
            >
              신청
            </button>
            <button
              className={styles.rejectBtn}
              onClick={() => {
                if (selected.length > 0) {
                  const row = certData.find((row) => row.id === selected[0]);
                  handleCertModalOpen('edit', row);
                }
              }}
              disabled={selected.length === 0}
            >
              수정
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
        {/* 기존 삭제/반려/승인 버튼 (휴가 탭, HR만) */}
        {isHR && approvalStatus === 'pending' && tab === 'leave' && (
          <>
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={selected.length === 0}
            >
              삭제
            </button>
            <button
              className={styles.rejectBtn}
              onClick={handleReject}
              disabled={selected.length === 0}
            >
              반려
            </button>
            <button
              className={styles.approveBtn}
              onClick={handleApprove}
              disabled={selected.length === 0}
            >
              승인
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

      {/* 증명서 신청/수정 모달 */}
      {showCertModal && (
        <CertificateModal
          mode={certModalMode}
          defaultValues={editCertData || {}}
          onSubmit={handleCertModalSubmit}
          onClose={handleCertModalClose}
          loading={certModalLoading}
        />
      )}

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Approval;
