import React, { createContext, useContext, useState, useEffect } from 'react';

const WeatherContext = createContext();

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

export const WeatherProvider = ({ children }) => {
  const [todayWeatherState, setTodayWeatherState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 날씨 데이터 가져오기 함수들을 Context로 이동
  const KMA_API_KEY = import.meta.env.VITE_KMA_API_KEY;
  const KMA_API_ENDPOINT =
    'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

  // 위치 정보 캐싱 (1시간)
  const LOCATION_CACHE_KEY = 'weather_location_cache';
  const LOCATION_CACHE_DURATION = 60 * 60 * 1000; // 1시간

  function getCachedLocation() {
    try {
      const cached = localStorage.getItem(LOCATION_CACHE_KEY);
      if (cached) {
        const { latitude, longitude, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < LOCATION_CACHE_DURATION) {
          return { latitude, longitude };
        }
      }
    } catch (error) {
      console.warn('캐시 읽기 실패:', error);
    }
    return null;
  }

  function setCachedLocation(latitude, longitude) {
    try {
      const cacheData = {
        latitude,
        longitude,
        timestamp: Date.now(),
      };
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('캐시 저장 실패:', error);
    }
  }

  // 여러 무료 위치 서비스에서 위치 정보 가져오기
  async function getLocationFromMultipleServices() {
    const services = [
      {
        name: 'ipapi.co',
        url: 'https://ipapi.co/json/',
        timeout: 5000,
        transform: (data) => ({
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ipapi.co',
        }),
      },
      {
        name: 'ip-api.com',
        url: 'http://ip-api.com/json/',
        timeout: 5000,
        transform: (data) => ({
          latitude: data.lat,
          longitude: data.lon,
          source: 'ip-api.com',
        }),
      },
      {
        name: 'ipinfo.io',
        url: 'https://ipinfo.io/json',
        timeout: 5000,
        transform: (data) => {
          const [lat, lon] = data.loc.split(',').map(Number);
          return {
            latitude: lat,
            longitude: lon,
            source: 'ipinfo.io',
          };
        },
      },
      {
        name: 'freegeoip.app',
        url: 'https://freegeoip.app/json/',
        timeout: 5000,
        transform: (data) => ({
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'freegeoip.app',
        }),
      },
    ];

    for (const service of services) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), service.timeout);

        const response = await fetch(service.url, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`${service.name} HTTP ${response.status}`);
        }

        const data = await response.json();
        const result = service.transform(data);

        if (result.latitude && result.longitude) {
          return result;
        } else {
          throw new Error(`${service.name} 유효하지 않은 데이터`);
        }
      } catch (error) {
        console.warn(`${service.name} 실패:`, error.message);
        continue;
      }
    }

    throw new Error('모든 위치 서비스 실패');
  }

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

  // base_date, base_time 계산 함수 (단기예보 규칙: 3시간 단위)
  function getKmaBaseDateTime() {
    const now = new Date();
    const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
    let hour = now.getHours();
    let minute = now.getMinutes();
    let baseHour = baseTimes[0];
    for (let i = 0; i < baseTimes.length; i++) {
      if (hour > baseTimes[i] || (hour === baseTimes[i] && minute >= 10)) {
        baseHour = baseTimes[i];
      }
    }
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

  // 날씨 데이터 가져오기 함수
  async function fetchWeatherData() {
    if (isLoading || todayWeatherState) {
      return;
    }

    setIsLoading(true);

    try {
      // 위치 정보 가져오기 (캐시 우선)
      const cachedLocation = getCachedLocation();
      let latitude, longitude;

      if (cachedLocation) {
        latitude = cachedLocation.latitude;
        longitude = cachedLocation.longitude;
      } else {
        // 위치 정보 가져오기
        // 브라우저 위치 정보 API 사용 여부 확인 (에러 방지)
        const useBrowserLocation =
          navigator.geolocation &&
          typeof navigator.geolocation.getCurrentPosition === 'function' &&
          !navigator.userAgent.includes('Safari'); // Safari에서 CoreLocation 에러 방지

        if (useBrowserLocation) {
          try {
            const position = await new Promise((resolve, reject) => {
              const options = {
                timeout: 3000, // 더 짧은 타임아웃
                enableHighAccuracy: false,
                maximumAge: 600000, // 10분
              };

              navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                options,
              );
            });
            const coords = position.coords;
            latitude = coords.latitude;
            longitude = coords.longitude;
            setCachedLocation(latitude, longitude);
          } catch (browserLocationError) {
              '브라우저 위치 정보 실패, IP 기반 위치 서비스 시도:',
              browserLocationError.message,
            );

            try {
              // 여러 무료 위치 서비스 백업 시스템 시도
              const locationData = await getLocationFromMultipleServices();
              latitude = locationData.latitude;
              longitude = locationData.longitude;
              setCachedLocation(latitude, longitude);
            } catch (ipLocationError) {
                '모든 위치 서비스 실패, 기본 위치 사용:',
                ipLocationError.message,
              );
              // 서울 서초구 좌표를 기본값으로 사용
              latitude = 37.4837;
              longitude = 127.0324;
              setCachedLocation(latitude, longitude);
            }
          }
        } else {

          try {
            // 여러 무료 위치 서비스 백업 시스템 시도
            const locationData = await getLocationFromMultipleServices();
            latitude = locationData.latitude;
            longitude = locationData.longitude;
            setCachedLocation(latitude, longitude);
          } catch (ipLocationError) {
              '모든 위치 서비스 실패, 기본 위치 사용:',
              ipLocationError.message,
            );
            // 서울 서초구 좌표를 기본값으로 사용
            latitude = 37.4837;
            longitude = 127.0324;
            setCachedLocation(latitude, longitude);
          }
        }
      }

      // 좌표 유효성 검사
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        throw new Error('유효하지 않은 좌표');
      }

      const grid = dfs_xy_conv(latitude, longitude);

      // 격자 좌표 유효성 검사
      if (!grid.x || !grid.y || isNaN(grid.x) || isNaN(grid.y)) {
        throw new Error('격자 좌표 변환 실패');
      }

      const { base_date, base_time } = getKmaBaseDateTime();
      const url = `${KMA_API_ENDPOINT}/getVilageFcst?serviceKey=${KMA_API_KEY}&numOfRows=100&pageNo=1&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${grid.x}&ny=${grid.y}`;


      const response = await fetch(url);
      const data = await response.json();

      if (!data.response || !data.response.body) {
        throw new Error('기상청 응답 오류');
      }

      const items = data.response.body.items.item;
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const today = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
      const todayTimes = [
        ...new Set(
          items.filter((i) => i.fcstDate === today).map((i) => i.fcstTime),
        ),
      ].sort();
      const nowHHMM = pad(now.getHours()) + '00';
      let todayTargetTime =
        todayTimes.find((t) => t >= nowHHMM) ||
        todayTimes[todayTimes.length - 1];

      function getWeather(items, date, time, category) {
        return items.find(
          (item) =>
            item.fcstDate === date &&
            item.fcstTime === time &&
            item.category === category,
        )?.fcstValue;
      }

      const weather = {
        TMP: getWeather(items, today, todayTargetTime, 'TMP'),
        SKY: getWeather(items, today, todayTargetTime, 'SKY'),
        POP: getWeather(items, today, todayTargetTime, 'POP'),
        PTY: getWeather(items, today, todayTargetTime, 'PTY'),
        fcstTime: todayTargetTime,
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
    } catch (error) {
      // 위치 정보 관련 에러는 조용히 처리 (사용자에게 불필요한 에러 표시 방지)
      if (
        error.message.includes('Position update is unavailable') ||
        error.message.includes('GeolocationPositionError') ||
        error.message.includes('kCLErrorLocationUnknown')
      ) {
      } else {
        console.error('날씨 데이터 가져오기 실패:', error);
      }

      // 기본값으로 설정
      setTodayWeatherState({
        TMP: '20',
        SKY: '1',
        PTY: '0',
        SKY_KR: '맑음',
        PTY_KR: '없음',
        fcstTime: '1200',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // 컴포넌트 마운트 시 날씨 데이터 가져오기
  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        todayWeatherState,
        setTodayWeatherState,
        isLoading,
        fetchWeatherData,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};
