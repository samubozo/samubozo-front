import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import axiosInstance from '../../configs/axios-config';
import styles from './PayrollManagement.module.scss';
import AuthContext from '../../context/UserContext';
import { API_BASE_URL, PAYROLL, HR } from '../../configs/host-config';

function parseJwt(token) {
  if (!token) return {};
  const base64Url = token.split('.')[1];
  if (!base64Url) return {};
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
  } catch (e) {
    console.error('JWT 파싱 실패:', e);
    return {};
  }
}

// 직원 목록 불러오는 함수
const fetchEmployees = async ({
  page = 0,
  size = 100,
  searchName = '',
  includeRetired = false,
  isHR = false,
} = {}) => {
  try {
    // ✅ HR이 아니면 본인 정보만 반환
    if (!isHR) {
      const payload = parseJwt(sessionStorage.getItem('ACCESS_TOKEN'));

      // 🔽 사용자 상세 정보 API 호출
      const res = await axiosInstance.get(`${API_BASE_URL}${HR}/users/detail`, {
        params: { employeeNo: payload.employeeNo },
      });

      const emp = res.data.result;

      return [
        {
          id: emp.employeeNo,
          name: emp.userName,
          position: emp.positionName,
          department: emp.department?.name || '',
          imageUrl: emp.profileImage || '',
        },
      ];
    }

    // ✅ HR이면 전체 호출
    let url = `${API_BASE_URL}${HR}/user/list`;
    let params = { page, size };

    if (searchName) {
      url = `${API_BASE_URL}${HR}/users/search`;
      params = {
        userName: searchName,
        activate: includeRetired ? undefined : 'Y',
        page,
        size,
      };
    }

    const res = await axiosInstance.get(url, { params });
    const rawList = res.data.result?.content || res.data.result || [];

    return rawList.map((emp) => ({
      id: emp.employeeNo,
      name: emp.userName,
      position: emp.positionName,
      department: emp.department?.name || '',
      imageUrl: emp.profileImage || '',
    }));
  } catch (err) {
    console.error('직원 불러오기 실패:', err);
    return [];
  }
};

const departmentOptions = [
  '전체',
  '경영지원',
  '영업부',
  '기획부',
  '마케팅',
  '디자인',
];

const defaultImg = 'https://via.placeholder.com/140x180?text=Profile';

const PayrollDetail = ({ employee, onClose }) => {
  const [form, setForm] = useState({
    payMonthStr: '',
    basePayroll: '',
    positionAllowance: '',
    mealAllowance: '',
    bonus: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 숫자만 추출 후 콤마 포맷
  const formatNumber = (value) => {
    const num = value.replace(/[^\d]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'payMonthStr') {
      setForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: formatNumber(value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const [yearStr, monthStr] = form.payMonthStr.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      // 숫자 필드는 콤마 제거 후 숫자로 변환
      const payload = {
        userId: employee.id,
        payYear: year,
        payMonth: month,
        basePayroll: Number(form.basePayroll.replace(/,/g, '')),
        positionAllowance: Number(form.positionAllowance.replace(/,/g, '')),
        mealAllowance: Number(form.mealAllowance.replace(/,/g, '')),
        bonus: Number(form.bonus.replace(/,/g, '')),
      };

      console.log('🚀 급여 저장 요청 payload:', payload);

      await axiosInstance.post(`${API_BASE_URL}${PAYROLL}`, payload);
      setMessage('저장되었습니다.');
      setForm({
        payMonthStr: '',
        basePayroll: '',
        positionAllowance: '',
        mealAllowance: '',
        bonus: '',
      });
    } catch (err) {
      console.error('급여 저장 요청 실패:', err); // 저장 실패 로그
      setMessage('저장 실패: ' + (err?.response?.data?.message || '오류'));
    } finally {
      setLoading(false);
    }
  };

  // 예시: employee에 계좌, 이미지 등 추가 정보가 있다고 가정
  const bankName = employee.bankName || '국민은행';
  const accountNumber = employee.accountNumber || '123-456-7890';
  const accountHolder = employee.accountHolder || employee.name;
  const employeeNo = employee.id;
  const imageUrl = employee.imageUrl || defaultImg;
  const department = employee.department || '경영지원';
  const position = employee.position || '사원';

  return (
    <div className={styles['payroll-detail-flex-wrap']}>
      <div className={styles['payroll-profile-outer']}>
        <img
          src={imageUrl}
          alt='profile'
          className={styles['payroll-profile-img']}
        />
      </div>
      <form onSubmit={handleSubmit} style={{ flex: 2.1 }}>
        <table className={styles['payroll-detail-table-merged']}>
          <tbody>
            <tr>
              <th>사원번호</th>
              <td>{employeeNo}</td>
              <th>급여월</th>
              <td>
                <input
                  type='month'
                  name='payMonthStr'
                  value={form.payMonthStr}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th>성명</th>
              <td>{employee.name}</td>
              <th>기본급</th>
              <td>
                <input
                  type='text'
                  name='basePayroll'
                  value={form.basePayroll}
                  onChange={handleChange}
                  autoComplete='off'
                  required
                />
              </td>
            </tr>
            <tr>
              <th>계좌</th>
              <td>
                {bankName} {accountNumber} ({accountHolder})
              </td>
              <th>직급수당</th>
              <td>
                <input
                  type='text'
                  name='positionAllowance'
                  value={form.positionAllowance}
                  onChange={handleChange}
                  autoComplete='off'
                  required
                />
              </td>
            </tr>
            <tr>
              <th>부서</th>
              <td>{department}</td>
              <th>식대</th>
              <td>
                <input
                  type='text'
                  name='mealAllowance'
                  value={form.mealAllowance}
                  onChange={handleChange}
                  autoComplete='off'
                  required
                />
              </td>
            </tr>
            <tr>
              <th>직책</th>
              <td>{position}</td>
              <th>성과급</th>
              <td>
                <input
                  type='text'
                  name='bonus'
                  value={form.bonus}
                  onChange={handleChange}
                  autoComplete='off'
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 18,
          }}
        >
          <button
            type='submit'
            disabled={loading}
            style={{ minWidth: 180 }}
            className={styles['save-button']}
          >
            {loading ? '저장 중...' : '저장'}
          </button>
          {message && (
            <div
              style={{
                textAlign: 'center',
                color: message.includes('실패') ? 'red' : 'green',
                paddingTop: 8,
                fontWeight: 500,
              }}
            >
              {message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

const PayrollManagement = () => {
  const [isHR, setIsHR] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [checkedList, setCheckedList] = useState([]);
  const [payrollData, setPayrollData] = useState({
    basePayroll: '',
    positionAllowance: '',
    mealAllowance: '',
    bonus: '',
  });
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('전체');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchName, setSearchName] = useState('');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const token = sessionStorage.getItem('ACCESS_TOKEN');
    const payload = parseJwt(token);
    console.log('✅ JWT payload:', payload); // 추가
    setIsHR(payload?.role === 'Y');
  }, []);

  const fetchPayroll = (year, month, employeeId = null) => {
    if (!user) return;

    const accessToken = sessionStorage.getItem('ACCESS_TOKEN');

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    let url = '';
    const params = { year, month };

    if (employeeId && isHR) {
      url = `${API_BASE_URL}${PAYROLL}/admin/monthly`;
      params.userId = employeeId;
    } else {
      url = `${API_BASE_URL}${PAYROLL}/me/monthly`;
    }

    if (year && month) {
      axiosInstance
        .get(url, { headers, params }) // ✅ 동적으로 지정된 url 사용
        .then((res) => {
          const result = res.data.result;
          setPayrollData({
            basePayroll: Number(result?.basePayroll ?? 0),
            positionAllowance: Number(result?.positionAllowance ?? 0),
            mealAllowance: Number(result?.mealAllowance ?? 0),
            bonus: Number(result?.bonus ?? 0),
          });
        })
        .catch((err) => {
          console.error('급여 조회 실패:', err);
          setPayrollData({
            basePayroll: '',
            positionAllowance: '',
            mealAllowance: '',
            bonus: '',
          });
        });
    } else {
      // 월이 지정되지 않은 경우: 본인 기본 급여 조회 (기존 로직 유지)
      axiosInstance
        .get(`${API_BASE_URL}${PAYROLL}/me`, { headers })
        .then((res) => {
          const result = res.data.result;
          setPayrollData({
            basePayroll: Number(result?.basePayroll ?? 0),
            positionAllowance: Number(result?.positionAllowance ?? 0),
            mealAllowance: Number(result?.mealAllowance ?? 0),
            bonus: Number(result?.bonus ?? 0),
          });
        })
        .catch(() => {
          setPayrollData({
            basePayroll: '',
            positionAllowance: '',
            mealAllowance: '',
            bonus: '',
          });
        });
    }
  };

  useEffect(() => {
    const loadEmployees = async () => {
      console.log('🚀 isHR 전달됨:', isHR); // 확인
      const employees = await fetchEmployees({ isHR });
      console.log('📦 직원 목록:', employees); // 확인
      setEmployeeData(employees);
    };

    if (user && isHR !== null) {
      loadEmployees();
    }
  }, [user, isHR]);

  useEffect(() => {
    if (!user) return;
    fetchPayroll();
  }, [user]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    const [year, month] = e.target.value.split('-');

    if (isHR && selectedEmployee) {
      fetchPayroll(year, month, selectedEmployee.id);
    } else {
      fetchPayroll(year, month);
    }
  };

  // 전체 체크 코드
  // const isAllChecked = checkedList.length === employeeData.length;

  // const handleAllCheck = (e) => {
  //   if (e.target.checked) {
  //     setCheckedList(employeeData.map((emp) => emp.id));
  //   } else {
  //     setCheckedList([]);
  //   }
  // };

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const handleCheck = (id) => {
    setCheckedList((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleEmployeeClick = (emp) => {
    const isSame = selectedEmployeeId === emp.id;

    if (isSame) {
      setSelectedEmployeeId(null);
      setSelectedEmployee(null);
    } else {
      setSelectedEmployeeId(emp.id);
      setSelectedEmployee(emp);

      if (isHR && selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        fetchPayroll(year, month, emp.id);
      }
    }
  };

  // 부서 필터링
  const filteredEmployees =
    selectedDepartment === '전체'
      ? employeeData
      : employeeData.filter((emp) => emp.department === selectedDepartment);

  // 계산 로직
  const base = payrollData.basePayroll || 0;
  const allowance = payrollData.positionAllowance || 0;
  const meal = payrollData.mealAllowance || 0;
  const bonus = payrollData.bonus || 0;
  const nonTaxableMeal = Math.min(meal, 100000);
  const taxableMeal = Math.max(meal - 100000, 0);
  const taxable = base + allowance + taxableMeal + bonus;
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

  const printRef = useRef(null);

  const handlePrintPayroll = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      alert('팝업 차단 해제를 먼저 해주세요!');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
    <html>
      <head>
        <title>급여명세서</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            line-height: 1.5;
          }

          h2 {
            text-align: center;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }

          th {
            background-color: #f5f5f5;
            text-align: center;
            font-weight: 600;
            padding: 10px;
            border: 1px solid #ccc;
            width: 30%;
          }

          td {
            text-align: right;
            padding: 10px;
            border: 1px solid #ccc;
            font-size: 14px;
          }

          td:first-child {
            text-align: left;
            width: 70%;
          }

          .summary-table td {
            font-weight: bold;
            background-color: #fafafa;
          }
          </style>

      </head>
      <body>
        <h2>급여명세서</h2>
        ${printContents}
      </body>
    </html>
  `);
    printWindow.document.close();

    // 💡 DOM 로딩 완료 후 print() 실행
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1500);
    };
  };

  return (
    <div className={styles['payroll-management-container']}>
      {/* 상단 필터/검색 영역 */}
      <div className={styles['payroll-filter-section']}>
        <div className={styles['filter-group']}>
          부서:
          <label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departmentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          급여월:
          <label>
            <input
              type='month'
              value={selectedMonth}
              onChange={handleMonthChange}
            />
          </label>
        </div>
        <div className={styles['button-group']}>
          <button
            onClick={handlePrintPayroll}
            disabled={!selectedEmployee}
            style={
              !selectedEmployee
                ? { background: '#ccc', cursor: 'not-allowed' }
                : {}
            }
          >
            급여명세서 출력
          </button>
        </div>
      </div>

      {/* 메인 테이블 영역 */}
      <div className={styles['payroll-table-section']}>
        {/* 직원 목록 */}
        <div className={styles['employee-list']}>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>no</th>
                <th>사원명</th>
                <th>직급</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, idx) => (
                <tr
                  key={emp.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleEmployeeClick(emp)} // ✅ 수정
                >
                  <td>
                    <input
                      type='checkbox'
                      checked={selectedEmployeeId === emp.id}
                      onChange={() => handleEmployeeClick(emp)} // ✅ 단일 선택
                      onClick={(e) => e.stopPropagation()}
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
            <span>{filteredEmployees.length}</span>
          </div>
        </div>

        {/* 급여/공제/합계 테이블 */}
        <div className={styles['payroll-details']} ref={printRef}>
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
                <tr>
                  <td>성과급</td>
                  <td>{bonus ? bonus.toLocaleString() : ''}</td>
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
      {/* 하단에 급여 등록/수정 화면 (hrRole이 'Y'일 때만) */}
      {isHR && selectedEmployee && (
        <PayrollDetail
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default PayrollManagement;
