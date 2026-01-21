"use client";

/**
 * GameHeader.jsx - 게임 헤더 컴포넌트
 *
 * 장소 표시 바와 게임 컨트롤 버튼(저장/불러오기/로그/처음으로)을 담당
 */

import React from "react";
import { useGameContext } from "@/contexts/GameContext";

const GameHeader = ({
  currentPlaceId,
  onSaveClick,
  onLoadClick,
  onLogClick,
  onResetClick,
  onInfoClick,
  isMuted,
  onToggleMute,
}) => {
  const { places } = useGameContext();
  return (
    <div className="header-content">
      <div className="place-bar">
        <div id="place-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="icon-place-bar"></span>
          <h1 className="place-name">
            {places[currentPlaceId]?.name || "알 수 없는 장소"}
          </h1>
        </div>
      </div>
      <div className="game-buttons">
        <button id="header-save-btn" className="game-button" onClick={onSaveClick}>
          <span className="game-button-icon save"></span>
          <span className="game-button-text">저장하기</span>
        </button>
        <button id="header-load-btn" className="game-button" onClick={onLoadClick}>
          <span className="game-button-icon load"></span>
          <span className="game-button-text">불러오기</span>
        </button>
        <button id="header-log-btn" className="game-button" onClick={onLogClick}>
          <span className="game-button-icon log"></span>
          <span className="game-button-text">로그</span>
        </button>
        <button id="header-reset-btn" className="game-button" onClick={onResetClick}>
          <span className="game-button-icon exit"></span>
          <span className="game-button-text">처음으로</span>
        </button>
        <button
          id="header-mute-btn"
          className={`game-button ${isMuted ? "music-off" : "music-on"}`}
          onClick={onToggleMute}
        >
          <span className="game-button-icon"></span>
        </button>
        <button
          id="header-info-btn"
          className="game-button info-button"
          onClick={onInfoClick}
          title="도움말"
        >
          <span className="game-button-icon info" style={{ color: "#DFCB93" }}>i</span>
        </button>
      </div>
    </div>
  );
};

export default GameHeader;
