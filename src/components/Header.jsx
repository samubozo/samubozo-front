import {
  AppBar,
  Button,
  Container,
  Grid,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/UserContext';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { API_BASE_URL, ORDER, SSE } from '../configs/host-config';
import { NotificationAdd } from '@mui/icons-material';

const Header = () => {
  // 로그인 상태에 따라 메뉴를 다르게 제공하고 싶다 -> Context에서 뽑아오면 되겠구나!
  const { isLoggedIn, onLogout, userRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const [liveQuantity, setLiveQuantity] = useState(0); // 실시간 주문 수
  const [message, setMessage] = useState('');

  // useRef로 SSE 연결값 참조 (리렌딩시 초기화 안됨.)
  const currentSSE = useRef(null);

  useEffect(() => {
    // 기존 연결이 있으면 해제
    if (currentSSE.current) {
      currentSSE.current.close();
      currentSSE.current = null;
    }

    console.log('role: ', userRole);
    const token = localStorage.getItem('ACCESS_TOKEN');

    if (userRole === 'ADMIN') {
      // 알림을 받기 위해 서버와 연결을 하기 위한 요청을 하겠다.
      // 기존에 사용하던 fetch, axios는 지속적 연결을 지원하지 않는다.
      currentSSE.current = new EventSourcePolyfill(
        `${API_BASE_URL}${SSE}/subscribe`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      currentSSE.current.addEventListener('connect', (event) => {
        console.log(event);
      });

      // 30초마다 발생하는 알림. (연결을 유지하기 위해)
      currentSSE.current.addEventListener('heartbeat', () => {
        console.log('Received heartbeat');
      });

      currentSSE.current.addEventListener('new-order', (e) => {
        const orderData = JSON.parse(e.data);
        console.log(orderData);
      });

      currentSSE.current.onerror = (error) => {
        console.log('SSE 연결 오류: ', error);
        if (error.status === 401) {
          handleLogout();
        }
      };
    }
  }, [userRole]);

  const handleLogout = () => {
    if (currentSSE.current) {
      console.log('로그아웃으로 인한 SSE 연결 해제');
      currentSSE.current.close();
      currentSSE.current = null;
    }

    onLogout();
    alert('로그아웃 완료!');
    navigate('/login');
  };

  // 페이지 언로드 시에도 연결 해제
  window.addEventListener('beforeunload', () => {
    if (currentSSE.current) {
      currentSSE.current.close();
    }
  });

  return (
    <AppBar position='static'>
      <Toolbar>
        <Container>
          <Grid container alignItems='center'>
            {/* 왼쪽 메뉴 (관리자용) */}
            <Grid
              item
              xs={4}
              style={{ display: 'flex', justifyContent: 'flex-start' }}
            >
              {userRole === 'ADMIN' && (
                <>
                  <Button color='inherit' component={Link} to='/member/list'>
                    회원관리
                  </Button>
                  <Button color='inherit' component={Link} to='/product/manage'>
                    상품관리
                  </Button>
                  <Button color='inherit' onClick={() => setLiveQuantity(0)}>
                    실시간 주문 <NotificationAdd /> ({liveQuantity}) {message}
                  </Button>
                </>
              )}
            </Grid>

            {/* 가운데 메뉴 */}
            <Grid item xs={4} style={{ textAlign: 'center' }}>
              <Button color='inherit' component={Link} to='/'>
                <Typography variant='h6'>PlayData Shop</Typography>
              </Button>
            </Grid>

            {/* 오른쪽 메뉴 (사용자용) */}
            <Grid
              item
              xs={4}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <Button color='inherit' component={Link} to='/product/list'>
                상품목록
              </Button>
              {isLoggedIn && (
                <>
                  <Button color='inherit' component={Link} to='/order/cart'>
                    장바구니
                  </Button>
                  <Button color='inherit' component={Link} to='/mypage'>
                    마이페이지
                  </Button>
                  <Button color='inherit' onClick={handleLogout}>
                    로그아웃
                  </Button>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <Button color='inherit' component={Link} to='/member/create'>
                    회원가입
                  </Button>
                  <Button color='inherit' component={Link} to='/login'>
                    로그인
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
