# 웹주얼 노벨 템플릿

JSON 파일을 통해 웹으로 간단한 비주얼 노벨을 만들 수 있는 템플릿입니다.

## 기능

✅ **PC/모바일 대응** - 반응형 디자인으로 모든 기기에서 작동  
✅ **캐릭터 변경 및 추가** - JSON으로 쉽게 캐릭터 관리  
✅ **표정 변경 지원** - 다양한 감정 표현  
✅ **분기 선택** - 플레이어의 선택에 따라 스토리 변화  
✅ **멀티 엔딩** - 여러 엔딩 지원  
✅ **컷신 지원** - 중요한 장면 강조  
✅ **배경음악** - 씬별 BGM 설정 가능  
✅ **세이브/로드** - localStorage + 파일 다운로드/업로드  
✅ **호감도 시스템** - 캐릭터별 호감도 관리  

## 프로젝트 구조

```
visual-novel-new/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트
├── script.js           # 게임 엔진
├── story.json          # 스토리 데이터
└── assets/             # 리소스 폴더
    ├── characters/     # 캐릭터 이미지
    │   ├── aa/        # 캐릭터 A 스프라이트
    │   └── bb/        # 캐릭터 B 스프라이트
    ├── backgrounds/    # 배경 이미지
    ├── cutscenes/      # 컷신 이미지
    ├── music/          # 배경음악
    └── icon/           # UI 아이콘
```

## 시작하기

### 1. 리소스 준비

`assets` 폴더에 필요한 이미지와 음악 파일을 추가하세요:

**캐릭터 스프라이트** (PNG 권장, 투명 배경)
- `assets/characters/aa/normal.png` - 평범한 표정
- `assets/characters/aa/happy.png` - 행복한 표정
- `assets/characters/aa/sad.png` - 슬픈 표정
- `assets/characters/aa/angry.png` - 화난 표정

**배경 이미지** (JPG/PNG)
- `assets/backgrounds/classroom.jpg`
- `assets/backgrounds/school_yard.jpg`

**음악** (MP3/OGG)
- `assets/music/title.mp3` - 타이틀 BGM
- `assets/music/daily.mp3` - 일상 BGM
- `assets/music/ending.mp3` - 엔딩 BGM

**아이콘** (SVG 권장)
- save.svg, load.svg, exit.svg 등

### 2. 스토리 작성

`story.json` 파일을 수정하여 스토리를 작성하세요.

#### 기본 구조

```json
{
  "title": "게임 제목",
  "startScene": "scene_001",
  "titleMusic": "assets/music/title.mp3",
  "characters": [...],
  "scenes": [...],
  "endings": [...]
}
```

#### 캐릭터 정의

```json
{
  "id": "char_a",
  "name": "민지",
  "initialAffection": 50,
  "sprites": {
    "normal": "assets/characters/aa/normal.png",
    "happy": "assets/characters/aa/happy.png",
    "sad": "assets/characters/aa/sad.png"
  }
}
```

#### 씬 작성

```json
{
  "id": "scene_001",
  "name": "씬 이름",
  "place": "교실",
  "background": "assets/backgrounds/classroom.jpg",
  "music": "assets/music/daily.mp3",
  "dialogues": [
    {
      "speaker": "민지",
      "text": "대사 내용",
      "characters": [
        {
          "id": "char_a",
          "expression": "happy",
          "active": true
        }
      ]
    }
  ],
  "choices": [...],
  "next": "scene_002"
}
```

#### 선택지

```json
{
  "id": "choice_001",
  "text": "선택지 텍스트",
  "affection": {
    "민지": 10
  },
  "setFlag": {
    "flag_name": true
  },
  "next": "scene_003"
}
```

#### 엔딩

```json
{
  "id": "ending_minji",
  "type": "TRUE ENDING",
  "title": "엔딩 제목",
  "message": "엔딩 메시지",
  "music": "assets/music/ending.mp3"
}
```

### 3. 로컬 서버 실행

브라우저 보안 정책으로 인해 로컬 서버가 필요합니다.

**Python 3 사용:**
```bash
cd visual-novel-new
python -m http.server 8000
```

**Node.js 사용:**
```bash
npx http-server visual-novel-new -p 8000
```

브라우저에서 `http://localhost:8000` 접속

## 고급 기능

### 컷신 추가

씬에 `cutscene` 속성을 추가하면 3초간 전체화면으로 이미지가 표시됩니다:

```json
{
  "id": "scene_cutscene",
  "cutscene": "assets/cutscenes/ending_a.jpg",
  "dialogues": [...]
}
```

### 플래그 시스템

선택지로 플래그를 설정하고, 씬 조건으로 활용할 수 있습니다:

```json
{
  "id": "choice_flag",
  "text": "특별한 선택",
  "setFlag": {
    "special_event": true
  },
  "next": "scene_special"
}
```

### 호감도 시스템

선택지마다 캐릭터 호감도를 변경할 수 있습니다 (0-100):

```json
{
  "affection": {
    "민지": 10,
    "서연": -5
  }
}
```

## 세이브/로드 기능

- **로컬 저장소**: 5개의 세이브 슬롯 (브라우저 localStorage)
- **파일 저장**: JSON 파일로 내보내기/불러오기
- **자동 삭제**: 브라우저 데이터 삭제 시 세이브 데이터도 삭제됨

⚠️ **주의**: localStorage는 브라우저 캐시 삭제 시 함께 삭제됩니다. 중요한 진행상황은 파일로 백업하세요.

## 커스터마이징

### CSS 변수 수정

`styles.css`의 CSS 변수를 수정하여 색상 테마를 변경할 수 있습니다:

```css
:root {
    --primary: #fff5da;
    --primary-light: #fff5da;
    /* ... */
}
```

### 스크립트 확장

`script.js`의 `VisualNovelEngine` 클래스를 확장하여 기능을 추가할 수 있습니다.

## 배포

### GitHub Pages

1. GitHub 저장소 생성
2. 파일 업로드
3. Settings > Pages > Source를 `main` 브랜치로 설정
4. `https://username.github.io/repository-name` 으로 접속

### Netlify / Vercel

프로젝트 폴더를 드래그 앤 드롭하여 즉시 배포 가능

## 라이선스

MIT License - 자유롭게 사용 및 수정 가능

## 문제 해결

**Q: 이미지가 표시되지 않아요**  
A: 경로를 확인하고, 로컬 서버에서 실행 중인지 확인하세요.

**Q: 음악이 재생되지 않아요**  
A: 브라우저 자동재생 정책으로 인해 첫 클릭 이후에만 재생됩니다.

**Q: 세이브가 저장되지 않아요**  
A: 시크릿 모드나 개인정보 보호 모드에서는 localStorage가 작동하지 않을 수 있습니다.

## 제작 정보

비주얼 노벨 템플릿 v1.0  
순수 HTML/CSS/JavaScript로 제작  
외부 라이브러리 없이 작동
