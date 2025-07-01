import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Schedule.module.scss';

// 더미 카테고리/일정 데이터
const initialCategories = [
  { id: 1, name: '내 캘린더', color: '#4caf50', checked: true, type: 'my' },
  { id: 2, name: '부재', color: '#b39ddb', checked: true, type: 'my' },
  { id: 3, name: '고객관리', color: '#f48fb1', checked: true, type: 'my' },
  { id: 4, name: '사무보조', color: '#ffd600', checked: true, type: 'group' },
  { id: 5, name: '대전 출장', color: '#cddc39', checked: true, type: 'group' },
  { id: 6, name: '연차/반차', color: '#2196f3', checked: true, type: 'group' },
  { id: 7, name: '출장', color: '#f44336', checked: true, type: 'group' },
  { id: 8, name: '영업부', color: '#ff9800', checked: true, type: 'group' },
  { id: 9, name: '마케팅', color: '#00bcd4', checked: true, type: 'group' },
];

const SCHEDULE_TYPES = ['연차', '반차', '출장', '회의', '기타', '할 일'];

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const todayStr = `${yyyy}-${mm}-${dd}`;
const tomorrowDate = new Date(today);
tomorrowDate.setDate(today.getDate() + 1);
const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);
const lastMonthDate = new Date(today);
lastMonthDate.setMonth(today.getMonth() - 1);
const lastMonthStr = lastMonthDate.toISOString().slice(0, 10);
const nextMonthDate = new Date(today);
nextMonthDate.setMonth(today.getMonth() + 1);
const nextMonthStr = nextMonthDate.toISOString().slice(0, 10);

const initialEvents = [
  // 오늘 일정
  {
    id: 1,
    title: '오늘 일정',
    start: todayStr,
    end: todayStr,
    categoryId: 1,
    type: '회의',
    memo: '오늘 일정입니다.',
  },
  // 내일 일정
  {
    id: 2,
    title: '내일 일정',
    start: tomorrowStr,
    end: tomorrowStr,
    categoryId: 2,
    type: '출장',
    memo: '내일 일정입니다.',
  },
  // 지난 일정
  {
    id: 3,
    title: '지난 일정',
    start: lastMonthStr,
    end: lastMonthStr,
    categoryId: 3,
    type: '연차',
    memo: '지난 일정입니다.',
  },
  // 다음 일정
  {
    id: 4,
    title: '다음 일정',
    start: nextMonthStr,
    end: nextMonthStr,
    categoryId: 4,
    type: '회의',
    memo: '다음 일정입니다.',
  },
  // 월 경계 연속 일정(이달~다음달)
  {
    id: 5,
    title: '월경계 연속 일정',
    start: todayStr,
    end: nextMonthStr,
    categoryId: 5,
    type: '프로젝트',
    memo: '이달~다음달 연속 일정입니다.',
  },
  // 기한 없는 할일
  {
    id: 6,
    title: '기한 없는 할일',
    start: '',
    end: '',
    categoryId: 6,
    type: '할 일',
    memo: '기한 없는 할일입니다.',
  },
  // 이번달 중간 일정
  {
    id: 7,
    title: '이번달 중간 일정',
    start: `${yyyy}-${mm}-15`,
    end: `${yyyy}-${mm}-16`,
    categoryId: 7,
    type: '회의',
    memo: '이번달 중간 일정입니다.',
  },
  // 7월 1일 단일 일정
  {
    id: 101,
    title: '7월 1일 단일 일정',
    start: '2025-07-01',
    end: '2025-07-01',
    categoryId: 1,
    type: '회의',
    memo: '7월 1일 하루짜리 일정입니다.',
  },
  // 7월 10~12일 연속 일정
  {
    id: 102,
    title: '7월 10~12일 연속 일정',
    start: '2025-07-10',
    end: '2025-07-12',
    categoryId: 2,
    type: '프로젝트',
    memo: '7월 10~12일 연속 일정입니다.',
  },
  // 7월 15일 단일 일정
  {
    id: 103,
    title: '7월 15일 단일 일정',
    start: '2025-07-15',
    end: '2025-07-15',
    categoryId: 3,
    type: '출장',
    memo: '7월 15일 하루짜리 일정입니다.',
  },
  // 7월 20~25일 연속 일정
  {
    id: 104,
    title: '7월 20~25일 연속 일정',
    start: '2025-07-20',
    end: '2025-07-25',
    categoryId: 4,
    type: '연차',
    memo: '7월 20~25일 연속 일정입니다.',
  },
  // 7월 31일 단일 일정
  {
    id: 105,
    title: '7월 31일 단일 일정',
    start: '2025-07-31',
    end: '2025-07-31',
    categoryId: 5,
    type: '회의',
    memo: '7월 31일 하루짜리 일정입니다.',
  },
  // 7월 5~8일 연속 일정
  {
    id: 106,
    title: '7월 5~8일 연속 일정',
    start: '2025-07-05',
    end: '2025-07-08',
    categoryId: 6,
    type: '프로젝트',
    memo: '7월 5~8일 연속 일정입니다.',
  },
  // 7월 1~31일 한달 전체 일정
  {
    id: 107,
    title: '7월 한달 전체 일정',
    start: '2025-07-01',
    end: '2025-07-31',
    categoryId: 7,
    type: '장기',
    memo: '7월 한달 전체 일정입니다.',
  },
];

function getMonthDays(year, month) {
  // month: 0-indexed
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
  if (!start || !end) return false;
  const d = date.toISOString().slice(0, 10);
  return d >= start && d <= end;
}

// 날짜를 연,월,일만 남기고 0시로 맞추는 함수
function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function Schedule() {
  // 날짜/달력 상태
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  // 카테고리/일정 상태
  const [categories, setCategories] = useState(initialCategories);
  const [events, setEvents] = useState(initialEvents);
  // 팝업/검색/필터 상태
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredEvent, setHoveredEvent] = useState(null); // {id, type, dateStr}
  const [popupPos, setPopupPos] = useState({ left: 0, top: 0 });
  const [rightHoveredEvent, setRightHoveredEvent] = useState(null);
  const [rightPopupPos, setRightPopupPos] = useState(null);
  // 우측 할일 상세 팝업 상태
  const [rightDetail, setRightDetail] = useState(null);
  // 오늘 셀 하이라이트 상태
  const [highlightTodayCell, setHighlightTodayCell] = useState(false);

  // 달력 날짜 배열
  const days = getMonthDays(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // 카테고리 체크박스 핸들러
  const handleCategoryCheck = (id) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, checked: !cat.checked } : cat,
      ),
    );
  };
  // 카테고리 삭제
  const handleCategoryDelete = (id) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };
  // 카테고리 추가
  const handleCategoryAdd = (cat) => {
    setCategories([...categories, { ...cat, id: Date.now(), checked: true }]);
    setShowCategoryModal(false);
  };
  // 일정 추가
  const handleEventAdd = (event) => {
    setEvents([...events, { ...event, id: Date.now() }]);
    setShowEventModal(false);
  };

  // 일정 필터링(카테고리 체크된 것만)
  const visibleCategoryIds = categories
    .filter((c) => c.checked)
    .map((c) => c.id);
  const visibleEvents = events.filter((e) =>
    visibleCategoryIds.includes(e.categoryId),
  );

  // 달력 네비게이션
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

  // 1. 현재 달의 시작/끝 구하기
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);

  // 2. 월별 할일만 필터링
  const filteredEvents = visibleEvents.filter((e) => {
    if (!e.start && !e.end) return true; // 기한 없는 할일은 항상 표시
    const start = new Date(e.start);
    const end = new Date(e.end);
    // 일정이 이번 달에 걸쳐 있으면 표시
    return end >= monthStart && start <= monthEnd;
  });

  // 3. 오늘 기준 분류
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const rightTodos = filteredEvents.filter(
    (e) => e.type === '할 일' && !e.start && !e.end,
  );
  const rightNormal = filteredEvents.filter(
    (e) => e.type !== '할 일' || (e.start && e.end),
  );

  const pastEvents = rightNormal.filter((e) => e.end && e.end < todayStr);
  const todayEvents = rightNormal.filter(
    (e) => e.start <= todayStr && e.end >= todayStr,
  );
  const tomorrowEvents = rightNormal.filter(
    (e) =>
      e.start <= tomorrowStr && e.end >= tomorrowStr && e.start !== todayStr,
  );
  const futureEvents = rightNormal.filter((e) => e.start > tomorrowStr);

  // 연속 일정 바 렌더링: 한 달 내에서 start~end가 겹치는 일정은 한 번만 표시
  function getEventBarsForMonth(year, month) {
    const bars = [];
    visibleEvents.forEach((ev) => {
      // 기한 없는 할일은 달력에 표시 X
      if (ev.type === '할 일' && (!ev.start || !ev.end)) return;
      if (!ev.start || !ev.end) return;
      const start = new Date(ev.start);
      const end = new Date(ev.end);
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
      }
    });
    return bars;
  }
  const eventBars = getEventBarsForMonth(currentYear, currentMonth);
  const eventBarIds = new Set(eventBars.map((bar) => bar.id));

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
              onClick={() => setShowCategoryModal(true)}
            >
              +
            </button>
          </div>
          {categories
            .filter((c) => c.type === 'my')
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
              onClick={() => setShowCategoryModal(true)}
            >
              +
            </button>
          </div>
          {categories
            .filter((c) => c.type === 'group')
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
            className={styles.addEventBtn}
          >
            일정추가
          </button>
        </div>
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
                // 1. 연속 일정 바(해당 날짜가 bar의 실제 start~end에 포함되는 모든 바)
                const barsForCell = eventBars.filter((bar) => {
                  const start = toDateOnly(new Date(bar.start));
                  const end = toDateOnly(new Date(bar.end));
                  const cellDate = toDateOnly(date);
                  return cellDate >= start && cellDate <= end;
                });
                // 2. 당일 단일 일정(기한 없는 할일은 무조건 제외)
                const dayEvents = visibleEvents.filter((e) => {
                  if (e.type === '할 일' && !e.start && !e.end) return false;
                  if (!e.start || !e.end) return isSameDay(date, dateStr); // 기한 없음(날짜 지정된 할일만)
                  // 연속 일정 바로 처리되는 일정은 무조건 제외
                  if (eventBarIds.has(e.id)) return false;
                  // 날짜 비교도 toDateOnly로 보정
                  const start = toDateOnly(new Date(e.start));
                  const end = toDateOnly(new Date(e.end));
                  const cellDate = toDateOnly(date);
                  return cellDate >= start && cellDate <= end;
                });
                cells.push(
                  <td
                    key={dateStr}
                    className={
                      styles.calendarCell +
                      (toDateOnly(date).getTime() ===
                      toDateOnly(today).getTime()
                        ? ' ' +
                          styles.todayCell +
                          (highlightTodayCell
                            ? ' ' + styles.todayCellHighlight
                            : '')
                        : '')
                    }
                  >
                    <div className={styles.dateNum}>{date.getDate()}</div>

                    {/* 단일 일정들을 컨테이너로 감싸서 상단에 배치 */}
                    <div className={styles.singleEventsContainer}>
                      {dayEvents.map((ev) => {
                        const cat = categories.find(
                          (c) => c.id === ev.categoryId,
                        );
                        const isHovered =
                          hoveredEvent &&
                          hoveredEvent.id === ev.id &&
                          hoveredEvent.type === 'single' &&
                          hoveredEvent.dateStr === dateStr;
                        return (
                          <div
                            key={ev.id}
                            className={styles.eventBar}
                            style={{
                              background: cat?.color,
                              position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setPopupPos({
                                left: rect.left,
                                top: rect.bottom + 4,
                              });
                              setHoveredEvent({
                                id: ev.id,
                                type: 'single',
                                dateStr,
                              });
                            }}
                            onMouseLeave={() => setHoveredEvent(null)}
                          >
                            {ev.title}
                            {isHovered && (
                              <EventDetailPopup
                                event={ev}
                                category={cat}
                                popupPos={popupPos}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* 연속 일정 바: 해당 날짜가 barStart~barEnd에 포함되는 모든 바 */}
                    {barsForCell.map((bar) => {
                      const cat = categories.find(
                        (c) => c.id === bar.categoryId,
                      );
                      const isHovered =
                        hoveredEvent &&
                        hoveredEvent.id === bar.id &&
                        hoveredEvent.type === 'bar' &&
                        hoveredEvent.dateStr === dateStr;
                      // 연속 일정 바의 위치에 따라 클래스 분기
                      let barClass = styles.continuousEventBar;
                      if (bar.barStart === bar.barEnd) {
                        barClass += ' ' + styles.continuousEventBarSingle;
                      } else if (date.getDate() === bar.barStart) {
                        barClass += ' ' + styles.continuousEventBarStart;
                      } else if (date.getDate() === bar.barEnd) {
                        barClass += ' ' + styles.continuousEventBarEnd;
                      } else {
                        barClass += ' ' + styles.continuousEventBarMiddle;
                      }
                      return (
                        <div
                          key={bar.id + '-' + dateStr}
                          className={barClass}
                          style={{
                            background: cat?.color,
                            position: 'relative',
                          }}
                          onMouseEnter={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            setPopupPos({
                              left: rect.left,
                              top: rect.bottom + 4,
                            });
                            setHoveredEvent({
                              id: bar.id,
                              type: 'bar',
                              dateStr,
                            });
                          }}
                          onMouseLeave={() => setHoveredEvent(null)}
                        >
                          {bar.title}
                          {isHovered && (
                            <EventDetailPopup
                              event={bar}
                              category={cat}
                              popupPos={popupPos}
                            />
                          )}
                        </div>
                      );
                    })}
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
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder='제목, 내용'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className={styles.searchBtn}>
            <span className={styles.searchIcon}>🔍</span>
          </button>
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
                  setRightPopupPos({ left: rect.left - 350, top: rect.top });
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
                  setRightPopupPos({ left: rect.left - 350, top: rect.top });
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
                  setRightPopupPos({ left: rect.left - 350, top: rect.top });
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
                  setRightPopupPos({ left: rect.left - 350, top: rect.top });
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
                  setRightPopupPos({ left: rect.left - 350, top: rect.top });
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
                />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 카테고리 추가 모달 */}
      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onAdd={handleCategoryAdd}
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
    </div>
  );
}

// 일정 상세 팝업(hover, Portal)
function EventDetailPopup({ event, category, popupPos, fixed }) {
  if (!popupPos) return null;
  return ReactDOM.createPortal(
    <div
      className={styles.eventDetailPopup}
      style={{
        position: 'fixed',
        left: popupPos.left,
        top: popupPos.top,
        zIndex: 99999,
      }}
    >
      <div className={styles.eventDetailTitle}>일정 상세</div>
      <div className={styles.eventDetailRow}>
        <span className={styles.eventDetailLabel}>제목</span>
        <span className={styles.eventDetailValue}>{event.title}</span>
      </div>
      <div className={styles.eventDetailRow}>
        <span className={styles.eventDetailLabel}>일자</span>
        <span className={styles.eventDetailValue}>
          {event.start && event.end
            ? `${event.start} ~ ${event.end}`
            : '기한 없음'}
        </span>
      </div>
      <div className={styles.eventDetailRow}>
        <span className={styles.eventDetailLabel}>일정구분</span>
        <span className={styles.eventDetailValue}>{event.type}</span>
      </div>
      <div className={styles.eventDetailRow}>
        <span className={styles.eventDetailLabel}>메모</span>
        <span className={styles.eventDetailValue}>{event.memo || '-'}</span>
      </div>
    </div>,
    document.body,
  );
}

// 카테고리 추가 모달
function CategoryModal({ onClose, onAdd }) {
  const [color, setColor] = useState('#e6f0fb');
  const [name, setName] = useState('');
  const [type, setType] = useState('my');
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalTitle}>캘린더 추가</div>
        <div className={styles.modalField}>
          <label>색상</label>
          <input
            type='color'
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
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
            <option value='my'>내 캘린더</option>
            <option value='group'>그룹 캘린더</option>
          </select>
        </div>
        <div className={styles.modalBtnRow}>
          <button
            className={styles.modalOkBtn}
            onClick={() => {
              if (name) {
                onAdd({ name, color, type });
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
function EventModal({ onClose, onAdd, categories }) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [type, setType] = useState(SCHEDULE_TYPES[0]);
  const [memo, setMemo] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [noDue, setNoDue] = useState(false);
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalTitle}>일정 추가</div>
        <div className={styles.modalField}>
          <label>제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='일정 제목'
          />
        </div>
        <div className={styles.modalField}>
          <label>일자</label>
          <input
            type='date'
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              setNoDue(false);
            }}
            disabled={noDue}
          />
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
          <label style={{ marginLeft: 8 }}>
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
        <div className={styles.modalField}>
          <label>일정구분</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {SCHEDULE_TYPES.map((opt) => (
              <option value={opt} key={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.modalField}>
          <label>메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder='메모 입력'
            rows={3}
            style={{ resize: 'none' }}
          />
        </div>
        <div className={styles.modalField}>
          <label>캘린더</label>
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
        </div>
        <div className={styles.modalBtnRow}>
          <button
            className={styles.modalOkBtn}
            onClick={() => {
              if (title && (noDue || (start && end))) {
                onAdd({ title, start, end, type, memo, categoryId });
                setTitle('');
                setStart('');
                setEnd('');
                setMemo('');
                setNoDue(false);
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

export default Schedule;
