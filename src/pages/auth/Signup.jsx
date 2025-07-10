import React, { useState, useEffect } from 'react';
import styles from './Signup.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/samubozo-logo.png';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR } from '../../configs/host-config';

const defaultForm = {
  email: '',
  password: '',
  passwordCheck: '',
  userName: '',
  birthDate: '',
  gender: '',
  phone: '',
  address: '',
  hireDate: '',
  departmentId: '',
  positionId: '',
};

const validateField = (name, value, form) => {
  let error;
  switch (name) {
    case 'email':
      if (!value) error = '이메일을 입력해 주세요.';
      else if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value))
        error = '올바른 이메일 형식이 아닙니다.';
      break;
    case 'password':
      if (!value) error = '비밀번호를 입력해 주세요.';
      else if (value.length < 8 || value.length > 20)
        error = '비밀번호는 8자 이상 20자 이하로 입력해 주세요.';
      else if (/\s/.test(value))
        error = '비밀번호에 공백을 포함할 수 없습니다.';
      break;
    case 'passwordCheck':
      if (value !== form.password)
        error = '비밀번호와 비밀번호 재확인이 일치하지 않습니다.';
      break;
    case 'userName':
      if (!value || value.trim().length < 2)
        error = '이름은 2글자 이상 입력해 주세요.';
      break;
    case 'birthDate':
      if (!value) error = '생년월일을 입력해 주세요.';
      break;
    case 'gender':
      if (!value) error = '성별을 선택해 주세요.';
      break;
    case 'phone':
      if (!value) error = '연락처를 입력해 주세요.';
      else if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(value))
        error = '올바른 휴대폰 번호 형식이 아닙니다.';
      break;
    case 'address':
      if (!value || value.trim().length < 5)
        error = '주소를 정확히 입력해 주세요.';
      break;
    case 'hireDate':
      if (!value) error = '입사일을 입력해 주세요.';
      break;
    case 'departmentId':
      if (!value) error = '부서를 선택해 주세요.';
      break;
    case 'positionId':
      if (!value) error = '직책을 선택해 주세요.';
      break;
    default:
      error = undefined;
  }
  return error;
};

const Signup = () => {
  const [form, setForm] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const navigate = useNavigate();

  // 부서와 직책 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 부서 목록 가져오기
        const deptResponse = await axiosInstance.get(
          `${API_BASE_URL}${HR}/departments`,
        );
        const deptData = Array.isArray(deptResponse.data.result)
          ? deptResponse.data.result
          : [];
        setDepartments(deptData);

        // 직책 목록 가져오기
        const posResponse = await axiosInstance.get(
          `${API_BASE_URL}${HR}/positions`,
        );
        const posData = Array.isArray(posResponse.data.result)
          ? posResponse.data.result
          : [];
        setPositions(posData);
      } catch (error) {
        setDepartments([
          { departmentId: 1, name: '경영지원', departmentColor: '#FFAB91' },
          { departmentId: 2, name: '인사팀', departmentColor: '#B39DDB' },
          { departmentId: 3, name: '회계팀', departmentColor: '#81D4FA' },
          { departmentId: 4, name: '영업팀', departmentColor: '#A5D6A7' },
        ]);
        setPositions([
          { positionId: 1, positionName: '사장' },
          { positionId: 2, positionName: '부장' },
          { positionId: 3, positionName: '과장' },
          { positionId: 4, positionName: '대리' },
          { positionId: 5, positionName: '사원' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 실시간 입력값 변경 및 즉시 에러 체크
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 현재 필드 에러 체크
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, { ...form, [name]: value }),
    }));

    // 비밀번호 변경 시 비밀번호 확인도 즉시 체크
    if (name === 'passwordCheck' || name === 'password') {
      setErrors((prev) => ({
        ...prev,
        passwordCheck:
          name === 'passwordCheck'
            ? validateField('passwordCheck', value, {
                ...form,
                passwordCheck: value,
              })
            : validateField('passwordCheck', form.passwordCheck, {
                ...form,
                password: value,
              }),
      }));
    }
  };

  // 성별 버튼 처리 (실시간 체크)
  const handleGender = (gender) => {
    setForm((prev) => ({
      ...prev,
      gender,
    }));
    setErrors((prev) => ({
      ...prev,
      gender: validateField('gender', gender, { ...form, gender }),
    }));
  };

  // 포커스 잃을 때도 체크 (선택적. UX 따라 생략 가능)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, form),
    }));
  };

  // 회원가입 제출 (전체 에러 체크)
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    let isValid = true;

    // 모든 필드 반복 검사
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key], form);
      if (err) {
        newErrors[key] = err;
        isValid = false;
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post(`${API_BASE_URL}${HR}/users/signup`, form);
      alert('회원가입이 완료되었습니다!');
      navigate('/employee');
    } catch (error) {
      alert(
        '회원가입 실패: ' + (error.response?.data?.message || error.message),
      );
    }
    setIsSubmitting(false);
  };

  // 이메일 중복확인 (회원가입 API에서 중복 체크)
  const handleEmailCheck = async () => {
    if (!form.email) {
      alert('이메일을 입력하세요.');
      return;
    }
    try {
      // 회원가입 API에 이메일만 보내서 중복 체크
      const res = await axiosInstance.post(
        `${API_BASE_URL}${HR}/users/signup`,
        {
          email: form.email,
        },
      );
      if (res.data && res.data.duplicate) {
        alert('이미 사용 중인 이메일입니다.');
        setIsEmailChecked(false);
      } else {
        alert('사용 가능한 이메일입니다.');
        setIsEmailChecked(true);
      }
    } catch (e) {
      if (e.response && e.response.data && e.response.data.duplicate) {
        alert('이미 사용 중인 이메일입니다.');
      } else {
        alert('이메일 중복 확인 중 오류가 발생했습니다.');
      }
      setIsEmailChecked(false);
    }
  };

  // 주소찾기 함수 추가
  const handleAddressSearch = () => {
    function openPostcode() {
      new window.daum.Postcode({
        oncomplete: function (data) {
          setForm((prev) => ({
            ...prev,
            address: data.address,
          }));
        },
      }).open();
    }

    if (window.daum && window.daum.Postcode) {
      openPostcode();
    } else {
      // 0.5초 후 한 번 더 시도 (최대 5회)
      let retry = 0;
      const interval = setInterval(() => {
        retry++;
        if (window.daum && window.daum.Postcode) {
          clearInterval(interval);
          openPostcode();
        } else if (retry > 5) {
          clearInterval(interval);
          alert(
            '주소찾기 API 로딩에 실패했습니다. 새로고침 후 다시 시도해 주세요.',
          );
        }
      }, 500);
    }
  };

  return (
    <div className={styles.outerBg}>
      <div className={styles.registerNav}>
        <Link to={'/'}>로그인</Link> |{' '}
        <span
          style={{ cursor: 'pointer', color: '#1785f2' }}
          onClick={() =>
            window.alert(
              `가입 이메일은 인사팀에게 문의하세요.\n\n(연락처: 02-0000-1111)`,
            )
          }
        >
          ID 찾기
        </span>{' '}
        | <Link to={'/passwordFind'}>PW 찾기</Link>
        <span className={styles.icon}>👤</span>
      </div>

      <img src={Logo} alt='로고' className={styles.registerLogo} />

      <div className={styles.registerWrap}>
        <div className={styles.registerContainer}>
          <div className={styles.registerHeader}></div>
          <h2 className={styles.registerMainTitle}>회원가입</h2>
          <form className={styles.registerForm} onSubmit={handleSubmit}>
            <div className={styles.registerGrid}>
              <div className={styles.registerLeft}>
                <label>이메일</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type='email'
                    name='email'
                    placeholder='이메일을 입력하세요.'
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ flex: 1 }}
                  />
                  <button
                    type='button'
                    onClick={handleEmailCheck}
                    style={{
                      padding: '0 16px',
                      background: isEmailChecked ? '#aaa' : '#66be80',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: isEmailChecked ? 'not-allowed' : 'pointer',
                    }}
                    disabled={isEmailChecked}
                  >
                    중복확인
                  </button>
                </div>
                {errors.email && (
                  <div className={styles.error}>{errors.email}</div>
                )}

                <label>비밀번호</label>
                <input
                  type='password'
                  name='password'
                  placeholder='비밀번호를 입력해주세요.'
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.password && (
                  <div className={styles.error}>{errors.password}</div>
                )}

                <label>비밀번호 재확인</label>
                <input
                  type='password'
                  name='passwordCheck'
                  placeholder='비밀번호를 재입력해주세요.'
                  value={form.passwordCheck}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.passwordCheck && (
                  <div className={styles.error}>{errors.passwordCheck}</div>
                )}

                <label>이름</label>
                <input
                  type='text'
                  name='userName'
                  placeholder='이름을 입력하세요.'
                  value={form.userName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.userName && (
                  <div className={styles.error}>{errors.userName}</div>
                )}

                <div className={styles.rowInline}>
                  <div className={styles.birthCol}>
                    <label>생년월일</label>
                    <div className={styles.inputIcon}>
                      <input
                        type='date'
                        name='birthDate'
                        value={form.birthDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                    {errors.birthDate && (
                      <div className={styles.error}>{errors.birthDate}</div>
                    )}
                  </div>
                  <div className={styles.genderCol}>
                    <label>성별</label>
                    <div className={styles.genderBtns}>
                      <button
                        type='button'
                        className={form.gender === '남자' ? styles.active : ''}
                        onClick={() => handleGender('남자')}
                      >
                        남자
                      </button>
                      <button
                        type='button'
                        className={form.gender === '여자' ? styles.active : ''}
                        onClick={() => handleGender('여자')}
                      >
                        여자
                      </button>
                    </div>
                    {errors.gender && (
                      <div className={styles.error}>{errors.gender}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.registerRight}>
                <label>연락처</label>
                <input
                  type='text'
                  name='phone'
                  placeholder='연락처를 입력하세요.'
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.phone && (
                  <div className={styles.error}>{errors.phone}</div>
                )}

                <label>주소</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type='text'
                    name='address'
                    placeholder='주소를 입력하세요.'
                    value={form.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ flex: 1 }}
                    readOnly // 직접 입력 방지, 주소찾기로만 입력
                  />
                  <button
                    type='button'
                    onClick={handleAddressSearch}
                    style={{
                      padding: '0 16px',
                      background: '#66be80',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    주소찾기
                  </button>
                </div>
                {errors.address && (
                  <div className={styles.error}>{errors.address}</div>
                )}

                <label>입사일</label>
                <div className={styles.inputIcon}>
                  <input
                    type='date'
                    name='hireDate'
                    value={form.hireDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.hireDate && (
                  <div className={styles.error}>{errors.hireDate}</div>
                )}

                <label>부서</label>
                <select
                  name='departmentId'
                  value={form.departmentId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value=''>선택하세요</option>
                  {departments.map((dept) => (
                    <option
                      key={dept.departmentId}
                      value={String(dept.departmentId)}
                    >
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <div className={styles.error}>{errors.departmentId}</div>
                )}

                <label>직책</label>
                <select
                  name='positionId'
                  value={form.positionId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value=''>선택하세요</option>
                  {positions.map((pos) => (
                    <option key={pos.positionId} value={String(pos.positionId)}>
                      {pos.positionName}
                    </option>
                  ))}
                </select>
                {errors.positionId && (
                  <div className={styles.error}>{errors.positionId}</div>
                )}
              </div>
            </div>

            <button className={styles.registerSubmit} type='submit'>
              {isSubmitting ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
