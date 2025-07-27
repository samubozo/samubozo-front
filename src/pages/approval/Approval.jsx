import React, { useState, useEffect, useContext } from 'react';
import styles from './Approval.module.scss';
import { useLocation } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';
import ToastNotification from '../../components/ToastNotification';
import VacationRequest from '../attendance/VacationRequest';
import AuthContext from '../../context/UserContext';
import axiosInstance from '../../configs/axios-config';
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
      await approvalService.applyCertificate(form);
      fetchData();
      return true; // 성공 시 true 반환
    } catch (e) {
      setCertModalLoading(false);
      return false; // 실패 시 false 반환
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

  // 행 클릭 핸들러 - 상세 정보 모달 열기
  const handleRowClick = (row) => {
    setDetailData(row);
    setShowDetailModal(true);
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
      // rejectTargetId가 배열인 경우 (다중 선택)
      const targetIds = Array.isArray(rejectTargetId)
        ? rejectTargetId
        : [rejectTargetId];

      // 휴가 반려 (기존 로직)
      for (const id of targetIds) {
        if (isHR) {
          await approvalService.rejectHRVacation(id, comment);
        } else {
          await approvalService.rejectVacation(id, comment);
        }
      }

      const message = `반려 처리 완료!\n\n처리 결과:\n• 반려: ${targetIds.length}건\n• 반려 사유: ${comment}\n\n처리자: ${user?.userName || '관리자'}\n처리 시간: ${new Date().toLocaleString()}`;
      setSuccessMessage(message);
      setShowSuccessModal(true);

      setShowRejectModal(false);
      setRejectTargetId(null);
      setSelected([]);
      fetchData(); // 데이터 새로고침
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

  const handleReject = async () => {
    if (tab !== 'leave' || selected.length === 0) return;

    // 반려 모달을 열어서 사유를 입력받음
    setRejectTargetId(selected);
    setShowRejectModal(true);
  };
  const handleApprove = async () => {
    if (tab !== 'leave' || selected.length === 0) return;
    let successCount = 0;
    let failCount = 0;
    let errorMessages = [];

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
        errorMessages.push(err.message || '승인 처리 중 오류가 발생했습니다.');
      }
    }

    if (successCount > 0) {
      const message = `연차 차감 완료!\n\n처리 결과:\n• 성공: ${successCount}건\n• 실패: ${failCount}건\n\n처리자: ${user?.userName || '관리자'}\n처리 시간: ${new Date().toLocaleString()}`;
      setSuccessMessage(message);
      setShowSuccessModal(true);
    }

    if (failCount > 0) {
      setToast({
        message: `일부 처리에 실패했습니다. (${failCount}건 실패)`,
        type: 'error',
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
          // 증명서 탭에서만 인쇄 버튼 활성화
          onEditCert={null}
          onPrintCert={
            tab === 'certificate'
              ? (row) => {
                  /* 추후 구현 */
                }
              : null
          }
          onRowClick={handleRowClick}
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

      {/* 성공 모달 */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
          autoClose={true}
          autoCloseDelay={3000}
        />
      )}

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
          <div
            className={styles.modalContent}
            style={{
              maxWidth: '500px',
              width: '90vw',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            {/* 헤더 */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e9ecef',
                position: 'relative',
                backgroundColor: 'white',
                borderRadius: '12px 12px 0 0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: '#2c3e50',
                      fontSize: '18px',
                      fontWeight: '600',
                    }}
                  >
                    {tab === 'leave' ? '휴가 신청 상세' : '증명서 신청 상세'}
                  </h3>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor:
                        detailData.status === '승인'
                          ? '#d4edda'
                          : detailData.status === '반려'
                            ? '#f8d7da'
                            : '#fff3cd',
                      color:
                        detailData.status === '승인'
                          ? '#155724'
                          : detailData.status === '반려'
                            ? '#721c24'
                            : '#856404',
                      fontWeight: '500',
                      fontSize: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'currentColor',
                        marginRight: '6px',
                      }}
                    ></div>
                    {detailData.status}
                  </div>
                </div>
                <button
                  className={styles.modalClose}
                  onClick={() => {
                    setShowDetailModal(false);
                    setDetailData(null);
                  }}
                  style={{
                    fontSize: '20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6c757d',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = '#495057';
                    e.target.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = '#6c757d';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* 컨텐츠 */}
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1,
                backgroundColor: 'white',
                borderRadius: '0 0 12px 12px',
              }}
            >
              {/* 기본 정보 */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#6c757d',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      신청자
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#2c3e50',
                      }}
                    >
                      {detailData.applicant}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#6c757d',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      부서
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#2c3e50',
                      }}
                    >
                      {detailData.applicantDepartment || detailData.department}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#6c757d',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      신청일
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#2c3e50',
                      }}
                    >
                      {detailData.applyDate}
                    </div>
                  </div>
                  {tab === 'leave' ? (
                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#6c757d',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        휴가 유형
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#2c3e50',
                        }}
                      >
                        {detailData.type}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#6c757d',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        증명서 유형
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#2c3e50',
                        }}
                      >
                        {detailData.type}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 기간/용도 */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor:
                      tab === 'certificate' && detailData.status === '반려'
                        ? '#f8d7da'
                        : tab === 'certificate' && detailData.status === '승인'
                          ? '#d4edda'
                          : tab === 'certificate' &&
                              detailData.status === '대기'
                            ? '#fff3cd'
                            : '#f8f9fa',
                    borderRadius: '8px',
                    border:
                      tab === 'certificate' && detailData.status === '반려'
                        ? '1px solid #f5c6cb'
                        : tab === 'certificate' && detailData.status === '승인'
                          ? '1px solid #c3e6cb'
                          : tab === 'certificate' &&
                              detailData.status === '대기'
                            ? '1px solid #ffeaa7'
                            : '1px solid #e9ecef',
                    borderLeft:
                      tab === 'certificate' && detailData.status === '반려'
                        ? '4px solid #dc3545'
                        : tab === 'certificate' && detailData.status === '승인'
                          ? '4px solid #28a745'
                          : tab === 'certificate' &&
                              detailData.status === '대기'
                            ? '4px solid #ffc107'
                            : 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      color:
                        tab === 'certificate' && detailData.status === '반려'
                          ? '#721c24'
                          : tab === 'certificate' &&
                              detailData.status === '승인'
                            ? '#155724'
                            : tab === 'certificate' &&
                                detailData.status === '대기'
                              ? '#856404'
                              : '#6c757d',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight:
                        tab === 'certificate' && detailData.status !== '대기'
                          ? '600'
                          : '400',
                    }}
                  >
                    {tab === 'leave' ? '기간' : '용도'}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color:
                        tab === 'certificate' && detailData.status === '반려'
                          ? '#721c24'
                          : tab === 'certificate' &&
                              detailData.status === '승인'
                            ? '#155724'
                            : tab === 'certificate' &&
                                detailData.status === '대기'
                              ? '#856404'
                              : '#2c3e50',
                    }}
                  >
                    {tab === 'leave'
                      ? detailData.period
                      : detailData.purpose || '용도 없음'}
                  </div>
                </div>
              </div>

              {/* 사유 */}
              {tab === 'leave' && (
                <div style={{ marginBottom: '24px' }}>
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor:
                        detailData.status === '반려'
                          ? '#f8d7da'
                          : detailData.status === '승인'
                            ? '#d4edda'
                            : '#fff3cd',
                      borderRadius: '8px',
                      border:
                        detailData.status === '반려'
                          ? '1px solid #f5c6cb'
                          : detailData.status === '승인'
                            ? '1px solid #c3e6cb'
                            : '1px solid #ffeaa7',
                      borderLeft:
                        detailData.status === '반려'
                          ? '4px solid #dc3545'
                          : detailData.status === '승인'
                            ? '4px solid #28a745'
                            : '4px solid #ffc107',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color:
                          detailData.status === '반려'
                            ? '#721c24'
                            : detailData.status === '승인'
                              ? '#155724'
                              : '#856404',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight:
                          detailData.status !== '대기' ? '600' : '400',
                      }}
                    >
                      {detailData.status === '반려' ? '반려 사유' : '사유'}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color:
                          detailData.status === '반려'
                            ? '#721c24'
                            : detailData.status === '승인'
                              ? '#155724'
                              : '#856404',
                        lineHeight: '1.4',
                      }}
                    >
                      {detailData.reason || '사유 없음'}
                    </div>
                  </div>
                </div>
              )}

              {/* 휴가 반려 정보 */}
              {tab === 'leave' &&
                detailData.status === '반려' &&
                detailData.rejectComment && (
                  <div style={{ marginBottom: '24px' }}>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        borderRadius: '8px',
                        borderLeft: '4px solid #dc3545',
                      }}
                    >
                      <div
                        style={{
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#721c24',
                          fontSize: '13px',
                        }}
                      >
                        반려 사유
                      </div>
                      <div
                        style={{
                          marginBottom: '12px',
                          color: '#721c24',
                          fontSize: '13px',
                          lineHeight: '1.4',
                        }}
                      >
                        {detailData.rejectComment}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '12px',
                          color: '#721c24',
                          opacity: 0.8,
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: '500' }}>결재자:</span>{' '}
                          {detailData.approver || '결재자 정보 없음'}
                        </div>
                        <div>
                          <span style={{ fontWeight: '500' }}>처리일:</span>{' '}
                          {detailData.processedAt || '처리일 정보 없음'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* 휴가 승인 정보 */}
              {tab === 'leave' &&
                detailData.status === '승인' &&
                detailData.approver && (
                  <div style={{ marginBottom: '24px' }}>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '8px',
                        borderLeft: '4px solid #28a745',
                      }}
                    >
                      <div
                        style={{
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#155724',
                          fontSize: '13px',
                        }}
                      >
                        승인 정보
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '12px',
                          color: '#155724',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: '500' }}>결재자:</span>{' '}
                          {detailData.approver || '결재자 정보 없음'}
                        </div>
                        <div>
                          <span style={{ fontWeight: '500' }}>처리일:</span>{' '}
                          {detailData.processedAt || '처리일 정보 없음'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* 증명서 반려 정보 */}
              {tab === 'certificate' &&
                detailData.status === '반려' &&
                detailData.rejectComment && (
                  <div style={{ marginBottom: '24px' }}>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        borderRadius: '8px',
                        borderLeft: '4px solid #dc3545',
                      }}
                    >
                      <div
                        style={{
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#721c24',
                          fontSize: '13px',
                        }}
                      >
                        반려 사유
                      </div>
                      <div
                        style={{
                          marginBottom: '12px',
                          color: '#721c24',
                          fontSize: '13px',
                          lineHeight: '1.4',
                        }}
                      >
                        {detailData.rejectComment}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '12px',
                          color: '#721c24',
                          opacity: 0.8,
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: '500' }}>결재자:</span>{' '}
                          {detailData.approver || '결재자 정보 없음'}
                        </div>
                        <div>
                          <span style={{ fontWeight: '500' }}>처리일:</span>{' '}
                          {detailData.processedAt || '처리일 정보 없음'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* 증명서 승인 정보 */}
              {tab === 'certificate' &&
                detailData.status === '승인' &&
                detailData.approver && (
                  <div style={{ marginBottom: '24px' }}>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '8px',
                        borderLeft: '4px solid #28a745',
                      }}
                    >
                      <div
                        style={{
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#155724',
                          fontSize: '13px',
                        }}
                      >
                        승인 정보
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '12px',
                          color: '#155724',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: '500' }}>결재자:</span>{' '}
                          {detailData.approver || '결재자 정보 없음'}
                        </div>
                        <div>
                          <span style={{ fontWeight: '500' }}>처리일:</span>{' '}
                          {detailData.processedAt || '처리일 정보 없음'}
                        </div>
                      </div>
                    </div>
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
          }}
        />
      )}
    </div>
  );
}

export default Approval;
