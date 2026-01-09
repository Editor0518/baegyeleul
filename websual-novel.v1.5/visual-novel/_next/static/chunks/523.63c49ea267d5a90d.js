// ========== 로컬 스토리지 세이브 시스템 ==========

// 세이브 슬롯 관리
const SAVE_SLOTS_KEY = 'visual_novel_save_slots';
const MAX_SLOTS = 5;

// 세이브 슬롯 목록 가져오기
const getSaveSlots = () => {
    try {
        const slots = localStorage.getItem(SAVE_SLOTS_KEY);
        return slots ? JSON.parse(slots) : {};
    } catch (err) {
        console.error("Failed to get save slots:", err);
        return {};
    }
};

// 세이브 슬롯에 저장
const saveToSlot = (slotNumber) => {
    if (!u || !u.id) {
        alert("저장할 데이터가 없습니다.");
        return false;
    }

    const saveData = {
        currentSceneId: u.id,
        currentAffection: _,
        history: h,
        interactedChoices: Array.from(m || []),
        timestamp: new Date().toISOString(),
        slotNumber: slotNumber
    };

    try {
        const slots = getSaveSlots();
        slots[slotNumber] = saveData;
        localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
        alert(`슬롯 ${slotNumber}에 저장되었습니다.`);
        return true;
    } catch (err) {
        console.error("Save failed:", err);
        alert("저장에 실패했습니다.");
        return false;
    }
};

// 세이브 슬롯에서 불러오기
const loadFromSlot = (slotNumber) => {
    try {
        const slots = getSaveSlots();
        const saveData = slots[slotNumber];
        
        if (!saveData) {
            alert("저장된 데이터가 없습니다.");
            return false;
        }

        // 게임 상태 복원 (실제 변수명에 맞게 조정 필요)
        if (typeof loadGameState === 'function') {
            loadGameState(saveData);
        }
        
        alert(`슬롯 ${slotNumber}에서 불러왔습니다.`);
        return true;
    } catch (err) {
        console.error("Load failed:", err);
        alert("불러오기에 실패했습니다.");
        return false;
    }
};

// 세이브 슬롯 삭제
const deleteSaveSlot = (slotNumber) => {
    try {
        const slots = getSaveSlots();
        if (slots[slotNumber]) {
            delete slots[slotNumber];
            localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
            alert(`슬롯 ${slotNumber}이(가) 삭제되었습니다.`);
            return true;
        }
        return false;
    } catch (err) {
        console.error("Delete failed:", err);
        return false;
    }
};

// 세이브 슬롯 정보 조회
const getSaveSlotInfo = (slotNumber) => {
    const slots = getSaveSlots();
    const save = slots[slotNumber];
    if (!save) return null;
    
    return {
        slotNumber: save.slotNumber,
        timestamp: new Date(save.timestamp).toLocaleString('ko-KR'),
        sceneId: save.currentSceneId
    };
};

// 모든 슬롯 정보 가져오기
const getAllSaveSlots = () => {
    const slots = getSaveSlots();
    const result = [];
    for (let i = 1; i <= MAX_SLOTS; i++) {
        if (slots[i]) {
            result.push(getSaveSlotInfo(i));
        } else {
            result.push({ slotNumber: i, empty: true });
        }
    }
    return result;
};

// 파일로 다운로드 (기존 기능 유지)
const handleSaveFile = () => {
    if (!u || !u.id) {
        alert("저장할 데이터가 없습니다.");
        return;
    }

    const saveData = {
        currentSceneId: u.id,
        currentAffection: _,
        history: h,
        interactedChoices: Array.from(m || []),
        timestamp: new Date().toISOString()
    };

    try {
        const blob = new Blob([JSON.stringify(saveData)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `save_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("게임이 파일로 저장되었습니다.");
    } catch (err) {
        console.error("Save failed:", err);
    }
};

// 파일에서 불러오기
const handleLoadFile = (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const saveData = JSON.parse(e.target.result);
            if (typeof loadGameState === 'function') {
                loadGameState(saveData);
                alert("파일에서 불러왔습니다.");
            }
        } catch (err) {
            console.error("Load failed:", err);
            alert("파일 불러오기에 실패했습니다.");
        }
    };
    reader.readAsText(file);
};

// 전역으로 내보내기
if (typeof window !== 'undefined') {
    window.saveToSlot = saveToSlot;
    window.loadFromSlot = loadFromSlot;
    window.deleteSaveSlot = deleteSaveSlot;
    window.getSaveSlotInfo = getSaveSlotInfo;
    window.getAllSaveSlots = getAllSaveSlots;
    window.handleSaveFile = handleSaveFile;
    window.handleLoadFile = handleLoadFile;
}