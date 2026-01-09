# 로컬 세이브 시스템 사용 가이드

## 개요
브라우저의 localStorage를 활용한 세이브/로드 시스템이 추가되었습니다.
5개의 세이브 슬롯을 사용할 수 있으며, 파일 다운로드/업로드 기능도 유지됩니다.

## 주요 기능

### 1. 세이브 슬롯에 저장하기
```javascript
// 슬롯 1~5에 저장
saveToSlot(1);  // 슬롯 1에 저장
saveToSlot(2);  // 슬롯 2에 저장
// ... 최대 슬롯 5까지
```

### 2. 세이브 슬롯에서 불러오기
```javascript
// 슬롯 1~5에서 불러오기
loadFromSlot(1);  // 슬롯 1에서 불러오기
loadFromSlot(2);  // 슬롯 2에서 불러오기
```

### 3. 세이브 슬롯 삭제하기
```javascript
deleteSaveSlot(1);  // 슬롯 1 삭제
```

### 4. 세이브 슬롯 정보 조회
```javascript
// 특정 슬롯 정보 확인
const slotInfo = getSaveSlotInfo(1);
console.log(slotInfo);
// { slotNumber: 1, timestamp: "2026. 1. 9. 오후 3:30:45", sceneId: "scene1" }

// 모든 슬롯 정보 확인
const allSlots = getAllSaveSlots();
console.log(allSlots);
// [
//   { slotNumber: 1, timestamp: "...", sceneId: "..." },
//   { slotNumber: 2, empty: true },
//   ...
// ]
```

### 5. 파일로 저장/불러오기 (기존 기능)
```javascript
// 파일로 다운로드
handleSaveFile();

// 파일에서 불러오기
// HTML: <input type="file" accept=".json" onchange="handleLoadFile(this.files[0])" />
```

## 브라우저 콘솔에서 사용하기

게임 실행 중 F12를 눌러 개발자 도구를 열고, 콘솔에서 다음 명령을 입력할 수 있습니다:

```javascript
// 현재 게임 저장
saveToSlot(1);

// 저장된 게임 불러오기
loadFromSlot(1);

// 저장 슬롯 목록 보기
getAllSaveSlots();
```

## 저장되는 데이터

각 세이브 슬롯에는 다음 정보가 저장됩니다:
- `currentSceneId`: 현재 씬 ID
- `currentAffection`: 현재 호감도
- `history`: 지나온 씬 기록
- `interactedChoices`: 선택한 선택지 기록
- `timestamp`: 저장 시간
- `slotNumber`: 슬롯 번호

## UI에 버튼 추가하기 (예시)

게임 UI에 세이브/로드 버튼을 추가하려면 HTML을 수정하세요:

```html
<!-- 세이브 메뉴 예시 -->
<div class="save-menu">
    <h2>세이브/로드</h2>
    
    <!-- 슬롯 1 -->
    <div class="save-slot">
        <span id="slot-1-info">빈 슬롯</span>
        <button onclick="saveToSlot(1)">저장</button>
        <button onclick="loadFromSlot(1)">불러오기</button>
        <button onclick="deleteSaveSlot(1)">삭제</button>
    </div>
    
    <!-- 슬롯 2 -->
    <div class="save-slot">
        <span id="slot-2-info">빈 슬롯</span>
        <button onclick="saveToSlot(2)">저장</button>
        <button onclick="loadFromSlot(2)">불러오기</button>
        <button onclick="deleteSaveSlot(2)">삭제</button>
    </div>
    
    <!-- ... 슬롯 3~5도 동일하게 추가 -->
    
    <!-- 파일 저장/불러오기 -->
    <div class="file-save-load">
        <button onclick="handleSaveFile()">파일로 저장</button>
        <input type="file" accept=".json" onchange="handleLoadFile(this.files[0])" />
    </div>
</div>

<script>
// 슬롯 정보 업데이트 함수
function updateSlotDisplay() {
    const slots = getAllSaveSlots();
    slots.forEach(slot => {
        const infoElement = document.getElementById(`slot-${slot.slotNumber}-info`);
        if (infoElement) {
            if (slot.empty) {
                infoElement.textContent = '빈 슬롯';
            } else {
                infoElement.textContent = `${slot.timestamp} - ${slot.sceneId}`;
            }
        }
    });
}

// 페이지 로드 시 슬롯 정보 업데이트
window.addEventListener('load', updateSlotDisplay);
</script>
```

## 주의사항

1. **브라우저 저장소 제한**: localStorage는 브라우저당 약 5-10MB의 용량 제한이 있습니다.

2. **브라우저 캐시 삭제**: 브라우저 캐시/쿠키를 삭제하면 저장된 데이터도 함께 삭제됩니다.

3. **개인정보 보호 모드**: 시크릿 모드나 개인정보 보호 모드에서는 localStorage가 세션 종료 시 삭제될 수 있습니다.

4. **중요한 세이브**: 중요한 세이브는 `handleSaveFile()`을 사용하여 파일로도 백업하는 것을 권장합니다.

5. **변수명 확인**: `u`, `_`, `h`, `m` 등의 변수명은 실제 게임 코드의 변수명과 일치해야 합니다.

## 트러블슈팅

### 저장이 안 돼요
- 브라우저가 localStorage를 지원하는지 확인하세요.
- 개인정보 보호 모드가 아닌지 확인하세요.
- 브라우저 콘솔(F12)에서 에러 메시지를 확인하세요.

### 불러오기가 안 돼요
- `loadGameState` 함수가 게임 코드에 정의되어 있어야 합니다.
- 해당 슬롯에 저장된 데이터가 있는지 `getAllSaveSlots()`로 확인하세요.

### 데이터가 사라졌어요
- 브라우저 캐시를 삭제했는지 확인하세요.
- 다른 브라우저나 시크릿 모드를 사용했는지 확인하세요.
- 중요한 데이터는 항상 파일로 백업하세요.
