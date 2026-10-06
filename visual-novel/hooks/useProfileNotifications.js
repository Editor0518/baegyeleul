'use client';

import { useState, useCallback, useEffect, useRef } from "react";
import { useGameContext } from "@/contexts/GameContext";
import { useCharacterProfile } from "@/hooks/useCharacterProfile";

let toastIdSeq = 0;

/**
 * 인물도감 변경 알림
 * - 물음표였던 인물이 처음 해금됨 (스탠딩 첫 등장)
 * - 해금된 인물의 세부정보가 새로 공개됨
 * - 해금된 인물의 한줄평이 바뀜
 *
 * 세부정보/한줄평은 "직전 진행 상태"와 비교하므로, 게임 시작·로드·재시작 직후에는
 * 기준점만 잡고 알림을 띄우지 않는다. (resetBaseline으로 기준점 초기화)
 */
export const useProfileNotifications = ({ enabled, playState, displayedCharacters }) => {
  const { characters } = useGameContext();
  const { allProfiles, isSeen, markCharactersAsSeen, getRevealedEntries } = useCharacterProfile();
  const [profileToasts, setProfileToasts] = useState([]);

  // { [characterId]: { infos: Set<entry>, comment: entry|null } } — 해금된 인물만
  const baselineRef = useRef(null);

  const resetBaseline = useCallback(() => {
    baselineRef.current = null;
  }, []);

  const dismissProfileToast = useCallback((id) => {
    setProfileToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    if (!enabled) {
      baselineRef.current = null;
      return;
    }

    const shownIds = Object.keys(displayedCharacters || {});
    const newlySeen = allProfiles.filter(p => shownIds.includes(p.id) && !isSeen(p.id));
    const newlySeenIds = new Set(newlySeen.map(p => p.id));

    const snapshot = {};
    allProfiles.forEach(p => {
      if (!isSeen(p.id) && !newlySeenIds.has(p.id)) return;
      const { infos, comment } = getRevealedEntries(p.id, playState);
      snapshot[p.id] = { infos: new Set(infos), comment };
    });

    const prev = baselineRef.current;
    baselineRef.current = snapshot;

    const toasts = newlySeen.map(p => ({ type: "unlock", name: p.name }));

    if (prev) {
      allProfiles.forEach(p => {
        const before = prev[p.id];
        const after = snapshot[p.id];
        if (!before || !after) return;
        // 정보/한줄평 알림은 도감 이름이 아닌 characters 시트의 이름 사용 (예: 멘델스존)
        const shortName = characters?.[p.id]?.name || p.name;
        if ([...after.infos].some(info => !before.infos.has(info))) {
          toasts.push({ type: "info", name: shortName });
        }
        if (after.comment && after.comment !== before.comment) {
          toasts.push({ type: "comment", name: shortName });
        }
      });
    }

    if (newlySeen.length > 0) {
      markCharactersAsSeen([...newlySeenIds]);
    }
    if (toasts.length > 0) {
      setProfileToasts(prevToasts => [
        ...prevToasts,
        ...toasts.map(t => ({ ...t, id: ++toastIdSeq })),
      ]);
    }
  }, [enabled, playState, displayedCharacters, characters, allProfiles, isSeen, getRevealedEntries, markCharactersAsSeen]);

  return { profileToasts, dismissProfileToast, resetBaseline };
};
