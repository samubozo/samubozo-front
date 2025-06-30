import React, { useState } from 'react';
import './EmployeeTable.scss';
import EmployeeDetail from './EmployeeDetail';

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

const EmployeeTable = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('성명');

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
        <input className='search-input' type='text' />
        <label className='retired-label'>
          <input type='checkbox' /> 퇴직자포함
        </label>
        <button className='search-btn'>
          <span className='search-icon'>&#128269;</span> 검색
        </button>
      </div>
      <div className='basic-info-title'>
        <span className='arrow'>&#9654;</span>
        <span>기본정보</span>
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
            {employees.map((emp, idx) => (
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
            ))}
          </tbody>
        </table>
      </div>
      <EmployeeDetail selectedEmployee={employees[selectedRow]}/>
    </div>
  );
};

export default EmployeeTable;
