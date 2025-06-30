import React from 'react';
import './Header.scss';
import Logo from '../assets/samubozo-logo2.png';
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
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
          <NavLink to='/' className='header-link'>
            홈
          </NavLink>
          <span className='header-divider'>|</span>
          <NavLink to='/' className='header-link'>
            조직도
          </NavLink>
          <span className='header-divider'>|</span>
          <NavLink to='/' className='header-link'>
            전자결제
          </NavLink>
          <div className='header-icons'>
            <button className='icon'>👤</button>
          </div>
        </div>
      </div>

      <nav className='header-nav'>
        <ul className='header-nav-list'>
          <li>
            <NavLink
              to='/dashboard'
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              메인
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/employee'
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              인사관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/attendance'
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              근태관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/salary'
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              급여관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/calendar'
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              일정관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/message'
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              쪽지함
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
