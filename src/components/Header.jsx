import React from 'react';
import styles from './Header.module.scss';
import Logo from '../assets/samubozo-logo2.png';
import { NavLink } from 'react-router-dom';
console.log(styles);

const Header = () => {
  return (
    <header className={styles.headerWrap}>
      <div className={styles.headerFixedLeft}>
        <span className={styles.gmt}>GMT+09:00</span>
        <span className={styles.userInfo}>신현국 팀장(경영지원)</span>
        <span className={styles.adminCheckbox}>
          <input type='checkbox' />
          <span>관리자</span>
        </span>
      </div>

      <div className={styles.headerMainRow}>
        <div className={styles.headerLogoRow}>
          <img src={Logo} alt='로고' className={styles.headerLogo} />
        </div>
        <div className={styles.headerRight}>
          <NavLink to='/' className={styles.headerLink}>
            홈
          </NavLink>
          <span className={styles.headerDivider}>|</span>
          <NavLink to='/orgchart' className={styles.headerLink}>
            조직도
          </NavLink>
          <span className={styles.headerDivider}>|</span>
          <NavLink to='/' className={styles.headerLink}>
            전자결제
          </NavLink>
          <div className={styles.headerIcons}>
            <button className={styles.icon}>👤</button>
          </div>
        </div>
      </div>

      <nav className={styles.headerNav}>
        <ul className={styles.headerNavList}>
          <li>
            <NavLink
              to='/dashboard'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              메인
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/employee'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              인사관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/attendance'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              근태관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/salary'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              급여관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/calendar'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              일정관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/message'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
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
