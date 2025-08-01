import React, { useState, useEffect, useRef } from 'react';
import styles from './OrgChart.module.scss';
import { HexColorPicker } from 'react-colorful';
import SuccessModal from '../../components/SuccessModal';

function EditDeptModal({
  open,
  onClose,
  onEdit,
  initialDept,
  existingDepartments = [],
}) {
  const [color, setColor] = useState('#e6f0fb');
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const colorCircleRef = useRef(null);
  const pickerRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (open && initialDept) {
      setName(initialDept.name || initialDept.departmentName || '');
      setColor(initialDept.departmentColor || initialDept.color || '#e6f0fb');
      setSelectedFile(null);
      setImagePreview(initialDept.imageUrl || initialDept.image || null);
      setErrors({});
      setIsSubmitting(false);
      setShowPicker(false);
    }
  }, [open, initialDept]);

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

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = '부서명을 입력해주세요.';
    } else if (name.trim().length < 2) {
      newErrors.name = '부서명은 2자 이상 입력해주세요.';
    } else if (name.trim().length > 20) {
      newErrors.name = '부서명은 20자 이하로 입력해주세요.';
    } else if (
      name.trim() !== (initialDept.name || initialDept.departmentName) &&
      existingDepartments.some((dept) => dept.name === name.trim())
    ) {
      newErrors.name = '이미 존재하는 부서명입니다.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('departmentColor', color);
      if (selectedFile) {
        formData.append('departmentImage', selectedFile);
      }
      await onEdit(formData);
      onClose(); // 성공 시에만 모달 닫기
    } catch (e) {
      let msg = '부서 정보 수정 중 오류가 발생했습니다.';
      if (e?.response?.data?.statusMessage) {
        msg = e.response.data.statusMessage;
      } else if (e?.message) {
        msg = e.message;
      }
      setSuccessMessage(msg);
      setShowSuccessModal(true);
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, imageFile: '' }));
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, imageFile: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div
        className={styles.modalBox}
        style={{
          maxWidth: '600px',
          width: '90vw',
          maxHeight: '95vh',
          overflow: 'auto',
          padding: '40px 40px 32px 40px',
        }}
      >
        <div
          className={styles.modalTitle}
          style={{ fontSize: '24px', marginBottom: '32px' }}
        >
          부서 정보 수정
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
            <span style={{ fontSize: 16, fontWeight: '500' }}>{color}</span>
            {showPicker && (
              <div
                ref={pickerRef}
                style={{
                  position: 'absolute',
                  top: -250,
                  left: 0,
                  zIndex: 1000,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  background: '#fff',
                  borderRadius: 12,
                  padding: '40px 0 0 0',
                  minWidth: 200,
                  minHeight: 200,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: 'transparent',
                    border: 'none',
                    fontSize: 16,
                    cursor: 'pointer',
                    zIndex: 2,
                    color: '#666',
                  }}
                  onClick={() => setShowPicker(false)}
                  aria-label='닫기'
                >
                  ×
                </button>
                <HexColorPicker color={color} onChange={setColor} />
              </div>
            )}
          </div>
        </div>
        {/* 부서 대표 이미지 파일 선택 */}
        <div
          className={styles.modalField}
          style={{
            marginBottom: '0px',
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
            {!selectedFile && !imagePreview ? (
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
                      {selectedFile ? selectedFile.name : '기존 이미지'}
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
        {errors.submit && (
          <div
            className={styles.errorMessage}
            style={{ textAlign: 'center', marginTop: '16px' }}
          >
            {errors.submit}
          </div>
        )}
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
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

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
  );
}

export default EditDeptModal;
