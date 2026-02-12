'use client';

/**
 * GameContext.jsx - 전역 게임 설정 및 스토리 데이터 관리
 *
 * 음소거 상태, 사용자 상호작용, 스토리 데이터를 전역으로 관리
 *
 * 구글 Apps Script 웹앱 URL은 APPS_SCRIPT_URL의 링크를 바꾸시면 됩니다. (20번줄)
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { setStoryData as setImageCollectorData } from "@/utils/imageCollector";
import { setStoryData as setAffectionHelperData } from "@/utils/affectionHelper";
import { setStoryData as setBackgroundHelperData } from "@/utils/backgroundHelper";
import { setStoryData as setEndingLogicData } from "@/utils/endingLogic";
import { setStoryData as setStoryValidatorData } from "@/utils/storyValidator";
import { setStoryData as setSpeakerHelperData } from "@/utils/speakerHelper";
import { validateStoryData, logValidationErrors } from "@/utils/storyDataValidator";

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxaJ91fRVP_nm4Kqdyjs4gW0dKMbVfGl_kkJjGob_Bxmt1QhOvZcsRWYfFevrH9BTvC/exec";

const LOAD_PROGRESS_TOTAL = 4;

const GameContext = createContext(null);

export const GameContextProvider = ({ children }) => {
  // BGM 음소거 상태
  const [isMuted, setIsMuted] = useState(true);

  // 사용자 상호작용 여부 (게임 시작 버튼 클릭 여부)
  const [hasInteracted, setHasInteracted] = useState(false);

  // 스토리 데이터 (public/storyData.json에서 로드)
  const [storyData, setStoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: LOAD_PROGRESS_TOTAL });
  const [loadSource, setLoadSource] = useState(null); // "appsScript" 또는 "json"

  // 검증 결과
  const [validationErrors, setValidationErrors] = useState([]);

  const applyStoryData = useCallback((data) => {
    setStoryData(data);

    setLoadProgress({ loaded: LOAD_PROGRESS_TOTAL, total: LOAD_PROGRESS_TOTAL });

    const errors = validateStoryData(data);
    setValidationErrors(errors);
    logValidationErrors(errors);

    setImageCollectorData(data);
    setAffectionHelperData(data);
    setBackgroundHelperData(data);
    setEndingLogicData(data);
    setStoryValidatorData(data);
    setSpeakerHelperData(data);
    setIsLoading(false);
  }, []);

  const loadStoryDataFromAppsScript = useCallback(async (onProgress) => {
    onProgress?.(0, LOAD_PROGRESS_TOTAL);

    const cacheBust = `cb=${Date.now()}`;
    const url = `${APPS_SCRIPT_URL}?${cacheBust}`;

    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Apps Script 응답 오류: ${response.status} ${response.statusText}`);
      }

      onProgress?.(1, LOAD_PROGRESS_TOTAL);

      const sheetsJson = await response.json();
      onProgress?.(2, LOAD_PROGRESS_TOTAL);

      const { convertSheetsJsonToStoryData } = await import("@/utils/convertXlsxToStoryData");
      const storyData = convertSheetsJsonToStoryData(sheetsJson);

      onProgress?.(3, LOAD_PROGRESS_TOTAL);
      return storyData;
    } catch (error) {
      console.error("[GameContext] Apps Script URL:", url);
      console.error("[GameContext] Apps Script 로드 실패:", error.message);
      throw error;
    }
  }, []);

  const loadStoryDataFromJson = useCallback(async () => {
    const timestamp = Date.now();
    const response = await fetch(`storyData.json?v=${timestamp}`, {
      cache: "no-cache",
    });
    if (!response.ok) {
      throw new Error(`Failed to load story data: ${response.status}`);
    }
    return response.json();
  }, []);

  // 스토리 데이터 로드
  useEffect(() => {
    const loadStoryData = async () => {
      console.log("[GameContext] 스토리 데이터 로드 시작");
      console.log("[GameContext] APPS_SCRIPT_URL:", APPS_SCRIPT_URL);
      setLoadProgress({ loaded: 0, total: LOAD_PROGRESS_TOTAL });
      try {
        console.log("[GameContext] Apps Script 로드 시도...");
        const data = await loadStoryDataFromAppsScript((loaded, total = LOAD_PROGRESS_TOTAL) => {
          setLoadProgress({ loaded, total });
        });

        // 데이터 유효성 검사
        const errors = validateStoryData(data);
        const hasCriticalErrors = errors.some(e => e.severity === 'error');

        if (hasCriticalErrors) {
          console.warn("[GameContext] Apps Script 데이터에 치명적인 오류가 있어 storyData.json으로 폴백합니다.", errors);
          throw new Error("Apps Script validation failed");
        }

        console.log("[GameContext] ✓ Apps Script 로드 성공");
        setLoadSource("appsScript");
        applyStoryData(data);
        return;
      } catch (error) {
        console.warn("[GameContext] Apps Script 로드 실패, storyData.json으로 폴백합니다.", error);
      }

      try {
        console.log("[GameContext] JSON 폴백 시작...");
        setLoadProgress({ loaded: LOAD_PROGRESS_TOTAL - 1, total: LOAD_PROGRESS_TOTAL });
        const data = await loadStoryDataFromJson();
        console.log("[GameContext] ✓ JSON 로드 성공 (폴백)");
        setLoadSource("json");
        applyStoryData(data);
      } catch (error) {
        console.error("[GameContext] 스토리 데이터 로드 실패:", error);
        setLoadError(error.message);
        setIsLoading(false);
      }
    };

    loadStoryData();
  }, [applyStoryData, loadStoryDataFromJson, loadStoryDataFromAppsScript]);

  // 음소거 토글 함수
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const value = {
    isMuted,
    setIsMuted,
    toggleMute,
    hasInteracted,
    setHasInteracted,
    // 스토리 데이터
    storyData,
    isLoading,
    loadError,
    loadProgress,
    loadSource, // 디버그용: "appsScript" 또는 "json"
    // 검증 결과
    validationErrors,
    // 개별 데이터 접근용 헬퍼
    gameInfo: storyData?.gameInfo,
    characters: storyData?.characters,
    places: storyData?.places,
    storyScenes: storyData?.storyScenes,
    endingConfig: storyData?.endingConfig,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// GameContext를 쉽게 사용하기 위한 커스텀 훅
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameContextProvider");
  }
  return context;
};
