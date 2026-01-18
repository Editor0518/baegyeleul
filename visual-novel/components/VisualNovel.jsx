'use client';

/**
 * VisualNovel.jsx - 비주얼 노벨 메인 컴포넌트
 *
 * 씬 구조:
 * - type: "normal" | "choice" | "ending"
 * - dialogues: 대사 배열 (이전 dialogue 단일 객체도 자동 변환)
 * - characters: 씬/대사 레벨 캐릭터 표시
 * - cutscene: 컷신 이미지 표시 (모든 씬 타입에서 사용 가능)
 * - checkAffection: 호감도 기반 엔딩 분기
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useGameState } from "@/hooks/useGameState";
import { useAffection } from "@/hooks/useAffection";
import { useDialogueState } from "@/hooks/useDialogueState";
import { useEndingState } from "@/hooks/useEndingState";
import { useCharacterDisplay } from "@/hooks/useCharacterDisplay";
import { useModal, MODAL_TYPES } from "@/hooks/useModal";
import { useGameContext } from "@/contexts/GameContext";
import { useBGM } from "@/hooks/useBGM";
import { useImagePreloader, useTitleScreenPreloader, useSceneBackgroundPreloader } from "@/hooks/useImagePreloader";
import { useVariables } from "@/hooks/useVariables";
import { useGameLog } from "@/hooks/useGameLog";
import { useChoicePagination } from "@/hooks/useChoicePagination";
import { getBackgroundStyle } from "@/utils/backgroundHelper";
import { validateSceneFlow, validateEndingInfo } from "@/utils/storyValidator";
import { clampAffection } from "@/utils/affectionHelper";
import { parseCommand, executeCommand, evaluateShowIf } from "@/utils/variableHelper";
import {
  ENDING_ERROR_MESSAGES,
  STORY_ERROR_MESSAGES,
  CONFIRM_MESSAGES,
} from "@/constants/endingConfig";
import {
  normalizeDialogues,
  computeCurrentCharacters,
  shouldShowCutscene as computeShouldShowCutscene,
  shouldShowChoices as computeShouldShowChoices,
} from "@/utils/sceneHelpers";
import { collectSceneImages, collectTitleScreenImages } from "@/utils/imageCollector";
import { preloadImagesBlocking } from "@/utils/imagePreloader";
import { parseEndingFromSceneId } from "@/utils/endingLogic";
import AffectionDisplay from "./AffectionDisplay";
import EndingResult from "./EndingResult";
import TitleScreen from "./TitleScreen";
import GameHeader from "./GameHeader";
import GameModals from "./GameModals";
import SceneContent from "./SceneContent";
import InitialLoadingScreen from "./InitialLoadingScreen";
import InGameLoadingScreen from "./InGameLoadingScreen";
import ValidationPanel from "./ValidationPanel";
import "./VisualNovel.css";

const VisualNovel = () => {
  const { currentScene, currentSceneId, goToScene, resetGame, resetToTitle, history, setHistory, choiceHistory, setChoiceHistory, recordChoice } =
    useGameState();
  const { affection, updateAffection, resetAffection, setAffection } =
    useAffection();
  const {
    variables,
    setVariable,
    getVariable,
    deleteVariable,
    addToVariable,
    resetVariables,
    setAllVariables
  } = useVariables();
  const {
    logEntries,
    addDialogueLog,
    addChoiceLog,
    clearLog,
    setAllLogs
  } = useGameLog();
  const { activeModal, modalData, openModal, closeModal } = useModal();
  const {
    isMuted,
    toggleMute,
    hasInteracted,
    setHasInteracted,
    storyData,
    isLoading: isStoryDataLoading,
    loadError,
    loadProgress,
    characters,
    places,
    gameInfo,
    storyScenes,
  } = useGameContext();

  const [showTitleScreen, setShowTitleScreen] = useState(true);

  // 대사 관련 상태 (커스텀 훅)
  const {
    dialogueIndex,
    showReaction,
    currentReaction,
    pendingNextScene,
    setDialogueIndex,
    incrementDialogueIndex,
    startReaction,
    endReaction,
    resetDialogueState,
  } = useDialogueState(currentSceneId, currentScene);

  // 엔딩 관련 상태 및 로직 (커스텀 훅)
  const lines = useMemo(() => normalizeDialogues(currentScene), [currentScene]);

  // handleStoryError를 useRef로 관리하여 순환 의존성 해결
  const handleStoryErrorRef = useRef();

  const handleStoryError = useCallback((errorMessage) => {
    if (handleStoryErrorRef.current) {
      handleStoryErrorRef.current(errorMessage);
    }
  }, []);

  const {
    endingInfo,
    showEndingResult,
    computedEndingSceneId,
    setEndingInfo,
    resetEndingState,
    showEnding,
  } = useEndingState(
    currentScene,
    currentSceneId,
    affection,
    lines,
    dialogueIndex,
    handleStoryError
  );

  // 캐릭터 디스플레이 관련 상태 (커스텀 훅)
  // 씬 전환 시 dialogueIndex가 아직 리셋되지 않았을 수 있으므로 안전하게 처리
  const safeDialogueIndex = Math.min(dialogueIndex, Math.max(0, lines.length - 1));
  const currentLine = lines.length > 0 ? (lines[safeDialogueIndex] || null) : null;

  // 디버그: currentLine이 null인 경우 추적
  if (lines.length > 0 && !currentLine) {
    console.log('[VisualNovel] currentLine is null!', {
      sceneId: currentSceneId,
      linesLength: lines.length,
      dialogueIndex,
      safeDialogueIndex,
      lines: lines,
      lineAtSafeIndex: lines[safeDialogueIndex]
    });
  }

  const isChoiceScene = currentScene?.type === "choice";
  const shouldShowChoices = useMemo(
    () => computeShouldShowChoices(isChoiceScene, lines.length, dialogueIndex),
    [isChoiceScene, lines.length, dialogueIndex]
  );
  const dialogueForChoice = useMemo(() => {
    if (!shouldShowChoices || lines.length === 0) return null;
    return lines[lines.length - 1];
  }, [shouldShowChoices, lines]);

  // 디버깅: 씬 전환 시 대사 상태 추적
  React.useEffect(() => {
    console.log('[VisualNovel] Scene/Dialogue State:', {
      sceneId: currentSceneId,
      sceneType: currentScene?.type,
      linesLength: lines.length,
      dialogueIndex,
      safeDialogueIndex,
      currentLine: currentLine ? { speaker: currentLine.speaker, text: currentLine.text?.substring(0, 30) } : null,
      shouldShowChoices,
      dialogueForChoice: dialogueForChoice ? { speaker: dialogueForChoice.speaker, text: dialogueForChoice.text?.substring(0, 30) } : null,
    });
  }, [currentSceneId, currentScene?.type, lines.length, dialogueIndex, safeDialogueIndex, currentLine, shouldShowChoices, dialogueForChoice]);

  const {
    displayCharacters,
    displayedCharacters,
    loadedPlace,
    setLoadedPlace,
    resetCharacterDisplay,
    updateDisplayedCharacters,
  } = useCharacterDisplay(currentSceneId, currentLine);

  const currentCharacters = useMemo(
    () =>
      computeCurrentCharacters({
        showReaction,
        currentReaction,
        currentLine,
        dialogueForChoice,
        shouldShowChoices,
        displayCharacters,
      }),
    [
      showReaction,
      currentReaction,
      currentLine,
      dialogueForChoice,
      shouldShowChoices,
      displayCharacters,
    ]
  );

  // 선택지 필터링 (show_if 조건 평가)
  const filteredChoices = useMemo(() => {
    if (!currentScene?.choices) return [];

    return currentScene.choices.filter(choice => {
      if (!choice.show_if) return true;

      return evaluateShowIf(choice.show_if, variables, affection, history, choiceHistory);
    });
  }, [currentScene, variables, affection, history, choiceHistory]);

  // 선택지 페이지네이션 (5개 이상일 때 3+1 구조)
  const {
    paginatedChoices,
    handleChoiceClick: handlePaginatedChoice,
    isRefreshing,
  } = useChoicePagination(filteredChoices, currentSceneId);

  // 캐릭터 표시 업데이트
  React.useEffect(() => {
    updateDisplayedCharacters(currentCharacters);
  }, [currentCharacters, updateDisplayedCharacters]);

  // handleStoryError 실제 구현 설정 (모든 reset 함수가 선언된 후)
  useEffect(() => {
    handleStoryErrorRef.current = (errorMessage) => {
      console.error("[Story Error]", errorMessage);
      openModal(MODAL_TYPES.STORY_ERROR, {
        message: CONFIRM_MESSAGES.STORY_ERROR(errorMessage),
        onConfirm: () => {
          closeModal();
          resetToTitle();
          setShowTitleScreen(true);
          resetAffection();
          resetDialogueState();
          resetEndingState();
          resetCharacterDisplay();
        },
      });
    };
  }, [
    openModal,
    closeModal,
    resetToTitle,
    setShowTitleScreen,
    resetAffection,
    resetDialogueState,
    resetEndingState,
    resetCharacterDisplay,
  ]);

  // BGM 관리
  const { audioRef, currentBGMRef } = useBGM({
    currentScene,
    currentSceneId,
    showTitleScreen,
    isMuted,
    hasInteracted,
    titleBGM: gameInfo?.backgroundMusic,
  });

  // 타이틀 화면 이미지 preload (차단형)
  const titleImages = useMemo(() => {
    return [...collectTitleScreenImages(), ...collectSceneImages("scene1")];
  }, []);

  const { isLoading: isTitleLoading, isReady: isTitleReady, progress: titleProgress } =
    useTitleScreenPreloader(titleImages, showTitleScreen);

  // Scene 배경 이미지 preload (비차단형 - 백그라운드에서 preload)
  // 배경은 준비되면 자연스럽게 전환, 로딩 중에도 화면 유지
  const { isReady: isSceneReady } = useSceneBackgroundPreloader(currentScene?.place);

  // 일반 이미지 preload 관리 (백그라운드)
  const { clearCache: clearImageCache } = useImagePreloader(currentSceneId, dialogueIndex, {
    enabled: !showTitleScreen && isSceneReady, // 타이틀 화면이 아니고 scene 배경이 준비되었을 때만 활성화
    lookAheadDialogues: 5, // 현재 scene에서 앞으로 5개 dialogue까지 preload
    lookAheadScenes: 2, // 다음 2개 scene까지 preload
  });

  // 파생 상태
  const currentPlaceId = useMemo(() => {
    if (loadedPlace) return loadedPlace;
    if (currentScene?.place && places[currentScene.place]) {
      return currentScene.place;
    }
    return "default";
  }, [currentScene, loadedPlace]);

  // 배경이 준비된 경우에만 업데이트, 아니면 이전 배경 유지
  const previousPlaceIdRef = useRef(currentPlaceId);
  const effectivePlaceId = useMemo(() => {
    if (isSceneReady) {
      previousPlaceIdRef.current = currentPlaceId;
      return currentPlaceId;
    }
    // 배경이 준비되지 않았으면 이전 배경 유지
    return previousPlaceIdRef.current;
  }, [currentPlaceId, isSceneReady]);

  const currentBackgroundStyle = useMemo(
    () => getBackgroundStyle(effectivePlaceId),
    [effectivePlaceId]
  );

  const shouldShowCutscene = useMemo(
    () => computeShouldShowCutscene(currentScene, currentLine),
    [currentScene, currentLine]
  );

  // 게임 상태 리셋 통합 함수
  const resetGameState = useCallback(
    (resetType) => {
      if (resetType === "restart") {
        resetGame();
        setShowTitleScreen(false);
        setHasInteracted(true);
      } else {
        resetToTitle();
        setShowTitleScreen(true);
        if (audioRef.current) {
          currentBGMRef.current = null;
        }
      }
      resetAffection();
      resetEndingState();
      resetDialogueState();
      resetCharacterDisplay();
      resetVariables();
      clearLog();
      clearImageCache(); // 이미지 preload 캐시 초기화
    },
    [
      resetGame,
      resetToTitle,
      resetAffection,
      resetEndingState,
      resetDialogueState,
      resetCharacterDisplay,
      resetVariables,
      clearLog,
      setHasInteracted,
      audioRef,
      currentBGMRef,
      clearImageCache,
    ]
  );

  // 엔딩 씬 전환 처리 (이미지 preload 대기)
  const [isPreloadingEnding, setIsPreloadingEnding] = React.useState(false);

  React.useEffect(() => {
    if (!computedEndingSceneId) return;

    if (computedEndingSceneId === "VALIDATION_ERROR") {
      queueMicrotask(() => {
        handleStoryError(ENDING_ERROR_MESSAGES.VALIDATION_ERROR);
      });
      return;
    }
    if (computedEndingSceneId === "SCENE_ID_ERROR") {
      queueMicrotask(() => {
        handleStoryError(ENDING_ERROR_MESSAGES.SCENE_ID_ERROR);
      });
      return;
    }
    if (computedEndingSceneId === "SCENE_NOT_FOUND") {
      queueMicrotask(() => {
        handleStoryError(ENDING_ERROR_MESSAGES.SCENE_NOT_FOUND);
      });
      return;
    }

    // ending scene의 이미지를 먼저 preload한 후 전환
    const preloadAndTransition = async () => {
      setIsPreloadingEnding(true);

      try {
        // ending scene의 이미지 수집
        const endingImages = collectSceneImages(computedEndingSceneId);

        if (endingImages.length > 0) {
          console.log(
            `[VisualNovel] Preloading ${endingImages.length} images for ending scene: ${computedEndingSceneId}`
          );

          // 차단형 preload (모든 이미지가 로드될 때까지 대기)
          const result = await preloadImagesBlocking(endingImages, { timeout: 15000 });

          if (result.success) {
            console.log("[VisualNovel] Ending scene images preloaded successfully");
          } else {
            console.warn(
              `[VisualNovel] Some ending images failed to load: ${result.failed.length}/${result.total}`
            );
          }
        }

        // 이미지 로드 완료 후 scene 전환
        goToScene(computedEndingSceneId);
      } catch (error) {
        console.error("[VisualNovel] Error preloading ending scene:", error);
        // 에러가 나도 전환은 진행
        goToScene(computedEndingSceneId);
      } finally {
        setIsPreloadingEnding(false);
      }
    };

    preloadAndTransition();
  }, [computedEndingSceneId, goToScene, handleStoryError]);

  // 엔딩 씬 진입 시 endingInfo 자동 생성 (checkAffection 없이 진입한 경우)
  React.useEffect(() => {
    if (currentScene?.type !== "ending") return;
    if (endingInfo) return; // 이미 endingInfo가 있으면 무시
    if (showEndingResult) return; // 이미 엔딩 표시 중이면 무시

    // 씬 ID로부터 엔딩 정보 생성
    const parsedEndingInfo = parseEndingFromSceneId(currentSceneId);

    if (parsedEndingInfo && validateEndingInfo(parsedEndingInfo)) {
      queueMicrotask(() => {
        setEndingInfo(parsedEndingInfo);
      });
    } else {
      // 파싱 실패 시 에러
      queueMicrotask(() => {
        handleStoryError(`엔딩 씬 ID "${currentSceneId}"로부터 엔딩 정보를 생성할 수 없습니다.`);
      });
    }
  }, [currentScene, currentSceneId, endingInfo, showEndingResult, setEndingInfo, handleStoryError]);

  // 엔딩 씬에서 dialogues가 비어있거나 모두 재생한 경우 자동으로 엔딩 표시
  React.useEffect(() => {
    if (currentScene?.type !== "ending") return;
    if (showEndingResult) return; // 이미 엔딩 표시 중이면 무시
    if (!endingInfo) return; // endingInfo가 없으면 대기 (위의 useEffect에서 생성 중)

    // dialogues가 비어있는 경우만 자동 표시
    // 대사가 있는 경우는 사용자가 모든 대사를 읽고 진행 버튼을 눌러야 함
    if (lines.length === 0) {
      // endingInfo 검증
      if (!validateEndingInfo(endingInfo)) {
        queueMicrotask(() => {
          handleStoryError(ENDING_ERROR_MESSAGES.RESULT_DISPLAY_ERROR);
        });
        return;
      }

      // 자동으로 엔딩 표시
      queueMicrotask(() => {
        showEnding();
      });
    }
  }, [currentScene, lines.length, showEndingResult, endingInfo, showEnding, handleStoryError]);

  // 마지막으로 로그에 추가한 대사 추적 (중복 방지)
  const lastLoggedDialogueRef = React.useRef(null);

  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const choiceHistoryRef = useRef(choiceHistory);
  useEffect(() => {
    choiceHistoryRef.current = choiceHistory;
  }, [choiceHistory]);

  // 마지막으로 실행한 명령어 추적 (무한 루프 방지)
  const lastExecutedCommandRef = useRef(null);

  // 변수/호감도 통합 업데이트 함수
  const handleAddToVariable = useCallback((name, amount) => {
    // characters에 존재하고 nonPlayable이 아니면 호감도로 처리
    const isCharacter = characters && characters[name] && !characters[name].nonPlayable;

    if (isCharacter) {
      updateAffection({ [name]: amount });
    } else {
      // 아니면 일반 변수 업데이트
      addToVariable(name, amount);
    }
  }, [characters, updateAffection, addToVariable]);

  // 대사 로그 추가 및 명령어 실행
  React.useEffect(() => {
    if (!currentLine || showReaction) return;

    // 대사 로그 추가 (중복 방지)
    if (currentLine.speaker && currentLine.text) {
      const logKey = `${currentSceneId}-${dialogueIndex}-${currentLine.speaker}-${currentLine.text}`;

      // 씬 전환 직후 dialogueIndex가 리셋되기 전에 잘못된 대사가 로그되는 것을 방지
      // prevKey가 null이면 새로운 씬 시작이므로 dialogueIndex가 0이어야 함
      if (lastLoggedDialogueRef.current === null && dialogueIndex !== 0) {
        return;
      }

      // 이미 기록한 대사가 아닐 때만 추가
      if (lastLoggedDialogueRef.current !== logKey) {
        addDialogueLog(currentLine.speaker, currentLine.text, currentSceneId);
        lastLoggedDialogueRef.current = logKey;
      }
    }

    // 명령어 실행
    if (currentLine.command) {
      const commandKey = `${currentSceneId}-${dialogueIndex}-${currentLine.command}`;

      // 이미 실행한 명령어면 건너뜀 (상태 변경으로 인한 재실행 방지)
      if (lastExecutedCommandRef.current === commandKey) {
        return;
      }

      const parsedCommand = parseCommand(currentLine.command);
      if (parsedCommand) {
        const context = {
          variables,
          affection,
          history: historyRef.current, // Use ref here
          choiceHistory: choiceHistoryRef.current, // Use ref here
          setVariable,
          getVariable,
          deleteVariable,
          addToVariable: handleAddToVariable, // Use wrapper function
        };

        const result = executeCommand(parsedCommand, context);

        // 명령어 실행 기록
        lastExecutedCommandRef.current = commandKey;

        // 명령어 실행 (변수 설정 등은 즉시 실행, 씬 전환은 handleNext에서 처리)
        // if/ifs 명령어의 씬 전환은 handleNext에서 처리되므로 여기서는 무시
      }
    }
  }, [currentLine, currentSceneId, dialogueIndex, showReaction, variables, affection, addDialogueLog, setVariable, getVariable, deleteVariable, addToVariable, goToScene, handleAddToVariable]); // history removed from dependency

  // 이벤트 핸들러
  const handleNext = useCallback(() => {
    console.log('[handleNext] Called', { sceneId: currentSceneId, dialogueIndex, linesLength: lines.length });

    // 엔딩 결과가 표시 중이면 아무 동작도 하지 않음 (강제 종료)
    if (showEndingResult) {
      console.log('[handleNext] Blocked: showEndingResult is true');
      return;
    }

    // 현재 대사의 명령어 먼저 실행 (if/ifs 등)
    let commandNextScene = null;
    if (currentLine?.command) {
      console.log('[handleNext] Executing command:', currentLine.command);
      const parsedCommand = parseCommand(currentLine.command);
      if (parsedCommand) {
        const context = {
          variables,
          affection,
          history,
          choiceHistory,
          setVariable,
          getVariable,
          deleteVariable,
          addToVariable,
        };

        const result = executeCommand(parsedCommand, context);
        console.log('[handleNext] Command result:', result);

        // 명령어 실행 결과로 씬 분기가 있으면 우선 적용
        if (result.nextScene && !result.shouldContinue) {
          commandNextScene = result.nextScene;
          console.log('[handleNext] Command triggered scene change to:', commandNextScene);
        }
      } else {
        console.log('[handleNext] Failed to parse command');
      }
    }

    // 명령어로 씬 전환이 결정되었으면 즉시 이동
    if (commandNextScene) {
      console.log('[handleNext] Going to next scene:', commandNextScene, '(from command)');
      goToScene(commandNextScene);
      return;
    }

    // 명령어가 없거나 씬 전환이 없으면 대사 진행
    if (lines.length > 0 && dialogueIndex < lines.length - 1) {
      console.log('[handleNext] Incrementing dialogueIndex');
      incrementDialogueIndex();
      return;
    }

    if (isChoiceScene && dialogueIndex >= lines.length - 1) {
      if (dialogueIndex === lines.length - 1) {
        incrementDialogueIndex();
      }
      return;
    }

    if (currentScene?.type === "ending") {
      if (!endingInfo || !validateEndingInfo(endingInfo)) {
        handleStoryError(ENDING_ERROR_MESSAGES.RESULT_DISPLAY_ERROR);
        return;
      }
      showEnding();
      return;
    }

    if (currentScene?.checkAffection) {
      console.log('[handleNext] Blocked: checkAffection is true');
      return;
    }

    // 기본 next로 씬 전환 (명령어로 씬 전환이 결정되지 않은 경우)
    const nextSceneId = currentScene?.next;

    if (nextSceneId) {
      console.log('[handleNext] Going to next scene:', nextSceneId, '(from scene.next)');
      goToScene(nextSceneId);
    } else {
      console.log('[handleNext] No next scene found');
      const validation = validateSceneFlow(currentScene);
      if (!validation.isValid) {
        handleStoryError(STORY_ERROR_MESSAGES.FLOW_ERROR(validation.error));
      }
    }
  }, [
    isChoiceScene,
    lines.length,
    dialogueIndex,
    currentScene,
    currentLine,
    endingInfo,
    handleStoryError,
    goToScene,
    incrementDialogueIndex,
    showEnding,
    showEndingResult,
    variables,
    affection,
    history,
    choiceHistory,
    setVariable,
    getVariable,
    deleteVariable,
    addToVariable,
  ]);

  const handleChoice = useCallback(
    (choice, index) => {
      // 선택지 로그 추가
      addChoiceLog(choice.text, currentSceneId);

      if (choice.affectionChanges) {
        updateAffection(choice.affectionChanges);
      }

      // 명령어 실행
      let commandNextScene = null;
      if (choice.command) {
        const parsedCommand = parseCommand(choice.command);
        if (parsedCommand) {
          const context = {
            variables,
            affection,
            setVariable,
            getVariable,
            deleteVariable,
            addToVariable,
          };

          const result = executeCommand(parsedCommand, context);

          // 명령어 실행 결과로 씬 분기가 있으면 우선 적용
          if (result.nextScene && !result.shouldContinue) {
            commandNextScene = result.nextScene;
          }
        }
      }

      const nextSceneId = commandNextScene || choice.next || currentScene?.next;

      // 디버그 로그
      console.log('[handleChoice] Choice info:', {
        choiceText: choice.text,
        command: choice.command,
        commandNextScene,
        choiceNext: choice.next,
        currentSceneNext: currentScene?.next,
        finalNextSceneId: nextSceneId
      });

      if (!nextSceneId) {
        handleStoryError(STORY_ERROR_MESSAGES.CHOICE_ERROR(choice.text));
        return;
      }

      // 선택지 기록 (1-based index)
      recordChoice(currentSceneId, index + 1);

      // reaction이 있고 텍스트가 비어있지 않으면 reaction 표시
      if (choice.reaction && choice.reaction.text && choice.reaction.text.trim() !== "") {
        // reaction 대사도 로그에 추가
        addDialogueLog(choice.reaction.speaker || 'narrator', choice.reaction.text, currentSceneId);

        // reaction 대사를 기록했으므로 ref 업데이트 (중복 방지)
        // reaction은 별도 표시이므로 특별한 키 형식 사용
        const reactionLogKey = `reaction-${currentSceneId}-${choice.reaction.speaker}-${choice.reaction.text}`;
        lastLoggedDialogueRef.current = reactionLogKey;

        startReaction(choice.reaction, nextSceneId, false);
      } else {
        // reactionText가 비어있으면 바로 다음 씬으로 이동
        goToScene(nextSceneId);
      }
    },
    [updateAffection, goToScene, handleStoryError, currentScene, currentSceneId, startReaction, addChoiceLog, addDialogueLog, variables, affection, setVariable, getVariable, deleteVariable, addToVariable]
  );

  // 페이지네이션을 포함한 선택지 핸들러
  const handleChoiceWithPagination = useCallback((choice, index) => {
    handlePaginatedChoice(choice, index, handleChoice);
  }, [handlePaginatedChoice, handleChoice]);

  const handleReactionNext = useCallback(() => {
    const nextScene = endReaction();
    if (nextScene) {
      // reaction 후 다음 씬으로 이동할 때 ref 리셋
      // 이렇게 하면 다음 씬의 첫 대사가 정상적으로 로그에 추가됨
      lastLoggedDialogueRef.current = null;
      goToScene(nextScene);
    }
  }, [endReaction, goToScene]);

  const handleRestartGame = useCallback(() => {
    resetGameState("restart");
  }, [resetGameState]);

  const handleConfirmResetToTitle = useCallback(() => {
    openModal(MODAL_TYPES.CONFIRM, {
      message: CONFIRM_MESSAGES.RESET_TO_TITLE,
      onConfirm: () => {
        closeModal();
        resetGameState("title");
      },
    });
  }, [openModal, closeModal, resetGameState]);

  const handleStartGame = useCallback(() => {
    setShowTitleScreen(false);
    setHasInteracted(true);
    goToScene("scene1");
  }, [goToScene, setHasInteracted]);

  const handleToggleMuteOnTitle = useCallback(() => {
    toggleMute();
    if (isMuted) {
      setHasInteracted(true);
    }
  }, [toggleMute, isMuted, setHasInteracted]);

  const handleOpenSave = useCallback(() => {
    openModal(MODAL_TYPES.SAVE_LOAD, { mode: "save" });
  }, [openModal]);

  const handleOpenLoad = useCallback(() => {
    openModal(MODAL_TYPES.SAVE_LOAD, { mode: "load" });
  }, [openModal]);

  const handleOpenLog = useCallback(() => {
    openModal(MODAL_TYPES.GAME_LOG);
  }, [openModal]);

  const getCurrentGameState = useCallback(() => {
    return {
      currentSceneId,
      affection,
      endingInfo,
      showEndingResult,
      dialogueIndex,
      currentPlace: currentPlaceId,
      showReaction,
      currentReaction,
      pendingNextScene,
      displayCharacters,
      displayedCharacters,
      variables,
      logEntries,
      history, // Added history to save state
      choiceHistory, // Added choiceHistory to save state
    };
  }, [
    currentSceneId,
    affection,
    endingInfo,
    showEndingResult,
    dialogueIndex,
    currentPlaceId,
    showReaction,
    currentReaction,
    pendingNextScene,
    displayCharacters,
    displayedCharacters,
    variables,
    logEntries,
    history, // Added history to dependency array
    choiceHistory, // Added choiceHistory to dependency array
  ]);

  const handleLoadGameState = useCallback(
    (saveData) => {
      if (!saveData || !saveData.sceneId) {
        console.warn("handleLoadGameState: invalid save data", saveData);
        return;
      }

      setShowTitleScreen(false);
      setHasInteracted(true);
      goToScene(saveData.sceneId);

      const loadedAffection = saveData.affection || {};
      const fixedAffection = {};
      const characterList = Array.isArray(characters)
        ? characters
        : characters
          ? Object.values(characters)
          : [];

      characterList.forEach((char) => {
        const raw = loadedAffection[char.id] ?? char.initialAffection ?? 0;
        fixedAffection[char.id] = clampAffection(char.id, raw);
      });
      setAffection(fixedAffection);

      setEndingInfo(saveData.endingInfo);
      setDialogueIndex(saveData.dialogueIndex ?? 0);

      const placeId =
        saveData.currentPlace && places && places[saveData.currentPlace]
          ? saveData.currentPlace
          : "default";
      setLoadedPlace(placeId);

      // 변수 로드
      if (saveData.variables) {
        setAllVariables(saveData.variables);
      } else {
        resetVariables();
      }

      // 방문 기록 로드
      if (saveData.history) {
        setHistory(saveData.history);
      } else {
        // 하위 호환성: 없으면 현재 씬만 포함
        setHistory([saveData.sceneId]);
      }

      // 선택지 기록 로드
      if (saveData.choiceHistory) {
        setChoiceHistory(saveData.choiceHistory);
      } else {
        setChoiceHistory({});
      }

      // 로그 로드
      if (saveData.logEntries) {
        setAllLogs(saveData.logEntries);

        // 로그를 불러온 후 ref 업데이트하여 중복 기록 방지
        // 현재 로드된 씬과 대사 인덱스를 기반으로 마지막 로그 키 설정
        const loadedScene = storyScenes.find(s => s.id === saveData.sceneId);
        if (loadedScene && loadedScene.dialogues && loadedScene.dialogues.length > 0) {
          const loadedDialogueIndex = saveData.dialogueIndex ?? 0;
          // 선택지가 표시된 상태에서 저장했을 경우 dialogueIndex가 배열 길이를 초과할 수 있음
          // 이 경우 마지막 대사를 사용
          const actualIndex = Math.min(loadedDialogueIndex, loadedScene.dialogues.length - 1);
          const loadedDialogue = loadedScene.dialogues[actualIndex];
          if (loadedDialogue) {
            const logKey = `${saveData.sceneId}-${actualIndex}-${loadedDialogue.speaker}-${loadedDialogue.text}`;
            lastLoggedDialogueRef.current = logKey;
          }
        }
      } else {
        clearLog();
        lastLoggedDialogueRef.current = null;
      }

      closeModal();
    },
    [
      goToScene,
      setAffection,
      setEndingInfo,
      setDialogueIndex,
      setLoadedPlace,
      closeModal,
      setHasInteracted,
      setAllVariables,
      resetVariables,
      setAllLogs,
      clearLog,
      storyScenes,
    ]
  );

  // 렌더링
  // storyData 로딩 중이거나 에러 발생 시 로딩 화면 표시
  if (isStoryDataLoading || !storyData) {
    return <InitialLoadingScreen progress={loadProgress} />;
  }

  // storyData 로드 실패 시 에러 표시
  if (loadError) {
    return (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        <h2>스토리 데이터를 불러오는 데 실패했습니다</h2>
        <p>{loadError}</p>
      </div>
    );
  }

  if (showTitleScreen) {
    // 타이틀 이미지가 로딩 중이면 초기 로딩 화면 표시
    if (isTitleLoading || !isTitleReady) {
      return <InitialLoadingScreen progress={titleProgress} />;
    }

    return (
      <>
        <ValidationPanel showOnTitleScreen={true} />
        <TitleScreen
          onStart={handleStartGame}
          onLoad={handleOpenLoad}
          isMuted={isMuted}
          onToggleMute={handleToggleMuteOnTitle}
        />
        <GameModals
          activeModal={activeModal}
          modalData={modalData}
          onCloseModal={closeModal}
          onLoad={handleLoadGameState}
          currentGameState={getCurrentGameState()}
          logEntries={logEntries}
        />
      </>
    );
  }

  return (
    <>
      <div className="visual-novel" style={currentBackgroundStyle}>
        <div className="game-container">
          {currentScene && (
            <>
              {/* <AffectionDisplay affection={affection} /> */}

              <GameHeader
                currentPlaceId={currentPlaceId}
                onSaveClick={handleOpenSave}
                onLoadClick={handleOpenLoad}
                onLogClick={handleOpenLog}
                onResetClick={handleConfirmResetToTitle}
                isMuted={isMuted}
                onToggleMute={toggleMute}
              />

              <SceneContent
                displayedCharacters={displayedCharacters}
                shouldShowCutscene={shouldShowCutscene}
                currentScene={currentScene}
                showReaction={showReaction}
                currentReaction={currentReaction}
                handleReactionNext={handleReactionNext}
                shouldShowChoices={shouldShowChoices}
                dialogueForChoice={dialogueForChoice}
                currentLine={currentLine}
                handleNext={handleNext}
                onChoice={handleChoiceWithPagination}
                filteredChoices={paginatedChoices}
                isRefreshing={isRefreshing}
              />

              {showEndingResult && endingInfo && (
                <EndingResult
                  endingInfo={endingInfo}
                  affection={affection}
                  onRestart={handleRestartGame}
                  onBackToTitle={() => resetGameState("title")}
                />
              )}

              <GameModals
                activeModal={activeModal}
                modalData={modalData}
                onCloseModal={closeModal}
                onLoad={handleLoadGameState}
                currentGameState={getCurrentGameState()}
                logEntries={logEntries}
              />
            </>
          )}

          {/* 게임 진행 중 로딩 화면 - 오버레이로 표시 */}
          {(isPreloadingEnding || !currentScene) && (
            <InGameLoadingScreen
              message={!currentScene ? "씬을 불러오는 중..." : "엔딩을 준비하는 중..."}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default VisualNovel;
