'use client';

import { useState, useCallback, useMemo } from "react";
import { useGameContext } from "@/contexts/GameContext";

const CG_STORAGE_KEY = "visualNovel_viewed_cgs";

export const useCGAlbum = () => {
  const { storyScenes, cutscenes } = useGameContext();

  // CG 목록: cutscenes 시트 순서대로 { id, name, image }
  // cutscenes 시트가 없으면(구버전 데이터) 씬에서 사용된 컷씬으로 대체
  const allCGs = useMemo(() => {
    if (cutscenes && cutscenes.length > 0) {
      return cutscenes.filter(cg => cg.image);
    }
    if (!storyScenes) return [];
    const seen = new Map();
    storyScenes.forEach(scene => {
      if (!scene.cutsceneImage) return;
      const id = scene.cutsceneId || scene.cutsceneImage;
      if (!seen.has(id)) seen.set(id, { id, name: "", image: scene.cutsceneImage });
    });
    return [...seen.values()].sort((a, b) => a.id.localeCompare(b.id));
  }, [cutscenes, storyScenes]);

  const [viewedCGs, setViewedCGs] = useState(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(CG_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // key: 컷씬ID
  const markCGAsViewed = useCallback((key) => {
    if (!key || typeof window === 'undefined') return;
    setViewedCGs(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      try {
        localStorage.setItem(CG_STORAGE_KEY, JSON.stringify([...next]));
      } catch (e) {
        console.error("Failed to save viewed CGs:", e);
      }
      return next;
    });
  }, []);

  // 구버전에서 파일명으로 저장된 열람 기록도 인정
  const isViewed = useCallback(
    (cg) => !!cg && (viewedCGs.has(cg.id) || viewedCGs.has(cg.image)),
    [viewedCGs]
  );

  return { allCGs, viewedCGs, markCGAsViewed, isViewed };
};
