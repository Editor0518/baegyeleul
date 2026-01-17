'use client';

import { useState, useCallback } from 'react';
import { createLogEntry } from '@/utils/gameLogHelper';

/**
 * 게임 로그 상태 관리 훅
 */
export const useGameLog = () => {
    const [logEntries, setLogEntries] = useState([]);

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
     */
    const addDialogueLog = useCallback((speaker, text, sceneId) => {
        addLogEntry('dialogue', { speaker, text, sceneId });
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
