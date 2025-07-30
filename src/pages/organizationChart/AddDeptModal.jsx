import React, { useState, useEffect, useRef } from 'react';
import styles from './OrgChart.module.scss';
import { HexColorPicker } from 'react-colorful';
import SuccessModal from '../../components/SuccessModal';
// import UserSearchModal from './UserSearchModal';

// 사용 가능한 색상 목록 (OrgChart COLOR_OPTIONS와 동일하게 유지)
const COLOR_OPTIONS = [
  '#e6f0fb', // 파랑
  '#dafbe5', // 초록
  '#fff0cc', // 노랑
  '#ffe6e6', // 빨강
  '#e0c3f7', // 보라
  '#e0e0e0', // 회색
  '#eaffd0', // 연두
];

function AddDeptModal({ open, onClose, onAdd, existingDepartments = [] }) {
  // 상태 관리
  const [color, setColor] = useState('#e6f0fb');
  const [name, setName] = useState('');
  // const [head, setHead] = useState(null); // 부서장
  // const [showUserSearch, setShowUserSearch] = useState(false);

  // 유효성 검사 상태
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 파일 선택 관련 상태
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // 컬러피커 관련 상태
  const [showPicker, setShowPicker] = useState(false);
  const colorCircleRef = useRef(null);
  const pickerRef = useRef(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setName('');
      // 이미 사용 중인 색상 제외 후 랜덤 선택
      const usedColors = existingDepartments
        .map((dept) => dept.departmentColor || dept.color)
        .filter(Boolean);
      const availableColors = COLOR_OPTIONS.filter(
        (color) => !usedColors.includes(color),
      );
      const randomColor =
        availableColors.length > 0
          ? availableColors[Math.floor(Math.random() * availableColors.length)]
          : COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
      setColor(randomColor);
      // setHead(null);
      setSelectedFile(null);
      setImagePreview(null);
      setErrors({});
      setIsSubmitting(false);
      setShowPicker(false);
    }
  }, [open, existingDepartments]);

  // 컬러피커 팝업 바깥 클릭 시 닫기
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

  // 유효성 검사 함수
  const validateForm = () => {
    const newErrors = {};

    // 부서명 검사
    if (!name.trim()) {
      newErrors.name = '부서명을 입력해주세요.';
    } else if (name.trim().length < 2) {
      newErrors.name = '부서명은 2자 이상 입력해주세요.';
    } else if (name.trim().length > 20) {
      newErrors.name = '부서명은 20자 이하로 입력해주세요.';
    } else if (existingDepartments.some((dept) => dept.name === name.trim())) {
      newErrors.name = '이미 존재하는 부서명입니다.';
    }

    // 부서장 검사
    // if (!head) {
    //   newErrors.head = '부서장을 선택해주세요.';
    // }

    // 부서 이미지 파일 검사
    if (!selectedFile) {
      newErrors.imageFile = '부서 대표 이미지를 선택해주세요.';
    } else if (!isValidImageFile(selectedFile)) {
      newErrors.imageFile =
        '올바른 이미지 파일을 선택해주세요. (jpg, jpeg, png, gif, webp)';
    } else if (selectedFile.size > 5 * 1024 * 1024) {
      // 5MB 제한
      newErrors.imageFile = '이미지 파일 크기는 5MB 이하여야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        color: color,
        imageFile: selectedFile,
        departmentColor: color,
      });
      // 성공 시에만 폼 초기화 및 모달 닫기
      setName('');
      setColor('#e6f0fb');
      setSelectedFile(null);
      setImagePreview(null);
      setErrors({});
      setShowPicker(false);
      onClose();
    } catch (error) {
      let msg = '부서 추가 중 오류가 발생했습니다.';
      if (error?.response?.data?.statusMessage) {
        msg = error.response.data.statusMessage;
      } else if (error?.message) {
        msg = error.message;
      }
      setSuccessMessage(msg);
      setShowSuccessModal(true);
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 파일 선택 처리
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (isValidImageFile(file)) {
        setSelectedFile(file);
        setErrors((prev) => ({ ...prev, imageFile: '' }));

        // 이미지 미리보기 생성
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setSelectedFile(null);
        setImagePreview(null);
        setErrors((prev) => ({
          ...prev,
          imageFile:
            '올바른 이미지 파일을 선택해주세요. (jpg, jpeg, png, gif, webp)',
        }));
      }
    }
  };

  // 이미지 파일 유효성 검사
  const isValidImageFile = (file) => {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return validTypes.includes(file.type);
  };

  // 파일 선택 버튼 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 파일 제거
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, imageFile: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div
        className={styles.modalBox}
        style={{
          maxWidth: '600px',
          width: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '40px 40px 32px 40px',
          minHeight: '38vh',
        }}
      >
        <div
          className={styles.modalTitle}
          style={{ fontSize: '24px', marginBottom: '32px' }}
        >
          부서 추가
        </div>

        {/* 부서명 입력 */}
        <div
          className={styles.modalField}
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <label
            style={{ minWidth: '120px', fontSize: '16px', fontWeight: '600' }}
          >
            부서명 *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='부서명을 입력하세요 (2-20자)'
            className={errors.name ? styles.inputError : ''}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              outline: 'none',
            }}
          />
        </div>
        {errors.name && (
          <div
            className={styles.errorMessage}
            style={{ marginLeft: '136px', marginTop: '4px' }}
          >
            {errors.name}
          </div>
        )}

        {/* 부서 색상 선택 */}
        <div
          className={styles.modalField}
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <label
            style={{
              minWidth: '120px',
              fontSize: '16px',
              fontWeight: '600',
              marginTop: '8px',
            }}
          >
            부서 색상 *
          </label>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* 동그라미 미리보기 (클릭 시 컬러 피커) */}
            <div
              ref={colorCircleRef}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '2px solid #ccc',
                background: color,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              title={color}
              onClick={() => setShowPicker((v) => !v)}
            />
            {/* 색상 코드 */}
            <span style={{ fontSize: 16, fontWeight: '500' }}>{color}</span>
            {/* 커스텀 컬러 피커 (동그라미 아래에 위치) */}
            {showPicker && (
              <div
                ref={pickerRef}
                style={{
                  position: 'absolute',
                  top: 50,
                  left: 0,
                  zIndex: 1000,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  background: '#fff',
                  borderRadius: 12,
                  padding: '40px 0 0 0', // 상단만 여백, 좌우/하단 여백 없음
                  minWidth: 200,
                  minHeight: 200,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 닫기 버튼: 상단 여백 공간에 위치 */}
                <button
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 16,
                    background: 'transparent',
                    border: 'none',
                    fontSize: 20,
                    cursor: 'pointer',
                    zIndex: 2,
                    color: '#666',
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

        {/* 부서 대표 이미지 파일 선택 */}
        <div
          className={styles.modalField}
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <label
            style={{
              minWidth: '120px',
              fontSize: '16px',
              fontWeight: '600',
              marginTop: '8px',
            }}
          >
            부서 대표 이미지 *
          </label>
          <div className={styles.imageFileInput} style={{ flex: 1 }}>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {!selectedFile ? (
              <button
                type='button'
                className={styles.fileSelectBtn}
                onClick={handleFileButtonClick}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px dashed #ddd',
                  borderRadius: '12px',
                  background: '#fafafa',
                  color: '#666',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >
                이미지 파일 선택
              </button>
            ) : (
              <div
                className={styles.selectedFileInfo}
                style={{ borderRadius: '12px' }}
              >
                <div className={styles.filePreview} style={{ padding: '16px' }}>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt='미리보기'
                      className={styles.previewImage}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid #e0e0e0',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div className={styles.fileDetails}>
                    <span
                      className={styles.fileName}
                      style={{ fontSize: '16px', fontWeight: '600' }}
                    >
                      {selectedFile.name}
                    </span>
                    <span
                      className={styles.fileSize}
                      style={{ fontSize: '14px' }}
                    >
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button
                  type='button'
                  className={styles.removeFileBtn}
                  onClick={handleRemoveFile}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ff4444',
                    background: '#fff',
                    color: '#ff4444',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    margin: '0 16px 16px 16px',
                  }}
                >
                  제거
                </button>
              </div>
            )}

            {errors.imageFile && (
              <div className={styles.errorMessage}>{errors.imageFile}</div>
            )}
          </div>
        </div>

        {/* 부서장 선택 - 임시 비활성화 */}
        {/*
        <div
          className={styles.modalField}
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <label
            style={{ minWidth: '120px', fontSize: '16px', fontWeight: '600' }}
          >
            부서장 *
          </label>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}
          >
            <input
              value={
                head
                  ? `${head.userName} (${head.department?.name || '부서 없음'})`
                  : ''
              }
              placeholder='부서장을 선택하세요'
              readOnly
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                outline: 'none',
              }}
              className={errors.head ? styles.inputError : ''}
            />
            <button
              type='button'
              className={styles.addUserBtn}
              onClick={() => setShowUserSearch(true)}
              title='부서장 선택'
              style={{
                width: '48px',
                height: '48px',
                padding: '0',
                borderRadius: '8px',
                border: '1px solid #48b96c',
                background: '#fff',
                color: '#48b96c',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 24, color: '#48b96c' }}>+</span>
            </button>
          </div>
        </div>
        {errors.head && (
          <div
            className={styles.errorMessage}
            style={{ marginLeft: '136px', marginTop: '4px' }}
          >
            {errors.head}
          </div>
        )}
        */}
        {/* 전체 에러 메시지 */}
        {errors.submit && (
          <div
            className={styles.errorMessage}
            style={{ textAlign: 'center', marginTop: '16px' }}
          >
            {errors.submit}
          </div>
        )}
        {/* 버튼 영역 */}
        <div
          className={styles.modalBtnRow}
          style={{ marginTop: '32px', gap: '16px', justifyContent: 'center' }}
        >
          <button
            className={styles.modalCancelBtn}
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
            }}
          >
            취소
          </button>
          <button
            className={styles.modalOkBtn}
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
            }}
          >
            {isSubmitting ? '추가 중...' : '부서 추가'}
          </button>
        </div>
        {/* 부서장 검색 모달 - 임시 비활성화 */}
        {/* <UserSearchModal
          open={showUserSearch}
          onClose={() => setShowUserSearch(false)}
          onSelect={(selectedUser) => {
            setHead(selectedUser);
            setShowUserSearch(false);
            setErrors((prev) => ({ ...prev, head: '' }));
          }}
          hrRoleFilter={true}
        /> */}

        {/* 성공 모달 */}
        {showSuccessModal && (
          <SuccessModal
            message={successMessage}
            onClose={() => {
              setShowSuccessModal(false);
              setSuccessMessage('');
            }}
          />
        )}
      </div>
    </div>
  );
}

export default AddDeptModal;
