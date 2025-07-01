import React, { useState } from 'react';
import './Login.scss';
import { Link } from 'react-router-dom';
import Logo from '../../assets/samubozo-logo.png';
import axios from 'axios';
import { API_BASE_URL, AUTH } from '../../configs/host-config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 로그인 로직
    console.log({ email, password, remember });
    // 실제 로그인 구현 시 여기에 API 호출 로직 등을 추가합니다.
    axios.post(
      `${API_BASE_URL}${AUTH}/`
    )
  };

  return (
    <div className='login-wrapper'>
      <div className='login-box'>
        <div className='logo-section'>
          <img src={Logo} alt='사무보조 로고' />
        </div>
        <form onSubmit={handleSubmit}>
          <input
            className='email-input'
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className='password-input'
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className='remember-section'>
            <input
              type='checkbox'
              id='remember'
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <label htmlFor='remember'>이메일 저장</label>
          </div>
          <button type='submit'>로그인</button>
        </form>
        <div className='links'>
          <span>
            <Link to={'/'}>ID 찾기</Link> | <Link to={'/'}>PW 찾기</Link> |{' '}
            <Link to={'/signup'}>회원가입 하기</Link>
          </span>
        </div>
        <div className='top-links'>
          <span>
            <Link to={'/signup'}>회원가입</Link> |{' '}
            <Link to={'/'}>비밀번호 찾기</Link>
          </span>
          <span className='icon'>👤</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
