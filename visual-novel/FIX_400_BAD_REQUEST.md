# 400 Bad Request 오류 해결 가이드

## 문제
```
❌ API 오류: 400 Bad Request
```

**400 Bad Request**는 API 요청 형식이 잘못되었다는 뜻입니다. 보통 시트 이름이 없거나 범위 형식이 잘못된 경우입니다.

---

## 🔍 진단 방법

### 단계 1: 스프레드시트의 실제 시트 이름 확인

```bash
npm run list:sheets -- SPREADSHEET_ID API_KEY
```

또는 환경 변수로:

```bash
npm run list:sheets
```

이 명령어가 실제 시트 이름들을 보여줄 것입니다.

### 단계 2: 출력 예시

```
✅ 스프레드시트: "Visual Novel Story"

📊 총 시트 개수: 3

📋 시트 목록:
──────────────────────────────────────────────────
1. "Sheet1"
   ID: 0
   크기: 5 행 × 3 열

2. "GameInfo"
   ID: 123456
   크기: 10 행 × 2 열

3. "Characters"
   ID: 789012
   크기: 5 행 × 8 열

──────────────────────────────────────────────────
```

---

## 🛠️ 해결 방법

### 원인: 시트 이름이 존재하지 않음

`fetchFromGoogleSheets.js`에서 찾는 시트 이름이 실제 스프레드시트에 없습니다.

**현재 코드가 찾는 시트:**
```javascript
const sheets = {
  gameInfo: 'GameInfo!A1:B100',
  characters: 'Characters!A1:H100',
  places: 'Places!A1:D100',
  scenes: 'Scenes!A1:Z1000',
  dialogues: 'Dialogues!A1:Z1000',
  choices: 'Choices!A1:Z1000',
  endingConfig: 'EndingConfig!A1:D100',
};
```

### 해결 방법: 시트 이름 매칭

#### 방법 1: 시트 이름 변경 (권장 - 간단함)

Google Sheets에서:

1. 각 시트 탭 우클릭
2. "시트이름 바꾸기"
3. 다음 이름으로 변경:
   - `GameInfo`
   - `Characters`
   - `Places`
   - `Scenes`
   - `Dialogues`
   - `Choices`
   - `EndingConfig`

⚠️ 이름은 **정확하게** 입력하세요 (대소문자 구분)

#### 방법 2: 코드 수정 (현재 시트 이름 유지)

`npm run list:sheets`의 출력에서 실제 시트 이름을 확인하고, `scripts/fetchFromGoogleSheets.js` 파일을 수정합니다:

**단계 1: 파일 열기**
```
scripts/fetchFromGoogleSheets.js
```

**단계 2: 약 80번 줄 근처의 `convertSheetToStoryData` 함수 찾기**

**단계 3: 시트 이름 업데이트**

현재:
```javascript
const gameInfoData = await fetchSheetData(spreadsheetId, apiKey, 'GameInfo!A1:B100');
const charactersData = await fetchSheetData(spreadsheetId, apiKey, 'Characters!A1:H100');
const placesData = await fetchSheetData(spreadsheetId, apiKey, 'Places!A1:D100');
const scenesData = await fetchSheetData(spreadsheetId, apiKey, 'Scenes!A1:Z1000');
const dialoguesData = await fetchSheetData(spreadsheetId, apiKey, 'Dialogues!A1:Z1000');
const choicesData = await fetchSheetData(spreadsheetId, apiKey, 'Choices!A1:Z1000');
const endingConfigData = await fetchSheetData(spreadsheetId, apiKey, 'EndingConfig!A1:D100');
```

실제 시트 이름으로 변경:
```javascript
const gameInfoData = await fetchSheetData(spreadsheetId, apiKey, '실제_시트이름!A1:B100');
const charactersData = await fetchSheetData(spreadsheetId, apiKey, '실제_시트이름!A1:H100');
// ... 나머지도 동일
```

---

## 예시: 실제 시트 이름이 다른 경우

**npm run list:sheets 출력:**
```
1. "Sheet1"
2. "데이터"
3. "캐릭터정보"
```

**수정된 코드:**
```javascript
const gameInfoData = await fetchSheetData(spreadsheetId, apiKey, 'Sheet1!A1:B100');
const charactersData = await fetchSheetData(spreadsheetId, apiKey, '캐릭터정보!A1:H100');
const placesData = await fetchSheetData(spreadsheetId, apiKey, '데이터!A1:D100');
```

---

## 📋 전체 확인 체크리스트

```
[ ] 1. npm run list:sheets 실행하여 실제 시트 이름 확인
[ ] 2. 스프레드시트의 시트 이름이 코드와 일치하는지 확인
[ ] 3. 시트 이름에 공백이나 특수문자 있는지 확인
[ ] 4. 범위 형식이 올바른지 확인 (예: "시트명!A1:Z1000")
```

---

## 🧪 테스트

수정 후:

```bash
# 다시 시도
npm run fetch:sheets
```

✅ 성공하면:
```
✅ storyData.json 파일이 생성되었습니다.
```

---

## 💡 팁

### 시트 이름 규칙

- 대소문자 구분 (`GameInfo` ≠ `gameinfo`)
- 공백 포함 가능 (`Game Info` 괜찮음)
- 특수문자 피하기 (괜찮지만 혼동 유발)
- 한글 가능 (하지만 범위 입력 시 인코딩 주의)

### 범위 형식

```
"시트명!A1:Z1000"  ✅ 올바름
"Sheet1!A:Z"       ✅ 올바름 (전체 열)
"Sheet1"           ❌ 잘못됨 (범위 필수)
"Sheet 1!A1:Z"     ✅ 올바름 (공백 포함 가능)
```

---

## 🆘 여전히 안 되면

1. **스프레드시트 ID 다시 확인**
   - URL에서 추출: `https://docs.google.com/spreadsheets/d/{ID}/edit`

2. **API 키 다시 확인**
   - 길이 30자 이상
   - 공백 없음
   - 복사/붙여넣기 오류 없음

3. **스프레드시트 공유 설정 확인**
   - 공유 → "누구나 액세스 가능" 또는 "링크로 열 수 있음"

4. **에러 메시지 정확하게 읽기**
   - 어느 시트에서 문제가 발생했는지 확인

---

**다시 시도해보세요!** 🚀
