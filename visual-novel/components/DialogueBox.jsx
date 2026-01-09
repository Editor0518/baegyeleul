'use client';

import React from "react";
import { getSpeakerInfo } from "@/utils/speakerHelper";
import "./DialogueBox.css";

const DialogueBox = ({ speaker, text, onNext }) => {
  const { displayName, speakerColor } = getSpeakerInfo(speaker);

  // 줄바꿈 문자(\n)를 <br>로 변환
  const formattedText = text ? text.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  )) : null;

  return (
    <div className="dialogue-box" onClick={onNext}>
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
