import React, { useState, useEffect } from 'react';
import styles from './Approval.module.scss';

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
        {data.map((row) => (
          <tr key={row.id}>
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
  // 탭 상태
  const [tab, setTab] = useState('leave');

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
  const leaveData = [
    {
      id: 1,
      type: '연차',
      reason: '개인사유',
      applicant: '신현국',
      applyDate: '2025.06.20',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 2,
      type: '반차',
      reason: '병원',
      applicant: '홍길동',
      applyDate: '2025.06.19',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 3,
      type: '연차',
      reason: '가족여행',
      applicant: '김철수',
      applyDate: '2025.06.18',
      approver: '인사담당자',
      processer: '2025.06.18',
      status: '승인',
    },
    {
      id: 4,
      type: '반차',
      reason: '치과',
      applicant: '이영희',
      applyDate: '2025.06.17',
      approver: '인사담당자',
      processer: '2025.06.17',
      status: '승인',
    },
    {
      id: 5,
      type: '연차',
      reason: '개인휴식',
      applicant: '박민수',
      applyDate: '2025.06.16',
      approver: '인사담당자',
      processer: '2025.06.16',
      status: '반려',
    },
    {
      id: 6,
      type: '반차',
      reason: '약속',
      applicant: '최지영',
      applyDate: '2025.06.15',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 7,
      type: '연차',
      reason: '가족행사',
      applicant: '정수진',
      applyDate: '2025.06.14',
      approver: '인사담당자',
      processer: '2025.06.14',
      status: '승인',
    },
    {
      id: 8,
      type: '반차',
      reason: '병원진료',
      applicant: '한미영',
      applyDate: '2025.06.13',
      approver: '인사담당자',
      processer: '2025.06.13',
      status: '승인',
    },
    {
      id: 9,
      type: '연차',
      reason: '개인휴식',
      applicant: '송태호',
      applyDate: '2025.06.12',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 10,
      type: '반차',
      reason: '약속',
      applicant: '윤서연',
      applyDate: '2025.06.11',
      approver: '인사담당자',
      processer: '2025.06.11',
      status: '승인',
    },
    {
      id: 11,
      type: '연차',
      reason: '가족여행',
      applicant: '임동현',
      applyDate: '2025.06.10',
      approver: '인사담당자',
      processer: '2025.06.10',
      status: '승인',
    },
    {
      id: 12,
      type: '반차',
      reason: '치과',
      applicant: '강지은',
      applyDate: '2025.06.09',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 13,
      type: '연차',
      reason: '개인사유',
      applicant: '조현우',
      applyDate: '2025.06.08',
      approver: '인사담당자',
      processer: '2025.06.08',
      status: '반려',
    },
    {
      id: 14,
      type: '반차',
      reason: '병원',
      applicant: '백서진',
      applyDate: '2025.06.07',
      approver: '인사담당자',
      processer: '2025.06.07',
      status: '승인',
    },
    {
      id: 15,
      type: '연차',
      reason: '가족행사',
      applicant: '남궁민',
      applyDate: '2025.06.06',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 16,
      type: '반차',
      reason: '약속',
      applicant: '차은우',
      applyDate: '2025.06.05',
      approver: '인사담당자',
      processer: '2025.06.05',
      status: '승인',
    },
    {
      id: 17,
      type: '연차',
      reason: '개인휴식',
      applicant: '오승우',
      applyDate: '2025.06.04',
      approver: '인사담당자',
      processer: '2025.06.04',
      status: '승인',
    },
    {
      id: 18,
      type: '반차',
      reason: '치과',
      applicant: '전지현',
      applyDate: '2025.06.03',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 19,
      type: '연차',
      reason: '가족여행',
      applicant: '김태희',
      applyDate: '2025.06.02',
      approver: '인사담당자',
      processer: '2025.06.02',
      status: '승인',
    },
    {
      id: 20,
      type: '반차',
      reason: '병원진료',
      applicant: '원빈',
      applyDate: '2025.06.01',
      approver: '인사담당자',
      processer: '2025.06.01',
      status: '승인',
    },
  ];
  const certData = [
    {
      id: 1,
      type: '재직',
      purpose: '은행제출',
      applicant: '신현국',
      applyDate: '2025.06.20',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 2,
      type: '경력',
      purpose: '이직',
      applicant: '홍길동',
      applyDate: '2025.06.19',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 3,
      type: '재직',
      purpose: '대출신청',
      applicant: '김철수',
      applyDate: '2025.06.18',
      approver: '인사담당자',
      processer: '2025.06.18',
      status: '승인',
    },
    {
      id: 4,
      type: '퇴직',
      purpose: '퇴직금',
      applicant: '이영희',
      applyDate: '2025.06.17',
      approver: '인사담당자',
      processer: '2025.06.17',
      status: '승인',
    },
    {
      id: 5,
      type: '경력',
      purpose: '이직',
      applicant: '박민수',
      applyDate: '2025.06.16',
      approver: '인사담당자',
      processer: '2025.06.16',
      status: '반려',
    },
    {
      id: 6,
      type: '재직',
      purpose: '아파트분양',
      applicant: '최지영',
      applyDate: '2025.06.15',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 7,
      type: '경력',
      purpose: '이직',
      applicant: '정수진',
      applyDate: '2025.06.14',
      approver: '인사담당자',
      processer: '2025.06.14',
      status: '승인',
    },
    {
      id: 8,
      type: '재직',
      purpose: '대출신청',
      applicant: '한미영',
      applyDate: '2025.06.13',
      approver: '인사담당자',
      processer: '2025.06.13',
      status: '승인',
    },
    {
      id: 9,
      type: '퇴직',
      purpose: '퇴직금',
      applicant: '송태호',
      applyDate: '2025.06.12',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 10,
      type: '경력',
      purpose: '이직',
      applicant: '윤서연',
      applyDate: '2025.06.11',
      approver: '인사담당자',
      processer: '2025.06.11',
      status: '승인',
    },
    {
      id: 11,
      type: '재직',
      purpose: '은행제출',
      applicant: '임동현',
      applyDate: '2025.06.10',
      approver: '인사담당자',
      processer: '2025.06.10',
      status: '승인',
    },
    {
      id: 12,
      type: '경력',
      purpose: '이직',
      applicant: '강지은',
      applyDate: '2025.06.09',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 13,
      type: '재직',
      purpose: '대출신청',
      applicant: '조현우',
      applyDate: '2025.06.08',
      approver: '인사담당자',
      processer: '2025.06.08',
      status: '반려',
    },
    {
      id: 14,
      type: '퇴직',
      purpose: '퇴직금',
      applicant: '백서진',
      applyDate: '2025.06.07',
      approver: '인사담당자',
      processer: '2025.06.07',
      status: '승인',
    },
    {
      id: 15,
      type: '경력',
      purpose: '이직',
      applicant: '남궁민',
      applyDate: '2025.06.06',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 16,
      type: '재직',
      purpose: '아파트분양',
      applicant: '차은우',
      applyDate: '2025.06.05',
      approver: '인사담당자',
      processer: '2025.06.05',
      status: '승인',
    },
    {
      id: 17,
      type: '경력',
      purpose: '이직',
      applicant: '오승우',
      applyDate: '2025.06.04',
      approver: '인사담당자',
      processer: '2025.06.04',
      status: '승인',
    },
    {
      id: 18,
      type: '재직',
      purpose: '은행제출',
      applicant: '전지현',
      applyDate: '2025.06.03',
      approver: '인사담당자',
      processer: '-',
      status: '요청',
    },
    {
      id: 19,
      type: '경력',
      purpose: '이직',
      applicant: '김태희',
      applyDate: '2025.06.02',
      approver: '인사담당자',
      processer: '2025.06.02',
      status: '승인',
    },
    {
      id: 20,
      type: '퇴직',
      purpose: '퇴직금',
      applicant: '원빈',
      applyDate: '2025.06.01',
      approver: '인사담당자',
      processer: '2025.06.01',
      status: '승인',
    },
  ];

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
  const handleDelete = () => setSelected([]);
  const handleReject = () => setSelected([]);
  const handleApprove = () => setSelected([]);

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
    </div>
  );
}

export default Approval;
