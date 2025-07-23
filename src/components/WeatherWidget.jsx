import React, { useState, useEffect } from 'react';
import WeatherAnimation from './WeatherAnimation';
import styles from './WeatherWidget.module.scss';

// 기상청 단기예보 API 엔드포인트 (상수)
const KMA_API_ENDPOINT =
  'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

// 위도, 경도 → 기상청 격자(nx, ny) 변환 함수
function dfs_xy_conv(lat, lon) {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;

  const DEGRAD = Math.PI / 180.0;

  let re = RE / GRID;
  let slat1 = SLAT1 * DEGRAD;
  let slat2 = SLAT2 * DEGRAD;
  let olon = OLON * DEGRAD;
  let olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  let rs = {};
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  rs.x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  rs.y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  return rs;
}

// base_date, base_time 계산 함수 (초단기실황 규칙: 10분 단위)
function getKmaBaseDateTimeForUltraSrtNcst() {
  const now = new Date();
  // 10분 단위로 내림
  now.setMinutes(Math.floor(now.getMinutes() / 10) * 10, 0, 0);
  const base_date =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const base_time =
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0');
  return { base_date, base_time };
}

const WeatherWidget = ({
  testWeather,
  setTestWeather,
  onlyButtons,
  onlyAnimation,
}) => {
  const KMA_API_KEY = import.meta.env.VITE_KMA_API_KEY;
  const [todayWeatherState, setTodayWeatherState] = useState(null);

  // 날씨 정보 가져오기
  useEffect(() => {
    function fetchWeather(lat, lon, addressStr = '') {
      const grid = dfs_xy_conv(lat, lon);
      const { base_date, base_time } = getKmaBaseDateTimeForUltraSrtNcst();
      const url = `${KMA_API_ENDPOINT}/getUltraSrtNcst?serviceKey=${KMA_API_KEY}&numOfRows=100&pageNo=1&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${grid.x}&ny=${grid.y}`;

      console.log('초단기실황 API 요청:', url);

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (!data.response || !data.response.body) {
            console.error('기상청 응답 오류:', data);
            return;
          }
          const items = data.response.body.items.item;
          const get = (cat) => items.find((i) => i.category === cat)?.obsrValue;
          const weather = {
            TMP: get('T1H'), // 기온
            SKY: get('SKY'), // 하늘상태
            PTY: get('PTY'), // 강수형태
            RN1: get('RN1'), // 1시간 강수량
            REH: get('REH'), // 습도
            WSD: get('WSD'), // 풍속
          };
          const skyMap = { 1: '맑음', 3: '구름많음', 4: '흐림' };
          const ptyMap = {
            0: '없음',
            1: '비',
            2: '비/눈',
            3: '눈',
            4: '소나기',
          };
          weather.SKY_KR = skyMap[weather.SKY] || weather.SKY;
          weather.PTY_KR = ptyMap[weather.PTY] || weather.PTY;
          setTodayWeatherState(weather);
          if (addressStr) console.log('현재 위치(주소):', addressStr);
        })
        .catch((err) => {
          console.error('날씨 정보 가져오기 실패:', err);
          setTodayWeatherState({
            TMP: '20',
            SKY: '1',
            PTY: '0',
            SKY_KR: '맑음',
            PTY_KR: '없음',
          });
          if (addressStr) console.log('현재 위치(주소):', addressStr);
        });
    }

    // 위치 정보 가져오기 시도
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('위치 정보 성공:', latitude, longitude);
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error.message);
          // 위치 정보 실패 시 ipapi.co에서 직접 위치 정보 요청
          fetch('https://ipapi.co/json/')
            .then((res) => res.json())
            .then((geoData) => {
              if (geoData.latitude && geoData.longitude) {
                console.log(
                  'ipapi.co 위치:',
                  geoData.latitude,
                  geoData.longitude,
                );
                fetchWeather(geoData.latitude, geoData.longitude, geoData.city);
              } else {
                console.log('ipapi.co 위치 정보 없음 - 서울 좌표 사용');
                fetchWeather(37.5665, 126.978);
              }
            })
            .catch((err) => {
              console.warn('ipapi.co 위치 변환 실패:', err.message);
              fetchWeather(37.5665, 126.978);
            });
        },
        {
          timeout: 10000, // 10초 타임아웃
          enableHighAccuracy: false, // 정확도 낮춰서 빠르게
          maximumAge: 300000, // 5분 캐시
        },
      );
    } else {
      console.error('이 브라우저는 위치 정보를 지원하지 않습니다.');
      // 브라우저 미지원 시 서울 좌표 사용
      console.log('브라우저 미지원 - 서울 좌표 사용');
      fetchWeather(37.5665, 126.978);
    }
  }, []); // 한 번만 실행

  // 버튼 렌더링
  const buttons = (
    <div
      style={{ position: 'fixed', left: 0, top: 0, zIndex: 100, padding: 10 }}
    >
      <button onClick={() => setTestWeather({ sky: '1', pty: '0' })}>
        맑음
      </button>
      <button onClick={() => setTestWeather({ sky: '4', pty: '0' })}>
        흐림
      </button>
      <button onClick={() => setTestWeather({ sky: '3', pty: '0' })}>
        구름
      </button>
      <button onClick={() => setTestWeather({ sky: '1', pty: '1' })}>비</button>
      <button onClick={() => setTestWeather({ sky: '1', pty: '3' })}>눈</button>
      <button onClick={() => setTestWeather(null)}>실제날씨</button>
    </div>
  );

  // 애니메이션 렌더링
  const animation = (testWeather ||
    (todayWeatherState && todayWeatherState.TMP)) && (
    <WeatherAnimation
      sky={testWeather ? testWeather.sky : todayWeatherState.SKY}
      pty={testWeather ? testWeather.pty : todayWeatherState.PTY}
    />
  );

  // 주소 정보 표시
  if (onlyButtons) return buttons;
  if (onlyAnimation) return animation;

  // 기본: 버튼+애니메이션 모두
  return (
    <>
      {buttons}
      {animation}
    </>
  );
};

export default WeatherWidget;
