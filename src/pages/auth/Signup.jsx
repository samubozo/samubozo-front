import React, { useState } from 'react';
import './Signup.scss';
import { Link } from 'react-router-dom';
import Logo from '../../assets/samubozo-logo.png';
import VerifyModal from "./VerifyModal"; // 경로 맞게!
const Signup = () => {
  const [gender, setGender] = useState('');
const [showModal, setShowModal] = useState(false);
const [timer, setTimer] = useState("00:00");
  return (
    <div className='outer-bg'>
        {showModal && (
        <VerifyModal
          email="aaa***@samubozo.com"
          timer={timer}
          onResend={() => {/* 재발송 로직 */}}
          onComplete={code => {/* 완료 로직 */}}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className='register-nav'>
        <Link to={'/'}>로그인</Link> | <Link to={'/'}>ID 찾기</Link> |{' '}
        <Link to={'/'}>PW 찾기</Link>
        <span className='icon'>👤</span>
      </div>
      <img src={Logo} alt='로고' className='register-logo' />
      <div className='register-wrap'>
        <div className='register-container'>
          <div className='register-header'></div>
          <h2 className='register-main-title'>회원가입</h2>
          <form className='register-form'>
            <div className='register-grid'>
              <div className='register-left'>
                <label>이메일</label>
                <div className='email-row'>
                  <input type='email' placeholder='이메일을 입력하세요.' />
                  <button onClick={() => setShowModal(true)}type='button' className='email-btn'>
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
                <div className='row-inline'>
                  <div className='birth-col'>
                    <label>생년월일</label>
                    <div className='input-icon'>
                      <input type='date' />
                    </div>
                  </div>
                  <div className='gender-col'>
                    <label>성별</label>
                    <div className='gender-btns'>
                      <button
                        type='button'
                        className={gender === '남자' ? 'active' : ''}
                        onClick={() => setGender('남자')}
                      >
                        남자
                      </button>
                      <button
                        type='button'
                        className={gender === '여자' ? 'active' : ''}
                        onClick={() => setGender('여자')}
                      >
                        여자
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='register-right'>
                <label>연락처</label>
                <input type='text' placeholder='연락처를 입력하세요.' />
                <label>주소</label>
                <input type='text' placeholder='주소를 입력하세요.' />
                <label>입사일</label>
                <div className='input-icon'>
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
            <button className='register-submit' type='submit'>
              회원가입
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
