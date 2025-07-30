/**
 * 한국 시간 관련 유틸리티 함수들
 */

/**
 * 현재 한국 시간을 yyyy-MM-dd 형식으로 반환
 * @returns {string} 한국 시간 기준 오늘 날짜 (yyyy-MM-dd)
 */
export const getKoreaToday = () => {
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9
  return koreaTime.toISOString().slice(0, 10);
};

/**
 * 주어진 날짜를 한국 시간으로 변환하여 yyyy-MM-dd 형식으로 반환
 * @param {Date} date - 변환할 날짜
 * @returns {string} 한국 시간 기준 날짜 (yyyy-MM-dd)
 */
export const getKoreaDateString = (date) => {
  const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC+9
  return koreaTime.toISOString().slice(0, 10);
};

/**
 * 현재 한국 시간을 Date 객체로 반환
 * @returns {Date} 한국 시간 기준 현재 시간
 */
export const getKoreaNow = () => {
  const now = new Date();
  return new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9
};
