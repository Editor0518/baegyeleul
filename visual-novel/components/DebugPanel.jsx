'use client';

// ★ 배포 시 false로 변경
const DEBUG_MODE = true;

import React, { useState, useRef, useEffect } from 'react';
import './DebugPanel.css';

const DebugPanel = ({
  currentSceneId,
  dialogueIndex,
  currentPlace,
  showTitleScreen,
  isSkipping,
  showReaction,
  currentReaction,
  pendingNextScene,
  showEndingResult,
  affection,
  variables,
  endingInfo,
  history,
  choiceHistory,
  logEntries,
  unlockedAchievements,
  viewedCGs,
  displayedCharacters,
  currentScene,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);

  // Ctrl+Shift+D 단축키
  useEffect(() => {
    if (!DEBUG_MODE) return;
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 드래그 처리
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!DEBUG_MODE) return null;

  const handleDragStart = (e) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const toggleSection = (sectionName) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const Section = ({ title, children, badge }) => {
    const isCollapsed = collapsedSections[title];
    return (
      <div className="debug-section">
        <div className="debug-section-header" onClick={() => toggleSection(title)}>
          <span className="debug-section-arrow">{isCollapsed ? '\u25B6' : '\u25BC'}</span>
          <span className="debug-section-title">{title}</span>
          {badge !== undefined && <span className="debug-section-badge">{badge}</span>}
        </div>
        {!isCollapsed && <div className="debug-section-body">{children}</div>}
      </div>
    );
  };

  const Row = ({ label, value, highlight }) => (
    <div className={`debug-row ${highlight ? 'debug-row-highlight' : ''}`}>
      <span className="debug-label">{label}</span>
      <span className="debug-value">
        {typeof value === 'object' ? JSON.stringify(value) : String(value ?? 'null')}
      </span>
    </div>
  );

  // 닫혀 있으면 토글 버튼만 표시
  if (!isOpen) {
    return (
      <button
        className="debug-toggle-button"
        onClick={() => setIsOpen(true)}
        title="Debug Inspector (Ctrl+Shift+D)"
      >
        DBG
      </button>
    );
  }

  return (
    <div className="debug-panel" ref={panelRef} style={{ left: position.x, top: position.y }}>
      {/* 드래그 가능한 헤더 */}
      <div className="debug-panel-header" onMouseDown={handleDragStart}>
        <span className="debug-panel-title">Debug Inspector</span>
        <button className="debug-close-btn" onClick={() => setIsOpen(false)}>
          ✕
        </button>
      </div>

      <div className="debug-panel-body">
        {/* Scene State */}
        <Section title="Scene State">
          <Row label="sceneId" value={currentSceneId} highlight />
          <Row label="sceneType" value={currentScene?.type} />
          <Row label="dialogueIndex" value={dialogueIndex} />
          <Row label="currentPlace" value={currentPlace} />
          <Row label="showTitleScreen" value={showTitleScreen} />
          <Row label="isSkipping" value={isSkipping} />
          <Row label="showReaction" value={showReaction} />
          <Row label="pendingNextScene" value={pendingNextScene} />
          <Row label="nextScene" value={currentScene?.next} />
        </Section>

        {/* Affection */}
        <Section title="Affection" badge={Object.keys(affection || {}).length}>
          {affection && Object.keys(affection).length > 0 ? (
            Object.entries(affection).map(([charId, val]) => (
              <Row key={charId} label={charId} value={val} />
            ))
          ) : (
            <div className="debug-empty">(empty)</div>
          )}
        </Section>

        {/* Variables */}
        <Section title="Variables" badge={Object.keys(variables || {}).length}>
          {variables && Object.keys(variables).length > 0 ? (
            Object.entries(variables).map(([name, val]) => (
              <Row key={name} label={name} value={val} />
            ))
          ) : (
            <div className="debug-empty">(empty)</div>
          )}
        </Section>

        {/* Ending */}
        <Section title="Ending">
          <Row label="showEndingResult" value={showEndingResult} />
          <Row label="endingInfo" value={endingInfo} />
        </Section>

        {/* History */}
        <Section title="History" badge={history?.length || 0}>
          <Row label="visited" value={history?.join(' → ')} />
        </Section>

        {/* Choice History */}
        <Section title="Choice History" badge={Object.keys(choiceHistory || {}).length}>
          {choiceHistory && Object.keys(choiceHistory).length > 0 ? (
            Object.entries(choiceHistory).map(([sceneId, idx]) => (
              <Row key={sceneId} label={sceneId} value={`choice #${idx}`} />
            ))
          ) : (
            <div className="debug-empty">(empty)</div>
          )}
        </Section>

        {/* Achievements */}
        <Section title="Achievements" badge={unlockedAchievements?.length || 0}>
          {unlockedAchievements && unlockedAchievements.length > 0 ? (
            <Row label="unlocked" value={unlockedAchievements.join(', ')} />
          ) : (
            <div className="debug-empty">(empty)</div>
          )}
        </Section>

        {/* CG Album */}
        <Section title="CG Album" badge={viewedCGs ? viewedCGs.size || 0 : 0}>
          {viewedCGs && viewedCGs.size > 0 ? (
            <Row label="viewed" value={[...viewedCGs].join(', ')} />
          ) : (
            <div className="debug-empty">(empty)</div>
          )}
        </Section>

        {/* Log Entries */}
        <Section title="Log Entries" badge={logEntries?.length || 0}>
          <Row label="count" value={logEntries?.length || 0} />
        </Section>

        {/* Display Characters */}
        <Section title="Display Characters">
          <Row label="characters" value={displayedCharacters} />
        </Section>
      </div>
    </div>
  );
};

export default DebugPanel;
