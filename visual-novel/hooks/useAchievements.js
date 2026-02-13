'use client';

import { useState, useCallback, useRef } from "react";
import { useGameContext } from "@/contexts/GameContext";
import { evaluateConditionString } from "@/utils/variableHelper";

const ACHIEVEMENT_STORAGE_KEY = "visualNovel_achievements";

export const useAchievements = () => {
  const { achievements: achievementDefs } = useGameContext();

  const [unlockedIds, setUnlockedIds] = useState(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // 토스트 큐: 새로 획득한 업적 이름 목록
  const [toastQueue, setToastQueue] = useState([]);

  // 중복 체크 방지용 ref (같은 프레임 내 중복 호출 방지)
  const checkingRef = useRef(false);

  const saveToStorage = useCallback((ids) => {
    try {
      localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify([...ids]));
    } catch (e) {
      console.error("Failed to save achievements:", e);
    }
  }, []);

  const isUnlocked = useCallback((achievementId) => unlockedIds.has(achievementId), [unlockedIds]);

  /**
   * 모든 업적 조건을 평가하여 새로 달성된 업적을 unlock 처리
   * 새로 획득한 업적이 있으면 토스트 큐에 추가
   */
  const checkAchievements = useCallback((variables, affection, history, choiceHistory) => {
    if (!achievementDefs || achievementDefs.length === 0) return;
    if (checkingRef.current) return;
    checkingRef.current = true;

    try {
      const newlyUnlocked = [];

      for (const achievement of achievementDefs) {
        if (!achievement.id || !achievement.command) continue;
        if (unlockedIds.has(achievement.id)) continue;

        const conditionMet = evaluateConditionString(
          achievement.command,
          variables,
          affection,
          history,
          choiceHistory
        );

        if (conditionMet) {
          newlyUnlocked.push(achievement);
        }
      }

      if (newlyUnlocked.length > 0) {
        setUnlockedIds(prev => {
          const next = new Set(prev);
          newlyUnlocked.forEach(a => next.add(a.id));
          saveToStorage(next);
          return next;
        });

        setToastQueue(prev => [
          ...prev,
          ...newlyUnlocked.map(a => a.name),
        ]);
      }
    } finally {
      checkingRef.current = false;
    }
  }, [achievementDefs, unlockedIds, saveToStorage]);

  /**
   * 토스트 큐에서 첫 번째 항목 제거 (표시 완료 시 호출)
   */
  const dismissToast = useCallback(() => {
    setToastQueue(prev => prev.slice(1));
  }, []);

  /**
   * 세이브 로드 시 업적 merge (기존 + 로드된 업적)
   */
  const mergeUnlockedAchievements = useCallback((loadedIds) => {
    if (!loadedIds || !Array.isArray(loadedIds)) return;
    setUnlockedIds(prev => {
      const next = new Set(prev);
      loadedIds.forEach(id => next.add(id));
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  /**
   * 획득한 업적 ID 배열 반환 (세이브 시 사용)
   */
  const getUnlockedArray = useCallback(() => {
    return [...unlockedIds];
  }, [unlockedIds]);

  return {
    achievementDefs: achievementDefs || [],
    unlockedIds,
    isUnlocked,
    checkAchievements,
    toastQueue,
    dismissToast,
    mergeUnlockedAchievements,
    getUnlockedArray,
  };
};
