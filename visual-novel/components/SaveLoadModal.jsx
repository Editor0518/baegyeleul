'use client';

import React, { useState, useRef, useEffect } from "react";
import { useSaveLoad } from "@/hooks/useSaveLoad";
import "./SaveLoadModal.css";
import "./ConfirmModal.css";

const SaveLoadModal = ({ mode, onClose, onLoad, currentGameState }) => {
  const {
    saveGame,
    loadGame,
    getAllSlots,
    deleteSlot,
    exportAllSaves,
    importAllSaves,
  } = useSaveLoad();

  // useState lazy initialization으로 초기 슬롯 로드
  const [slots, setSlots] = useState(() => getAllSlots());
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState(null);

  // 확인 다이얼로그 상태 통합 관리
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null, // 'import' | 'delete'
    data: null, // slotId or file
  });

  // 메시지 자동 숨기기 (3초 후)
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const refreshSlots = React.useCallback(() => {
    const allSlots = getAllSlots();
    setSlots(allSlots);
  }, [getAllSlots]);

  const handleSave = (slotId) => {
    if (!currentGameState) {
      setMessage({ type: "error", text: "저장할 데이터가 없습니다." });
      return;
    }

    const result = saveGame(slotId, currentGameState);
    if (result.success) {
      setMessage({ type: "success", text: `슬롯 ${slotId}에 저장되었습니다.` });
      refreshSlots();
    } else {
      setMessage({ type: "error", text: `저장 실패: ${result.error}` });
    }
  };

  const handleLoad = (slotId) => {
    const result = loadGame(slotId);
    if (result.success) {
      setMessage({ type: "success", text: `슬롯 ${slotId}에서 불러왔습니다.` });
      setTimeout(() => {
        onLoad(result.data);
        onClose();
      }, 500);
    } else {
      setMessage({ type: "error", text: `불러오기 실패: ${result.error}` });
    }
  };

  const handleDelete = (slotId, e) => {
    e.stopPropagation();
    // 커스텀 확인 다이얼로그 표시
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      data: slotId
    });
  };

  const confirmDelete = () => {
    const slotId = confirmDialog.data;
    const result = deleteSlot(slotId);
    if (result.success) {
      setMessage({
        type: "success",
        text: `슬롯 ${slotId}이 삭제되었습니다.`,
      });
      refreshSlots();
    } else {
      setMessage({ type: "error", text: `삭제 실패: ${result.error}` });
    }
    closeConfirmDialog();
  };

  // 전체 내보내기
  const handleExportAll = () => {
    const result = exportAllSaves();
    if (result.success) {
      setMessage({
        type: "success",
        text: "전체 세이브 파일로 내보내기 완료!",
      });
    } else {
      setMessage({ type: "error", text: `내보내기 실패: ${result.error}` });
    }
  };

  // 전체 불러오기 시작
  const handleImportAllClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 후 경고창 표시
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setConfirmDialog({
      isOpen: true,
      type: 'import',
      data: file
    });

    // 파일 입력 초기화
    e.target.value = "";
  };

  // 불러오기 확인
  const handleConfirmImport = async () => {
    const file = confirmDialog.data;
    if (!file) return;

    const result = await importAllSaves(file);
    if (result.success) {
      setMessage({
        type: "success",
        text: `전체 세이브 불러오기 완료!`,
      });
      refreshSlots();
    } else {
      setMessage({ type: "error", text: `불러오기 실패: ${result.error}` });
    }

    closeConfirmDialog();
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: null,
      data: null
    });
  };

  const handleCancel = () => {
    if (confirmDialog.type === 'import') {
      setMessage({ type: "success", text: "불러오기가 취소되었습니다." });
    }
    closeConfirmDialog();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="save-load-overlay">
      <div id="game-save-load-modal" className="save-load-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === "save" ? "저장하기" : "불러오기"}</h2>
          <button className="close-button" onClick={onClose}></button>
        </div>

        {/* 전체 내보내기/불러오기 버튼 */}
        <div className="global-actions">
          <button
            className="global-action-btn export"
            onClick={handleExportAll}
          >
            <span id="save-export-btn" className="global-btn-icon export"></span>
            <span className="global-action-text">전체 내보내기</span>
          </button>
          <button
            className="global-action-btn import"
            onClick={handleImportAllClick}
          >
            <span id="save-import-btn" className="global-btn-icon import"></span>
            <span className="global-action-text">전체 불러오기</span>
          </button>
        </div>

        {message && (
          <div className={`save-message ${message.type}`}>{message.text}</div>
        )}

        <div id="save-slots-container" className="slots-container">
          {slots.map((slot) => (
            <div
              key={slot.slotId}
              className={`slot-item ${slot.isEmpty ? "empty" : "filled"}`}
              onClick={() => {
                if (mode === "save") {
                  handleSave(slot.slotId);
                } else if (!slot.isEmpty) {
                  handleLoad(slot.slotId);
                }
              }}
            >
              <div className="slot-header">
                <span className="slot-number">슬롯 {slot.slotId}</span>
                {!slot.isEmpty && (
                  <div className="slot-actions">
                    <button
                      className="action-btn delete"
                      onClick={(e) => handleDelete(slot.slotId, e)}
                      title="삭제"
                    ></button>
                  </div>
                )}
              </div>

              {slot.isEmpty ? (
                <div className="slot-content empty-content">
                  <span className="empty-text">비어있음</span>
                  {/* {mode === "save" && (
                    <span className="hint-text">클릭하여 저장</span>
                  )} */}
                </div>
              ) : (
                <div className="slot-content">
                  <div className="slot-info">
                    <div className="scene-name">{slot.sceneName}</div>
                    <div className="timestamp">
                      {formatTimestamp(slot.timestamp)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".json"
          onChange={handleFileSelect}
        />

        {/* 통합 확인 다이얼로그 */}
        {confirmDialog.isOpen && (
          <div className="confirm-dialog-overlay" onClick={handleCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <h3 className="confirm-title">
                {confirmDialog.type === 'delete' ? '삭제 확인' : '경고'}
              </h3>
              <p className="confirm-message">
                {confirmDialog.type === 'delete' ? (
                  <>
                    슬롯 {confirmDialog.data}의 데이터를 삭제하시겠습니까?
                    <br />
                    <span style={{ fontSize: '0.9em', opacity: 0.8 }}>삭제된 데이터는 복구할 수 없습니다.</span>
                  </>
                ) : (
                  <>
                    불러오기를 진행하면 현재 저장된 세이브 데이터는 모두 삭제되거나
                    덮어씌워집니다.
                    <strong>계속하시겠습니까?</strong>
                  </>
                )}
              </p>
              <div className="confirm-buttons">
                <button
                  className="confirm-btn cancel"
                  onClick={handleCancel}
                >
                  취소
                </button>
                <button
                  className="confirm-btn confirm"
                  onClick={confirmDialog.type === 'delete' ? confirmDelete : handleConfirmImport}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveLoadModal;
