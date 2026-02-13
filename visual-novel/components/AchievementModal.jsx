'use client';

import React from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import './AchievementModal.css';

const AchievementModal = ({ onClose }) => {
  const { achievementDefs, isUnlocked } = useAchievements();

  const unlockedCount = achievementDefs.filter(a => isUnlocked(a.id)).length;

  return (
    <div className="achievement-overlay" onClick={onClose}>
      <div id="achievement-modal" className="achievement-modal" onClick={(e) => e.stopPropagation()}>
        <div className="achievement-header">
          <h2>업적</h2>
          <span className="achievement-counter">{unlockedCount} / {achievementDefs.length}</span>
          <button className="achievement-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="achievement-content">
          {achievementDefs.length === 0 ? (
            <div className="achievement-empty">등록된 업적이 없습니다.</div>
          ) : (
            <div className="achievement-list">
              {achievementDefs.map((achievement) => {
                const unlocked = isUnlocked(achievement.id);
                const showName = unlocked || achievement.name_show;
                const showCondition = unlocked || achievement.condition_show;

                return (
                  <div
                    key={achievement.id}
                    className={`achievement-item ${unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="achievement-item-header">
                      <span className={`achievement-badge ${unlocked ? 'badge-unlocked' : 'badge-locked'}`}>
                        {unlocked ? '✦' : '?'}
                      </span>
                      <h3 className="achievement-name">
                        {showName ? achievement.name : '???'}
                      </h3>
                    </div>
                    {unlocked && achievement.desc && (
                      <p className="achievement-desc">{achievement.desc}</p>
                    )}
                    <p className="achievement-condition">
                      {showCondition
                        ? achievement.condition_desc
                        : '아직 획득하지 못한 업적입니다.'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="achievement-footer">
          <button className="achievement-button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
