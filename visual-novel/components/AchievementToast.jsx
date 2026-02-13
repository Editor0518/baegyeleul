'use client';

import React, { useEffect, useRef } from 'react';
import './AchievementToast.css';

const TOAST_DURATION = 3000;

const AchievementToast = ({ message, onDismiss }) => {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!message) return;

    timerRef.current = setTimeout(() => {
      onDismiss();
    }, TOAST_DURATION);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="achievement-toast">
      <div className="achievement-toast-inner">
        <span className="achievement-toast-icon">✦</span>
        <p className="achievement-toast-text">업적 달성! {message}</p>
      </div>
    </div>
  );
};

export default AchievementToast;
