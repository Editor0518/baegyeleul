'use client';

import React, { useEffect, useMemo, useState } from "react";
import { getSpeakerInfo } from "@/utils/speakerHelper";
import "./DialogueBox.css";

const DialogueBox = ({ speaker, text, onNext }) => {
  const FADE_IN_DURATION = 400;  // ms, matches CSS fade-in 0.4s
  const FADE_OUT_DURATION = 100; // ms, matches CSS fade-out 0.1s
  const [fadeState, setFadeState] = useState("fade-in");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { displayName, speakerColor } = getSpeakerInfo(speaker);

  // 줄바꿈 문자(\n)를 <br>로 변환
  const formattedText = useMemo(() => (
    text
      ? text.split("\n").map((line, i, arr) => (
        <React.Fragment key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </React.Fragment>
      ))
      : null
  ), [text]);

  useEffect(() => {
    // 선택지가 뜰 때는 onNext가 undefined이므로 페이드 효과 없음
    if (onNext === undefined) {
      setFadeState("");
      setIsTransitioning(false);
      return;
    }
    // 새 대사가 표시될 때만 페이드 인
    setFadeState("fade-in");
    setIsTransitioning(false);
    const timer = setTimeout(() => setFadeState(""), FADE_IN_DURATION);
    return () => clearTimeout(timer);
  }, [text, onNext]);

  const handleClick = () => {
    if (!onNext || isTransitioning) return;
    setIsTransitioning(true);
    onNext();
  };

  return (
    <div id="game-dialogue-box" className="dialogue-box" onClick={handleClick}>
      <div className="dialogue-content">
        {displayName && (
          <div className="speaker-name" style={{ color: speakerColor }}>
            <p className="speaker-text">{displayName}</p>
            <span className="line-deco left"></span>
            <span className="line-deco right"></span>
          </div>
        )}
        <div className={`dialogue-text ${fadeState}`}>
          {formattedText}
          <button className="next-button"></button>
        </div>
      </div>
    </div>
  );
};

export default DialogueBox;
