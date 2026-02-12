'use client';

import { useState, useCallback, useMemo } from "react";
import { useGameContext } from "@/contexts/GameContext";

const CG_STORAGE_KEY = "visualNovel_viewed_cgs";

export const useCGAlbum = () => {
  const { storyScenes } = useGameContext();

  const allCGs = useMemo(() => {
    if (!storyScenes) return [];
    return [...new Set(
      storyScenes
        .map(scene => scene.cutsceneImage)
        .filter(Boolean)
    )].sort();
  }, [storyScenes]);

  const [viewedCGs, setViewedCGs] = useState(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(CG_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markCGAsViewed = useCallback((filename) => {
    if (!filename || typeof window === 'undefined') return;
    setViewedCGs(prev => {
      if (prev.has(filename)) return prev;
      const next = new Set(prev);
      next.add(filename);
      try {
        localStorage.setItem(CG_STORAGE_KEY, JSON.stringify([...next]));
      } catch (e) {
        console.error("Failed to save viewed CGs:", e);
      }
      return next;
    });
  }, []);

  const isViewed = useCallback((filename) => viewedCGs.has(filename), [viewedCGs]);

  return { allCGs, viewedCGs, markCGAsViewed, isViewed };
};
