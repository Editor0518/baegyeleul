'use client';

import React, { useRef, useEffect, useState } from "react";
import "./ChoiceBox.css";

const ChoiceBox = ({ choices, onChoice, isVisible = true }) => {
  // isVisible이 true일 때만 choices를 업데이트
  const displayedChoicesRef = useRef(choices);
  // 클릭 시 즉시 숨기기 위한 로컬 상태
  const [isLocallyVisible, setIsLocallyVisible] = useState(isVisible);
  // 이전 isVisible 상태 추적
  const prevIsVisibleRef = useRef(isVisible);

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

  // 항상 캐시된 choices 사용
  const displayedChoices = displayedChoicesRef.current;

  const handleChoiceClick = (choice, index) => {
    // 클릭 즉시 숨기기
    setIsLocallyVisible(false);
    // 원래 핸들러 호출
    onChoice(choice, index);
  };

  return (
    <div className={`choice-box ${!isLocallyVisible ? 'hidden' : ''}`}>
      <div className="choices-container">
        {displayedChoices.map((choice, index) => (
          <button
            key={index}
            className="choice-button"
            onClick={() => handleChoiceClick(choice, index)}
            disabled={!isLocallyVisible}
          >
            <div className="icon-choice-button"></div>
            <p className="choice-button-text">{choice.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChoiceBox;
