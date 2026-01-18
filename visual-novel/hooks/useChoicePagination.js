'use client';

/**
 * useChoicePagination.js - 선택지 페이지네이션 훅
 * 선택지가 5개 이상일 때 3+1 구조로 페이지네이션 제공
 */

import { useState, useMemo, useCallback, useEffect } from 'react';

const CHOICES_PER_PAGE = 3; // 한 페이지에 표시할 실제 선택지 개수

export const useChoicePagination = (choices, currentSceneId) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 씬이 변경되면 페이지 초기화
    useEffect(() => {
        setCurrentPage(0);
        setIsRefreshing(false);
    }, [currentSceneId]);

    // 페이지가 변경되면 잠깐 리프레시 상태로 만들어서 ChoiceBox가 업데이트되도록 함
    useEffect(() => {
        if (isRefreshing) {
            // 다음 프레임에서 리프레시 해제
            const timer = setTimeout(() => {
                setIsRefreshing(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isRefreshing]);

    // 페이지네이션이 필요한지 확인
    const needsPagination = choices.length >= 5;

    // 총 페이지 수 계산
    const totalPages = useMemo(() => {
        if (!needsPagination) return 1;
        return Math.ceil(choices.length / CHOICES_PER_PAGE);
    }, [choices.length, needsPagination]);

    // 현재 페이지에 표시할 선택지 계산
    const paginatedChoices = useMemo(() => {
        if (!needsPagination) {
            // 페이지네이션이 필요없으면 모든 선택지 반환
            return choices;
        }

        const startIndex = currentPage * CHOICES_PER_PAGE;
        const endIndex = startIndex + CHOICES_PER_PAGE;
        const pageChoices = choices.slice(startIndex, endIndex);

        // 네비게이션 선택지 추가
        const isLastPage = currentPage === totalPages - 1;
        const isFirstPage = currentPage === 0;

        if (isLastPage && !isFirstPage) {
            // 마지막 페이지: "처음으로" 추가
            return [
                ...pageChoices,
                {
                    text: '처음으로',
                    isNavigation: true,
                    navigationAction: 'first',
                },
            ];
        } else if (!isLastPage) {
            // 중간 페이지: "다음으로" 추가
            return [
                ...pageChoices,
                {
                    text: '다음으로',
                    isNavigation: true,
                    navigationAction: 'next',
                },
            ];
        }

        return pageChoices;
    }, [choices, currentPage, needsPagination, totalPages]);

    // 네비게이션 핸들러
    const handleNavigation = useCallback((action) => {
        if (action === 'next') {
            setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
            setIsRefreshing(true); // 리프레시 트리거
        } else if (action === 'first') {
            setCurrentPage(0);
            setIsRefreshing(true); // 리프레시 트리거
        }
    }, [totalPages]);

    // 선택지 클릭 핸들러 래퍼
    const handleChoiceClick = useCallback((choice, index, originalOnChoice) => {
        if (choice.isNavigation) {
            // 네비게이션 선택지면 페이지만 변경
            handleNavigation(choice.navigationAction);
        } else {
            // 실제 선택지면 원래 핸들러 호출
            // 원본 choices 배열에서의 실제 인덱스 계산
            const actualIndex = currentPage * CHOICES_PER_PAGE + index;
            originalOnChoice(choices[actualIndex], actualIndex);
        }
    }, [handleNavigation, currentPage, choices]);

    return {
        paginatedChoices,
        handleChoiceClick,
        needsPagination,
        currentPage,
        totalPages,
        isRefreshing, // 리프레시 상태 반환
    };
};
