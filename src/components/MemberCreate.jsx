import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  TextField,
} from '@mui/material';
import React, { useContext, useState } from 'react';
import { replace, useNavigate } from 'react-router-dom';
import { API_BASE_URL, USER } from '../configs/host-config';
import AuthContext from '../context/UserContext';
import axios from 'axios';

const MemberCreate = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [zipcode, setZipcode] = useState('');

  // 이메일 인증 관련 상태
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailSendLoading, setEmailSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // react router dom에서 제공하는 훅 useNavigate
  // 사용자가 특정 요소를 누르지 않아도 이벤트 등에서 페이지를 이동시킬 때 사용하는 훅
  // 리턴받은 함수를 통해 원하는 url을 문자열로 전달합니다.
  const navigate = useNavigate();

  const { isLoggedIn } = useContext(AuthContext);
  if (isLoggedIn) {
    alert('여기 왜왔죠??');
    navigate('/', replace);
  }

  const sendVerificationEmail = async () => {
    console.log('이메일 인증 버튼이 클릭됨!');
    if (!email) {
      alert('이메일을 먼저 입력해 주세요!');
      return;
    }
    const regEmail =
      /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

    // 정규표현식 작성 후 변수에 대입해 주면, 정규표현식을 담은 객체로 저장이 됩니다.
    // 해당 정규표현식 객체는 test 메서드를 통해, 전달된 값이 정규표현식에 일치하는 값인지를 검증하는 로직을 제공.
    if (!regEmail.test(email)) {
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setEmailSendLoading(true); // 이메일 전송 직전에 로딩 상태 true
    try {
      const res = await axios.post(`${API_BASE_URL}${USER}/email-valid`, {
        email,
      });
      console.log('응답된 결과: ', res.data);

      setIsEmailSent(true); // 인증 코드를 입력할 수 있는 필드를 드러내자.
      alert('인증 코드가 이메일로 발송되었습니다.');
    } catch (error) {
      console.error('이메일 발송 오류: ', error);
      if (error.response.data.statusMessage === 'Blocking') {
        alert('인증 차된된 이메일 입니다. 잠시 후 다시 시도해 주세요!');
      } else {
        alert('인증 이메일 발송 중 오류 발생!');
      }
    } finally {
      setEmailSendLoading(false); // 전송되든 에러가 나든 로딩이 끝났음을 알려주기.
    }
  };

  const verifyEmailCode = async () => {
    if (!verificationCode.trim()) {
      alert('인증 코드를 입력해 주세요!');
      return;
    }

    setVerifyLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}${USER}/verify`, {
        email,
        code: verificationCode,
      });

      console.log('응답된 데이터: ', res.data);
      setIsEmailVerified(true);
      alert('이메일 인증이 완료되었습니다!');
    } catch (error) {
      console.error('인증 확인 오류: ', error);
      const msg = error.response.data.statusMessage;
      if (msg === 'authCode expired!') {
        alert('인증 시간이 만료되었습니다. 인증 코드부터 다시 발급해 주세요!');
      } else if (msg.indexOf('wrong') !== -1) {
        alert(
          `인증 코드가 올바르지 않습니다!, 남은 횟수: ${msg.split(', ')[1]}`,
        );
      } else if (msg === 'Blocking') {
        alert('임시 차단된 이메일입니다. 잠시 후 다시 시도해 주세요!');
      } else {
        alert('기타 오류 발생!');
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const memberCreate = async (e) => {
    e.preventDefault();

    // 백엔드에게 전송할 데이터 형태를 만들자 (DTO 형태대로)
    const registData = {
      name,
      email,
      password,
      address: {
        city,
        street,
        zipCode: zipcode,
      },
    };

    const res = await fetch(`${API_BASE_URL}${USER}/create`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(registData),
    });

    const data = await res.json();
    if (data.statusCode === 201) {
      alert(`${data.result}님 환영합니다!`);
      navigate('/');
    } else {
      alert(data.statusMessage);
    }

    /*
    fetch(`http://localhost:8181/user/create`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(registData),
    })
      .then((res) => {
        if (res.status === 201) return res.json();
        else {
          alert('이메일이 중복되었습니다. 다른 이메일로 다시 시도해 보세요!');
          return;
        }
      })
      .then((data) => {
        if (data) {
          console.log('백엔드로부터 전달된 데이터: ', data);
          alert(`${data.result}님 환영합니다!`);
        }
      });
    */
  };

  return (
    <Grid container justifyContent='center'>
      <Grid item xs={12} sm={8} md={6}>
        <Card>
          <CardHeader title='회원가입' style={{ textAlign: 'center' }} />
          <CardContent>
            <form onSubmit={memberCreate}>
              <TextField
                label='이름'
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                margin='normal'
                required
              />

              {/* 이메일 필드와 인증 버튼 */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  label='Email'
                  type='email'
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // 이메일이 변경되면 인증 상태 초기화 (인증받지 않은 것처럼 돌려놓기)
                    if (isEmailSent || isEmailVerified) {
                      setIsEmailSent(false);
                      setIsEmailVerified(false);
                    }
                  }}
                  fullWidth
                  margin='normal'
                  required
                  // sx={{
                  //   '& .MuiInputBase-root': {
                  //     backgroundColor: isEmailVerified ? '#f5f5f5' : 'inherit',
                  //   },
                  // }}
                />
                <Button
                  variant='outlined'
                  onClick={sendVerificationEmail}
                  sx={{ mb: 1, minWidth: '100px' }}
                >
                  {emailSendLoading
                    ? '발송중...'
                    : isEmailVerified
                      ? '인증완료'
                      : '인증'}
                </Button>
              </Box>

              {/* 인증 코드 입력 필드 */}
              {isEmailSent && !isEmailVerified && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    label='인증 코드'
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    fullWidth
                    margin='normal'
                    placeholder='이메일로 받은 인증 코드를 입력하세요'
                  />
                  <Button
                    variant='outlined'
                    onClick={verifyEmailCode}
                    disabled={!verificationCode || verifyLoading}
                    sx={{ mb: 1, minWidth: '100px' }}
                  >
                    {verifyLoading ? '확인중...' : '확인'}
                  </Button>
                </Box>
              )}

              <TextField
                label='Password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='도시'
                value={city}
                onChange={(e) => setCity(e.target.value)}
                fullWidth
                margin='normal'
              />
              <TextField
                label='상세주소'
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                fullWidth
                margin='normal'
              />
              <TextField
                label='우편번호'
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                fullWidth
                margin='normal'
              />
              <CardActions>
                <Button
                  type='submit'
                  color='primary'
                  variant='contained'
                  fullWidth
                  disabled={!isEmailVerified}
                >
                  회원가입
                </Button>
              </CardActions>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MemberCreate;
