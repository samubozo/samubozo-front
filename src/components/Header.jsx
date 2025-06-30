import React from 'react';
import './Header.scss';
import Logo from '../assets/samubozo-logo2.png';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

const Header = () => {
  return (
    <>
      <header className='header-wrap'>
        <div className='header-fixed-left'>
          <span className='gmt'>GMT+09:00</span>
          <span className='user-info'>신현국 팀장(경영지원)</span>
          <span className='admin-checkbox'>
            <input type='checkbox' />
            <span>관리자</span>
          </span>
        </div>
        <div className='header-main-row'>
          <div className='header-logo-row'>
            <img src={Logo} alt='로고' className='header-logo' />
          </div>
          <div className='header-right'>
            <Link to={'/'} className='header-link'>
              홈
            </Link>
            <span className='header-divider'>|</span>
            <Link to={'/'} className='header-link'>
              조직도
            </Link>
            <span className='header-divider'>|</span>
            <Link to={'/'} className='header-link'>
              쪽지함
            </Link>
            <div className='header-icons'>
              <button className='icon'>👤</button>
            </div>
          </div>
        </div>
        <nav className='header-nav'>
          <ul className='header-nav-list'>
            <li className='active'>
              <Link to={'/dashboard'}>메인</Link>
            </li>
            <li>
              <Link to={'/employee'}>인사관리</Link>
            </li>
            <li>
              <Link>근태관리</Link>
            </li>
            <li>
              <Link>급여관리</Link>
            </li>
            <li>
              <Link>일정관리</Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;
