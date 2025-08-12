import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import axiosInstance from '../../configs/axios-config';
import styles from './PayrollManagement.module.scss';
import AuthContext from '../../context/UserContext';
import { API_BASE_URL, PAYROLL, HR } from '../../configs/host-config';
import SuccessModal from '../../components/SuccessModal';

function parseJwt(token) {
  if (!token) return {};
  const base64Url = token.split('.')[1];
  if (!base64Url) return {};
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
  } catch (e) {
    return {};
  }
}

const fetchEmployees = async ({
  page = 0,
  size = 100,
  searchName = '',
  includeRetired = false,
  isHR = false,
  year,
  month,
} = {}) => {
  try {
    //  HR이 아니면 본인 정보만 반환
    if (!isHR) {
      const payload = parseJwt(sessionStorage.getItem('ACCESS_TOKEN'));

      //  사용자 상세 정보 API 호출
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
          activated: emp.activate || 'Y',
          isRetired: emp.activate !== 'Y' ? 'Y' : 'N',
        },
      ];
    }

    //  HR이면 전체 호출
    let url = `${API_BASE_URL}${HR}/user/payrollList`;
    let params = { page, size, year, month };

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
      activated: emp.activate || 'Y', // 재직 여부 (원본)
      isRetired: emp.activate !== 'Y' ? 'Y' : 'N', // 퇴직 여부 (EmployeeTable 호환)
    }));
  } catch (err) {
    return [];
  }
};





const defaultImg = 'https://via.placeholder.com/140x180?text=Profile';

const PayrollDetail = ({ employee, onClose, fetchPayroll, showModal }) => {
  const [form, setForm] = useState({
    payMonthStr: '',
    basePayroll: '',
    positionAllowance: '',
    mealAllowance: '',
    bonus: '',
  });
  const [loading, setLoading] = useState(false);

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
    try {
      const [yearStr, monthStr] = form.payMonthStr.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      // 숫자 필드는 콤마 제거 후 숫자로 변환
      const payload = {
        userId: employee.id,
        payYear: year,
        payMonth: month,
        basePayroll:
          form.basePayroll.trim() === ''
            ? null
            : Number(form.basePayroll.replace(/,/g, '')),
        positionAllowance:
          form.positionAllowance.trim() === ''
            ? null
            : Number(form.positionAllowance.replace(/,/g, '')),
        mealAllowance:
          form.mealAllowance.trim() === ''
            ? null
            : Number(form.mealAllowance.replace(/,/g, '')),
        bonus:
          form.bonus.trim() === ''
            ? null
            : Number(form.bonus.replace(/,/g, '')),

        positionName: employee.position,
      };

      await axiosInstance.post(`${API_BASE_URL}${PAYROLL}`, payload);

      // ✅ 저장 성공 후 급여 다시 조회
      if (fetchPayroll) {
        fetchPayroll(year, month, employee.id);
      }
      showModal?.('급여가 저장되었습니다.');

      setForm({
        payMonthStr: '',
        basePayroll: '',
        positionAllowance: '',
        mealAllowance: '',
        bonus: '',
      });
    } catch (err) {
      showModal?.('저장 실패: ' + (err?.response?.data?.message || '오류'));
    } finally {
      setLoading(false);
    }
  };

  // 예시: employee에 계좌, 이미지 등 추가 정보가 있다고 가정
  const bankName = employee.bankName || '';
  const accountNumber = employee.accountNumber || '';
  const accountHolder = employee.accountHolder;
  const employeeNo = employee.id;
  const imageUrl = employee.imageUrl || defaultImg;
  const department = employee.department || '';
  const position = employee.position || '';

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
            justifyContent: 'flex-end',
            marginTop: 18,
          }}
        >
          <button
            type='submit'
            disabled={loading}
            style={{ minWidth: 180 }}
            className={styles['save-button']}
          >
            {loading ? '등록/수정 중...' : '등록 / 수정'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PayrollManagement = () => {
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [isHR, setIsHR] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [checkedList, setCheckedList] = useState([]);
  const [payrollData, setPayrollData] = useState({
    basePayroll: '',
    positionAllowance: '',
    mealAllowance: '',
    bonus: '',
  });
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [selectedDepartment, setSelectedDepartment] = useState('전체');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { user } = useContext(AuthContext);
  useEffect(() => {
    axiosInstance.get('/departments')
      .then(response => {
        const departments = response.data.result;
        if (Array.isArray(departments)) {
          // 2단계: map을 사용하여 ID와 이름을 가진 새로운 객체 배열 생성
          const departmentData = departments.map(department => ({
            id: department.departmentId,
            name: department.name
          }));
          setDepartmentOptions(departmentData);
        } else {
          console.error('부서 목록 데이터는 배열이 아닙니다:', departments);
        }
      })
      .catch(error => {
        console.error('부서 목록 불러오기 실패', error);
      });
  }, []);
  
  

  useEffect(() => {
    const token = sessionStorage.getItem('ACCESS_TOKEN');
    const payload = parseJwt(token);
    setIsHR(payload?.role === 'Y');
  }, []);

  useEffect(() => {
    if (selectedMonth && user) {
      const [year, month] = selectedMonth.split('-');
      if (isHR && selectedEmployee) {
        fetchPayroll(year, month, selectedEmployee.id);
      } else {
        fetchPayroll(year, month);
      }
    }
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
        .get(url, { headers, params }) // 동적으로 지정된 url 사용
        .then((res) => {
          const result = res.data.result;
          setPayrollData({
            basePayroll: Number(result?.basePayroll ?? 0),
            positionAllowance: Number(result?.positionAllowance ?? 0),
            mealAllowance: Number(result?.mealAllowance ?? 0),
            bonus: Number(result?.bonus ?? 0),
            overtimePay: Number(result?.overtimePay ?? 0),
          });
        })
        .catch((err) => {

          setSuccessMessage('해당 연월에 급여 기록이 없습니다.');
          setShowSuccessModal(true);

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
    if (!user) return;

    let cancelled = false; // 경쟁 상태 방지

    const token = sessionStorage.getItem('ACCESS_TOKEN');
    const payload = parseJwt(token);
    const hrRole = payload?.role === 'Y';
    setIsHR(hrRole);

    let y, m;
    if (selectedMonth) {
      const [ys, ms] = selectedMonth.split('-');
      y = Number(ys);
      m = Number(ms);
    }

    const loadEmployees = async () => {
      const employees = await fetchEmployees({
        isHR: hrRole,
        includeRetired: true,
        year: y,
        month: m,
      });
      if (!cancelled) setEmployeeData(employees);
    };

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [user, selectedMonth]);

  useEffect(() => {
    if (!user) return;
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

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const handleCheck = (id) => {
    setCheckedList((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleEmployeeClick = async (emp) => {
    const isSame = selectedEmployeeId === emp.id;

    if (isSame) {
      setSelectedEmployeeId(null);
      setSelectedEmployee(null);
    } else {
      setSelectedEmployeeId(emp.id);

      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${HR}/user/${emp.id}`,
        );
        const data = res.data.result;

        setSelectedEmployee({
          id: data.employeeNo,
          name: data.userName,
          department: data.department?.name || '',
          position: data.positionName || '',
          imageUrl: data.profileImage || '',
          bankName: data.bankName || '',
          accountNumber: data.accountNumber || '',
          accountHolder: data.accountHolder || data.userName,
          isRetired: data.activate !== 'Y' ? 'Y' : 'N',
        });

        if (isHR && selectedMonth) {
          const [year, month] = selectedMonth.split('-');
          fetchPayroll(year, month, data.employeeNo);
        }
      } catch (err) {
        alert('직원 정보를 불러올 수 없습니다.');
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
  const overtime = payrollData.overtimePay || 0;
  const nonTaxableMeal = Math.min(meal, 200000);
  const taxableMeal = Math.max(meal - 200000, 0);
  const taxable = base + allowance + taxableMeal + bonus + overtime;
  const nonTaxable = nonTaxableMeal;
  const total = taxable + nonTaxable;

  // 공제항목 계산
  const pension = Math.floor(taxable * 0.045); // 국민연금 (4.5%)
  const health = Math.floor(taxable * 0.03545); // 건강보험 (3.545%)
  const care = Math.floor(health * 0.1281); // 장기요양보험 (건강보험의 12.81%)
  const employment = Math.floor(taxable * 0.008); // 고용보험 (0.8%)
  const incomeTax = Math.floor(taxable * 0.03); // 소득세 (3%)
  const localTax = Math.floor(incomeTax * 0.1); // 지방소득세 (소득세의 10%)

  const totalDeduction =
    pension + health + care + employment + incomeTax + localTax;
  const netPay = total - totalDeduction;

  const printRef = useRef(null);

  const handleOvertimeCalculation = async () => {
    if (!selectedEmployee || !selectedMonth) return;

    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    const payload = {
      userId: selectedEmployee.id,
      payYear: year,
      payMonth: month,
      basePayroll: payrollData.basePayroll,
      positionAllowance: payrollData.positionAllowance,
      mealAllowance: payrollData.mealAllowance,
      bonus: payrollData.bonus,
      positionName: selectedEmployee.position,
    };

    try {
      await axiosInstance.post(`${API_BASE_URL}${PAYROLL}`, payload);
      setSuccessMessage('야근수당이 계산되어 저장되었습니다.');
      setShowSuccessModal(true);
      fetchPayroll(year, month, selectedEmployee.id); // 화면 반영
    } catch (err) {
      setSuccessMessage('야근수당 계산에 실패했습니다.');
      setShowSuccessModal(true);
    }
  };

  const handlePrintPayroll = () => {
    if (!selectedEmployee) return;

    const emp = selectedEmployee;
    const [year, month] = selectedMonth.split('-');
    const formattedMonth = `${year}년 ${month}월`;
    const employeeInfoHTML = `
    <div style="margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="font-weight: bold; padding: 6px;">사원명</td>
          <td style="padding: 6px;">${emp.name}</td>
          <td style="font-weight: bold; padding: 6px;">사번</td>
          <td style="padding: 6px;">${emp.id}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 6px;">부서</td>
          <td style="padding: 6px;">${emp.department || ''}</td>
          <td style="font-weight: bold; padding: 6px;">직급</td>
          <td style="padding: 6px;">${emp.position || ''}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 6px;">계좌</td>
          <td colspan="3" style="padding: 6px;">
            ${emp.bankName || ''} ${emp.accountNumber || ''} (${emp.accountHolder || emp.name})
          </td>
        </tr>
      </table>
    </div>
  `;

    const logoHTML = `
    <div style="text-align: center; margin-top: 40px;">
      <img src="/logo.png" alt="회사 로고" style="height: 80px; opacity: 0.85;" />
    </div>
  `;

    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      setSuccessMessage('팝업 차단 해제를 먼저 해주세요!');
      setShowSuccessModal(true);
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
          padding: 30px;
        }
        h2 {
          text-align: center;
          margin-bottom: 70px;
        }
        .info-table, .salary-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 70px;
        }
        .info-table td {
          border: 1px solid #ccc;
          padding: 6px;
          font-size: 15px;
        }
        .salary-table th, .salary-table td {
          border: 1px solid #999;
          padding: 8px;
          font-size: 15px;
          text-align: center;
        }
        .summary {
          font-weight: bold;
          background: #f5f5f5;
        }
        .footer {
          font-size: 25px;
          font-weight: bold;
          text-align: center;
          margin-top: 50px;
        }

        .ceo-signature {
          position: relative; /* 기준이 되는 컨테이너 */
          display: inline-block;
          margin-top: 10px;
          text-align: center;
        }

        .ceo-signature span {
          font-size: 16px;
          font-weight: 600;
          position: relative;
          z-index: 1; /* 텍스트가 위에 있도록 */
        }

        .ceo-signature img {
          position: absolute;
          top: -25px; /* (인) 위로 이동 */
          left: 95%;
          transform: translateX(-50%);
          height: 40px;
          opacity: 0.85; // 투명도
          z-index: 0; /* 이미지가 아래로 */
        }

        .footer img {
          height: 60px;
          margin-top: 10px;
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <h2>${formattedMonth} 급여명세서</h2>

      ${emp.isRetired === 'Y' ? `<p style="text-align:center; color:red; font-weight:bold;">[퇴사자]</p>` : ''}


      <!-- 직원 정보 -->
      <table class="info-table">
        <tr>
          <td>성명</td>
          <td>${emp.name}</td>
          <td>사번</td>
          <td>${emp.id}</td>
        </tr>
        <tr>
          <td>부서</td>
          <td>${emp.department || ''}</td>
          <td>직책</td>
          <td>${emp.position || ''}</td>
        </tr>
        <tr>
          <td>계좌</td>
          <td colspan="3">
            ${emp.bankName || ''} ${emp.accountNumber || ''} (${emp.accountHolder || emp.name})
          </td>
        </tr>
      </table>

      <!-- 급여 내역 -->
      <table class="salary-table">
        <thead>
          <tr>
            <th colspan="2">지급내역</th>
            <th colspan="2">공제내역</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>기본급</td><td>${base.toLocaleString()}</td>
            <td>국민연금</td><td>${pension.toLocaleString()}</td>
          </tr>
          <tr>
            <td>직급수당</td><td>${allowance.toLocaleString()}</td>
            <td>건강보험</td><td>${health.toLocaleString()}</td>
          </tr>
          <tr>
            <td>식대</td><td>${meal.toLocaleString()}</td>
            <td>장기요양보험</td><td>${care.toLocaleString()}</td>
          </tr>
          <tr>
            <td>성과급</td><td>${bonus.toLocaleString()}</td>
            <td>고용보험</td><td>${employment.toLocaleString()}</td>
          </tr>
          <tr>
            <td>야근수당</td><td>${(payrollData.overtimePay ?? 0).toLocaleString()}</td>
            <td>소득세</td><td>${incomeTax.toLocaleString()}</td>
          </tr>
          <tr>
            <td><td></td></td>
            <td>지방소득세</td><td>${localTax.toLocaleString()}</td>
          </tr>
          <tr>
            <td class="summary">지급합계 (원)</td><td class="summary">${total.toLocaleString()}</td>
            <td class="summary">공제합계 (원)</td><td class="summary">${totalDeduction.toLocaleString()}</td>
          </tr>
          <tr>
            <td colspan="2" class="summary">실수령액</td>
            <td colspan="2" class="summary">${netPay.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <!-- 푸터 -->
      <div class="footer">
        <p>주식회사 사무보조</p>
        <div class="ceo-signature">
          <span>대표이사 ○○○ (인)</span>
        <img src="/logo.png" alt="회사로고" />
        </div>
      </div>
    </body>
  </html>
`);
    printWindow.document.close();

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
              {departmentOptions.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
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
            onClick={handleOvertimeCalculation}
            disabled={!selectedEmployee}
            style={
              !selectedEmployee
                ? { background: '#ccc', cursor: 'not-allowed' }
                : {}
            }
          >
            야근수당 계산
          </button>

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
                  className={`${selectedEmployeeId === emp.id ? styles.selected : ''} ${
                    emp.isRetired === 'Y' ? styles['retired-row'] : ''
                  }`}
                  onClick={() => handleEmployeeClick(emp)}
                >
                  <td>
                    <input
                      type='checkbox'
                      checked={selectedEmployeeId === emp.id}
                      onChange={() => handleEmployeeClick(emp)} // 단일 선택
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
            {(() => {
              const total = filteredEmployees.length;
              const retiredCount = filteredEmployees.filter(
                (emp) => emp.isRetired === 'Y',
              ).length;
              const activeCount = total - retiredCount;

              return (
                <>
                  <span>인원 (퇴직)</span>
                  <span>
                    {activeCount}명 ({retiredCount}명)
                  </span>
                </>
              );
            })()}
          </div>
        </div>

        {/* 급여/공제/합계 테이블 */}
        <div className={styles['payroll-details']} ref={printRef}>
          <div className={styles['pay-section']}>
            <table>
              <thead>
                <tr>
                  <th>급여항목</th>
                  <th>금액 (원)</th>
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
                <tr>
                  <td>야근수당</td>
                  <td>{payrollData.overtimePay?.toLocaleString() || '0'}</td>
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
                  <th>금액 (원)</th>
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
                  <td>장기요양보험</td>
                  <td>{health ? care.toLocaleString() : ''}</td>
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
                  <th>금액 (원)</th>
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
          fetchPayroll={fetchPayroll}
          showModal={(msg) => {
            setSuccessMessage(msg);
            setShowSuccessModal(true);
          }}
        />
      )}

      {/* 성공 모달 */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
          autoClose={true}
          autoCloseDelay={2000}
        />
      )}
    </div>
  );
};

export default PayrollManagement;
