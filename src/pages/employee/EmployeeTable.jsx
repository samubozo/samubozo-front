import React, { useState, useMemo } from 'react';
import './EmployeeTable.scss';
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
  {
    id: 6,
    name: '퇴직자1',
    position: '과장',
    department: '인사부',
    joinDate: '2020.01.01',
    phone: '010-1234-5678',
    email: 'retired1@samubozo.com',
    address: '서울특별시 퇴직동',
    isRetired: 'Y', // 퇴직자 데이터 추가
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

  const filteredEmployees = useMemo(() => {
    const searchKey = dropdownValue === '성명' ? 'name' : 'department';

    return employees.filter((employee) => {
      if (!includeRetired && employee.isRetired === 'Y') {
        return false;
      }
      if (!searchTerm) {
        return true;
      }
      return String(employee[searchKey])
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, dropdownValue, includeRetired]);

  React.useEffect(() => {
    setSelectedRow(null);
  }, [filteredEmployees]);

  const handleSearch = () => {
    console.log('검색 버튼 클릭됨!');
  };

  const handleExcelDownload = () => {
    const dataToDownload = filteredEmployees;

    // 1. 엑셀에 표시될 헤더 이름들 (한글)
    const headers = orderedKeys.map((key) => columnMap[key]);

    // 2. 엑셀에 실제로 들어갈 데이터 (원본 키를 유지)
    const excelDataForSheet = dataToDownload.map((emp) => {
      const row = {};
      orderedKeys.forEach((key) => {
        row[key] = emp[key] !== undefined && emp[key] !== null ? emp[key] : '';
      });
      return row;
    });

    // 3. 빈 워크시트 생성
    const worksheet = XLSX.utils.aoa_to_sheet([]); // 빈 배열로 초기화

    // 4. 1행에 헤더 추가
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

    // 5. 2행부터 데이터 추가 (헤더 바로 아래)
    // sheet_add_json 사용 시 fields 옵션으로 순서와 키를 명시해야 합니다.
    XLSX.utils.sheet_add_json(worksheet, excelDataForSheet, {
      origin: 'A2', // 데이터를 A2 셀부터 시작
      skipHeader: true, // json_to_sheet처럼 자동으로 헤더를 생성하는 것을 건너뜀
      header: orderedKeys, // 어떤 키를 어떤 순서로 넣을지 명시 (이것은 데이터 매핑에 사용됨)
    });

    // 6. 헤더 스타일 정의 (1행에만 적용)
    const headerStyle = {
      fill: {
        patternType: 'solid',
        fgColor: { rgb: 'DCE6F1' }, // 연한 파랑
      },
      font: {
        bold: true,
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
      },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    // 7. 각 헤더 셀에 스타일 적용 (0번째 행, 즉 A1부터 시작하는 헤더 행)
    for (let C = 0; C < headers.length; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      // 헤더 셀이 이미 sheet_add_aoa로 생성되었으므로 존재할 것입니다.
      // 하지만 혹시 모를 경우를 대비해 안전하게 참조합니다.
      const cell = worksheet[cellAddress] || {};
      cell.s = headerStyle;
      worksheet[cellAddress] = cell; // 변경된 셀 객체를 워크시트에 다시 할당
    }

    // 8. 컬럼 너비 자동 조정
    const wscols = orderedKeys.map((key) => {
      const headerText = columnMap[key] || '';
      const maxLength = Math.max(
        headerText.length,
        ...dataToDownload.map((e) => String(e[key] || '').length),
      );
      return { wch: maxLength + 2 };
    });
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '직원정보');

    // 9. 스타일 정보를 포함해 파일 저장
    XLSX.writeFile(workbook, '직원정보.xlsx', { cellStyles: true });
  };

  return (
    <div className='employee-wrapper'>
      <div className='employee-search-box'>
        <span className='search-label'>검색어</span>
        <div
          className='dropdown-box'
          tabIndex={0}
          onBlur={() => setDropdownOpen(false)}
        >
          <div
            className='dropdown-selected'
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {dropdownValue}
            <span className='dropdown-arrow'>&#9662;</span>
          </div>
          {dropdownOpen && (
            <div className='dropdown-options'>
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
          className='search-input'
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <label className='retired-label'>
          <input
            type='checkbox'
            checked={includeRetired}
            onChange={(e) => setIncludeRetired(e.target.checked)}
          />{' '}
          퇴직자포함
        </label>
        <button className='search-btn' onClick={handleSearch}>
          <span className='search-icon'>&#128269;</span> 검색
        </button>
      </div>
      <div className='basic-info-title'>
        <span className='arrow'>&#9654;</span>
        <span>기본정보</span>
        <button className='excel' onClick={handleExcelDownload}>
          Excel 다운로드
        </button>
      </div>
      <div className='employee-table-wrap'>
        <table className='employee-table'>
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
                  className={selectedRow === idx ? 'selected' : ''}
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
                <td
                  colSpan='9'
                  style={{ textAlign: 'center', padding: '20px' }}
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <EmployeeDetail selectedEmployee={filteredEmployees[selectedRow]} />
    </div>
  );
};

export default EmployeeTable;
