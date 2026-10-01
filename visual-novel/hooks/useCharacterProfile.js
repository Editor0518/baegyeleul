'use client';

import { useState, useCallback, useMemo } from "react";
import { useGameContext } from "@/contexts/GameContext";
import { evaluateConditionString } from "@/utils/variableHelper";

// 스탠딩을 한 번이라도 본 캐릭터 (세이브와 무관한 전체 기준)
const SEEN_STORAGE_KEY = "visualNovel_seen_characters";
// 마지막으로 플레이한 진행 상태 (타이틀에서 도감을 열 때 세부정보/한줄평 계산용)
const PLAY_STATE_STORAGE_KEY = "visualNovel_profile_play_state";

const readStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

// "정보_A"처럼 연산자 없이 이름만 쓴 조건은 "정보_A == 1"로 취급
// (evaluateConditionString은 파싱 실패 시 true를 반환하므로 그대로 두면 항상 공개됨)
const normalizeCondition = (condition) => {
  const trimmed = (condition || "").trim();
  if (/^\S+$/.test(trimmed)) return `${trimmed} == 1`;
  return trimmed;
};

export const useCharacterProfile = () => {
  const { profiles, profileEntries, characters } = useGameContext();

  // 도감 목록: profiles 시트 순서대로, characters 시트 정보와 합쳐서 구성
  const allProfiles = useMemo(() => {
    return (profiles || [])
      .filter(p => characters?.[p.characterId])
      .map(p => {
        const char = characters[p.characterId];
        // 기본 표정 우선, 파일이 없을 때를 대비해 나머지 표정도 후보로 둠
        const { default: defaultFile, ...otherEmotions } = char.emotions || {};
        const images = char.imageFolder
          ? [defaultFile, ...Object.values(otherEmotions)]
              .filter(Boolean)
              .map(file => `assets/characters/${char.imageFolder}/${file}`)
          : [];
        return {
          ...p,
          id: p.characterId,
          name: p.name || char.name || p.characterId,
          color: char.color,
          images,
        };
      });
  }, [profiles, characters]);

  const [seenCharacters, setSeenCharacters] = useState(
    () => new Set(readStorage(SEEN_STORAGE_KEY, []))
  );

  const [savedPlayState, setSavedPlayState] = useState(
    () => readStorage(PLAY_STATE_STORAGE_KEY, null)
  );

  const markCharactersAsSeen = useCallback((ids) => {
    if (!ids || ids.length === 0 || typeof window === 'undefined') return;
    setSeenCharacters(prev => {
      if (ids.every(id => prev.has(id))) return prev;
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      try {
        localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...next]));
      } catch (e) {
        console.error("Failed to save seen characters:", e);
      }
      return next;
    });
  }, []);

  // playState: { variables, affection, history, choiceHistory }
  const savePlayState = useCallback((playState) => {
    if (typeof window === 'undefined') return;
    setSavedPlayState(playState);
    try {
      localStorage.setItem(PLAY_STATE_STORAGE_KEY, JSON.stringify(playState));
    } catch (e) {
      console.error("Failed to save profile play state:", e);
    }
  }, []);

  const isSeen = useCallback((characterId) => seenCharacters.has(characterId), [seenCharacters]);

  /**
   * 진행 상태 기준으로 공개된 세부정보와 한줄평 계산
   * - info: 조건을 만족하는 항목 전부 (시트 순서)
   * - comment: 조건을 만족하는 첫 항목 하나
   * playState가 없으면(한 번도 플레이하지 않음) 둘 다 비어 있음
   */
  const getRevealedEntries = useCallback((characterId, playState) => {
    if (!playState) return { infos: [], comment: null };

    const { variables, affection, history, choiceHistory } = playState;
    const isMet = (entry) => !entry.condition || evaluateConditionString(
      normalizeCondition(entry.condition),
      variables || {},
      affection || {},
      history || [],
      choiceHistory || {}
    );

    const entries = (profileEntries || []).filter(e => e.characterId === characterId);
    const infos = entries.filter(e => e.type === "info" && isMet(e));
    const comment = entries.find(e => e.type === "comment" && isMet(e)) || null;
    return { infos, comment };
  }, [profileEntries]);

  return {
    allProfiles,
    seenCharacters,
    isSeen,
    markCharactersAsSeen,
    savedPlayState,
    savePlayState,
    getRevealedEntries,
  };
};
