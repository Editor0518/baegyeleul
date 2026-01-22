"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import ChoiceBox from "./ChoiceBox";
import { MODAL_TYPES } from "@/hooks/useModal";
import "./TutorialOverlay.css";

const TUTORIAL_STEPS = [
    {
        text: "안녕하세요! 게임 플레이를 돕기 위한 가이드입니다.\n화면 아무 곳이나 클릭하면 다음 설명으로 넘어갑니다.",
        targetId: null,
    },
    {
        text: "대사창을 클릭하여 게임을 진행할 수 있습니다.\n대사가 다 나온 뒤, 클릭하시면 다음 내용으로 넘어갑니다.\n대사창이 아닌 곳은 눌러도 넘어가지 않습니다.",
        targetId: "game-dialogue-box",
    },
    {
        text: "좌측 상단에는 현재 주인공이 위치한 '장소'가 표시됩니다.\n이야기의 흐름에 따라 장소가 변하게 됩니다.",
        targetId: "place-bar",
    },
    {
        text: "이 버튼은 현재 상태를 '저장'하는 버튼입니다.\n중요한 선택을 하기 전에 미리 저장해두면 좋겠죠?",
        targetId: "header-save-btn",
    },
    {
        text: "저장 창에서는 원하는 슬롯을 선택하여 현재 시점을\n 저장할 수 있습니다.\n'전체 내보내기'를 통해 세이브 파일을 따로 보관하시면,\n데이터가 날아가도 '전체 불러오기'로 언제든 복구 가능합니다!",
        targetId: "game-save-load-modal",
        action: { type: "openModal", modalType: MODAL_TYPES.SAVE_LOAD, data: { mode: "save" } }
    },
    {
        text: "이전에 저장했던 지점으로 돌아가고 싶을 땐\n'불러오기' 버튼을 눌러주세요.",
        targetId: "header-load-btn",
        action: { type: "closeModal" }
    },
    {
        text: "불러오기 창에서 저장된 슬롯 중 하나를 선택하면,\n해당 시점부터 바로 게임을 이어서 진행할 수 있습니다.",
        targetId: "game-save-load-modal",
        action: { type: "openModal", modalType: MODAL_TYPES.SAVE_LOAD, data: { mode: "load" } }
    },
    {
        text: "'로그' 버튼을 누르면 지금까지 읽었던 대사들을\n다시 볼 수 있습니다.",
        targetId: "header-log-btn",
        action: { type: "closeModal" }
    },
    {
        text: "로그 창에서는 지나간 대화들과 선택했던 기록들을 확인하며\n놓친 내용이 있는지 다시 훑어볼 수 있습니다.",
        targetId: "game-log-modal",
        action: { type: "openModal", modalType: MODAL_TYPES.GAME_LOG }
    },
    {
        text: "'처음으로' 버튼을 누르면 타이틀 화면으로 돌아갑니다.\n저장하지 않은 진행 내역은 사라지니 꼭 저장 후 눌러주세요!",
        targetId: "header-reset-btn",
        action: { type: "closeModal" }
    },
    {
        text: "스피커 모양 버튼을 눌러 배경 음악을 켜거나 끌 수 있습니다.",
        targetId: "header-mute-btn",
    },
    {
        text: "이야기 도중 중요한 갈림길이 나오면 '선택지'가 나타납니다.\n원하는 운명을 직접 선택해 보세요!",
        targetId: "game-choice-box",
        showFakeChoices: true,
    },
    {
        text: "이제 모든 준비가 끝났습니다!\n즐거운 시간 되시길 바랍니다.",
        targetId: null,
    },
];

const TutorialOverlay = ({ onClose, openModal, closeModal, activeModal }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightStyle, setHighlightStyle] = useState({});

    const stepData = TUTORIAL_STEPS[currentStep];

    const updateHighlightPosition = useCallback(() => {
        if (!stepData.targetId) {
            setHighlightStyle({ display: 'none' });
            return;
        }

        const element = document.getElementById(stepData.targetId);
        if (element) {
            const rect = element.getBoundingClientRect();

            let { top, left, width, height } = rect;
            // 장소 표시(place-bar)의 경우 1.2배 크기 적용
            if (stepData.targetId === "place-bar") {
                const scale = 1.2;
                const newWidth = width * scale;
                const newHeight = height * scale;
                // 중앙 정렬 유지를 위해 offset 계산
                left = left - (newWidth - width) / 2;
                top = top - (newHeight - height) / 2;
                width = newWidth;
                height = newHeight;
            } else if (stepData.targetId.includes("modal")) {
                // 모달창의 경우 테두리를 넉넉하게 감싸도록 약간의 여유(outset) 추가
                const offset = 8;
                top -= offset;
                left -= offset;
                width += offset * 2;
                height += offset * 2;
            }

            setHighlightStyle({
                top: `${top}px`,
                left: `${left}px`,
                width: `${width}px`,
                height: `${height}px`,
                display: 'block'
            });
        } else {
            setHighlightStyle({ display: 'none' });
        }
    }, [stepData.targetId]);

    // 단계가 바뀔 때 액션 실행
    useEffect(() => {
        if (stepData.action) {
            if (stepData.action.type === "openModal") {
                openModal(stepData.action.modalType, stepData.action.data);
            } else if (stepData.action.type === "closeModal") {
                closeModal();
            }
        }
    }, [currentStep, openModal, closeModal]);

    useEffect(() => {
        // 모달 애니메이션(0.5s)이 완료된 후 정확한 위치를 잡기 위해 지연 시간 증가
        const timer = setTimeout(updateHighlightPosition, 100);

        window.addEventListener('resize', updateHighlightPosition);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateHighlightPosition);
        };
    }, [updateHighlightPosition, activeModal]);

    const handleNext = (e) => {
        e.stopPropagation();
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            closeModal();
            onClose();
        }
    };

    return (
        <div className="tutorial-overlay">
            <div className="tutorial-dimmed-bg" onClick={handleNext} />

            <div className="tutorial-content">
                <div
                    className="tutorial-highlight"
                    style={highlightStyle}
                />

                <div className="tutorial-box" onClick={handleNext}>
                    <div className="tutorial-box-header">도움말</div>
                    <p className="tutorial-text">{stepData.text}</p>
                    <div className="tutorial-click-hint">클릭하여 계속...</div>
                </div>

                {stepData.showFakeChoices && (
                    <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 11000 }}>
                        <ChoiceBox
                            choices={[
                                { text: "멘델스존이 좋다" },
                                { text: "리스트가 좋다" },
                                { text: "에투아르가 좋다" }
                            ]}
                            onChoice={() => { }}
                            isVisible={true}
                        />
                    </div>
                )}
            </div>
        </div >
    );
};

export default TutorialOverlay;
