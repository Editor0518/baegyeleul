'use client';

import { useState, useCallback } from 'react';

/**
 * 사용자 변수 상태 관리 훅
 */
export const useVariables = () => {
    const [variables, setVariables] = useState({});

    /**
     * 변수 설정
     */
    const setVariable = useCallback((name, value) => {
        setVariables(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    /**
     * 변수 가져오기
     */
    const getVariable = useCallback((name) => {
        return variables[name];
    }, [variables]);

    /**
     * 변수 삭제
     */
    const deleteVariable = useCallback((name) => {
        setVariables(prev => {
            const newVars = { ...prev };
            delete newVars[name];
            return newVars;
        });
    }, []);

    /**
     * 변수에 숫자 더하기
     */
    const addToVariable = useCallback((name, amount) => {
        setVariables(prev => {
            const currentValue = prev[name] || 0;
            const numericValue = Number(currentValue);

            if (isNaN(numericValue)) {
                console.warn(`Cannot add to non-numeric variable: ${name}`);
                return prev;
            }

            return {
                ...prev,
                [name]: numericValue + amount
            };
        });
    }, []);

    /**
     * 모든 변수 초기화
     */
    const resetVariables = useCallback(() => {
        setVariables({});
    }, []);

    /**
     * 변수 일괄 설정 (로드 시 사용)
     */
    const setAllVariables = useCallback((newVariables) => {
        setVariables(newVariables || {});
    }, []);

    return {
        variables,
        setVariable,
        getVariable,
        deleteVariable,
        addToVariable,
        resetVariables,
        setAllVariables,
    };
};
