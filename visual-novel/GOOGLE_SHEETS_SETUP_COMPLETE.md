## 📋 Google Sheets 통합 완료 요약

생성된 파일들과 필요한 링크를 정리했습니다.

---

## 📁 생성된 파일들

### 1. **스크립트 파일**

#### `scripts/fetchFromGoogleSheets.js` ✅
- **기능**: Google Sheets에서 데이터를 받아와 `public/storyData.json`으로 변환
- **사용법**:
  ```bash
  npm run fetch:sheets -- --spreadsheet-id YOUR_ID --api-key YOUR_KEY
  ```
- **변환 대상**:
  - GameInfo (게임 정보)
  - Characters (캐릭터)
  - Places (배경/장소)
  - Scenes (씬)
  - Dialogues (대사)
  - Choices (선택지)
  - EndingConfig (엔딩 설정)

#### `scripts/googleSheetsConfig.js` ✅
- **기능**: Google Sheets API 설정 저장
- **설정 항목**:
  - API 엔드포인트
  - 각 시트별 범위
  - 환경 변수 참조

### 2. **환경 설정 파일**

#### `.env.example` ✅
- **기능**: 환경 변수 템플릿
- **내용**:
  ```
  GOOGLE_SHEETS_ID=your_spreadsheet_id
  GOOGLE_API_KEY=your_google_api_key
  ```
- **사용법**: `.env.local`로 복사 후 실제 값 입력

#### `.gitignore` (업데이트됨) ✅
- `.env.local` 추가 (API 키 노출 방지)

#### `package.json` (업데이트됨) ✅
```json
"fetch:sheets": "node scripts/fetchFromGoogleSheets.js"
```

### 3. **문서**

#### `GOOGLE_SHEETS_GUIDE.md` ✅
- **내용**: 
  - Google API 설정 (3단계)
  - Sheets 구조 상세 설명
  - 각 시트별 데이터 형식
  - 트러블슈팅
  - GitHub Actions 자동화

#### `GOOGLE_SHEETS_QUICKSTART.md` ✅
- **내용**: 5분 빠른 시작
  - 단계별 설정
  - 예시 데이터
  - FAQ

---

## 🔗 필요한 링크 (중요!)

### 반드시 필요한 것들

| 항목 | 링크 | 목적 |
|------|------|------|
| **Google Cloud Console** | https://console.cloud.google.com/ | API 키 발급 |
| **Google Sheets** | https://sheets.google.com | 스프레드시트 생성 |
| **Sheets API 문서** | https://developers.google.com/sheets/api | 공식 문서 |

### 상세 가이드

| 항목 | 링크 |
|------|------|
| Google Sheets API 시작 | https://developers.google.com/sheets/api/guides/concepts |
| API 인증 방법 | https://developers.google.com/sheets/api/guides/authorizing |
| REST API 레퍼런스 | https://developers.google.com/sheets/api/reference/rest |
| 스프레드시트 구조 | https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets |
| 값 읽기 API | https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get |

---

## 🚀 빠른 시작 (5분)

### 1단계: API 키 발급
```
Google Cloud Console 
  → API 및 서비스 
  → 라이브러리 
  → "Google Sheets API" 검색 
  → 활성화 
  → 사용자 인증 정보 
  → API 키 생성
```

### 2단계: Google Sheets 생성
```
1. https://sheets.google.com 접속
2. 새 스프레드시트 생성
3. 시트 탭 우클릭 → 다음 시트 생성:
   - GameInfo
   - Characters
   - Places
   - Scenes
   - Dialogues
   - Choices
   - EndingConfig
4. 링크 복사 후 공유 (링크로 열 수 있도록)
5. URL에서 SPREADSHEET_ID 추출
```

### 3단계: 환경 변수 설정
```bash
cp .env.example .env.local

# .env.local 편집
GOOGLE_SHEETS_ID=위에서_복사한_ID
GOOGLE_API_KEY=위에서_발급받은_키
```

### 4단계: 데이터 동기화
```bash
# node-fetch 설치 (처음 한 번만)
npm install node-fetch --save-dev

# 실행
npm run fetch:sheets
```

✅ `public/storyData.json` 생성 완료!

---

## 📊 Sheets 데이터 형식

자세한 내용은 [GOOGLE_SHEETS_GUIDE.md](./GOOGLE_SHEETS_GUIDE.md) 참고

### 간단 요약

**GameInfo** (기본 정보)
```
항목 | 값
title | 게임 제목
subtitle | 부제
```

**Characters** (캐릭터)
```
id | name | color | initialAffection | imageFolder | emotions
aa | 에이 | #fff  | 0                | aa          | default:aa_01.png
```

**Dialogues** (대사)
```
sceneId | speaker | text | characters
scene1  | aa      | 안녕  | aa:default:left:true
```

**Choices** (선택지)
```
sceneId | index | text | next | affectionChanges
scene1  | 1     | 선택1 | s2   | aa:2
```

---

## ⚙️ 설정 옵션

### 환경 변수
```bash
# 필수
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_API_KEY=your_api_key

# 선택 (나중에 추가 가능)
GOOGLE_SHEETS_CACHE_ENABLED=true
GOOGLE_SHEETS_AUTO_SYNC=false
```

### 스크립트 인자
```bash
npm run fetch:sheets -- \
  --spreadsheet-id YOUR_ID \
  --api-key YOUR_KEY
```

---

## 🔒 보안 체크리스트

- [ ] `.env.local` 파일 생성 (`.gitignore`에 있음)
- [ ] API 키를 GitHub에 커밋하지 않음
- [ ] `.env.example`만 commit (실제 값 X)
- [ ] Google Sheets 공유 범위 확인
- [ ] API 키에 IP 제한 설정 (선택사항)

---

## 📝 다음 단계

1. **[GOOGLE_SHEETS_QUICKSTART.md](./GOOGLE_SHEETS_QUICKSTART.md)** - 5분 시작 가이드
2. **[GOOGLE_SHEETS_GUIDE.md](./GOOGLE_SHEETS_GUIDE.md)** - 상세 가이드
3. **Google Sheets 스프레드시트 생성** - 템플릿 사용하거나 직접 작성
4. **`npm run fetch:sheets` 실행** - 데이터 동기화
5. **게임 실행** - 데이터 자동 로드 확인

---

## 🆘 문제 해결

### API 키 오류
```
❌ "API 키가 유효하지 않습니다"
→ Google Cloud Console에서 API 키 재확인
→ Google Sheets API 활성화 여부 확인
```

### 데이터 형식 오류
```
❌ "Unexpected token in JSON"
→ Sheets의 데이터 형식 재확인
→ 빈 행이 없는지 확인
```

### 이미지 경로 오류
```
❌ "이미지를 찾을 수 없음"
→ public/assets/ 경로 구조 확인
→ imageFolder와 파일 이름 일치 확인
```

---

## 📚 참고 자료

- **공식 Google Sheets API 문서**: https://developers.google.com/sheets/api
- **Node.js Fetch API**: https://nodejs.org/dist/latest-v18.x/docs/api/fetch.html
- **스토리 데이터 포맷**: [STORY_DATA_GUIDE.md](./STORY_DATA_GUIDE.md)

---

**설정이 완료되었습니다!** 🎉

이제 Google Sheets에서 시나리오를 작성하고 `npm run fetch:sheets`로 게임에 반영할 수 있습니다.
