import React, { useState, useEffect } from 'react';
import styles from './AbsenceRegistrationModal.module.scss';
import { getKoreaToday } from '../../utils/dateUtils';
import { attendanceService } from '../../services/attendanceService';
import { approvalService } from '../../services/approvalService';
import SuccessModal from '../../components/SuccessModal';

// 한국 시간 기준 오늘 날짜
const todayStr = getKoreaToday();

const absenceTypes = [
  { value: 'BUSINESS_TRIP', label: '출장' },
  { value: 'TRAINING', label: '연수' },
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
  const [myVacations, setMyVacations] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 내 부재 목록 불러오기
  useEffect(() => {
    if (open) {
      fetchMyData();
    }
  }, [open]);

  const fetchMyData = async () => {
    try {
      // 부재 목록 불러오기
      const absenceResponse = await attendanceService.getAbsences({});
      const absences =
        absenceResponse.result || absenceResponse.data || absenceResponse || [];
      // 승인/처리중 상태만 필터링
      const filteredAbsences = absences.filter((a) => {
        const status = a.absenceStatus || a.status || a.approvalStatus;
        return ['PENDING', 'APPROVED', 'PROCESSING'].includes(status);
      });
      setMyAbsences(filteredAbsences);

      // 휴가 목록 불러오기
      const vacationResponse = await approvalService.getMyVacationRequests();
      const vacations =
        vacationResponse.result ||
        vacationResponse.data ||
        vacationResponse ||
        [];
      // 승인/처리중 상태만 필터링
      const filteredVacations = vacations.filter((v) => {
        const status = v.vacationStatus || v.status || v.approvalStatus;
        return [
          'PENDING',
          'APPROVED',
          'PROCESSING',
          'PENDING_APPROVAL',
        ].includes(status);
      });
      setMyVacations(filteredVacations);

      setDataLoaded(true);
    } catch (error) {
      console.error('데이터 불러오기 실패:', error);
      setMyAbsences([]);
      setMyVacations([]);
      setDataLoaded(true);
    }
  };

  // 중복 검사 함수 (부재 + 휴가)
  const checkDuplicate = () => {
    const requestStart = new Date(startDate);
    const requestEnd = new Date(endDate);

    // 해당 기간에 이미 신청한 부재가 있는지 검사 (타입 무관)
    const existingAbsence = myAbsences.find((absence) => {
      const absenceStart = new Date(absence.startDate);
      const absenceEnd = new Date(absence.endDate);

      // 기간이 겹치는지 확인
      const isOverlapping =
        requestStart <= absenceEnd && requestEnd >= absenceStart;

      return isOverlapping;
    });

    // 해당 기간에 휴가가 있는지 검사
    const vacationDuplicate = myVacations.some((vacation) => {
      const vacationStart = new Date(vacation.startDate);
      const vacationEnd = new Date(vacation.endDate);

      // 기간이 겹치는지 확인
      const isOverlapping =
        requestStart <= vacationEnd && requestEnd >= vacationStart;

      return isOverlapping;
    });

    return { existingAbsence, vacationDuplicate };
  };

  // 날짜나 타입이 변경될 때마다 중복 검사
  useEffect(() => {
    // 데이터가 로드되지 않았으면 검사하지 않음
    if (!dataLoaded) {
      return;
    }

    if (startDate && endDate && type) {
      const { existingAbsence, vacationDuplicate } = checkDuplicate();

      if (existingAbsence) {
        setDuplicateError('해당 기간에 이미 신청한 부재가 있습니다.');
      } else if (vacationDuplicate) {
        setDuplicateError('이미 해당 기간에 신청된 휴가가 있습니다.');
      } else {
        setDuplicateError('');
      }
    }
  }, [startDate, endDate, type, myAbsences, myVacations, dataLoaded]);

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

    // type 필드 검증 (필수 필드)
    if (!type) {
      alert('부재 유형을 선택해주세요.');
      return;
    }

    // 중복 에러가 있으면 제출 차단
    if (duplicateError) {
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
            />
          </div>
          {duplicateError && (
            <div
              style={{
                marginLeft: '105px',
                marginTop: '4px',
                color: '#e74c3c',
                fontSize: '14px',
                fontWeight: 400,
              }}
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
