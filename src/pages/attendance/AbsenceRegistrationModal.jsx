import React, { useState, useEffect } from 'react';
import styles from './AbsenceRegistrationModal.module.scss';
import { getKoreaToday } from '../../utils/dateUtils';
import { attendanceService } from '../../services/attendanceService';
import SuccessModal from '../../components/SuccessModal';

// 한국 시간 기준 오늘 날짜
const todayStr = getKoreaToday();

const absenceTypes = [
  { value: 'BUSINESS_TRIP', label: '출장' },
  { value: 'TRAINING', label: '연수' },
  { value: 'ANNUAL_LEAVE', label: '연차' },
  { value: 'HALF_DAY_LEAVE', label: '반차' },
  { value: 'SHORT_LEAVE', label: '외출' },
  { value: 'SICK_LEAVE', label: '병가' },
  { value: 'OFFICIAL_LEAVE', label: '공가' },
  { value: 'ETC', label: '기타' },
];

const urgencyOptions = [
  { value: 'NORMAL', label: '일반' },
  { value: 'URGENT', label: '긴급' },
];

const timeOptions = Array.from({ length: 36 }, (_, i) => {
  const hour = String(Math.floor(i / 2) + 6).padStart(2, '0'); // 06:00 ~ 23:30
  const min = i % 2 === 0 ? '00' : '30';
  return `${hour}:${min}`;
});

const AbsenceRegistrationModal = ({ open, onClose, onSubmit }) => {
  const [type, setType] = useState('BUSINESS_TRIP');
  const [urgency, setUrgency] = useState('NORMAL');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('');
  const [myAbsences, setMyAbsences] = useState([]);
  const [duplicateError, setDuplicateError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 내 부재 목록 불러오기
  useEffect(() => {
    if (open) {
      fetchMyAbsences();
    }
  }, [open]);

  const fetchMyAbsences = async () => {
    try {
      const response = await attendanceService.getAbsences({});
      const absences = response.result || response.data || response || [];
      setMyAbsences(absences);
    } catch (error) {
      console.error('부재 목록 불러오기 실패:', error);
      setMyAbsences([]);
    }
  };

  // 중복 검사 함수
  const checkDuplicate = () => {
    if (!myAbsences.length) return false;

    const requestStart = new Date(startDate);
    const requestEnd = new Date(endDate);

    return myAbsences.some((absence) => {
      const absenceStart = new Date(absence.startDate);
      const absenceEnd = new Date(absence.endDate);

      // 기간이 겹치는지 확인
      const isOverlapping =
        requestStart <= absenceEnd && requestEnd >= absenceStart;

      // 같은 타입인지 확인
      const isSameType = absence.type === type;

      return isOverlapping && isSameType;
    });
  };

  // 날짜나 타입이 변경될 때마다 중복 검사
  useEffect(() => {
    if (startDate && endDate && type) {
      const isDuplicate = checkDuplicate();
      if (isDuplicate) {
        setDuplicateError(
          '이미 해당 기간에 같은 유형의 부재가 신청되어 있습니다.',
        );
      } else {
        setDuplicateError('');
      }
    }
  }, [startDate, endDate, type, myAbsences]);

  // 부재 타입 변경 시 긴급도 자동 설정
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);

    // 부재 타입에 따른 긴급도 자동 설정
    if (newType === 'SICK_LEAVE' || newType === 'OFFICIAL_LEAVE') {
      setUrgency('URGENT');
    } else {
      setUrgency('NORMAL');
    }
  };

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // 중복 검사
    if (duplicateError) {
      setSuccessMessage(duplicateError);
      setShowSuccessModal(true);
      return;
    }

    // startTime, endTime이 'HH:mm' 포맷인지 보장
    const formattedStartTime =
      startTime && startTime.length === 5 ? startTime : '';
    const formattedEndTime = endTime && endTime.length === 5 ? endTime : '';
    if (onSubmit)
      onSubmit({
        type,
        urgency,
        startDate,
        endDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        reason,
      });
    if (onClose) onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>부재 신청</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label>부재 유형</label>
            <select value={type} onChange={handleTypeChange}>
              {absenceTypes.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.row}>
            <label>긴급도</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              {urgencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.row}>
            <label>날짜 선택</label>
            <input
              type='date'
              min={todayStr}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>~</span>
            <input
              type='date'
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <label>시간</label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ width: 120 }}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span>~</span>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ width: 120 }}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.row}>
            <label>사유</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='부재 사유를 입력하세요'
              style={{
                flex: '1',
                height: '80px',
                resize: 'vertical',
                border: '1px solid #b7d7c2',
                borderRadius: '4px',
                padding: '0.5rem 0.7rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {duplicateError && (
            <div
              className={styles.errorMessage}
              style={{ color: 'red', fontSize: '0.9rem', marginBottom: '1rem' }}
            >
              {duplicateError}
            </div>
          )}
          <div className={styles.buttonRow}>
            <button
              type='submit'
              className={styles.submitBtn}
              disabled={!!duplicateError}
            >
              신청
            </button>
            <button
              type='button'
              onClick={onClose}
              className={styles.cancelBtn}
            >
              취소
            </button>
          </div>
        </form>
      </div>
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={successMessage}
        />
      )}
    </div>
  );
};

export default AbsenceRegistrationModal;
