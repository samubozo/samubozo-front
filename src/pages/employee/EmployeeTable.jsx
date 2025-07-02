import React, { useState, useMemo, useEffect } from 'react';
import styles from './EmployeeTable.module.scss';
import EmployeeDetail from './EmployeeDetail';
import * as XLSX from 'xlsx';

const employees = [
  {
    id: 1,
    name: '신현국',
    position: '팀장',
    department: '경영지원',
    joinDate: '2025.02.19',
    phone: '010-0000-1111',
    email: 'aaa@samubozo.com',
    address: '서울특별시 서초구 효령로 335',
    isRetired: 'N',
  },
  {
    id: 2,
    name: '이호영',
    position: '부팀장',
    department: '영업부',
    joinDate: '2025.02.19',
    phone: '010-0000-1111',
    email: 'bbb@samubozo.com',
    address: '서울특별시 서초구 효령로 335',
    isRetired: 'N',
  },
  {
    id: 3,
    name: '김예은',
    position: '사원',
    department: '기획부',
    joinDate: '2025.02.19',
    phone: '010-0000-1111',
    email: 'ccc@samubozo.com',
    address: '서울특별시 서초구 효령로 335',
    isRetired: 'N',
  },
  {
    id: 4,
    name: '주영찬',
    position: '사원',
    department: '마케팅',
    joinDate: '2025.02.19',
    phone: '010-0000-1111',
    email: 'ddd@samubozo.com',
    address: '서울특별시 서초구 효령로 335',
    isRetired: 'N',
  },
  {
    id: 5,
    name: '구현희',
    position: '사원',
    department: '디자인',
    joinDate: '2025.02.19',
    phone: '010-0000-1111',
    email: 'eee@samubozo.com',
    address: '서울특별시 서초구 효령로 335',
    isRetired: 'N',
  },
];

const columnMap = {
  id: '사번',
  name: '성명',
  position: '직책',
  department: '부서',
  joinDate: '입사일자',
  phone: '핸드폰',
  email: '회사이메일',
  address: '주소',
  isRetired: '퇴사',
};

const orderedKeys = [
  'id',
  'name',
  'position',
  'department',
  'joinDate',
  'phone',
  'email',
  'address',
  'isRetired',
];

const EmployeeTable = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('성명');
  const [searchTerm, setSearchTerm] = useState('');
  const [includeRetired, setIncludeRetired] = useState(false);

  // 필터링된 직원 목록을 useMemo로 캐싱하여 성능 최적화
  const filteredEmployees = useMemo(() => {
    // 검색 기준 키 설정 (성명 또는 부서)
    const searchKey = dropdownValue === '성명' ? 'name' : 'department';

    return employees.filter((employee) => {
      // 퇴직자 포함 옵션이 체크되지 않았고 직원이 퇴직자라면 필터링
      if (!includeRetired && employee.isRetired === 'Y') {
        return false;
      }
      // 검색어가 없으면 모든 직원 포함
      if (!searchTerm) {
        return true;
      }
      // 검색어가 있으면 해당 키의 값에 검색어가 포함되는지 확인
      return String(employee[searchKey])
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, dropdownValue, includeRetired]);

  // 필터링된 직원이 변경될 때 선택된 행 초기화
  useEffect(() => {
    setSelectedRow(null);
  }, [filteredEmployees]);

  // 검색 버튼 클릭 핸들러 (실제 검색은 useMemo에서 처리되므로, 여기서는 콘솔 로그만)
  const handleSearch = () => {
    console.log('검색 버튼 클릭됨!');
    // 실제 검색 로직은 searchTerm, dropdownValue, includeRetired 상태 변경 시 useMemo에 의해 자동 실행
  };

  const handleExcelDownload = () => {
    const mappedData = filteredEmployees.map((emp) => {
      const row = {};
      orderedKeys.forEach((key) => {
        row[columnMap[key]] = emp[key];
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '직원정보');
    XLSX.writeFile(workbook, '직원정보.xlsx');
  };

  return (
    <div className={styles.employeeWrapper}>
      <div className={styles.searchBox}>
        <span className={styles.searchLabel}>검색어</span>
        <div
          className={styles.dropdownBox}
          tabIndex={0}
          onBlur={() => setDropdownOpen(false)}
        >
          <div
            className={styles.dropdownSelected}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {dropdownValue}
            <span className={styles.dropdownArrow}>&#9662;</span>
          </div>
          {dropdownOpen && (
            <div className={styles.dropdownOptions}>
              <div
                onClick={() => {
                  setDropdownValue('성명');
                  setDropdownOpen(false);
                }}
              >
                성명
              </div>
              <div
                onClick={() => {
                  setDropdownValue('부서');
                  setDropdownOpen(false);
                }}
              >
                부서
              </div>
            </div>
          )}
        </div>
        <input
          className={styles.searchInput}
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <label className={styles.retiredLabel}>
          <input
            type='checkbox'
            checked={includeRetired}
            onChange={(e) => setIncludeRetired(e.target.checked)}
          />{' '}
          퇴직자포함
        </label>
        <button className={styles.searchBtn} onClick={handleSearch}>
          <span className={styles.searchIcon}>&#128269;</span> 검색
        </button>
      </div>
      <div className={styles.basicInfoTitle}>
        <span className={styles.arrow}>&#9654;</span>
        <span>기본정보</span>
        <button className={styles.excel} onClick={handleExcelDownload}>
          Excel 다운로드
        </button>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>사번</th>
              <th>성명</th>
              <th>직책</th>
              <th>부서</th>
              <th>입사일자</th>
              <th>핸드폰</th>
              <th>회사이메일</th>
              <th>주소</th>
              <th>퇴사</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp, idx) => (
                <tr
                  key={emp.id}
                  className={selectedRow === idx ? styles.selected : ''}
                  onClick={() => setSelectedRow(idx)}
                >
                  <td>{emp.id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.position}</td>
                  <td>{emp.department}</td>
                  <td>{emp.joinDate}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.email}</td>
                  <td>{emp.address}</td>
                  <td>{emp.isRetired}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='9' className={styles.noData}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* 직원 상세정보: 행 클릭 시에만 노출 */}
      {selectedRow !== null && (
        <EmployeeDetail selectedEmployee={filteredEmployees[selectedRow]} />
      )}
    </div>
  );
};

export default EmployeeTable;
