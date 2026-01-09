# 403 Forbidden 오류 해결 가이드

## 문제
```
❌ API 오류: 403 Forbidden
```

**403 Forbidden**은 API 키가 유효하지 않거나 접근 권한이 없다는 뜻입니다.

---

## 🔍 진단 방법

### 1단계: 진단 스크립트 실행

```bash
npm run debug:sheets -- SPREADSHEET_ID API_KEY
```

또는 환경 변수로:

```bash
npm run debug:sheets
```

진단 결과를 보고 아래에서 해당하는 해결 방법을 찾으세요.

---

## 🛠️ 해결 방법

### 원인 1: Google Sheets API가 활성화되지 않음

**확인 방법:**
```
Google Cloud Console
  → https://console.cloud.google.com/apis/library/sheets.googleapis.com
  → "Google Sheets API" 검색
```

**해결 방법:**

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택
3. **API 및 서비스** → **라이브러리** 이동
4. "Google Sheets API" 검색
5. **활성화** 클릭

✅ 완료: API가 활성화되었습니다

---

### 원인 2: API 키가 잘못되었음

**확인 방법:**

1. 제공받은 API 키가 맞는지 확인
2. 복사/붙여넣기 오류 확인 (공백 없는지)
3. API 키 길이가 30자 이상인지 확인

**해결 방법:**

API 키를 다시 생성하세요:

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **API 및 서비스** → **사용자 인증 정보** 이동
3. 기존 API 키 삭제 (옵션)
4. **사용자 인증 정보 만들기** → **API 키** 선택
5. 새로운 API 키 복사
6. `.env.local` 파일 업데이트

```
GOOGLE_API_KEY=새로운_API_키
```

✅ 완료: 새로운 API 키를 사용하세요

---

### 원인 3: 스프레드시트 ID가 잘못되었음

**확인 방법:**

URL에서 ID 추출:
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
                                      ↑ 여기!
```

**해결 방법:**

1. Google Sheets 스프레드시트 열기
2. URL에서 SPREADSHEET_ID 확인
3. `.env.local` 파일 업데이트

```
GOOGLE_SHEETS_ID=올바른_ID
```

✅ 완료: 올바른 스프레드시트 ID를 사용하세요

---

### 원인 4: API 키에 IP 제한이 설정되어 있음

**확인 방법:**

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
2. **사용자 인증 정보** 에서 API 키 선택
3. **애플리케이션 제한** 확인
4. **API 제한** 확인

**해결 방법:**

#### 방법 A: IP 제한 제거 (개발 중일 때)

1. Google Cloud Console에서 API 키 선택
2. **애플리케이션 제한**에서 **제한 없음** 선택
3. 저장

⚠️ 주의: 프로덕션 배포 전에 IP 제한을 다시 설정하세요

#### 방법 B: 현재 IP를 화이트리스트에 추가

1. [현재 IP 확인](https://www.whatismyipaddress.com/)
2. Google Cloud Console에서 API 키 선택
3. **애플리케이션 제한** → **HTTP 레퍼러**
4. 현재 IP와 localhost 추가:
   ```
   127.0.0.1
   localhost
   your-current-ip
   ```

✅ 완료: IP 제한이 해제되었거나 현재 IP가 포함되었습니다

---

### 원인 5: 스프레드시트가 공개 설정이 아님

**확인 방법:**

1. Google Sheets 스프레드시트 열기
2. **공유** 버튼 클릭
3. 공유 범위 확인

**해결 방법:**

1. Google Sheets 스프레드시트 열기
2. **공유** 버튼 클릭
3. **링크 복사** 또는 **누구나 액세스 가능** 설정
4. 저장

✅ 완료: 스프레드시트가 공개되었습니다

---

### 원인 6: API 배치 속도 제한 (Quota)

API가 너무 많은 요청을 받았을 수 있습니다.

**해결 방법:**

1. 몇 분 기다린 후 다시 시도
2. [Google Cloud Console](https://console.cloud.google.com/apis/dashboard) 에서 할당량 확인
3. 필요시 할당량 증가 요청

✅ 완료: 나중에 다시 시도하세요

---

## 📋 전체 확인 체크리스트

```
[ ] 1. Google Sheets API가 활성화되어 있는가?
       확인: https://console.cloud.google.com/apis/library/sheets.googleapis.com

[ ] 2. API 키가 정확한가?
       확인: API 키 길이 30자 이상, 공백 없음

[ ] 3. 스프레드시트 ID가 정확한가?
       확인: URL에서 ID 추출하여 .env.local 업데이트

[ ] 4. API 키에 IP 제한이 없는가?
       확인: https://console.cloud.google.com/apis/credentials
       방법: 제한 없음 또는 현재 IP 추가

[ ] 5. 스프레드시트가 공개 설정인가?
       확인: 공유 범위 "누구나 액세스 가능" 또는 "링크로 열 수 있음"

[ ] 6. API 배치 속도 제한이 아닌가?
       방법: 몇 분 후 다시 시도
```

---

## 🧪 테스트

모든 설정을 완료했으면:

```bash
# 진단 실행
npm run debug:sheets

# 데이터 동기화
npm run fetch:sheets
```

✅ 성공하면:
```
🚀 Google Sheets 데이터 변환 시작
📥 Google Sheets에서 데이터를 받아오는 중...

✅ storyData.json 파일이 생성되었습니다.
```

---

## 💡 추가 팁

### 로컬 개발 중 권장 설정

```
1. API 키: IP 제한 없음 또는 localhost 포함
2. 스프레드시트: 공개 (누구나 액세스)
3. .env.local: 절대 commit하지 않음
```

### 프로덕션 배포 전

```
1. API 키: IP 제한 설정 (서버 IP만)
2. API 키: 필요한 API만 허용 (Google Sheets API만)
3. 스프레드시트: 필요한 사용자만 공유
```

---

## 📞 추가 도움

여전히 문제가 해결되지 않으면:

1. **진단 결과 공유**: `npm run debug:sheets` 결과 스크린샷
2. **오류 메시지 공유**: 정확한 오류 메시지
3. **설정 확인**: 
   - API 키 길이
   - Spreadsheet ID 형식
   - 스프레드시트 존재 여부

---

**다시 시도해보세요!** 🚀
