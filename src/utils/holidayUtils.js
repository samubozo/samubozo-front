// 한국 공휴일 처리 유틸리티

// 음력 공휴일을 양력으로 변환하는 함수
function getLunarDate(year, month, day) {
  // 간단한 음력-양력 변환 (정확하지 않으므로 실제 사용시 더 정확한 라이브러리 필요)
  // 여기서는 주요 공휴일만 하드코딩
  return null;
}

// 한국 공휴일 목록 (2024-2025년) - 백업용
const KOREAN_HOLIDAYS = {
  // 고정 공휴일
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '크리스마스',

  // 설날 (음력 1월 1일 전후)
  '2024-02-09': '설날',
  '2024-02-10': '설날',
  '2024-02-11': '설날',
  '2025-01-27': '설날',
  '2025-01-28': '설날',
  '2025-01-29': '설날',

  // 부처님오신날 (음력 4월 8일)
  '2024-05-15': '부처님오신날',
  '2025-05-03': '부처님오신날',

  // 추석 (음력 8월 15일 전후)
  '2024-09-16': '추석',
  '2024-09-17': '추석',
  '2024-09-18': '추석',
  '2025-10-05': '추석',
  '2025-10-06': '추석',
  '2025-10-07': '추석',
};

// 공휴일 데이터 캐시
let holidayCache = new Map();

/**
 * 공공데이터포털에서 공휴일 데이터 가져오기
 * @param {number} year - 년도
 * @returns {Promise<Array>} - 공휴일 목록
 */
export async function fetchHolidaysFromAPI(year) {
  try {
    // 공공데이터포털 API 키 (Vite에서는 import.meta.env 사용)
    const API_KEY = import.meta.env.VITE_HOLIDAY_API_KEY || 'your-api-key';

    const response = await fetch(
      `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?serviceKey=${API_KEY}&solYear=${year}&numOfRows=100&_type=json`,
    );

    console.log('API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 에러:', errorText);
      throw new Error(
        `API 요청 실패: ${response.status} ${response.statusText}`,
      );
    }

    const responseText = await response.text();

    // XML 응답인지 확인
    if (responseText.trim().startsWith('<')) {
      console.warn('XML 응답 받음, 백업 데이터 사용');
      return getHolidaysForYear(year);
    }

    const data = JSON.parse(responseText);

    const holidays = data.response.body.items.item || [];

    return holidays.map((holiday) => {
      // locdate를 YYYY-MM-DD 형식으로 변환
      const locdate = String(holiday.locdate);
      const date = `${locdate.slice(0, 4)}-${locdate.slice(4, 6)}-${locdate.slice(6, 8)}`;

      return {
        date: date,
        name: holiday.dateName,
      };
    });
  } catch (error) {
    console.warn('공휴일 API 호출 실패, 백업 데이터 사용:', error);
    return getHolidaysForYear(year);
  }
}

/**
 * 특정 년도의 공휴일 데이터 가져오기 (캐시 사용)
 * @param {number} year - 년도
 * @returns {Promise<Array>} - 공휴일 목록
 */
export async function getHolidaysForYearAsync(year) {
  // 캐시 확인
  if (holidayCache.has(year)) {
    return holidayCache.get(year);
  }

  try {
    // API에서 데이터 가져오기
    const holidays = await fetchHolidaysFromAPI(year);
    holidayCache.set(year, holidays);
    return holidays;
  } catch (error) {
    // API 실패시 백업 데이터 사용
    const backupHolidays = getHolidaysForYear(year);
    holidayCache.set(year, backupHolidays);
    return backupHolidays;
  }
}

/**
 * 특정 날짜가 공휴일인지 확인 (비동기)
 * @param {Date} date - 확인할 날짜
 * @returns {Promise<string|null>} - 공휴일 이름 또는 null
 */
export async function isKoreanHolidayAsync(date) {
  const year = date.getFullYear();
  const holidays = await getHolidaysForYearAsync(year);

  const dateStr = date.toISOString().slice(0, 10);
  const holiday = holidays.find((h) => h.date === dateStr);

  return holiday ? holiday.name : null;
}

/**
 * 특정 날짜가 공휴일인지 확인 (동기 - 백업용)
 * @param {Date} date - 확인할 날짜
 * @returns {string|null} - 공휴일 이름 또는 null
 */
export function isKoreanHoliday(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // 년도별 공휴일 확인
  const yearSpecificKey = `${year}-${month}-${day}`;
  if (KOREAN_HOLIDAYS[yearSpecificKey]) {
    return KOREAN_HOLIDAYS[yearSpecificKey];
  }

  // 고정 공휴일 확인
  const fixedKey = `${month}-${day}`;
  if (KOREAN_HOLIDAYS[fixedKey]) {
    return KOREAN_HOLIDAYS[fixedKey];
  }

  return null;
}

/**
 * 특정 년도의 모든 공휴일 목록 반환 (백업용)
 * @param {number} year - 년도
 * @returns {Array} - 공휴일 목록
 */
export function getHolidaysForYear(year) {
  const holidays = [];

  // 고정 공휴일 추가
  const fixedHolidays = [
    { month: 1, day: 1, name: '신정' },
    { month: 3, day: 1, name: '삼일절' },
    { month: 5, day: 5, name: '어린이날' },
    { month: 6, day: 6, name: '현충일' },
    { month: 8, day: 15, name: '광복절' },
    { month: 10, day: 3, name: '개천절' },
    { month: 10, day: 9, name: '한글날' },
    { month: 12, day: 25, name: '크리스마스' },
  ];

  fixedHolidays.forEach((holiday) => {
    const date = new Date(year, holiday.month - 1, holiday.day);
    holidays.push({
      date: date.toISOString().slice(0, 10),
      name: holiday.name,
    });
  });

  // 년도별 공휴일 추가
  Object.keys(KOREAN_HOLIDAYS).forEach((key) => {
    if (key.startsWith(`${year}-`)) {
      holidays.push({
        date: key,
        name: KOREAN_HOLIDAYS[key],
      });
    }
  });

  return holidays;
}

/**
 * 주말인지 확인
 * @param {Date} date - 확인할 날짜
 * @returns {boolean} - 주말 여부
 */
export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // 0: 일요일, 6: 토요일
}

/**
 * 쉬는날인지 확인 (주말 또는 공휴일) - 동기 버전
 * @param {Date} date - 확인할 날짜
 * @returns {Object} - { isHoliday: boolean, type: string, name: string }
 */
export function isRestDay(date) {
  const holidayName = isKoreanHoliday(date);
  const isWeekendDay = isWeekend(date);

  if (holidayName) {
    return {
      isHoliday: true,
      type: 'holiday',
      name: holidayName,
    };
  }

  if (isWeekendDay) {
    const dayNames = [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ];
    return {
      isHoliday: true,
      type: 'weekend',
      name: dayNames[date.getDay()],
    };
  }

  return {
    isHoliday: false,
    type: 'weekday',
    name: null,
  };
}

/**
 * 쉬는날인지 확인 (주말 또는 공휴일) - 비동기 버전
 * @param {Date} date - 확인할 날짜
 * @returns {Promise<Object>} - { isHoliday: boolean, type: string, name: string }
 */
export async function isRestDayAsync(date) {
  const holidayName = await isKoreanHolidayAsync(date);
  const isWeekendDay = isWeekend(date);

  if (holidayName) {
    return {
      isHoliday: true,
      type: 'holiday',
      name: holidayName,
    };
  }

  if (isWeekendDay) {
    const dayNames = [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ];
    return {
      isHoliday: true,
      type: 'weekend',
      name: dayNames[date.getDay()],
    };
  }

  return {
    isHoliday: false,
    type: 'weekday',
    name: null,
  };
}
