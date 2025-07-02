import React, { useState } from 'react';
import styles from './Signup.module.scss'; // styles import
import { Link } from 'react-router-dom';
import Logo from '../../assets/samubozo-logo.png';
import VerifyModal from './VerifyModal'; // 경로 맞게!

const Signup = () => {
  const [gender, setGender] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState('00:00'); // 타이머 상태 추가

  return (
    <div className={styles.outerBg}>
      {' '}
      {/* styles.outerBg 적용 */}
      {showModal && (
        <VerifyModal
          email='aaa***@samubozo.com' // 실제 이메일 값으로 대체 필요
          timer={timer} // 타이머 값 전달
          onResend={() => {
            /* 재발송 로직 */
          }}
          onComplete={(code) => {
            /* 완료 로직 */
          }}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className={styles.registerNav}>
        {' '}
        {/* styles.registerNav 적용 */}
        <Link to={'/'}>로그인</Link> | <Link to={'/'}>ID 찾기</Link> |{' '}
        <Link to={'/passwordFind'}>PW 찾기</Link>
        <span className={styles.icon}>👤</span> {/* styles.icon 적용 */}
      </div>
      <img src={Logo} alt='로고' className={styles.registerLogo} />{' '}
      {/* styles.registerLogo 적용 */}
      <div className={styles.registerWrap}>
        {' '}
        {/* styles.registerWrap 적용 */}
        <div className={styles.registerContainer}>
          {' '}
          {/* styles.registerContainer 적용 */}
          <div className={styles.registerHeader}></div>{' '}
          {/* styles.registerHeader 적용 */}
          <h2 className={styles.registerMainTitle}>회원가입</h2>{' '}
          {/* styles.registerMainTitle 적용 */}
          <form className={styles.registerForm}>
            {' '}
            {/* styles.registerForm 적용 */}
            <div className={styles.registerGrid}>
              {' '}
              {/* styles.registerGrid 적용 */}
              <div className={styles.registerLeft}>
                {' '}
                {/* styles.registerLeft 적용 */}
                <label>이메일</label>
                <div className={styles.emailRow}>
                  {' '}
                  {/* styles.emailRow 적용 */}
                  <input type='email' placeholder='이메일을 입력하세요.' />
                  <button
                    onClick={() => setShowModal(true)}
                    type='button'
                    className={styles.emailBtn}
                  >
                    {' '}
                    {/* styles.emailBtn 적용 */}
                    인증
                  </button>
                </div>
                <label>비밀번호</label>
                <input type='password' placeholder='비밀번호를 입력해주세요.' />
                <label>비밀번호 재확인</label>
                <input
                  type='password'
                  placeholder='비밀번호를 재입력해주세요.'
                />
                <label>이름</label>
                <input type='text' placeholder='이름을 입력하세요.' />
                <div className={styles.rowInline}>
                  {' '}
                  {/* styles.rowInline 적용 */}
                  <div className={styles.birthCol}>
                    {' '}
                    {/* styles.birthCol 적용 */}
                    <label>생년월일</label>
                    <div className={styles.inputIcon}>
                      {' '}
                      {/* styles.inputIcon 적용 */}
                      <input type='date' />
                    </div>
                  </div>
                  <div className={styles.genderCol}>
                    {' '}
                    {/* styles.genderCol 적용 */}
                    <label>성별</label>
                    <div className={styles.genderBtns}>
                      {' '}
                      {/* styles.genderBtns 적용 */}
                      <button
                        type='button'
                        className={gender === '남자' ? styles.active : ''} // styles.active 적용
                        onClick={() => setGender('남자')}
                      >
                        남자
                      </button>
                      <button
                        type='button'
                        className={gender === '여자' ? styles.active : ''} // styles.active 적용
                        onClick={() => setGender('여자')}
                      >
                        여자
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.registerRight}>
                {' '}
                {/* styles.registerRight 적용 */}
                <label>연락처</label>
                <input type='text' placeholder='연락처를 입력하세요.' />
                <label>주소</label>
                <input type='text' placeholder='주소를 입력하세요.' />
                <label>입사일</label>
                <div className={styles.inputIcon}>
                  {' '}
                  {/* styles.inputIcon 적용 */}
                  <input type='date' />
                </div>
                <label>부서</label>
                <select>
                  <option>경영지원</option>
                  <option>인사팀</option>
                  <option>회계팀</option>
                  <option>영업팀</option>
                </select>
                <label>직책</label>
                <select>
                  <option>팀장</option>
                  <option>대리</option>
                  <option>사원</option>
                </select>
              </div>
            </div>
            <button className={styles.registerSubmit} type='submit'>
              {' '}
              {/* styles.registerSubmit 적용 */}
              회원가입
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
