'use client';

import React from "react";
import "./ConfirmModal.css";

const WarningModal = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="confirm-dialog-overlay">
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <h3 className="confirm-title" style={{ color: '#ff4d4d', fontWeight: 'bold' }}>주의</h3>
                <p
                    className="confirm-message"
                    style={{ whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{ __html: message }}
                />
                <div className="confirm-buttons">
                    <button className="confirm-btn cancel" onClick={onCancel}>
                        돌아가기
                    </button>
                    <button className="confirm-btn confirm" onClick={onConfirm}>
                        확인하고 시작하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningModal;
