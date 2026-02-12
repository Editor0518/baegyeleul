'use client';

import React, { useRef, useEffect, useState, useCallback } from "react";
import "./ChoiceBox.css";

const TOAST_DURATION = 2000;

const ChoiceBox = ({ choices, onChoice, isVisible = true }) => {
  // isVisible이 true일 때만 choices를 업데이트
  const displayedChoicesRef = useRef(choices);
  // 클릭 시 즉시 숨기기 위한 로컬 상태
  const [isLocallyVisible, setIsLocallyVisible] = useState(isVisible);
  // 이전 isVisible 상태 추적
  const prevIsVisibleRef = useRef(isVisible);
  // 토스트 메시지 상태
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    // isVisible이 false에서 true로 변경될 때만 choices 업데이트
    if (isVisible && !prevIsVisibleRef.current && choices && choices.length > 0) {
      displayedChoicesRef.current = choices;
    }

    // isVisible이 변경되면 로컬 상태도 동기화
    if (isVisible !== prevIsVisibleRef.current) {
      setIsLocallyVisible(isVisible);
      prevIsVisibleRef.current = isVisible;
    }
  }, [isVisible, choices]);

  // 토스트 표시 후 자동 숨김
  const showToast = useCallback((message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, TOAST_DURATION);
  }, []);

  // 클린업
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // 항상 캐시된 choices 사용
  const displayedChoices = displayedChoicesRef.current;

  const handleChoiceClick = (choice, index) => {
    // 잠긴 선택지 클릭 시 토스트 표시
    if (choice.isLocked) {
      showToast("조건을 달성하지 않아 선택할 수 없습니다");
      return;
    }
    // 클릭 즉시 숨기기
    setIsLocallyVisible(false);
    // 원래 핸들러 호출
    onChoice(choice, index);
  };

  return (
    <div id="game-choice-box" className={`choice-box ${!isLocallyVisible ? 'hidden' : ''}`}>
      <div className="choices-container">
        {displayedChoices.map((choice, index) => (
          <button
            key={index}
            className={`choice-button ${choice.isLocked ? 'choice-button-locked' : ''}`}
            onClick={() => handleChoiceClick(choice, index)}
            disabled={!isLocallyVisible}
          >
            <div className={`icon-choice-button ${choice.isLocked ? 'icon-locked' : ''}`}></div>
            <p className="choice-button-text">{choice.text}</p>
          </button>
        ))}
      </div>
      {toastMessage && (
        <div className="choice-toast" key={Date.now()}>
          <p className="choice-toast-text">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ChoiceBox;
