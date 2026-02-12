'use client';

/**
 * SceneContent.jsx - 씬 내용 렌더링 컴포넌트
 * 캐릭터, 컷신, 대사, 선택지를 표시
 */

import React from "react";
import CharacterDisplay from "./CharacterDisplay";
import DialogueBox from "./DialogueBox";
import ChoiceBox from "./ChoiceBox";
import Cutscene from "./Cutscene";

const SceneContent = ({
  displayedCharacters,
  shouldShowCutscene,
  currentScene,
  showReaction,
  currentReaction,
  handleReactionNext,
  shouldShowChoices,
  dialogueForChoice,
  currentLine,
  handleNext,
  onChoice,
  filteredChoices,
  isRefreshing,
  isSkipping,
  onSkipClick,
}) => {
  return (
    <>
      <CharacterDisplay characterMap={displayedCharacters} />

      <div className="scene-content">
        {shouldShowCutscene && !isSkipping && (
          <Cutscene
            imagePath={currentScene.cutsceneImage}
            alt="Cutscene"
          />
        )}

        {(() => {
          if (showReaction && currentReaction) {
            return (
              <DialogueBox
                speaker={currentReaction.speaker}
                text={currentReaction.text}
                onNext={handleReactionNext}
                onSkipClick={onSkipClick}
                isSkipping={isSkipping}
              />
            );
          }

          const lineToDisplay = shouldShowChoices
            ? dialogueForChoice
            : currentLine;

          // 디버깅: 대사가 표시되지 않는 문제 추적
          if (!lineToDisplay) {
            console.log('[SceneContent] lineToDisplay is null/undefined:', {
              shouldShowChoices,
              dialogueForChoice,
              currentLine,
              sceneId: currentScene?.id,
            });
          }

          return (
            lineToDisplay && (
              <DialogueBox
                speaker={currentScene?.type === 'warning' ? null : lineToDisplay.speaker}
                text={currentScene?.type === 'warning' ? "" : lineToDisplay.text}
                onNext={shouldShowChoices ? undefined : handleNext}
                onSkipClick={onSkipClick}
                isSkipping={isSkipping}
              />
            )
          );
        })()}

        <ChoiceBox
          question={currentScene.question}
          choices={filteredChoices || []}
          onChoice={onChoice}
          isVisible={shouldShowChoices && !showReaction && !isRefreshing}
        />
      </div>
    </>
  );
};

export default SceneContent;
