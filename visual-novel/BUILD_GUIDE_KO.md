# 빌드 & 테스트 실행 가이드

## 한눈에 보기

| 하고 싶은 것 | 명령어 (`visual-novel` 폴더에서) | 결과 |
|---|---|---|
| 코드 고치면서 바로바로 확인 | `npm run dev` | http://localhost:3000 |
| 배포용 빌드 | `npm run build` | `out/` 폴더 생성 |
| 빌드 결과 실행해보기 | 저장소 루트의 `start-server.bat` 더블클릭 | http://localhost:8000 자동으로 열림 |
| 빌드 + zip 압축 | `npm run build:package` | `visual-novel-out.zip` |

> **스프레드시트만 고쳤다면 다시 빌드할 필요 없습니다.**
> 게임 데이터는 실행할 때 Apps Script API로 시트에서 바로 불러옵니다 ([GameContext.jsx](contexts/GameContext.jsx)).
> 빌드는 **코드(.js/.jsx)를 고쳤을 때만** 하면 됩니다.

---

## 0. 처음 한 번만: 준비

### Node 버전 관리: nvm-windows

이 PC는 Node.js 버전을 **nvm-windows**로 관리합니다. Python처럼 가상환경을 "켜는" 단계는 없습니다. 터미널을 열면 nvm에서 선택된 버전이 바로 쓰입니다.

- 이 프로젝트를 빌드한 버전: **Node 24.12.0** (npm 11.6.2)
- 설치된 다른 버전: 22.19.0, 18.20.8 (18.18 이상이면 모두 사용 가능)
- 프로젝트에 버전 지정 파일(`.nvmrc` 등)은 없습니다.

```bash
node -v           # 지금 쓰는 버전 확인
nvm list          # 설치된 버전 목록 (* 표시가 사용 중)
nvm use 24.12.0   # 버전 바꾸기 (관리자 권한 터미널에서 실행)
```

### 패키지 설치

패키지는 프로젝트 안의 `visual-novel/node_modules` 폴더에 설치됩니다. 이 폴더가 이미 있으면 건너뛰어도 됩니다. 없거나 `package.json`이 바뀌었을 때만 설치하세요.

```bash
cd visual-novel
npm install
```

이후 명령어는 모두 **`visual-novel` 폴더 안에서** 실행합니다. (`start-server.bat`만 저장소 루트에 있습니다.)

---

## 1. 개발 중 테스트: `npm run dev`

```bash
npm run dev
```

- 브라우저에서 http://localhost:3000 을 엽니다.
- 코드를 저장하면 화면에 자동으로 반영됩니다. 빌드할 필요가 없습니다.
- 끝낼 때는 터미널에서 `Ctrl+C`를 누릅니다.

빌드하기 전에 이 방법으로 먼저 확인하는 게 가장 빠릅니다.

---

## 2. 빌드: `npm run build`

```bash
npm run build
```

마지막에 아래처럼 나오면 성공입니다.

```
 ✓ Compiled successfully
 ...
 ✓ Exporting (2/2)
○  (Static)  prerendered as static content
```

- 결과물은 `visual-novel/out/` 폴더에 생깁니다.
- 이 폴더만 있으면 Node.js 없이 어떤 웹 서버에서든 실행됩니다.
- 빌드 중 오류가 나면 오류 메시지에 파일 이름과 줄 번호가 나오니 그곳을 확인하세요.

---

## 3. 빌드 결과 실행해보기

### 방법 A: `start-server.bat` (추천)

저장소 루트(`baegyeleul/`)의 **`start-server.bat`을 더블클릭**합니다.

- `visual-novel/out` 폴더를 8000번 포트로 띄우고, 브라우저를 자동으로 엽니다 (http://localhost:8000).
- 서버는 따로 뜬 PowerShell 창에서 돌아갑니다. **끝낼 때는 그 창을 닫으면** 됩니다.

### 방법 B: 터미널 명령어

```bash
npx serve out -l 3000
```

그다음 http://localhost:3000 을 엽니다. 끝낼 때는 `Ctrl+C`를 누릅니다.

### ⚠️ `out/index.html`을 더블클릭해서 열면 안 됩니다

파일을 직접 열면(`file://...`) 스크립트 경로가 깨져서 화면이 안 나옵니다. 반드시 A나 B처럼 서버로 띄워서 여세요.

---

## 4. 배포/공유용 zip 만들기

```bash
npm run build:package
```

- 빌드한 뒤 `out/` 폴더를 `visual-novel/visual-novel-out.zip`으로 압축합니다.
- 받는 사람은 압축을 풀고 웹 서버로 띄워야 합니다 (위 3번 참고).

---

## 5. 테스트할 때 팁

- **디버그 창:** 게임 화면에서 `Ctrl+Shift+D`를 누르면 현재 변수·호감도·씬 기록을 볼 수 있습니다. 명령어가 제대로 실행됐는지 확인할 때 씁니다.
- **새 게임으로 시작하기:** 예전 버전에서 저장한 세이브에는 버그로 잘못 생긴 변수(예: 선택지에서 `add 1 to mendelssohn`을 실행해 생긴 `mendelssohn` 변수)가 남아 있을 수 있습니다. 명령어 동작을 확인할 때는 새 게임으로 시작하세요.
- **명령어 실행 로그:** 브라우저에서 `F12` → Console 탭을 열면 `[handleNext]`, `[handleChoice]`로 시작하는 로그에서 어떤 명령어가 실행됐고 어느 씬으로 갔는지 볼 수 있습니다.

---

## 6. 문제 해결

| 증상 | 해결 |
|---|---|
| `start-server.bat` 실행 시 "Build output not found" | 아직 빌드를 안 했습니다. `npm run build`를 먼저 하세요. |
| 고친 코드가 화면에 반영이 안 됨 | 다시 빌드했는지 확인 → 브라우저 탭을 닫았다가 다시 열기 |
| 포트가 이미 사용 중이라는 오류 | 이미 떠 있는 서버 창(또는 `npm run dev` 터미널)을 닫고 다시 실행 |
| 빌드가 이상하게 실패함 | `visual-novel/.next` 폴더를 지우고 다시 `npm run build` |
| `npm` 명령어를 찾을 수 없음 | Node.js가 설치 안 됨 → https://nodejs.org 에서 LTS 버전 설치 |

---

## 참고: git 커밋할 때

`out/` 폴더는 `.gitignore`에 들어 있지만, 그 안의 일부 파일(`index.html`, `404.html`, `index.txt` 등)은 예전부터 git에 올라가 있습니다. 그래서 빌드할 때마다 이 파일들이 "변경됨"으로 표시됩니다. 지금까지는 코드 변경과 함께 커밋해 왔으니 그대로 같이 커밋하시면 됩니다.
