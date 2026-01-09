# Google Sheets 빠른 시작 가이드

## 🚀 5분 안에 시작하기

### 1단계: Google API 키 발급 (3분)

#### 1.1 Google Cloud 계정이 없으면 생성
- [Google Cloud Console](https://console.cloud.google.com/) 접속

#### 1.2 새 프로젝트 생성
```
프로젝트 선택 → 새 프로젝트 → "visual-novel-studio" → 만들기
```

#### 1.3 Google Sheets API 활성화
```
1. 좌측 "API 및 서비스" → "라이브러리"
2. "Google Sheets API" 검색
3. "활성화" 버튼 클릭
```

#### 1.4 API 키 생성
```
1. "API 및 서비스" → "사용자 인증 정보"
2. "사용자 인증 정보 만들기" → "API 키"
3. 생성된 키 복사 (안전히 보관)
```

### 2단계: Google Sheets 만들기 (1분)

#### 2.1 새 스프레드시트 생성
- [Google Sheets](https://sheets.google.com) 접속
- "새 스프레드시트" 클릭
- 이름: "Visual Novel Story"

#### 2.2 필수 시트 생성
시트 탭에서 다음을 생성:
- `GameInfo`
- `Characters`
- `Places`
- `Scenes`
- `Dialogues`
- `Choices`
- `EndingConfig`

#### 2.3 스프레드시트 공개
```
공유 → 링크 복사 (또는 "누구나 액세스 가능")
```

#### 2.4 스프레드시트 ID 복사
URL에서 추출:
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
                                      ↑
                                    여기!
```

### 3단계: 프로젝트 설정 (1분)

#### 3.1 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env.example .env.local
```

#### 3.2 값 입력
```
GOOGLE_SHEETS_ID=위에서_복사한_아이디
GOOGLE_API_KEY=위에서_발급받은_키
```

### 4단계: 데이터 동기화 (실행!)

```bash
# node-fetch 설치 (처음 한 번만)
npm install node-fetch --save-dev

# 데이터 가져오기
npm run fetch:sheets
```

✅ 완료! `public/storyData.json` 파일이 생성되었습니다.

---

## 📊 Sheets 데이터 입력 예시

### GameInfo 시트
```
항목              | 값
title             | 제목
subtitle          | 부제
me                | 주인공
backgroundMusic   | bg.mp3
```

### Characters 시트
```
id | name | color    | initialAffection | minAffection | maxAffection | imageFolder | emotions
aa | 에이 | #ffffff  | 0                | 0            | 10           | aa          | default:aa_01.png,sad:aa_02.png
bb | 비   | #ff69b4  | 0                | 0            | 10           | bb          | default:bb_01.png,happy:bb_02.png
```

### Places 시트
```
id     | name   | image       | color
forest | 숲속   | forest.png  | #2d5016
school | 학교   | school.png  | #87ceeb
```

### Scenes 시트
```
id             | type   | place  | next
scene1         | normal | forest | scene1_choice
scene1_choice  | choice | forest | scene2
scene2         | normal | school | ending
ending         | ending | forest | 
```

### Dialogues 시트
```
sceneId  | speaker | text          | characters
scene1   | aa      | 안녕하세요.   | aa:default:left:true
scene1   | bb      | 안뇽.         | aa:default:left:false,bb:default:center:true
```

### Choices 시트
```
sceneId        | index | text        | next   | affectionChanges | speaker | reactionText | reactionCharacters
scene1_choice  | 1     | 친절하게    | scene2 | aa:2             | aa      | 착한 사람!   | aa:happy:left:true
scene1_choice  | 2     | 무시하기    | scene3 | bb:2             | bb      | 흠...        | aa:sad:left:false
```

### EndingConfig 시트
```
key               | value | description
bad_threshold     | 0     | 나쁜 엔딩
normal_threshold  | 1     | 보통 엔딩
good_threshold    | 2     | 좋은 엔딩
best_threshold    | 4     | 최고 엔딩
```

---

## 📚 상세 문서

더 자세한 정보는 [GOOGLE_SHEETS_GUIDE.md](./GOOGLE_SHEETS_GUIDE.md) 참고

---

## 🔗 필요한 링크

| 항목 | 링크 |
|------|------|
| 🌐 Google Cloud Console | https://console.cloud.google.com/ |
| 📊 Google Sheets | https://sheets.google.com |
| 📖 Sheets API 문서 | https://developers.google.com/sheets/api |
| 🔑 API 레퍼런스 | https://developers.google.com/sheets/api/reference/rest |

---

## ⚡ 자주 묻는 질문

**Q: API 키를 어디서 얻나요?**
> Google Cloud Console → API 및 서비스 → 사용자 인증 정보에서 API 키를 생성하세요.

**Q: API 키를 GitHub에 올려도 되나요?**
> ❌ 절대 안 됩니다! `.env.local`에 저장하고 `.gitignore`에 추가하세요.

**Q: 데이터를 어떻게 게임에 반영하나요?**
> `npm run fetch:sheets` 실행 → `storyData.json` 생성 → 게임 자동 로드

**Q: 실시간으로 반영되나요?**
> 아니요. `npm run fetch:sheets` 명령어를 실행할 때마다 동기화됩니다.
> 자동 동기화는 GitHub Actions로 설정 가능합니다.

---

## 💡 팁

- 각 시트의 첫 행은 헤더로 인식됩니다
- 빈 행은 구분자로 작용합니다 (피하세요)
- 특수 문자는 Unicode로 입력 가능합니다
- 이미지 경로는 `public/assets/` 상대 경로입니다

---

**문제가 생기면 이슈를 등록하세요!** 🐛
