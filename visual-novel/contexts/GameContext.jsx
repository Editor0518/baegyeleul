'use client';

/**
 * GameContext.jsx - 전역 게임 설정 및 스토리 데이터 관리
 *
 * 음소거 상태, 사용자 상호작용, 스토리 데이터를 전역으로 관리
 * 
 * 구글 스프레드 시트 페이지 불러오는 링크는 PUBLISHED_XLSX_URL의 링크를 바꾸시면 됩니다. (20번줄)
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { setStoryData as setImageCollectorData } from "@/utils/imageCollector";
import { setStoryData as setAffectionHelperData } from "@/utils/affectionHelper";
import { setStoryData as setBackgroundHelperData } from "@/utils/backgroundHelper";
import { setStoryData as setEndingLogicData } from "@/utils/endingLogic";
import { setStoryData as setStoryValidatorData } from "@/utils/storyValidator";
import { setStoryData as setSpeakerHelperData } from "@/utils/speakerHelper";
import { validateStoryData, logValidationErrors } from "@/utils/storyDataValidator";

const PUBLISHED_XLSX_URL =
  process.env.NEXT_PUBLIC_PUBLISHED_XLSX_URL ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhFIcM9RRt_ysKkbY2fajvFzM0tR7qWaE0iiIND7hqj19F5QlBdsef7esYG2BvBdBMbCMAPsnRwB2s/pub?output=xlsx";

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
  const [loadSource, setLoadSource] = useState(null); // "xlsx" 또는 "json"

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

  const loadStoryDataFromXlsx = useCallback(async (onProgress) => {
    onProgress?.(0, LOAD_PROGRESS_TOTAL);

    // 캐시 버스팅 URL 생성
    const cacheBust = `cb=${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const urlWithCacheBust = `${PUBLISHED_XLSX_URL}&${cacheBust}`;

    try {
      const response = await fetch(urlWithCacheBust, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`XLSX 응답 오류: ${response.status} ${response.statusText}`);
      }

      onProgress?.(1, LOAD_PROGRESS_TOTAL);

      const buffer = await response.arrayBuffer();
      onProgress?.(2, LOAD_PROGRESS_TOTAL);

      const xlsxModule = await import("xlsx");
      const XLSX = xlsxModule.default || xlsxModule;
      const { convertXlsxToStoryData } = await import("@/utils/convertXlsxToStoryData");
      const storyDataFromSheet = convertXlsxToStoryData(buffer, XLSX);

      onProgress?.(3, LOAD_PROGRESS_TOTAL);
      return storyDataFromSheet;
    } catch (error) {
      console.error("[GameContext] XLSX URL:", urlWithCacheBust);
      console.error("[GameContext] XLSX 로드 실패:", error.message);
      throw error;
    }
  }, [PUBLISHED_XLSX_URL]);

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
      console.log("[GameContext] PUBLISHED_XLSX_URL:", PUBLISHED_XLSX_URL);
      setLoadProgress({ loaded: 0, total: LOAD_PROGRESS_TOTAL });
      try {
        console.log("[GameContext] XLSX 로드 시도...");
        const data = await loadStoryDataFromXlsx((loaded, total = LOAD_PROGRESS_TOTAL) => {
          setLoadProgress({ loaded, total });
        });
        console.log("[GameContext] ✓ XLSX 로드 성공");
        setLoadSource("xlsx");
        applyStoryData(data);
        return;
      } catch (error) {
        console.warn("[GameContext] XLSX 로드 실패, storyData.json으로 폴백합니다.", error);
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
  }, [applyStoryData, loadStoryDataFromJson, loadStoryDataFromXlsx]);

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
    loadSource, // 디버그용: "xlsx" 또는 "json"
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
