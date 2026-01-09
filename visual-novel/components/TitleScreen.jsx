"use client";

import React from "react";
import "./TitleScreen.css";
import { useGameContext } from "@/contexts/GameContext";

const TitleScreen = ({ onStart, onLoad, isMuted, onToggleMute }) => {
  const { gameInfo } = useGameContext();

  // 줄바꿈 문자(\n)를 <br>로 변환
  const formattedSubtitle = gameInfo.subtitle ? gameInfo.subtitle.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < gameInfo.subtitle.split('\n').length - 1 && <br />}
    </React.Fragment>
  )) : null;

  return (
    <div className="title-screen">
      {/* 음소거 버튼 (우측 상단) */}
      <div className="title-music-button-container">
        <button
          className={`title-music-button ${isMuted ? "music-off" : "music-on"}`}
          onClick={onToggleMute}
        >
          <span className="game-button-icon"></span>
        </button>
      </div>

      <div className="title-container">
        <div className="title-content">
          <div className="title-box">
            <h1 className="game-title">{gameInfo.title}</h1>
            <span className="line-deco left"></span>
            <span className="line-deco right"></span>
          </div>
          <div className="game-subtitle">
            <span className="icon-subtitle"></span>
            {formattedSubtitle}
          </div>
        </div>
        <div className="title-buttons">
          <button className="start-button" onClick={onStart}>
            <span className="line-deco left"></span>시작하기
            <span className="line-deco right"></span>
          </button>
          <button className="load-button" onClick={onLoad}>
            <span className="line-deco left"></span>불러오기
            <span className="line-deco right"></span>
          </button>
        </div>
      </div>
      <p className="copyright">
        Websual Novel.v1.6 made by @rrllgg22
        <br />
        @Editor0518 added some features with it
      </p>
    </div>
  );
};

export default TitleScreen;
