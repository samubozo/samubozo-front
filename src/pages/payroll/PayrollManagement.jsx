import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styles from './PayrollManagement.module.scss';
import AuthContext from '../../context/UserContext';

const employeeData = [
  { id: 1, name: '신한국', position: '팀장' },
  { id: 2, name: '이호영', position: '부팀장' },
  { id: 3, name: '김예은', position: '사원' },
  { id: 4, name: '주영찬', position: '사원' },
  { id: 5, name: '구현희', position: '사원' },
];

const PayrollManagement = () => {
  const [checkedList, setCheckedList] = useState([]);
  const [payrollData, setPayrollData] = useState({
    basePayroll: '',
    positionAllowance: '',
    mealAllowance: '',
  });

  const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log('🔥 useEffect 진입됨');
    if (!user) {
      console.log('⛔ user 없음');
      return;
    }
    console.log('✅ user 있음:', user);

    const userRole = user.hrRole === 'Y' ? 'Y' : 'N';
    const userEmail = user.email;
    const userEmployeeNo = user.employeeNo;
    const accessToken = sessionStorage.getItem('ACCESS_TOKEN');

    // ✅ 여기 로그 추가
    console.log('👤 현재 로그인된 사용자:', user);
    console.log('📦 급여 API 요청 헤더', {
      'X-User-Email': user.email,
      'X-User-Role': userRole,
      'X-User-Employee-No': user.employeeNo,
      Authorization: `Bearer ${accessToken}`,
    });

    axios
      .get(`${import.meta.env.VITE_BACKEND_API}/payroll/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // ✅ 필수
          'X-User-Email': userEmail,
          'X-User-Role': userRole,
          'X-User-Employee-No': userEmployeeNo,
        },
      })
      .then((res) => {
        console.log('✅ 전체 응답:', res);
        console.log('✅ res.data:', res.data);
        console.log('✅ res.data.result:', res.data.result);

        const result = res.data.result;
        setPayrollData({
          basePayroll: Number(result?.basePayroll ?? 0),
          positionAllowance: Number(result?.positionAllowance ?? 0),
          mealAllowance: Number(result?.mealAllowance ?? 0),
        });
      })
      .catch((err) => {
        console.error('❌ 급여 데이터 호출 실패:', err);
        setPayrollData({
          basePayroll: '',
          positionAllowance: '',
          mealAllowance: '',
        });
      });
  }, [user]);
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

  // 계산 로직
  const base = payrollData.basePayroll || 0;
  const allowance = payrollData.positionAllowance || 0;
  const meal = payrollData.mealAllowance || 0;
  const nonTaxableMeal = Math.min(meal, 100000);
  const taxableMeal = Math.max(meal - 100000, 0);
  const taxable = base + allowance + taxableMeal;
  const nonTaxable = nonTaxableMeal;
  const total = taxable + nonTaxable;

  // 공제항목 계산
  const pension = Math.floor(taxable * 0.045);
  const health = Math.floor(taxable * 0.07);
  const employment = Math.floor(taxable * 0.008);
  const incomeTax = Math.floor(taxable * 0.03);
  const localTax = Math.floor(incomeTax * 0.1);

  const totalDeduction = pension + health + employment + incomeTax + localTax;
  const netPay = total - totalDeduction;

  return (
    <div className={styles['payroll-management-container']}>
      {/* 상단 필터/검색 영역 */}
      <div className={styles['payroll-filter-section']}>
        <div className={styles['filter-group']}>
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
            급여월:
            <input type='month' />
          </label>
        </div>
        <div className={styles['button-group']}>
          <button>급여명세서 출력</button>
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
                  <td>{base ? base.toLocaleString() : ''}</td>
                </tr>
                <tr>
                  <td>직급수당</td>
                  <td>{allowance ? allowance.toLocaleString() : ''}</td>
                </tr>
                <tr>
                  <td>식대</td>
                  <td>{meal ? meal.toLocaleString() : ''}</td>
                </tr>
              </tbody>
            </table>
            <div className={styles['summary-table-spacer']} />
            {/* 하단 요약 */}
            <table className={styles['summary-table']}>
              <tbody>
                <tr>
                  <td>과세</td>
                  <td>{taxable ? taxable.toLocaleString() : ''}</td>
                </tr>
                <tr>
                  <td>비과세</td>
                  <td>{nonTaxable ? nonTaxable.toLocaleString() : ''}</td>
                </tr>
                <tr>
                  <td>지급액계</td>
                  <td>{total ? total.toLocaleString() : ''}</td>
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
                  <td>{pension ? pension.toLocaleString() : ''}</td>
                </tr>
                <tr>
                  <td>건강보험</td>
                  <td>{health ? health.toLocaleString() : ''}</td>
                </tr>
                <tr>
                  <td>고용보험</td>
                  <td>{employment ? employment.toLocaleString() : ''}</td>
                </tr>
                <tr>
                  <td>소득세</td>
                  <td>{incomeTax ? incomeTax.toLocaleString() : ''}</td>
                </tr>
                <tr>
                  <td>지방소득세</td>
                  <td>{localTax ? localTax.toLocaleString() : ''}</td>
                </tr>
              </tbody>
            </table>
            <div className={styles['summary-table-spacer']} />
            {/* 하단 요약 */}
            <table className={styles['summary-table']}>
              <tbody>
                <tr>
                  <td>공제액계</td>
                  <td>
                    {totalDeduction ? totalDeduction.toLocaleString() : ''}
                  </td>
                </tr>
                <tr>
                  <td>차인지급액</td>
                  <td>{netPay ? netPay.toLocaleString() : ''}</td>
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
                  <td>{total ? total.toLocaleString() : ''}</td>
                </tr>
                <tr>
                  <td>총 공제액</td>
                  <td>
                    {totalDeduction ? totalDeduction.toLocaleString() : ''}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className={styles['summary-table-spacer']} />
            <table className={styles['summary-table']}>
              <tbody>
                <tr>
                  <td>실수령액</td>
                  <td>{netPay ? netPay.toLocaleString() : ''}</td>
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
