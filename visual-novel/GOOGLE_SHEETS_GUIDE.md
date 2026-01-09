# Google Sheets 스토리 데이터 동기화 가이드

## 개요

이 가이드는 Google Sheets에서 시나리오 데이터를 받아와 게임에 적용하는 방법을 설명합니다.

## 1️⃣ Google API 설정

### 1.1 Google Cloud 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성
   - 프로젝트 이름: `visual-novel-studio` (또는 원하는 이름)
   - 만들기 클릭

### 1.2 Google Sheets API 활성화

1. 콘솔에서 **API 및 서비스** → **라이브러리** 이동
2. "Google Sheets API" 검색
3. **활성화** 클릭

### 1.3 API 키 생성

1. **API 및 서비스** → **사용자 인증 정보** 이동
2. **사용자 인증 정보 만들기** → **API 키** 선택
3. 생성된 API 키 복사 (안전하게 보관)

## 2️⃣ Google Sheets 스프레드시트 생성

### 2.1 템플릿 스프레드시트

다음 링크에서 템플릿을 복사해서 사용하세요:
**[Google Sheets 템플릿 (공개 템플릿)](https://docs.google.com/spreadsheets/d/1pJ_example/edit#gid=0)**

또는 직접 만들기:

### 2.2 시트 구조

스프레드시트에 다음 시트들을 만듭니다:

#### **GameInfo** (게임 정보)
```
| 항목 | 값 |
|------|-----|
| title | 청춘! 피할 수 없다면 즐겨라 |
| subtitle | 인생 시뮬레이션 |
| me | 주인공 |
| backgroundMusic | bg_music.mp3 |
```

#### **Characters** (캐릭터)
```
| id | name | color | initialAffection | minAffection | maxAffection | imageFolder | emotions |
|----|------|-------|------------------|--------------|--------------|-------------|----------|
| aa | 에이 | #ffffff | 0 | 0 | 10 | aa | default:aa_01_default.png,sad:aa_02_sad.png,happy:aa_03_happy.png |
| bb | 비 | #ff69b4 | 0 | 0 | 10 | bb | default:bb_01_default.png,angry:bb_02_angry.png |
```

**emotions 형식**: `감정명:파일명,감정명:파일명,...`

#### **Places** (배경/장소)
```
| id | name | image | color |
|----|------|-------|-------|
| forest | 숲속 | forest.png | #2d5016 |
| school | 학교 | school.png | #87ceeb |
| home | 집 | home.png | #ffd700 |
```

#### **Scenes** (씬 정보)
```
| id | type | place | next |
|----|------|-------|------|
| scene1 | normal | forest | scene1_choice |
| scene1_choice | choice | forest | scene2 |
| scene2 | normal | school | normal_ending |
| normal_ending | ending | forest | |
```

**type 종류**:
- `normal`: 일반 대사 씬
- `choice`: 선택지 씬
- `ending`: 엔딩 씬

#### **Dialogues** (대사)
```
| sceneId | speaker | text | characters |
|---------|---------|------|------------|
| scene1 | aa | 안녕하세요. | aa:default:left:true |
| scene1 | bb | 안뇽. | aa:default:left:false,bb:default:center:true |
| scene1_choice | aa | 이름이 뭐예요? | aa:default:left:true,bb:default:center:false |
```

**characters 형식**: `캐릭터ID:감정:위치:활성화,캐릭터ID:감정:위치:활성화,...`

- 감정: `default`, `sad`, `happy` 등 (emotions에서 정의한 것)
- 위치: `left`, `center`, `right`
- 활성화: `true` 또는 `false`

#### **Choices** (선택지)
```
| sceneId | index | text | next | affectionChanges | speaker | reactionText | reactionCharacters |
|---------|-------|------|------|------------------|---------|--------------|-------------------|
| scene1_choice | 1 | 친절하게 대답 | scene2 | aa:2 | aa | 착한 사람이네요! | aa:happy:left:true,bb:default:center:false |
| scene1_choice | 2 | 무시하기 | scene3 | bb:2 | bb | 흠... | aa:sad:left:false,bb:angry:center:true |
| scene1_choice | 3 | 잠수하기 | scene_bad | aa:-1 | narrator | 시간이 흘렀다... | |
```

**affectionChanges 형식**: `캐릭터ID:값,캐릭터ID:값,...`
- 양수: 호감도 증가
- 음수: 호감도 감소

#### **EndingConfig** (엔딩 설정)
```
| key | value | description | notes |
|-----|-------|-------------|-------|
| bad_threshold | 0 | 나쁜 엔딩 기준값 | |
| normal_threshold | 1 | 보통 엔딩 기준값 | |
| good_threshold | 2 | 좋은 엔딩 기준값 | |
| best_threshold | 4 | 최고 엔딩 기준값 | |
```

## 3️⃣ 데이터 동기화

### 3.1 스프레드시트 공개 설정

1. Google Sheets에서 스프레드시트 ID 복사 (URL에서 추출)
   - URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

2. **공유** → **누구나 액세스 가능** 설정 (또는 조회 권한만)

### 3.2 데이터 다운로드 및 변환

```bash
# 방법 1: 명령어로 직접 실행
npm run fetch:sheets -- --spreadsheet-id YOUR_SHEET_ID --api-key YOUR_API_KEY

# 방법 2: 환경 변수 설정 후 실행
export GOOGLE_SHEETS_ID=YOUR_SHEET_ID
export GOOGLE_API_KEY=YOUR_API_KEY
npm run fetch:sheets
```

### 3.3 package.json 스크립트 추가

```json
{
  "scripts": {
    "fetch:sheets": "node scripts/fetchFromGoogleSheets.js",
    "fetch:sheets:interactive": "node scripts/fetchFromGoogleSheets.js --interactive"
  }
}
```

## 4️⃣ 필요한 링크 정리

### 핵심 링크

| 항목 | 링크 |
|------|------|
| Google Cloud Console | https://console.cloud.google.com/ |
| Google Sheets API 문서 | https://developers.google.com/sheets/api |
| Sheets API 레퍼런스 | https://developers.google.com/sheets/api/reference/rest |
| 스프레드시트 템플릿 | (직접 만들거나 공유받은 링크) |

### API 키 관련

- **API 키 관리**: Google Cloud Console → API 및 서비스 → 사용자 인증 정보
- **API 키 제한**: IP 주소, HTTP 레퍼러, API 제한 설정 가능

## 5️⃣ 트러블슈팅

### Q: "API 키가 유효하지 않습니다" 오류

**해결책**:
1. API 키가 정확한지 확인
2. Google Sheets API가 활성화되어 있는지 확인
3. 스프레드시트가 공개 설정되어 있는지 확인

### Q: 데이터 형식 오류

**해결책**:
1. Sheets에서 지정된 형식을 정확히 따랐는지 확인
2. 빈 행이 없는지 확인 (구분자 역할)
3. 특수 문자는 제대로 이스케이프되었는지 확인

### Q: 캐릭터 이미지가 표시되지 않음

**해결책**:
1. `public/assets/characters/{imageFolder}/{fileName}` 경로 확인
2. 파일 이름이 정확한지 확인 (대소문자 구분)

## 6️⃣ 자동 동기화 설정 (선택사항)

GitHub Actions를 사용해 자동으로 Sheets에서 동기화:

```yaml
# .github/workflows/sync-sheets.yml
name: Sync from Google Sheets

on:
  schedule:
    - cron: '0 */6 * * *'  # 6시간마다 실행
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Fetch from Sheets
        env:
          GOOGLE_SHEETS_ID: ${{ secrets.GOOGLE_SHEETS_ID }}
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
        run: npm run fetch:sheets
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add public/storyData.json
          git commit -m "chore: sync from Google Sheets" || true
          git push
```

## 7️⃣ 보안 주의사항

⚠️ **API 키 노출 금지**:
- GitHub에 API 키를 commit하지 마세요
- `.env.local` 파일에 저장하고 `.gitignore`에 추가
- GitHub Secrets를 사용해 CI/CD에서 관리
- 필요시 스프레드시트 공유 범위 제한

**권장 방법**:
```bash
# .env.local (절대 commit하지 않음)
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_API_KEY=your_api_key
```

```javascript
// .gitignore에 추가
.env.local
.env.*.local
```

## 8️⃣ 예시: 전체 워크플로우

1. Google Sheets에서 시나리오 작성
2. 데이터 정기적으로 동기화
   ```bash
   npm run fetch:sheets
   ```
3. `public/storyData.json` 자동 생성
4. 게임 실행 시 새로운 데이터 로드
5. 변경 사항 자동 적용 (재배포 불필요)

---

**문제가 있으시면 이슈를 등록해주세요!** 🚀
