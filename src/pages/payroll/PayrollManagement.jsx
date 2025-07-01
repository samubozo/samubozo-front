import React, { useState } from 'react';
import styles from './PayrollManagement.module.scss';

const employeeData = [
  { id: 1, name: '신한국', position: '팀장' },
  { id: 2, name: '이호영', position: '부팀장' },
  { id: 3, name: '김예은', position: '사원' },
  { id: 4, name: '주영찬', position: '사원' },
  { id: 5, name: '구현희', position: '사원' },
];

const PayrollManagement = () => {
  const [checkedList, setCheckedList] = useState([]);

  const isAllChecked = checkedList.length === employeeData.length;

  const handleAllCheck = (e) => {
    if (e.target.checked) {
      setCheckedList(employeeData.map((emp) => emp.id));
    } else {
      setCheckedList([]);
    }
  };

  const handleCheck = (id) => {
    setCheckedList((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className={styles['payroll-management-container']}>
      {/* 상단 필터/검색 영역 */}
      <div className={styles['payroll-filter-section']}>
        <div className={styles['filter-group']}>
          <label>
            급여월:
            <input type='month' />
          </label>
          <label>
            부서:
            <select>
              <option>전체</option>
              <option>경영지원</option>
              <option>영업</option>
              {/* 기타 부서 */}
            </select>
          </label>
          <label>
            지급일:
            <input type='date' />
          </label>
        </div>
        <div className={styles['button-group']}>
          <button>엑셀 다운로드</button>
          <button>인쇄</button>
        </div>
      </div>

      {/* 메인 테이블 영역 */}
      <div className={styles['payroll-table-section']}>
        {/* 직원 목록 */}
        <div className={styles['employee-list']}>
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type='checkbox'
                    checked={isAllChecked}
                    onChange={handleAllCheck}
                  />
                </th>
                <th>no</th>
                <th>사원명</th>
                <th>직급</th>
              </tr>
            </thead>
            <tbody>
              {employeeData.map((emp, idx) => (
                <tr key={emp.id}>
                  <td>
                    <input
                      type='checkbox'
                      checked={checkedList.includes(emp.id)}
                      onChange={() => handleCheck(emp.id)}
                    />
                  </td>
                  <td>{idx + 1}</td>
                  <td>{emp.name}</td>
                  <td>{emp.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles['employee-summary-spacer']} />
          {/* 하단 인원(퇴직) 요약 */}
          <div className={styles['employee-summary']}>
            <span>인원 (퇴직)</span>
            <span>{employeeData.length}</span>
          </div>
        </div>

        {/* 급여/공제/합계 테이블 */}
        <div className={styles['payroll-details']}>
          <div className={styles['pay-section']}>
            <table>
              <thead>
                <tr>
                  <th>급여항목</th>
                  <th>금액</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>기본급</td>
                  <td>5,000,000</td>
                </tr>
                <tr>
                  <td>직급수당</td>
                  <td></td>
                </tr>
                <tr>
                  <td>식대</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div className={styles['summary-table-spacer']} />
            {/* 하단 요약 */}
            <table className={styles['summary-table']}>
              <tbody>
                <tr>
                  <td>과세</td>
                  <td></td>
                </tr>
                <tr>
                  <td>비과세</td>
                  <td></td>
                </tr>
                <tr>
                  <td>지급액계</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles['deduction-section']}>
            <table>
              <thead>
                <tr>
                  <th>공제항목</th>
                  <th>금액</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>국민연금</td>
                  <td></td>
                </tr>
                <tr>
                  <td>건강보험</td>
                  <td></td>
                </tr>
                <tr>
                  <td>고용보험</td>
                  <td></td>
                </tr>
                <tr>
                  <td>소득세</td>
                  <td></td>
                </tr>
                <tr>
                  <td>지방소득세</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div className={styles['summary-table-spacer']} />
            {/* 하단 요약 */}
            <table className={styles['summary-table']}>
              <tbody>
                <tr>
                  <td>공제액계</td>
                  <td></td>
                </tr>
                <tr>
                  <td>차인지급액</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles['summary-section']}>
            <table>
              <thead>
                <tr>
                  <th>총 항목</th>
                  <th>금액</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>총 지급액</td>
                  <td></td>
                </tr>
                <tr>
                  <td>총 공제액</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div className={styles['summary-table-spacer']} />
            <table className={styles['summary-table']}>
              <tbody>
                <tr>
                  <td>실수령액</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollManagement;
