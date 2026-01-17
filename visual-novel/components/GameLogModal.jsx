import React from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { formatLogForDisplay } from '@/utils/gameLogHelper';
import './GameLogModal.css';

const GameLogModal = ({ logEntries, onClose }) => {
    const { characters } = useGameContext();

    const formattedLogs = formatLogForDisplay(logEntries, characters);

    return (
        <div className="game-log-modal-overlay" onClick={onClose}>
            <div className="game-log-modal" onClick={(e) => e.stopPropagation()}>
                <div className="game-log-header">
                    <h2>게임 로그</h2>
                    <button className="game-log-close-button" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="game-log-content">
                    {formattedLogs.length === 0 ? (
                        <div className="game-log-empty">
                            아직 기록된 로그가 없습니다.
                        </div>
                    ) : (
                        <div className="game-log-list">
                            {formattedLogs.map((log, index) => (
                                <div
                                    key={index}
                                    className={`game-log-entry ${log.type === 'choice' ? 'log-choice' : 'log-dialogue'} ${log.speaker === 'narrator' ? 'log-narrator' : ''}`}
                                >
                                    {log.type === 'dialogue' ? (
                                        <>
                                            {log.speaker !== 'narrator' && (
                                                <div className="log-speaker">{log.speakerName}</div>
                                            )}
                                            <div className="log-text">{log.displayText}</div>
                                        </>
                                    ) : (
                                        <div className="log-choice-text">{log.displayText}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="game-log-footer">
                    <button className="game-log-button" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameLogModal;
