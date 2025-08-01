import React, { useState, useEffect, useRef } from 'react';

const ToastNotification = ({
  message,
  type = 'info',
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const endTime = startTimeRef.current + duration;

    const updateProgress = () => {
      if (isPaused) {
        animationRef.current = requestAnimationFrame(updateProgress);
        return;
      }

      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / duration) * 100;

      setProgress(newProgress);

      if (remaining > 0) {
        animationRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationRef.current = requestAnimationFrame(updateProgress);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // 애니메이션 완료 후 제거
    }, duration);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, onClose, isPaused]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (pausedTimeRef.current) {
      const pauseDuration = Date.now() - pausedTimeRef.current;
      startTimeRef.current += pauseDuration; // 시작 시간을 조정하여 일시정지 시간만큼 연장
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'message':
        return '💬';
      case 'approval':
        return '📋';
      case 'system':
        return '🔔';
      case 'payroll':
        return '💰';
      default:
        return '🔔';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'message':
        return '#e3f2fd';
      case 'approval':
        return '#fff3e0';
      case 'system':
        return '#f3e5f5';
      case 'payroll':
        return '#e8f5e8';
      default:
        return '#e3f2fd';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'message':
        return '#2196f3';
      case 'approval':
        return '#ff9800';
      case 'system':
        return '#9c27b0';
      case 'payroll':
        return '#4caf50';
      default:
        return '#2196f3';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'message':
        return '#2196f3';
      case 'approval':
        return '#ff9800';
      case 'system':
        return '#9c27b0';
      case 'payroll':
        return '#4caf50';
      default:
        return '#2196f3';
    }
  };

  // 프로필 이미지 렌더링
  const renderProfileImage = () => {
    const profileImage = message.senderProfileImage || message.profileImage;
    const senderName = message.senderName || message.sender || '알 수 없음';

    if (profileImage) {
      return (
        <img
          src={profileImage}
          alt={senderName}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flexShrink: 0,
          }}
        />
      );
    }

    // 기본 프로필 이미지 (이니셜)
    const initials = senderName
      .split(' ')
      .map((name) => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: getBorderColor(),
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
    );
  };

  // 쪽지 내용 미리보기 렌더링
  const renderMessageContent = () => {
    if (type === 'message' && message.content) {
      // HTML 태그 제거 및 텍스트만 추출
      const plainText = message.content.replace(/<[^>]*>/g, '');
      const preview =
        plainText.length > 100
          ? plainText.substring(0, 100) + '...'
          : plainText;

      return (
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            lineHeight: '1.4',
            marginTop: '4px',
            padding: '8px',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '4px',
            border: '1px solid rgba(0,0,0,0.1)',
            maxHeight: '60px',
            overflow: 'hidden',
          }}
        >
          {preview}
        </div>
      );
    }

    return (
      <div
        style={{
          fontSize: '13px',
          color: '#666',
          lineHeight: '1.4',
        }}
      >
        {message.content || message.message}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: getBackgroundColor(),
        border: `2px solid ${getBorderColor()}`,
        borderRadius: '8px',
        padding: '16px',
        minWidth: '320px',
        maxWidth: '450px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose();
        }, 300);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 진행 바 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '3px',
          width: `${progress}%`,
          background: getProgressColor(),
          transition: isPaused ? 'none' : 'width 0.1s linear',
          borderRadius: '8px 0 0 0',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* 프로필 이미지 */}
        {renderProfileImage()}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#333',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {message.title || '새로운 알림'}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {type === 'message' ? '쪽지' : '알림'}
            </div>
          </div>

          {/* 발신자 정보 */}
          <div
            style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '6px',
              fontWeight: '500',
            }}
          >
            {message.senderName || message.sender || '알 수 없음'}
            {message.senderDepartment && ` • ${message.senderDepartment}`}
          </div>

          {/* 내용 */}
          {renderMessageContent()}

          {/* 시간 */}
          <div
            style={{
              fontSize: '11px',
              color: '#999',
              marginTop: '6px',
            }}
          >
            {message.createdAt
              ? new Date(message.createdAt).toLocaleString()
              : '방금 전'}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
            setTimeout(() => {
              onClose();
            }, 300);
          }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            color: '#999',
            cursor: 'pointer',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
