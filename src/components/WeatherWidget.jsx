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

// base_date, base_time 계산 함수 (기상청 단기예보 규칙)
function getKmaBaseDateTime() {
  const now = new Date();
  // 단기예보 발표시각: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let hour = now.getHours();
  let minute = now.getMinutes();
  let baseHour = baseTimes[0];
  for (let i = 0; i < baseTimes.length; i++) {
    if (hour > baseTimes[i] || (hour === baseTimes[i] && minute >= 10)) {
      baseHour = baseTimes[i];
    }
  }
  // 만약 00:00~02:10 사이면 전날 23시로 요청해야 함
  if (hour < 2 || (hour === 2 && minute < 10)) {
    const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const base_date =
      yest.getFullYear().toString() +
      String(yest.getMonth() + 1).padStart(2, '0') +
      String(yest.getDate()).padStart(2, '0');
    return { base_date, base_time: '2300' };
  }
  const base_date =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  return { base_date, base_time: String(baseHour).padStart(2, '0') + '00' };
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
    function fetchWeather(lat, lon) {
      const grid = dfs_xy_conv(lat, lon);
      const { base_date, base_time } = getKmaBaseDateTime();
      const url = `${KMA_API_ENDPOINT}/getVilageFcst?serviceKey=${KMA_API_KEY}&numOfRows=100&pageNo=1&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${grid.x}&ny=${grid.y}`;

      console.log('날씨 API 요청:', url);

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (!data.response || !data.response.body) {
            console.error('기상청 응답 오류:', data);
            return;
          }
          const items = data.response.body.items.item;

          // 오늘/내일 날짜 구하기 (YYYYMMDD)
          const now = new Date();
          const pad = (n) => n.toString().padStart(2, '0');
          const today = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
          const tomorrowDate = new Date(now);
          tomorrowDate.setDate(now.getDate() + 1);
          const tomorrow = `${tomorrowDate.getFullYear()}${pad(tomorrowDate.getMonth() + 1)}${pad(tomorrowDate.getDate())}`;

          // 오늘/내일의 모든 시각 구하기
          const todayTimes = [
            ...new Set(
              items.filter((i) => i.fcstDate === today).map((i) => i.fcstTime),
            ),
          ].sort();
          const tomorrowTimes = [
            ...new Set(
              items
                .filter((i) => i.fcstDate === tomorrow)
                .map((i) => i.fcstTime),
            ),
          ].sort();

          // 오늘: 현재 시각 이후 가장 가까운 시각, 없으면 가장 마지막 시각
          const nowHHMM = pad(now.getHours()) + '00';
          let todayTargetTime =
            todayTimes.find((t) => t >= nowHHMM) ||
            todayTimes[todayTimes.length - 1];
          // 내일: 가장 이른 시각 (없으면 null)
          let tomorrowTargetTime = tomorrowTimes[0] || null;

          // 카테고리별 추출 함수
          function getWeather(items, date, time, category) {
            return items.find(
              (item) =>
                item.fcstDate === date &&
                item.fcstTime === time &&
                item.category === category,
            )?.fcstValue;
          }

          // 오늘 데이터
          const todayWeather = {
            TMP: getWeather(items, today, todayTargetTime, 'TMP'),
            SKY: getWeather(items, today, todayTargetTime, 'SKY'),
            POP: getWeather(items, today, todayTargetTime, 'POP'),
            PTY: getWeather(items, today, todayTargetTime, 'PTY'),
            fcstTime: todayTargetTime,
          };

          // 내일 데이터 (없으면 null)
          let tomorrowWeather;
          if (tomorrowTargetTime) {
            tomorrowWeather = {
              TMP: getWeather(items, tomorrow, tomorrowTargetTime, 'TMP'),
              SKY: getWeather(items, tomorrow, tomorrowTargetTime, 'SKY'),
              POP: getWeather(items, tomorrow, tomorrowTargetTime, 'POP'),
              PTY: getWeather(items, tomorrow, tomorrowTargetTime, 'PTY'),
              fcstTime: tomorrowTargetTime,
            };
          } else {
            console.warn('내일 예보 데이터가 없습니다.');
            tomorrowWeather = {
              TMP: null,
              SKY: null,
              POP: null,
              PTY: null,
              fcstTime: null,
            };
          }

          // 하늘상태/강수형태 한글 변환
          const skyMap = { 1: '맑음', 3: '구름많음', 4: '흐림' };
          const ptyMap = {
            0: '없음',
            1: '비',
            2: '비/눈',
            3: '눈',
            4: '소나기',
          };

          todayWeather.SKY_KR = skyMap[todayWeather.SKY] || todayWeather.SKY;
          todayWeather.PTY_KR = ptyMap[todayWeather.PTY] || todayWeather.PTY;
          tomorrowWeather.SKY_KR =
            skyMap[tomorrowWeather.SKY] || tomorrowWeather.SKY;
          tomorrowWeather.PTY_KR =
            ptyMap[tomorrowWeather.PTY] || tomorrowWeather.PTY;

          console.log('기상청 단기예보:', {
            오늘: todayWeather,
            내일: tomorrowWeather,
          });
          setTodayWeatherState(todayWeather);
        })
        .catch((err) => {
          console.error('날씨 정보 가져오기 실패:', err);
          // 날씨 API 실패 시 기본 날씨 상태 설정
          setTodayWeatherState({
            TMP: '20',
            SKY: '1',
            POP: '0',
            PTY: '0',
            SKY_KR: '맑음',
            PTY_KR: '없음',
            fcstTime: '1200',
          });
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
                fetchWeather(geoData.latitude, geoData.longitude);
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
