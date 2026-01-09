'use client';

import React, { useEffect, useRef, useState, useCallback } from "react";
import { getSpeakerInfo } from "@/utils/speakerHelper";
import "./DialogueBox.css";

const TYPING_INTERVAL = 25; // ms per character

const DialogueBox = ({ speaker, text = "", onNext }) => {
  const { displayName, speakerColor } = getSpeakerInfo(speaker);

  const [displayedText, setDisplayedText] = useState("");
  const typingTimer = useRef(null);

  // 타이핑 효과: 새로운 대사가 오면 처음부터 다시 타이핑
  useEffect(() => {
    // 기존 타이머 정리
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
    setDisplayedText("");

    const fullText = text || "";
    if (!fullText) return;

    let idx = 0;
    const typeNext = () => {
      idx += 1;
      setDisplayedText(fullText.slice(0, idx));
      if (idx < fullText.length) {
        typingTimer.current = setTimeout(typeNext, TYPING_INTERVAL);
      }
    };

    typingTimer.current = setTimeout(typeNext, TYPING_INTERVAL);

    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [text]);

  const isTypingComplete = displayedText === (text || "");

  const handleClick = useCallback(() => {
    if (!isTypingComplete) {
      // 타이핑 중이면 즉시 완료로 표시
      if (typingTimer.current) clearTimeout(typingTimer.current);
      setDisplayedText(text || "");
      return;
    }
    onNext?.();
  }, [isTypingComplete, onNext, text]);

  // 줄바꿈 문자(\n)를 <br>로 변환
  const formattedText = displayedText
    ? displayedText.split('\n').map((line, i, arr) => (
        <React.Fragment key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </React.Fragment>
      ))
    : null;

  return (
    <div className="dialogue-box" onClick={handleClick}>
      <div className="dialogue-content">
        {displayName && (
          <div className="speaker-name" style={{ color: speakerColor }}>
            <p className="speaker-text">{displayName}</p>
            <span className="line-deco left"></span>
            <span className="line-deco right"></span>
          </div>
        )}
        <div className="dialogue-text">
          {formattedText}
          <button className="next-button"></button>
        </div>
      </div>
    </div>
  );
};

export default DialogueBox;
