'use client';

import React, { useEffect, useLayoutEffect, useState } from 'react';
import './ProfileToast.css';

const TOAST_DURATION = 5000;
const TOAST_EXIT_DURATION = 400;

const TOAST_TEXT = {
  unlock: { label: "새로운 인물", suffix: "인물 도감에 등록되었습니다" },
  info: { label: "정보 추가", suffix: "새로운 정보가 추가되었습니다" },
  comment: { label: "한줄평 갱신", suffix: "한줄평이 갱신되었습니다" },
};

const ProfileToastItem = ({ toast, onDismiss }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setIsLeaving(true), TOAST_DURATION);
    const removeTimer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION + TOAST_EXIT_DURATION);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onDismiss]);

  const text = TOAST_TEXT[toast.type] || TOAST_TEXT.info;

  return (
    <div className={`profile-toast${isLeaving ? " leaving" : ""}`}>
      <span className="profile-toast-icon" aria-hidden="true"></span>
      <div className="profile-toast-body">
        <span className="profile-toast-label">{text.label}</span>
        <p className="profile-toast-text">
          <strong>{toast.name}</strong> {text.suffix}
        </p>
      </div>
    </div>
  );
};

/**
 * 인물도감 알림 토스트 - 좌측 상단, 장소 표시 바로 아래에 쌓임 (새 알림은 아래로)
 */
const ProfileToast = ({ toasts, onDismiss }) => {
  const [top, setTop] = useState(null);

  // 장소 이름 길이(줄 수)에 따라 높이가 바뀌므로 장소 표시 바 아래 위치를 측정
  useLayoutEffect(() => {
    const placeBar = document.getElementById('place-bar');
    if (!placeBar) return;
    const container = placeBar.closest('.game-container');

    const update = () => {
      const barRect = placeBar.getBoundingClientRect();
      const baseTop = container ? container.getBoundingClientRect().top : 0;
      setTop(barRect.bottom - baseTop);
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(placeBar);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="profile-toast-stack"
      style={top !== null ? { top: `calc(${top}px + 0.75rem)` } : undefined}
    >
      {toasts.map(toast => (
        <ProfileToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default ProfileToast;
