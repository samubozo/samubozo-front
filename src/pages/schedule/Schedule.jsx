import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from './Schedule.module.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, SCHEDULE } from '../../configs/host-config';
import { HexColorPicker } from 'react-colorful';
import debounce from 'lodash/debounce';

// 색상 대비 계산 함수
function getContrastColor(backgroundColor) {
  // HEX 색상을 RGB로 변환
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // 밝기 계산 (YIQ 공식)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // 밝기가 128보다 크면 어두운 글씨, 작으면 밝은 글씨
  // 매우 어두운 색상의 경우 더 강한 대비를 위해 흰색 사용
  if (brightness <= 50) {
    return '#ffffff'; // 매우 어두운 색상
  } else if (brightness > 128) {
    return '#000000'; // 밝은 색상
  } else {
    return '#ffffff'; // 중간 어두운 색상
  }
}

const SCHEDULE_TYPES = [
  { label: '연차', value: 'ANNUAL_LEAVE' },
  { label: '반차', value: 'HALF_LEAVE' },
  { label: '출장', value: 'BUSINESS_TRIP' },
  { label: '회의', value: 'MEETING' },
  { label: '기타', value: 'ETC' },
  { label: '할 일', value: 'TODO' },
];

const SCHEDULE_TYPE_LABELS = {
  ANNUAL_LEAVE: '연차',
  HALF_LEAVE: '반차',
  BUSINESS_TRIP: '출장',
  MEETING: '회의',
  ETC: '기타',
  TODO: '할 일',
};

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

function isSameDay(date, dateStr) {
  return date.toISOString().slice(0, 10) === dateStr;
}

function isBetween(date, start, end) {
  if (!start) return false;
  const effectiveEnd = end || start;
  const d = date.toISOString().slice(0, 10);
  return d >= start && d <= effectiveEnd;
}

function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function Schedule() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(null); // null | 'PERSONAL' | 'GROUP'
  const [showEventModal, setShowEventModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchActiveIdx, setSearchActiveIdx] = useState(-1);
  const searchInputRef = useRef(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [popupPos, setPopupPos] = useState({ left: 0, top: 0 });
  const [rightHoveredEvent, setRightHoveredEvent] = useState(null);
  const [rightPopupPos, setRightPopupPos] = useState(null);
  const [rightDetail, setRightDetail] = useState(null);
  const [highlightTodayCell, setHighlightTodayCell] = useState(false);
  const [rightTodos, setRightTodos] = useState([]);
  const [editEvent, setEditEvent] = useState(null); // 수정할 일정 상태
  const [popupHover, setPopupHover] = useState(false);
  const hideTimerRef = useRef(null);
  const [highlightedEventId, setHighlightedEventId] = useState(null);

  // 카테고리 데이터 처리 함수 (checked 필드 기본값 설정)
  const processCategoriesData = (categoriesData) => {
    // localStorage에서 저장된 체크 상태 불러오기
    const savedCheckStates = JSON.parse(
      localStorage.getItem('scheduleCategoryCheckStates') || '{}',
    );

    return (categoriesData || []).map((cat) => ({
      ...cat,
      checked:
        savedCheckStates[cat.id] !== undefined
          ? savedCheckStates[cat.id]
          : true, // 저장된 상태가 있으면 사용, 없으면 기본값 true
    }));
  };

  // 카테고리 체크 상태를 localStorage에 저장하는 함수
  const saveCategoryCheckStates = (categories) => {
    const checkStates = {};
    categories.forEach((cat) => {
      checkStates[cat.id] = cat.checked;
    });
    localStorage.setItem(
      'scheduleCategoryCheckStates',
      JSON.stringify(checkStates),
    );
  };

  // 달력 날짜 배열 및 첫 요일
  const days = getMonthDays(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // 카테고리 목록 조회
  useEffect(() => {
    axiosInstance
      .get(`${API_BASE_URL}${SCHEDULE}/categories`)
      .then((res) => {
        // 저장된 체크 상태를 유지하면서 카테고리 목록 설정
        const categoriesWithChecked = processCategoriesData(res.data || []);
        setCategories(categoriesWithChecked);
        // 초기 로드 시에도 체크 상태 저장
        saveCategoryCheckStates(categoriesWithChecked);
      })
      .catch((err) => {
        setCategories([]);
      });
  }, []);

  // 일정 목록 조회 (연/월 변경 시)
  useEffect(() => {
    axiosInstance
      .get(`${API_BASE_URL}${SCHEDULE}/events`, {
        params: { year: currentYear, month: currentMonth + 1 },
      })
      .then((res) => {
        console.log('일정 데이터:', res.data);
        setEvents(res.data || []); // res.data.result 대신 res.data 사용
      })
      .catch((err) => {
        setEvents([]);
      });
  }, [currentYear, currentMonth]);

  // 기한 없는 할일(isAllDay)만 별도 조회
  useEffect(() => {
    axiosInstance
      .get(`${API_BASE_URL}${SCHEDULE}/events/all-day`)
      .then((res) => {
        setRightTodos(res.data || []);
      })
      .catch((err) => {
        setRightTodos([]);
      });
  }, []);

  // 카테고리 추가
  const handleCategoryAdd = (cat) => {
    axiosInstance
      .post(`${API_BASE_URL}${SCHEDULE}/categories`, cat)
      .then(() => axiosInstance.get(`${API_BASE_URL}${SCHEDULE}/categories`))
      .then((res) => {
        // 기존 체크 상태 유지, 새로 추가된 카테고리만 true
        setCategories((prev) => {
          const prevMap = new Map(prev.map((c) => [c.id, c.checked]));
          return (res.data || []).map((cat) => ({
            ...cat,
            checked: prevMap.has(cat.id) ? prevMap.get(cat.id) : true,
          }));
        });
        alert('카테고리가 정상적으로 추가되었습니다.');
      })
      .catch(() => {});
    setShowCategoryModal(null);
  };
  // 카테고리 삭제
  const handleCategoryDelete = (id) => {
    // 1. 해당 카테고리의 남은 일정 찾기
    const eventsInCategory = events.filter((e) => e.categoryId === id);
    if (eventsInCategory.length > 0) {
      // 2. 가장 과거 일정 찾기 (startDate 기준)
      const oldestEvent = eventsInCategory.reduce((min, e) =>
        new Date(e.startDate) < new Date(min.startDate) ? e : min,
      );
      // 3. 달력 이동 + 하이라이트
      const start = new Date(oldestEvent.startDate);
      setCurrentYear(start.getFullYear());
      setCurrentMonth(start.getMonth());
      setHighlightedEventId(oldestEvent.id);
      setTimeout(() => setHighlightedEventId(null), 2000);
      // 4. 안내 메시지
      alert(
        '해당 카테고리에 속한 일정이 남아있어 삭제할 수 없습니다. 먼저 일정을 모두 삭제해 주세요.',
      );
      return;
    }
    // 5. 실제 카테고리 삭제 로직 실행
    if (!window.confirm('정말로 이 카테고리를 삭제하시겠습니까?')) return;
    axiosInstance
      .delete(`${API_BASE_URL}${SCHEDULE}/categories/${id}`)
      .then(() => axiosInstance.get(`${API_BASE_URL}${SCHEDULE}/categories`))
      .then((res) => {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
        alert('카테고리가 정상적으로 삭제되었습니다.');
      })
      .catch(() => {});
    setShowCategoryModal(null);
  };
  // 카테고리 체크박스 토글 (프론트 상태만 변경)
  const handleCategoryCheck = (id) => {
    setCategories((prev) => {
      const updated = prev.map((cat) =>
        cat.id === id ? { ...cat, checked: !cat.checked } : cat,
      );
      // 체크 상태 변경 시 localStorage에 저장
      saveCategoryCheckStates(updated);
      return updated;
    });
  };

  // 일정 추가
  const handleEventAdd = (event) => {
    axiosInstance
      .post(`${API_BASE_URL}${SCHEDULE}/events`, event)
      .then(() =>
        axiosInstance.get(`${API_BASE_URL}${SCHEDULE}/events`, {
          params: { year: currentYear, month: currentMonth + 1 },
        }),
      )
      .then((res) => {
        setEvents(res.data || []);
        // 기한 없는 할일 추가 시 rightTodos도 즉시 갱신
        if (
          event.isAllDay ||
          (!event.startDate && !event.endDate && event.type === 'TODO')
        ) {
          axiosInstance
            .get(`${API_BASE_URL}${SCHEDULE}/events/all-day`)
            .then((res) => setRightTodos(res.data || []));
        }
        alert('일정이 정상적으로 추가되었습니다.');
      })
      .catch((err) => {
        console.error('일정 추가 에러:', err);
        console.error('에러 응답:', err.response?.data);
      });
    setShowEventModal(false);
  };

  // 일정 필터링(카테고리 체크된 것만)
  const visibleCategoryIds = categories
    .filter((c) => c.checked)
    .map((c) => c.id);
  const visibleEvents = events.filter((e) =>
    visibleCategoryIds.includes(e.categoryId),
  );

  // 1. 현재 달의 시작/끝 구하기
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);

  // 2. 월별 할일만 필터링
  const filteredEvents = visibleEvents.filter((e) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate || e.startDate);
    // 일정이 이번 달에 걸쳐 있으면 표시
    return end >= monthStart && start <= monthEnd;
  });

  // 3. 오늘 기준 분류
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const rightNormal = filteredEvents.filter(
    (e) => e.type !== 'TODO' || e.startDate,
  );

  const pastEvents = rightNormal.filter(
    (e) => (e.endDate || e.startDate) < todayStr,
  );
  const todayEvents = rightNormal.filter(
    (e) => e.startDate <= todayStr && (e.endDate || e.startDate) >= todayStr,
  );
  const tomorrowEvents = rightNormal.filter(
    (e) =>
      e.startDate <= tomorrowStr &&
      (e.endDate || e.startDate) >= tomorrowStr &&
      e.startDate !== todayStr,
  );
  const futureEvents = rightNormal.filter((e) => e.startDate > tomorrowStr);

  // 연속 일정 바 렌더링: 한 달 내에서 start~end가 겹치는 일정은 한 번만 표시
  function getEventBarsForMonth(year, month, events) {
    const bars = [];
    console.log('getEventBarsForMonth 호출:', {
      year,
      month,
      eventsCount: events.length,
    });
    events.forEach((ev) => {
      console.log('일정 처리:', {
        id: ev.id,
        title: ev.title,
        startDate: ev.startDate,
        endDate: ev.endDate,
      });
      // 기한 없는 할일은 달력에 표시 X
      if (ev.type === 'TODO' && (!ev.startDate || !ev.endDate)) return;
      if (!ev.startDate) return;

      // 당일 일정(endDate가 null이거나 startDate와 같은 경우)은 연속 일정 바로 처리하지 않음
      const start = new Date(ev.startDate);
      const end = new Date(ev.endDate || ev.startDate);
      const isSingleDay =
        !ev.endDate ||
        toDateOnly(start).getTime() === toDateOnly(end).getTime();

      if (isSingleDay) {
        console.log('당일 일정이므로 연속 일정 바로 처리하지 않음:', ev.title);
        return;
      }

      console.log('날짜 처리:', {
        start: start.toISOString(),
        end: end.toISOString(),
      });
      if (
        (start.getFullYear() < year ||
          (start.getFullYear() === year && start.getMonth() <= month)) &&
        (end.getFullYear() > year ||
          (end.getFullYear() === year && end.getMonth() >= month))
      ) {
        const barStart =
          start.getFullYear() === year && start.getMonth() === month
            ? start.getDate()
            : 1;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const barEnd =
          end.getFullYear() === year && end.getMonth() === month
            ? end.getDate()
            : lastDay;
        bars.push({ ...ev, barStart, barEnd });
        console.log('바 추가됨:', { barStart, barEnd });
      }
    });
    console.log('최종 바 개수:', bars.length);
    return bars;
  }
  const eventBars = getEventBarsForMonth(
    currentYear,
    currentMonth,
    visibleEvents,
  );
  const eventBarIds = new Set(eventBars.map((bar) => bar.id));

  // 달력 네비게이션 함수 복구
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setHighlightTodayCell(false); // 연타 방지
    setTimeout(() => setHighlightTodayCell(true), 10); // 렌더 후 트리거
    setTimeout(() => setHighlightTodayCell(false), 1010); // 1초 후 해제
  };

  // 일정 삭제 핸들러
  const handleEventDelete = (event) => {
    if (!window.confirm('정말로 이 일정을 삭제하시겠습니까?')) return;
    axiosInstance
      .delete(`${API_BASE_URL}${SCHEDULE}/events/${event.id}`)
      .then(() => {
        // 일반 일정 목록 갱신
        return axiosInstance.get(`${API_BASE_URL}${SCHEDULE}/events`, {
          params: { year: currentYear, month: currentMonth + 1 },
        });
      })
      .then((res) => {
        setEvents(res.data || []);
        // 기한 없는 할일도 갱신 (삭제된 일정이 기한 없는 할일일 수 있음)
        return axiosInstance.get(`${API_BASE_URL}${SCHEDULE}/events/all-day`);
      })
      .then((res) => {
        setRightTodos(res.data || []);
        alert('일정이 정상적으로 삭제되었습니다.');
      })
      .catch((err) => {
        alert('일정 삭제 중 오류가 발생했습니다.');
        console.error('일정 삭제 에러:', err);
      });
  };
  // 일정 수정 핸들러(모달 오픈)
  const handleEventEdit = (event) => {
    setEditEvent(event);
  };
  // 일정 수정 완료 핸들러
  const handleEventUpdate = (updated) => {
    axiosInstance
      .put(`${API_BASE_URL}${SCHEDULE}/events/${editEvent.id}`, updated)
      .then(() => {
        // 일반 일정 목록 갱신
        return axiosInstance.get(`${API_BASE_URL}${SCHEDULE}/events`, {
          params: { year: currentYear, month: currentMonth + 1 },
        });
      })
      .then((res) => {
        setEvents(res.data || []);
        // 기한 없는 할일도 갱신 (수정된 일정이 기한 없는 할일일 수 있음)
        return axiosInstance.get(`${API_BASE_URL}${SCHEDULE}/events/all-day`);
      })
      .then((res) => {
        setRightTodos(res.data || []);
        alert('일정이 정상적으로 수정되었습니다.');
        setEditEvent(null);
      })
      .catch((err) => {
        alert('일정 수정 중 오류가 발생했습니다.');
        console.error('일정 수정 에러:', err);
      });
  };

  // 트리거(일정 바/아이템)에서
  const handleEventMouseEnter = (ev, pos, type, dateStr) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setHoveredEvent({ ...ev, type, dateStr });
    setPopupPos(pos);
  };
  const handleEventMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => setHoveredEvent(null), 250);
  };

  // 상세 모달에서
  const handlePopupMouseEnter = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setPopupHover(true);
  };
  const handlePopupMouseLeave = () => {
    setPopupHover(false);
    hideTimerRef.current = setTimeout(() => setHoveredEvent(null), 250);
  };

  // 검색어 입력 시 실시간 필터링
  // 서버 기반 전체 기간 검색 (debounce 적용)
  const fetchSearchResults = debounce(async (keyword) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setSearchActiveIdx(-1);
      return;
    }
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${SCHEDULE}/events/search`,
        {
          params: { keyword },
        },
      );
      setSearchResults(res.data || []);
      setShowSearchDropdown(true);
      setSearchActiveIdx(res.data && res.data.length > 0 ? 0 : -1);
    } catch (e) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setSearchActiveIdx(-1);
    }
  }, 300);

  useEffect(() => {
    fetchSearchResults(searchTerm);
    // cleanup: debounce 취소
    return () => fetchSearchResults.cancel();
  }, [searchTerm]);

  // 키보드 네비게이션
  const handleSearchKeyDown = (e) => {
    if (!showSearchDropdown || searchResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchActiveIdx((idx) => (idx + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchActiveIdx(
        (idx) => (idx - 1 + searchResults.length) % searchResults.length,
      );
    } else if (e.key === 'Enter') {
      if (searchActiveIdx >= 0 && searchActiveIdx < searchResults.length) {
        handleSearchSelect(searchResults[searchActiveIdx]);
      }
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false);
    }
  };

  // 하이라이트 함수
  function highlightText(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(
      `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi',
    );
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          style={{ background: '#ffe066', color: '#222', padding: 0 }}
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  }

  // 일정 선택 시 해당 월/일로 이동
  const handleSearchSelect = (ev) => {
    setShowSearchDropdown(false);
    setSearchTerm('');
    // 기한 없는 할일은 이동 없이 상세 모달만 띄움
    if (!ev.startDate || !ev.endDate) {
      // 상세 모달 띄우기(오른쪽 사이드바 기준)
      setRightHoveredEvent(ev);
      setRightPopupPos({ left: 0, top: 100 }); // 적당한 위치
      return;
    }
    // 해당 월/연도로 이동
    const start = new Date(ev.startDate);
    setCurrentYear(start.getFullYear());
    setCurrentMonth(start.getMonth());
    setHighlightedEventId(ev.id);
    setTimeout(() => setHighlightedEventId(null), 2000);
    setTimeout(() => {
      setHoveredEvent({ ...ev, type: 'single', dateStr: ev.startDate });
      setPopupPos({ left: 0, top: 100 });
    }, 300);
  };

  // 달력 셀 렌더링 부분에서, 해당 셀 날짜가 하이라이트할 일정 구간에 포함되면 하이라이트 클래스 추가
  const isCellHighlighted = (date) => {
    if (!highlightedEventId) return false;
    // visibleEvents에서 해당 일정 찾기
    const event = visibleEvents.find((e) => e.id === highlightedEventId);
    if (!event || !event.startDate) return false;
    const cellDate = toDateOnly(date).getTime();
    const start = toDateOnly(new Date(event.startDate)).getTime();
    const end = toDateOnly(
      new Date(event.endDate || event.startDate),
    ).getTime();
    return cellDate >= start && cellDate <= end;
  };

  return (
    <div className={styles.scheduleWrapper}>
      {/* 좌측: 카테고리/캘린더 목록 */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>캘린더</div>
        <div className={styles.categorySection}>
          <div className={styles.categoryGroupTitleRow}>
            <span className={styles.categoryGroupTitle}>내 캘린더</span>
            <button
              className={styles.categoryAddBtn}
              onClick={() => setShowCategoryModal('PERSONAL')}
            >
              +
            </button>
          </div>
          {categories
            .filter((c) => c.type === 'PERSONAL')
            .map((cat) => (
              <div className={styles.categoryItem} key={cat.id}>
                <input
                  type='checkbox'
                  checked={cat.checked}
                  onChange={() => handleCategoryCheck(cat.id)}
                />
                <span
                  className={styles.categoryColor}
                  style={{ background: cat.color }}
                ></span>
                <span className={styles.categoryName}>{cat.name}</span>
                <button
                  className={styles.categoryDeleteBtn}
                  onClick={() => handleCategoryDelete(cat.id)}
                >
                  ×
                </button>
              </div>
            ))}
        </div>
        <div className={styles.categorySection}>
          <div className={styles.categoryGroupTitleRow}>
            <span className={styles.categoryGroupTitle}>그룹 캘린더</span>
            <button
              className={styles.categoryAddBtn}
              onClick={() => setShowCategoryModal('GROUP')}
            >
              +
            </button>
          </div>
          {categories
            .filter((c) => c.type === 'GROUP')
            .map((cat) => (
              <div className={styles.categoryItem} key={cat.id}>
                <input
                  type='checkbox'
                  checked={cat.checked}
                  onChange={() => handleCategoryCheck(cat.id)}
                />
                <span
                  className={styles.categoryColor}
                  style={{ background: cat.color }}
                ></span>
                <span className={styles.categoryName}>{cat.name}</span>
                <button
                  className={styles.categoryDeleteBtn}
                  onClick={() => handleCategoryDelete(cat.id)}
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      </aside>

      {/* 중앙: 달력/상단 네비 */}
      <main className={styles.mainContent}>
        <div className={styles.calendarNav}>
          <button onClick={handlePrevMonth} className={styles.navBtn}>
            {'<'}
          </button>
          <span className={styles.currentMonth}>
            {currentYear}년 {currentMonth + 1}월
          </span>
          <button onClick={handleNextMonth} className={styles.navBtn}>
            {'>'}
          </button>
          <button onClick={handleToday} className={styles.todayBtn}>
            오늘
          </button>
          <button
            onClick={() => setShowEventModal(true)}
            className={`${styles.addEventBtn} ${categories.length === 0 ? styles.disabledBtn : ''}`}
            disabled={categories.length === 0}
            title={
              categories.length === 0
                ? '먼저 캘린더 카테고리를 생성해주세요.'
                : '일정을 추가합니다.'
            }
          >
            일정추가
          </button>
        </div>
        {categories.length === 0 && (
          <div className={styles.noCategoryMessage}>
            <span>
              ⚠️ 일정을 추가하려면 먼저 캘린더 카테고리를 생성해주세요.
            </span>
            <button
              onClick={() => setShowCategoryModal('PERSONAL')}
              className={styles.createCategoryBtn}
            >
              카테고리 생성하기
            </button>
          </div>
        )}
        <table className={styles.calendarTable}>
          <thead>
            <tr>
              <th>일</th>
              <th>월</th>
              <th>화</th>
              <th>수</th>
              <th>목</th>
              <th>금</th>
              <th>토</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const rows = [];
              let cells = [];
              // 첫 주 빈칸
              for (let i = 0; i < firstDayOfWeek; i++) {
                cells.push(<td key={`empty-${i}`}></td>);
              }
              days.forEach((date, idx) => {
                const dateStr = date.toISOString().slice(0, 10);
                // 1일 셀에만 별도 클래스 추가
                const isFirstDay = date.getDate() === 1;
                // 1. 연속 일정 바(해당 날짜가 bar의 실제 start~end에 포함되는 모든 바)
                const barsForCell = eventBars.filter((bar) => {
                  const start = toDateOnly(new Date(bar.startDate));
                  const end = toDateOnly(new Date(bar.endDate));
                  const cellDate = toDateOnly(date);
                  return cellDate >= start && cellDate <= end;
                });
                // 2. 당일 단일 일정(기한 없는 할일은 무조건 제외)
                const dayEvents = visibleEvents.filter((e) => {
                  if (e.type === 'TODO' && !e.startDate && !e.endDate)
                    return false;
                  if (!e.startDate) return false;
                  // 연속 일정 바로 처리되는 일정은 무조건 제외
                  if (eventBarIds.has(e.id)) return false;
                  // 날짜 비교도 toDateOnly로 보정
                  const start = toDateOnly(new Date(e.startDate));
                  const end = toDateOnly(new Date(e.endDate || e.startDate));
                  const cellDate = toDateOnly(date);
                  const isInRange = cellDate >= start && cellDate <= end;
                  return isInRange;
                });
                cells.push(
                  <td
                    key={dateStr}
                    className={
                      styles.calendarCell +
                      (isFirstDay ? ' ' + styles.firstDayCell : '') +
                      (toDateOnly(date).getTime() ===
                      toDateOnly(today).getTime()
                        ? ' ' +
                          styles.todayCell +
                          (highlightTodayCell
                            ? ' ' + styles.todayCellHighlight
                            : '')
                        : '') +
                      (isCellHighlighted(date)
                        ? ' ' + styles.highlightedCell
                        : '')
                    }
                  >
                    <div className={styles.dateNum}>{date.getDate()}</div>

                    {/* 연속 일정 바: 해당 날짜가 barStart~barEnd에 포함되는 모든 바 (먼저 렌더링) */}
                    {barsForCell.map((bar) => {
                      const cat = categories.find(
                        (c) => c.id === bar.categoryId,
                      );

                      // 연속 일정 바의 위치에 따른 라운딩 클래스 결정
                      const currentDate = date.getDate(); // 현재 셀의 날짜 (1-31)
                      const barStart = bar.barStart; // 해당 월에서의 시작일
                      const barEnd = bar.barEnd; // 해당 월에서의 종료일

                      let barClassName = styles.continuousEventBar;

                      // 당일 일정인 경우 (barStart와 barEnd가 같음)
                      if (barStart === barEnd) {
                        barClassName = styles.continuousEventBarSingle;
                      } else {
                        // 구간 일정의 첫 번째 날
                        if (currentDate === barStart) {
                          barClassName = styles.continuousEventBarStart;
                        }
                        // 구간 일정의 마지막 날
                        else if (currentDate === barEnd) {
                          barClassName = styles.continuousEventBarEnd;
                        }
                        // 구간 일정의 중간 날
                        else {
                          barClassName = styles.continuousEventBarMiddle;
                        }
                      }

                      return (
                        <div
                          key={bar.id + '-' + dateStr}
                          className={barClassName}
                          style={{
                            background: cat?.color,
                            color: cat?.color
                              ? getContrastColor(cat.color)
                              : '#222',
                            position: 'relative',
                          }}
                          onMouseEnter={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            handleEventMouseEnter(
                              bar,
                              {
                                left: rect.right, // 오른쪽 끝
                                top: rect.bottom + 4,
                              },
                              'bar',
                              dateStr,
                            );
                          }}
                          onMouseLeave={handleEventMouseLeave}
                        >
                          {bar.title}
                          {hoveredEvent &&
                            hoveredEvent.id === bar.id &&
                            hoveredEvent.type === 'bar' &&
                            hoveredEvent.dateStr === dateStr && (
                              <EventDetailPopup
                                event={bar}
                                category={cat}
                                popupPos={popupPos}
                                onEdit={handleEventEdit}
                                onDelete={handleEventDelete}
                                onMouseEnter={handlePopupMouseEnter}
                                onMouseLeave={handlePopupMouseLeave}
                              />
                            )}
                        </div>
                      );
                    })}

                    {/* 단일 일정들을 컨테이너로 감싸서 연속 일정 바 다음에 배치 */}
                    <div className={styles.singleEventsContainer}>
                      {dayEvents.map((ev) => {
                        const cat = categories.find(
                          (c) => c.id === ev.categoryId,
                        );
                        return (
                          <div
                            key={ev.id}
                            className={styles.eventBar}
                            style={{
                              background: cat?.color,
                              color: cat?.color
                                ? getContrastColor(cat.color)
                                : '#222',
                              position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              handleEventMouseEnter(
                                ev,
                                {
                                  left: rect.right, // 오른쪽 끝
                                  top: rect.bottom + 4,
                                },
                                'single',
                                dateStr,
                              );
                            }}
                            onMouseLeave={handleEventMouseLeave}
                          >
                            {ev.title}
                            {hoveredEvent &&
                              hoveredEvent.id === ev.id &&
                              hoveredEvent.type === 'single' &&
                              hoveredEvent.dateStr === dateStr && (
                                <EventDetailPopup
                                  event={ev}
                                  category={cat}
                                  popupPos={popupPos}
                                  onEdit={handleEventEdit}
                                  onDelete={handleEventDelete}
                                  onMouseEnter={handlePopupMouseEnter}
                                  onMouseLeave={handlePopupMouseLeave}
                                />
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </td>,
                );
                // 한 주가 끝나면 행 추가
                if ((idx + firstDayOfWeek + 1) % 7 === 0) {
                  rows.push(<tr key={`row-${idx}`}>{cells}</tr>);
                  cells = [];
                }
              });
              // 마지막 주 남은 칸
              if (cells.length) {
                while (cells.length < 7)
                  cells.push(<td key={`empty-end-${cells.length}`}></td>);
                rows.push(<tr key='row-last'>{cells}</tr>);
              }
              return rows;
            })()}
          </tbody>
        </table>
      </main>

      {/* 우측: 일정 검색/카테고리별 일정 목록 */}
      <aside className={styles.rightbar}>
        <div className={styles.searchBox} style={{ position: 'relative' }}>
          <input
            ref={searchInputRef}
            className={styles.searchInput}
            placeholder='제목, 내용'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            onKeyDown={handleSearchKeyDown}
            autoComplete='off'
          />
          <button className={styles.searchBtn}>
            <span className={styles.searchIcon}>🔍</span>
          </button>
          {showSearchDropdown && searchResults.length > 0 && (
            <ul
              style={{
                position: 'absolute',
                top: 38,
                left: 0,
                right: 0,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                zIndex: 1000,
                maxHeight: 220,
                overflowY: 'auto',
                margin: 0,
                padding: 0,
                listStyle: 'none',
              }}
            >
              {searchResults.map((ev, idx) => (
                <li
                  key={ev.id}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: 15,
                    background: idx === searchActiveIdx ? '#eafaf1' : '#fff',
                    fontWeight: idx === searchActiveIdx ? 700 : 400,
                  }}
                  onMouseDown={() => handleSearchSelect(ev)}
                  onMouseEnter={() => setSearchActiveIdx(idx)}
                >
                  <span style={{ fontWeight: 600 }}>
                    {highlightText(ev.title, searchTerm)}
                  </span>
                  <span style={{ color: '#888', marginLeft: 8, fontSize: 13 }}>
                    {ev.startDate ? `(${ev.startDate})` : '(기한 없음)'}
                  </span>
                  <div
                    style={{
                      color: '#666',
                      fontSize: 13,
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {highlightText(ev.content, searchTerm)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.eventListSection}>
          <div className={styles.eventListGroup}>
            <div
              className={
                styles.eventListGroupTitle + ' ' + styles.eventListPast
              }
            >
              지난 할일 <span>({pastEvents.length})</span>
            </div>
            {pastEvents.map((ev) => (
              <div
                className={styles.eventListItem}
                key={ev.id}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setRightHoveredEvent(ev);
                  setRightPopupPos({
                    left: rect.left - 230,
                    top: rect.top + 5,
                  });
                }}
                onMouseLeave={() => {
                  setRightHoveredEvent(null);
                  setRightPopupPos(null);
                }}
              >
                <span
                  className={styles.eventListColor}
                  style={{
                    background: categories.find((c) => c.id === ev.categoryId)
                      ?.color,
                  }}
                ></span>
                {ev.title}
                {rightHoveredEvent &&
                  rightHoveredEvent.id === ev.id &&
                  rightPopupPos && (
                    <EventDetailPopup
                      event={ev}
                      category={categories.find((c) => c.id === ev.categoryId)}
                      popupPos={rightPopupPos}
                      fixed
                      onEdit={handleEventEdit}
                      onDelete={handleEventDelete}
                      onMouseEnter={handlePopupMouseEnter}
                      onMouseLeave={handlePopupMouseLeave}
                    />
                  )}
              </div>
            ))}
          </div>
          <div className={styles.eventListGroup}>
            <div
              className={
                styles.eventListGroupTitle + ' ' + styles.eventListToday
              }
            >
              오늘 <span>({todayEvents.length})</span>
            </div>
            {todayEvents.map((ev) => (
              <div
                className={styles.eventListItem}
                key={ev.id}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setRightHoveredEvent(ev);
                  setRightPopupPos({
                    left: rect.left - 230,
                    top: rect.top + 5,
                  });
                }}
                onMouseLeave={() => {
                  setRightHoveredEvent(null);
                  setRightPopupPos(null);
                }}
              >
                <span
                  className={styles.eventListColor}
                  style={{
                    background: categories.find((c) => c.id === ev.categoryId)
                      ?.color,
                  }}
                ></span>
                {ev.title}
                {rightHoveredEvent &&
                  rightHoveredEvent.id === ev.id &&
                  rightPopupPos && (
                    <EventDetailPopup
                      event={ev}
                      category={categories.find((c) => c.id === ev.categoryId)}
                      popupPos={rightPopupPos}
                      fixed
                      onEdit={handleEventEdit}
                      onDelete={handleEventDelete}
                      onMouseEnter={handlePopupMouseEnter}
                      onMouseLeave={handlePopupMouseLeave}
                    />
                  )}
              </div>
            ))}
          </div>
          <div className={styles.eventListGroup}>
            <div className={styles.eventListGroupTitle}>
              내일 <span>({tomorrowEvents.length})</span>
            </div>
            {tomorrowEvents.map((ev) => (
              <div
                className={styles.eventListItem}
                key={ev.id}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setRightHoveredEvent(ev);
                  setRightPopupPos({
                    left: rect.left - 230,
                    top: rect.top + 5,
                  });
                }}
                onMouseLeave={() => {
                  setRightHoveredEvent(null);
                  setRightPopupPos(null);
                }}
              >
                <span
                  className={styles.eventListColor}
                  style={{
                    background: categories.find((c) => c.id === ev.categoryId)
                      ?.color,
                  }}
                ></span>
                {ev.title}
                {rightHoveredEvent &&
                  rightHoveredEvent.id === ev.id &&
                  rightPopupPos && (
                    <EventDetailPopup
                      event={ev}
                      category={categories.find((c) => c.id === ev.categoryId)}
                      popupPos={rightPopupPos}
                      fixed
                      onEdit={handleEventEdit}
                      onDelete={handleEventDelete}
                      onMouseEnter={handlePopupMouseEnter}
                      onMouseLeave={handlePopupMouseLeave}
                    />
                  )}
              </div>
            ))}
          </div>
          <div className={styles.eventListGroup}>
            <div className={styles.eventListGroupTitle}>
              다음 할일 <span>({futureEvents.length})</span>
            </div>
            {futureEvents.map((ev) => (
              <div
                className={styles.eventListItem}
                key={ev.id}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setRightHoveredEvent(ev);
                  setRightPopupPos({
                    left: rect.left - 230,
                    top: rect.top + 5,
                  });
                }}
                onMouseLeave={() => {
                  setRightHoveredEvent(null);
                  setRightPopupPos(null);
                }}
              >
                <span
                  className={styles.eventListColor}
                  style={{
                    background: categories.find((c) => c.id === ev.categoryId)
                      ?.color,
                  }}
                ></span>
                {ev.title}
                {rightHoveredEvent &&
                  rightHoveredEvent.id === ev.id &&
                  rightPopupPos && (
                    <EventDetailPopup
                      event={ev}
                      category={categories.find((c) => c.id === ev.categoryId)}
                      popupPos={rightPopupPos}
                      fixed
                      onEdit={handleEventEdit}
                      onDelete={handleEventDelete}
                      onMouseEnter={handlePopupMouseEnter}
                      onMouseLeave={handlePopupMouseLeave}
                    />
                  )}
              </div>
            ))}
          </div>
          <div className={styles.eventListGroup}>
            <div
              className={
                styles.eventListGroupTitle + ' ' + styles.eventListNoDue
              }
            >
              기한 없는 할일 <span>({rightTodos.length})</span>
            </div>
            {rightTodos.map((ev) => (
              <div
                className={styles.eventListItem}
                key={ev.id}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setRightHoveredEvent(ev);
                  setRightPopupPos({
                    left: rect.left - 230,
                    top: rect.top + 5,
                  });
                }}
                onMouseLeave={() => {
                  setRightHoveredEvent(null);
                  setRightPopupPos(null);
                }}
              >
                <span
                  className={styles.eventListColor}
                  style={{
                    background: ev.categoryColor || '#ccc',
                  }}
                ></span>
                {ev.title}
                {rightHoveredEvent &&
                  rightHoveredEvent.id === ev.id &&
                  rightPopupPos && (
                    <EventDetailPopup
                      event={ev}
                      category={categories.find((c) => c.id === ev.categoryId)}
                      popupPos={rightPopupPos}
                      fixed
                      onEdit={handleEventEdit}
                      onDelete={handleEventDelete}
                      onMouseEnter={handlePopupMouseEnter}
                      onMouseLeave={handlePopupMouseLeave}
                    />
                  )}
              </div>
            ))}
            {rightDetail && (
              <div
                className={styles.rightDetailPopupWrap}
                onClick={() => setRightDetail(null)}
              >
                <EventDetailPopup
                  event={rightDetail}
                  category={categories.find(
                    (c) => c.id === rightDetail.categoryId,
                  )}
                  onEdit={handleEventEdit}
                  onDelete={handleEventDelete}
                  onMouseEnter={handlePopupMouseEnter}
                  onMouseLeave={handlePopupMouseLeave}
                />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 카테고리 추가 모달 */}
      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(null)}
          onAdd={handleCategoryAdd}
          defaultType={showCategoryModal}
        />
      )}
      {/* 일정 추가 모달 */}
      {showEventModal && (
        <EventModal
          onClose={() => setShowEventModal(false)}
          onAdd={handleEventAdd}
          categories={categories}
        />
      )}
      {/* 일정 수정 모달 */}
      {editEvent && (
        <EventModal
          onClose={() => setEditEvent(null)}
          onAdd={handleEventUpdate}
          categories={categories}
          defaultEvent={editEvent}
        />
      )}
    </div>
  );
}

// 일정 상세 팝업(hover, Portal)
function EventDetailPopup({
  event,
  category,
  popupPos,
  fixed,
  onEdit,
  onDelete,
  onMouseEnter,
  onMouseLeave,
}) {
  const popupRef = React.useRef(null);
  const [modalHeight, setModalHeight] = React.useState(0);

  React.useEffect(() => {
    if (popupRef.current) {
      setModalHeight(popupRef.current.offsetHeight);
    }
  }, [event, popupPos]);

  if (!popupPos) return null;
  // 아래로 뜨던 것을 위로 뜨게(top - modalHeight)
  const adjustedTop = popupPos.top - modalHeight;
  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className={styles.eventDetailPopup}
      style={{
        position: 'fixed',
        left: popupPos.left,
        top: adjustedTop,
        zIndex: 99999,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={styles.eventDetailTitle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>일정 상세</span>
        <span style={{ display: 'flex', gap: 8 }}>
          <button
            style={{
              background: '#48b96c',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 18px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => onEdit && onEdit(event)}
          >
            수정
          </button>
          <button
            style={{
              background: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 18px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => onDelete && onDelete(event)}
          >
            삭제
          </button>
        </span>
      </div>
      <div className={styles.eventDetailRow}>
        <span className={styles.eventDetailLabel}>제목</span>
        <span className={styles.eventDetailValue}>{event.title}</span>
      </div>
      {event.content && (
        <div className={styles.eventDetailRow}>
          <span className={styles.eventDetailLabel}>내용</span>
          <span className={styles.eventDetailValue}>{event.content}</span>
        </div>
      )}
      <div className={styles.eventDetailRow}>
        <span className={styles.eventDetailLabel}>일자</span>
        <span className={styles.eventDetailValue}>
          {event.startDate
            ? event.endDate && event.endDate !== event.startDate
              ? `${event.startDate} ~ ${event.endDate}`
              : event.startDate
            : '기한 없음'}
        </span>
      </div>
      <div className={styles.eventDetailRow}>
        <span className={styles.eventDetailLabel}>일정구분</span>
        <span className={styles.eventDetailValue}>
          {SCHEDULE_TYPE_LABELS[event.type] || event.type}
        </span>
      </div>
      {category && (
        <div className={styles.eventDetailRow}>
          <span className={styles.eventDetailLabel}>카테고리</span>
          <span className={styles.eventDetailValue}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: category.color,
                marginRight: 6,
              }}
            ></span>
            {category.name}
          </span>
        </div>
      )}
    </div>,
    document.body,
  );
}

// 카테고리 추가 모달
function CategoryModal({ onClose, onAdd, defaultType = 'PERSONAL' }) {
  const [color, setColor] = useState('#e6f0fb');
  const [name, setName] = useState('');
  const [type, setType] = useState(defaultType); // 기본값 동적 적용
  const [showPicker, setShowPicker] = useState(false);
  const colorCircleRef = useRef(null);
  const pickerRef = useRef(null);

  // 팝업 바깥 클릭 시 닫기
  useEffect(() => {
    if (!showPicker) return;
    function handleClick(e) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        colorCircleRef.current &&
        !colorCircleRef.current.contains(e.target)
      ) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPicker]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalTitle}>캘린더 추가</div>
        <div className={styles.modalField}>
          <label>색상</label>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {/* 동그라미 미리보기 (클릭 시 컬러 피커) */}
            <div
              ref={colorCircleRef}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid #ccc',
                background: color,
                cursor: 'pointer',
              }}
              title={color}
              onClick={() => setShowPicker((v) => !v)}
            />
            {/* 색상 코드 */}
            <span style={{ fontSize: 14 }}>{color}</span>
            {/* 커스텀 컬러 피커 (동그라미 아래에 위치) */}
            {showPicker && (
              <div
                ref={pickerRef}
                style={{
                  position: 'absolute',
                  top: 40,
                  left: 0,
                  zIndex: 1000,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  background: '#fff',
                  borderRadius: 8,
                  padding: '32px 0 0 0', // 상단만 여백, 좌우/하단 여백 없음
                  minWidth: 180,
                  minHeight: 220,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 닫기 버튼: 상단 여백 공간에 위치 */}
                <button
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 12,
                    background: 'transparent',
                    border: 'none',
                    fontSize: 18,
                    cursor: 'pointer',
                    zIndex: 2,
                  }}
                  onClick={() => setShowPicker(false)}
                  aria-label='닫기'
                >
                  ×
                </button>
                {/* 컬러 피커 본체 */}
                <HexColorPicker color={color} onChange={setColor} />
              </div>
            )}
          </div>
        </div>
        <div className={styles.modalField}>
          <label>제목</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='캘린더명'
          />
        </div>
        <div className={styles.modalField}>
          <label>구분</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value='PERSONAL'>내 캘린더</option>
            <option value='GROUP'>그룹 캘린더</option>
          </select>
        </div>
        <div className={styles.modalBtnRow}>
          <button
            className={styles.modalOkBtn}
            onClick={() => {
              if (name) {
                const base = { name, color, type };
                const userDeptId = sessionStorage.getItem('USER_DEPARTMENT_ID');
                if (
                  type === 'GROUP' &&
                  (!userDeptId ||
                    userDeptId === 'null' ||
                    userDeptId === 'undefined')
                ) {
                  alert('부서 정보가 없습니다. 다시 로그인 해주세요.');
                  return;
                }
                const data =
                  type === 'PERSONAL'
                    ? {
                        ...base,
                        ownerEmployeeNo:
                          sessionStorage.getItem('USER_EMPLOYEE_NO'),
                      }
                    : {
                        ...base,
                        departmentId: Number(userDeptId),
                      };
                onAdd(data);
                setName('');
                setColor('#e6f0fb');
              }
            }}
          >
            확인
          </button>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// 일정 추가 모달
function EventModal({ onClose, onAdd, categories, defaultEvent }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [type, setType] = useState(SCHEDULE_TYPES[0].value);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [noDue, setNoDue] = useState(false);
  const [error, setError] = useState('');
  const [dateType, setDateType] = useState('single'); // 'single' | 'range'

  // defaultEvent가 있으면 기존 값 세팅
  useEffect(() => {
    if (defaultEvent) {
      setTitle(defaultEvent.title);
      setContent(defaultEvent.content || '');
      setStart(defaultEvent.startDate || '');
      setEnd(defaultEvent.endDate || '');
      setType(defaultEvent.type);
      setCategoryId(defaultEvent.categoryId);
      setNoDue(defaultEvent.isAllDay);

      // endDate가 null이면 당일 일정, null이 아니면 구간 일정
      setDateType(defaultEvent.endDate ? 'range' : 'single');
    }
  }, [defaultEvent]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalTitle}>일정 추가</div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <div className={styles.modalField}>
          <label>제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='일정 제목'
          />
        </div>
        <div className={styles.modalField}>
          <label>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='일정 내용'
            rows={3}
            style={{ resize: 'none' }}
          />
        </div>
        <div className={styles.modalField}>
          <label>일자</label>
          <div className={styles.dateFieldContainer}>
            <div className={styles.dateTypeSelector}>
              <label>
                <input
                  type='radio'
                  value='single'
                  checked={dateType === 'single'}
                  onChange={(e) => {
                    setDateType(e.target.value);
                    setNoDue(false);
                    if (e.target.value === 'single') {
                      setEnd(''); // 당일 일정이면 종료일 초기화
                    }
                  }}
                />
                하루 일정
              </label>
              <label>
                <input
                  type='radio'
                  value='range'
                  checked={dateType === 'range'}
                  onChange={(e) => {
                    setDateType(e.target.value);
                    setNoDue(false);
                  }}
                />
                여러 날 일정
              </label>
            </div>
            <div className={styles.dateInputs}>
              <input
                type='date'
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setNoDue(false);
                }}
                disabled={noDue}
              />
              {dateType === 'range' && (
                <>
                  <span>~</span>
                  <input
                    type='date'
                    value={end}
                    onChange={(e) => {
                      setEnd(e.target.value);
                      setNoDue(false);
                    }}
                    disabled={noDue}
                  />
                </>
              )}
              <label className={styles.noDueCheckbox}>
                <input
                  type='checkbox'
                  checked={noDue}
                  onChange={(e) => {
                    setNoDue(e.target.checked);
                    if (e.target.checked) {
                      setStart('');
                      setEnd('');
                    }
                  }}
                />
                기한 없음
              </label>
            </div>
          </div>
        </div>
        <div className={styles.modalField}>
          <label>일정구분</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {SCHEDULE_TYPES.map((opt) => (
              <option value={opt.value} key={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.modalField}>
          <label>캘린더</label>
          {categories.length === 0 ? (
            <div className={styles.noCategoryInModal}>
              <select disabled>
                <option value=''>등록된 캘린더가 없습니다</option>
              </select>
              <div className={styles.noCategoryWarning}>
                ⚠️ 일정을 추가하려면 먼저 캘린더 카테고리를 생성해주세요.
              </div>
            </div>
          ) : (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            >
              {categories.map((cat) => (
                <option value={cat.id} key={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className={styles.modalBtnRow}>
          <button
            className={styles.modalOkBtn}
            onClick={() => {
              if (!title) {
                setError('제목을 입력하세요.');
                return;
              }
              if (!content) {
                setError('내용을 입력하세요.');
                return;
              }
              if (!noDue && !start) {
                setError('시작일을 입력하세요.');
                return;
              }
              // 구간 일정인 경우에만 종료일 검사
              if (!noDue && dateType === 'range' && !end) {
                setError('종료일을 입력하세요.');
                return;
              }
              // 구간 일정인 경우에만 시작일-종료일 유효성 검사
              if (
                !noDue &&
                dateType === 'range' &&
                start &&
                end &&
                start > end
              ) {
                setError('시작일은 종료일보다 늦을 수 없습니다.');
                return;
              }
              if (
                !categoryId ||
                !categories.find((cat) => cat.id === categoryId)
              ) {
                setError('캘린더(카테고리)를 선택하세요.');
                return;
              }
              setError('');
              const selectedCategory = categories.find(
                (cat) => cat.id === categoryId,
              );
              let eventData = {
                title: title, // 일정 제목
                content: content, // 일정 내용 (별도 입력)
                startDate: start, // 서버 필드명에 맞춤
                endDate: dateType === 'single' ? null : end, // 당일 일정이면 null, 구간 일정이면 endDate
                type,
                categoryId,
                isAllDay: noDue, // 기한 없음 상태와 연동
              };
              if (selectedCategory && selectedCategory.type === 'GROUP') {
                const userDeptId = sessionStorage.getItem('USER_DEPARTMENT_ID');
                eventData = {
                  ...eventData,
                  departmentId: userDeptId ? Number(userDeptId) : null,
                };
              }
              onAdd(eventData);
              setTitle('');
              setContent('');
              setStart('');
              setEnd('');
              setNoDue(false);
            }}
          >
            확인
          </button>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default Schedule;
