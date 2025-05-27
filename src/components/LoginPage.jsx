import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { API_BASE_URL, USER } from '../configs/host-config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);

  // 환경변수에서 가져오기
  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  // 구글 로그인 처리
  const handleGoogleLogin = () => {
    console.log('구글 로그인 버튼 클릭!');
  };

  // 카카오 로그인 처리
  const handleKakaoLogin = () => {
    console.log('카카오 로그인 버튼 클릭!');
    // 로그인 팝업창 열기
    const popup = window.open(
      `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`,
      'kakao-login',
      'width=500,height=600,scrollbars=yes,resizable=yes',
    );
  };

  // 자체 로그인 로직
  const doLogin = async () => {
    const loginData = {
      email,
      password,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}${USER}/doLogin`, loginData);
      alert('로그인 성공!');
      onLogin(res.data.result);
      navigate('/');
    } catch (e) {
      console.log(e); // 백엔드 데이터: e.response.data
      alert('로그인 실패입니다. 아이디 또는 비밀번호를 확인하세요!');
    }
  };

  return (
    <Grid container justifyContent='center'>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardHeader title='로그인' style={{ textAlign: 'center' }} />
          <CardContent>
            {/* 소셜 로그인 섹션 */}
            <Box mb={3}>
              <Button
                variant='outlined'
                fullWidth
                onClick={handleGoogleLogin}
                sx={{
                  mb: 2,
                  borderColor: '#4285f4',
                  color: '#4285f4',
                  '&:hover': {
                    borderColor: '#3367d6',
                    backgroundColor: '#f8f9fa',
                  },
                  textTransform: 'none',
                  fontSize: '16px',
                  height: '48px',
                }}
                startIcon={
                  <img
                    src='https://developers.google.com/identity/images/g-logo.png'
                    alt='Google'
                    style={{ width: '20px', height: '20px' }}
                  />
                }
              >
                Google로 로그인
              </Button>

              <Button
                variant='outlined'
                fullWidth
                onClick={handleKakaoLogin}
                sx={{
                  mb: 2,
                  borderColor: '#fee500',
                  color: '#3c1e1e',
                  backgroundColor: '#fee500',
                  '&:hover': {
                    borderColor: '#fdd835',
                    backgroundColor: '#fdd835',
                  },
                  textTransform: 'none',
                  fontSize: '16px',
                  height: '48px',
                }}
                startIcon={
                  <img
                    src='https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png'
                    alt='Kakao'
                    style={{ width: '20px', height: '20px' }}
                  />
                }
              >
                Kakao로 로그인
              </Button>

              <Box display='flex' alignItems='center' my={3}>
                <Divider sx={{ flex: 1 }} />
                <Typography
                  variant='body2'
                  sx={{ px: 2, color: 'text.secondary' }}
                >
                  또는
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>
            </Box>

            {/* 기존 로그인 폼 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                doLogin();
              }}
            >
              <TextField
                label='Email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin='normal'
                required
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button color='secondary' fullWidth>
                    비밀번호 변경
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    type='submit'
                    color='primary'
                    variant='contained'
                    fullWidth
                  >
                    로그인
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* 비밀번호 변경 모달 */}
      {/* <Dialog open={resetPassword} onClose={() => setResetPassword(false)}>
          <ResetPasswordModal handleClose={() => setResetPassword(false)} />
        </Dialog> */}
    </Grid>
  );
};

export default LoginPage;
