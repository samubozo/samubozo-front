import React, { useState } from 'react';
import styles from './Signup.module.scss';
import { Link } from 'react-router-dom';
import Logo from '../../assets/samubozo-logo.png';
import VerifyModal from './VerifyModal';
import axios from 'axios';
import { API_BASE_URL, HR } from '../../configs/host-config';
// import axios from 'axios'; // 주석 처리 (실제 사용 시 주석 해제)
// import { API_BASE_URL, HR } from '../../configs/host-config'; // 주석 처리

const defaultForm = {
  email: '',
  password: '',
  passwordCheck: '',
  name: '',
  birth: '',
  gender: '',
  phone: '',
  address: '',
  hireDate: '',
  department: '',
  position: '',
};

const Signup = () => {
  const [form, setForm] = useState(defaultForm);
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState('00:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 공통 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 성별은 버튼으로 따로 처리
  const handleGender = (gender) => {
    setForm((prev) => ({
      ...prev,
      gender,
    }));
  };

  // 이메일 인증 버튼 (모달 열기)
  const handleEmailVerify = () => {
    setShowModal(true);
    checkEmail();
    // 인증 요청/타이머 등은 추가로 구현
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 실제 API 호출 예시 (주석 해제하고 사용)
    try {
      const res = await axios.post(`${API_BASE_URL}${HR}/users/signup`, form);
      // 성공 처리
    } catch (error) {
      // 실패 처리
    }
    setIsSubmitting(false);
  };

  const checkEmail = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}${HR}/users/signup`, {
        email: form.email,
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.outerBg}>
      {showModal && (
        <VerifyModal
          email={form.email || 'aaa***@samubozo.com'}
          timer={timer}
          onResend={() => {
            /* 인증 코드 재발송 로직 */
          }}
          onComplete={(code) => {
            /* 인증 완료 처리 */
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className={styles.registerNav}>
        <Link to={'/'}>로그인</Link> | <Link to={'/'}>ID 찾기</Link> |{' '}
        <Link to={'/'}>PW 찾기</Link>
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
                <div className={styles.emailRow}>
                  <input
                    type='email'
                    name='email'
                    placeholder='이메일을 입력하세요.'
                    value={form.email}
                    onChange={handleChange}
                  />
                  <button
                    type='button'
                    className={styles.emailBtn}
                    onClick={handleEmailVerify}
                  >
                    인증
                  </button>
                </div>

                <label>비밀번호</label>
                <input
                  type='password'
                  name='password'
                  placeholder='비밀번호를 입력해주세요.'
                  value={form.password}
                  onChange={handleChange}
                />

                <label>비밀번호 재확인</label>
                <input
                  type='password'
                  name='passwordCheck'
                  placeholder='비밀번호를 재입력해주세요.'
                  value={form.passwordCheck}
                  onChange={handleChange}
                />

                <label>이름</label>
                <input
                  type='text'
                  name='name'
                  placeholder='이름을 입력하세요.'
                  value={form.name}
                  onChange={handleChange}
                />

                <div className={styles.rowInline}>
                  <div className={styles.birthCol}>
                    <label>생년월일</label>
                    <div className={styles.inputIcon}>
                      <input
                        type='date'
                        name='birth'
                        value={form.birth}
                        onChange={handleChange}
                      />
                    </div>
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
                />

                <label>주소</label>
                <input
                  type='text'
                  name='address'
                  placeholder='주소를 입력하세요.'
                  value={form.address}
                  onChange={handleChange}
                />

                <label>입사일</label>
                <div className={styles.inputIcon}>
                  <input
                    type='date'
                    name='hireDate'
                    value={form.hireDate}
                    onChange={handleChange}
                  />
                </div>

                <label>부서</label>
                <select
                  name='department'
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value=''>선택하세요</option>
                  <option value='경영지원'>경영지원</option>
                  <option value='인사팀'>인사팀</option>
                  <option value='회계팀'>회계팀</option>
                  <option value='영업팀'>영업팀</option>
                </select>

                <label>직책</label>
                <select
                  name='position'
                  value={form.position}
                  onChange={handleChange}
                >
                  <option value=''>선택하세요</option>
                  <option value='팀장'>팀장</option>
                  <option value='대리'>대리</option>
                  <option value='사원'>사원</option>
                </select>
              </div>
            </div>

            <button
              className={styles.registerSubmit}
              type='submit'
              disabled={isSubmitting}
            >
              {isSubmitting ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
