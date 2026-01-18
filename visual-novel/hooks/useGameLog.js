'use client';

import { useState, useCallback, useRef } from 'react';
import { createLogEntry } from '@/utils/gameLogHelper';

/**
 * 게임 로그 상태 관리 훅
 */
export const useGameLog = () => {
    const [logEntries, setLogEntries] = useState([]);
    // 이미 본 대사를 추적 (sceneId-dialogueIndex 형식) - Ref로 변경하여 리렌더링 방지
    const viewedDialoguesRef = useRef(new Set());

    /**
     * 로그 항목 추가
     */
    const addLogEntry = useCallback((type, data) => {
        const entry = createLogEntry(type, data);
        if (entry) {
            setLogEntries(prev => [...prev, entry]);
        }
    }, []);

    /**
     * 대사 로그 추가 (편의 함수)
     * sceneId와 dialogueIndex를 기반으로 중복 방지
     */
    const addDialogueLog = useCallback((speaker, text, sceneId, dialogueIndex) => {
        const viewKey = `${sceneId}-${dialogueIndex}`;

        // 이미 본 대사면 추가하지 않음
        if (viewedDialoguesRef.current.has(viewKey)) {
            return;
        }

        // 새로운 대사면 로그에 추가하고 viewed 목록에 추가
        addLogEntry('dialogue', { speaker, text, sceneId });
        viewedDialoguesRef.current.add(viewKey);
    }, [addLogEntry]);

    /**
     * 선택지 로그 추가 (편의 함수)
     */
    const addChoiceLog = useCallback((text, sceneId) => {
        addLogEntry('choice', { text, sceneId });
    }, [addLogEntry]);

    /**
     * 로그 초기화
     */
    const clearLog = useCallback(() => {
        setLogEntries([]);
        viewedDialoguesRef.current = new Set();
    }, []);

    /**
     * 최근 N개 로그 가져오기
     */
    const getRecentLogs = useCallback((count) => {
        return logEntries.slice(-count);
    }, [logEntries]);

    /**
     * 로그 일괄 설정 (로드 시 사용)
     */
    const setAllLogs = useCallback((newLogs) => {
        setLogEntries(newLogs || []);
        viewedDialoguesRef.current = new Set();
    }, []);

    return {
        logEntries,
        addLogEntry,
        addDialogueLog,
        addChoiceLog,
        clearLog,
        getRecentLogs,
        setAllLogs,
    };
};
