import React, { useState, useEffect } from 'react';
import styles from './Approval.module.scss';
import { useLocation } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';
import ToastNotification from '../../components/ToastNotification';

// 독립 컴포넌트: Tab
function ApprovalTabs({ tab, setTab }) {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tabBtn} ${tab === 'certificate' ? styles.activeTab : ''}`}
        onClick={() => setTab('certificate')}
      >
        증명서 내역
      </button>
      <button
        className={`${styles.tabBtn} ${tab === 'leave' ? styles.activeTab : ''}`}
        onClick={() => setTab('leave')}
      >
        연차/반차 내역
      </button>
    </div>
  );
}

// 독립 컴포넌트: Dropdown
function Dropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.dropdown} tabIndex={0} onBlur={() => setOpen(false)}>
      <div
        className={styles.dropdownSelected}
        onClick={() => setOpen((v) => !v)}
      >
        {options.find((o) => o.value === value)?.label || options[0].label}
        <span className={styles.dropdownArrow}>▼</span>
      </div>
      {open && (
        <div className={styles.dropdownList}>
          {options.map((o) => (
            <div
              key={o.value}
              className={styles.dropdownItem}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 독립 컴포넌트: DatePicker (간단한 input type=date)
function DatePicker({ value, onChange }) {
  return (
    <input
      type='date'
      className={styles.datePicker}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// 독립 컴포넌트: Table
function ApprovalTable({ columns, data, selected, setSelected }) {
  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>
            <input
              type='checkbox'
              checked={selected.length === data.length && data.length > 0}
              onChange={(e) =>
                setSelected(e.target.checked ? data.map((d) => d.id) : [])
              }
            />
          </th>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={row.id ?? idx}>
            <td>
              <input
                type='checkbox'
                checked={selected.includes(row.id)}
                onChange={() => toggle(row.id)}
              />
            </td>
            {columns.map((col) => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 메인 Approval 컴포넌트
function Approval() {
  const location = useLocation();
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

  // 필터/탭 변경 시 page를 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [item, status, dateFrom, dateTo, filterType, filterValue, tab]);

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

  // 더미 데이터
  const leaveOptions = [
    { value: 'all', label: '전체' },
    { value: '연차', label: '연차' },
    { value: '반차', label: '반차' },
  ];
  const certOptions = [
    { value: 'all', label: '전체' },
    { value: '재직', label: '재직' },
    { value: '경력', label: '경력' },
    { value: '퇴직', label: '퇴직' },
  ];
  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: '요청', label: '요청' },
    { value: '승인', label: '승인' },
    { value: '반려', label: '반려' },
  ];
  const leaveFilterTypes = [
    { value: 'all', label: '전체' },
    { value: 'applicant', label: '신청자' },
    { value: 'approver', label: '결재자' },
    { value: 'reason', label: '사유' },
  ];
  const certFilterTypes = [
    { value: 'all', label: '전체' },
    { value: 'applicant', label: '신청자' },
    { value: 'approver', label: '결재자' },
    { value: 'purpose', label: '용도' },
  ];

  // 더미 테이블 데이터
  const leaveColumns = [
    { key: 'type', label: '항목' },
    { key: 'reason', label: '사유' },
    { key: 'applicant', label: '신청자' },
    { key: 'applyDate', label: '신청일자' },
    { key: 'approver', label: '결재자' },
    { key: 'processer', label: '처리일자' },
    { key: 'status', label: '상태' },
  ];
  const certColumns = [
    { key: 'type', label: '항목' },
    { key: 'purpose', label: '용도' },
    { key: 'applicant', label: '신청자' },
    { key: 'applyDate', label: '신청일자' },
    { key: 'approver', label: '결재자' },
    { key: 'processer', label: '처리일자' },
    { key: 'status', label: '상태' },
  ];
  const [leaveData, setLeaveData] = useState([]);
  const [certData, setCertData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 영어 -> 한글 매핑 객체 추가
  const vacationTypeMap = {
    ANNUAL_LEAVE: '연차',
    AM_HALF_DAY: '반차(오전)',
    PM_HALF_DAY: '반차(오후)',
  };
  const statusMap = {
    PENDING: '대기',
    APPROVED: '승인',
    REJECTED: '반려',
  };

  // 실제 API 연동: 휴가/증명서 목록 불러오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 'leave') {
          const res = await approvalService.getPendingApprovals();
          const arr = Array.isArray(res) ? res : res?.result || [];
          setLeaveData(
            arr.map((row) => ({
              id: row.vacationId,
              type: vacationTypeMap[row.vacationType] || row.vacationType, // 한글 변환
              reason: row.reason,
              applicant: row.applicantName,
              department: row.department,
              applyDate: row.startDate,
              endDate: row.endDate,
              status: statusMap[row.status] || '대기', // 한글 변환
            })),
          );
        } else {
          setCertData([]); // 임시
        }
      } catch (e) {
        setLeaveData([]);
        setCertData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab]);

  // 필터링 (간단 예시)
  const filteredLeave = leaveData.filter((row) => {
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
    }
    return true;
  });

  // 버튼 핸들러 (삭제/반려/승인)
  const handleDelete = async () => {
    setSelected([]);
    // TODO: 실제 삭제 API 연동 필요
    // 삭제 후 목록 새로고침
    if (tab === 'leave') {
      const res = await approvalService.getPendingApprovals();
      setLeaveData(res || []);
    }
  };
  const handleReject = async () => {
    if (tab !== 'leave' || selected.length === 0) return;
    for (const id of selected) {
      try {
        await approvalService.rejectVacation(id, '사유 입력 필요');
      } catch (err) {
        setToast({
          message: err.message || '반려 처리 중 오류가 발생했습니다.',
          type: 'error',
        });
      }
    }
    setToast({ message: '반려 처리 완료', type: 'success' });
    setSelected([]);
    // 반려 후 목록 새로고침
    const res = await approvalService.getPendingApprovals();
    setLeaveData(res || []);
  };
  const handleApprove = async () => {
    if (tab !== 'leave' || selected.length === 0) return;
    let successCount = 0;
    let failCount = 0;
    for (const id of selected) {
      try {
        await approvalService.approveVacation(id);
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
    // 승인 후 목록 새로고침
    const res = await approvalService.getPendingApprovals();
    setLeaveData(res || []);
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

  return (
    <div className={styles.approvalWrap}>
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
      <div className={styles.actionRow}>
        <button className={styles.deleteBtn} onClick={handleDelete}>
          삭제
        </button>
        <button className={styles.rejectBtn} onClick={handleReject}>
          반려
        </button>
        <button className={styles.approveBtn} onClick={handleApprove}>
          승인
        </button>
      </div>
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
