import React, { useState, useEffect, useRef } from 'react';
import styles from './EmployeeTable.module.scss';
import EmployeeDetail from './EmployeeDetail';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR } from '../../configs/host-config';

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
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const tableWrapRef = useRef(null);

  const fetchEmployees = async (
    pageNum = 0,
    search = '',
    searchType = '성명',
    includeRetiredOpt = false,
    append = false,
  ) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}${HR}/user/list`;
      let params = { page: pageNum, size: 10 };
      if (search) {
        url = `${API_BASE_URL}${HR}/users/search`;
        params = {
          ...(searchType === '성명'
            ? { userName: search }
            : { departmentName: search }),
          page: pageNum,
          size: 10,
        };
        if (!includeRetiredOpt) {
          params.activate = 'Y';
        }
      }
      const res = await axiosInstance.get(url, { params });
      const list = res.data.result?.content || res.data.result || [];
      let filtered = list;
      if (search) {
        if (!includeRetiredOpt) {
          filtered = list.filter((emp) => emp.activate === 'Y');
        }
      }
      const mapped = filtered.map((emp) => ({
        id: emp.employeeNo,
        name: emp.userName,
        position: emp.positionName,
        department:
          emp.department?.name || emp.department?.departmentName || '',
        joinDate: emp.hireDate,
        phone: emp.phone,
        email: emp.email,
        address: emp.address,
        isRetired: emp.activate === 'Y' ? 'Y' : 'N',
      }));
      setEmployees((prev) => (append ? [...prev, ...mapped] : mapped));
      const totalPages = res.data.result?.totalPages;
      if (typeof totalPages === 'number') {
        setHasMore(pageNum + 1 < totalPages);
      } else {
        setHasMore(mapped.length === 10);
      }
    } catch (err) {
      setError('직원 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEmployees([]);
    setPage(0);
    setHasMore(true);
    fetchEmployees(0);
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    setEmployees([]);
    setPage(0);
    setHasMore(true);
    fetchEmployees(0, searchTerm, dropdownValue, includeRetired, false);
    setSelectedRow(null);
    setIsSearching(false);
  };

  const handleScroll = () => {
    if (!hasMore || loading || isSearching) return;
    const el = tableWrapRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchEmployees(nextPage, searchTerm, dropdownValue, includeRetired, true);
    }
  };

  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [employees, hasMore, loading, isSearching]);

  const handleExcelDownload = () => {
    const mappedData = employees.map((emp) => {
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

  const handleRetireSuccess = async (retiredId) => {
    setEmployees([]);
    setPage(0);
    setHasMore(true);
    await fetchEmployees(0, searchTerm, dropdownValue, includeRetired, false);
    const idx = employees.findIndex(
      (emp) => String(emp.id) === String(retiredId),
    );
    setSelectedRow(idx >= 0 ? idx : null);
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
            <span className={styles.dropdownArrow} aria-hidden='true'>
              <svg
                width='16'
                height='16'
                viewBox='0 0 20 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                style={{ display: 'inline', verticalAlign: 'middle' }}
              >
                <path
                  d='M5 8L10 13L15 8'
                  stroke='#7b7b7b'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
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
        <button
          className={styles.createAccount}
          style={{ marginRight: '10px' }}
          onClick={() => navigate('/signup')}
        >
          계정생성
        </button>
        <button className={styles.excel} onClick={handleExcelDownload}>
          Excel 다운로드
        </button>
      </div>
      <div className={styles.tableWrap} ref={tableWrapRef}>
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
              <th>재직</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan='9'>로딩 중...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan='9' className={styles.noData}>
                  {error}
                </td>
              </tr>
            ) : employees.length > 0 ? (
              employees.map((emp, idx) => (
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
      {selectedRow !== null && (
        <EmployeeDetail
          selectedEmployee={employees[selectedRow]}
          onRetireSuccess={handleRetireSuccess}
        />
      )}
    </div>
  );
};

export default EmployeeTable;
