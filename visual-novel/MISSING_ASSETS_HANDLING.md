# 누락된 에셋 처리 가이드

## 개요

프로젝트에서 스프레드시트 데이터에서 참조하는 이미지(표정, 배경) 또는 음악 파일이 에셋 폴더에 없을 때, **에러를 발생시키지 않고 우아하게 처리**하도록 개선되었습니다.

## 개선 사항

### 1. 음악 (BGM) 처리 - `hooks/useBGM.js`
- **변경 전**: 파일 확인 실패 시 에러 throw
- **변경 후**: 파일 존재 여부를 먼저 확인하고, 없으면 경고 로그만 출력
- **동작**: 해당 BGM 없이 진행 (음악 없이 게임 플레이 가능)

```javascript
// 파일 확인 (HEAD 요청)
const head = await fetch(url, { method: "HEAD" });
if (!head.ok) {
  console.warn(`[BGM] 파일을 찾을 수 없음: ${newBGM} (${head.status}) - 스킵합니다.`);
  return; // 조용히 스킵
}
```

### 2. 캐릭터 표정 이미지 - `components/CharacterSprite.jsx`
- **변경 전**: 존재하지 않는 감정에 대해 경고 없이 무시
- **변경 후**: 감정이 없으면 상세 경고 로그 출력
- **동작**: 해당 캐릭터가 화면에 표시되지 않음 (다른 캐릭터는 정상 표시)

```javascript
// 감정 파일 확인
if (!char.emotions[emotion]) {
  console.warn(
    `[CharacterSprite] 감정 파일 없음: ${charId}/${emotion} - 스탠딩이 표시되지 않습니다.`
  );
  return null;
}

// 이미지 로드 실패 시
img.onError = (e) => {
  console.warn(`[CharacterSprite] 이미지 로드 실패: ${id} (${emotion}) - 파일이 존재하지 않습니다.`);
  e.target.style.display = "none";
};
```

### 3. 배경 이미지 - `utils/backgroundHelper.js`
- **변경 전**: 이미지 없을 때 기본 배경으로 폴백하지만 로그 없음
- **변경 후**: 장소 정보나 이미지 없을 때 경고 로그 출력
- **동작**: 색상 배경 또는 기본 배경으로 표시

```javascript
// 장소 정보 없음 → 기본 배경 + 경고
if (!place) {
  console.warn(`[backgroundHelper] 장소 정보 없음: ${placeId} - 기본 배경으로 표시됩니다.`);
  return { background: '#f5f5f5' };
}

// 이미지 없음 → 색상 배경 + 경고
if (!place.image) {
  console.warn(`[backgroundHelper] 배경 이미지 없음: ${placeId} - 색상으로 표시됩니다.`);
  return { background: place.color || '#f5f5f5' };
}
```

### 4. 이미지 수집기 - `utils/imageCollector.js`
- **변경 전**: null 반환 시 로그 없음
- **변경 후**: 캐릭터/장소 정보 누락 시 상세 경고 로그 출력
- **동작**: preload할 이미지 목록에서 제외 (부하 감소)

```javascript
// 캐릭터 정보 없음
if (!char) {
  console.warn(
    `[imageCollector] 캐릭터 정보 없음: ${charId} - 이미지가 표시되지 않습니다.`
  );
  return null;
}

// 감정 파일 없음
if (!char.emotions[emotion]) {
  console.warn(
    `[imageCollector] 감정 파일 없음: ${charId}/${emotion} - 이미지가 표시되지 않습니다.`
  );
  return null;
}
```

### 5. 이미지 프리로더 - `utils/imagePreloader.js`
- **변경 전**: 이미지 로드 실패 시 generic 경고
- **변경 후**: 파일 경로를 포함한 명확한 경고 로그
- **동작**: preload 실패해도 계속 진행 (오류 없이 게임 진행)

```javascript
img.onerror = (error) => {
  console.warn(`[ImagePreloader] 이미지 로드 실패: ${url} - 파일이 존재하지 않을 수 있습니다.`, error);
  resolve(null); // 계속 진행
};
```

## 스프레드시트 작성 시 주의사항

### 캐릭터 감정 파일 (필수)
- `characters` 시트에서 정의한 감정에 해당하는 이미지 파일이 있어야 합니다.
- 예: `characters/liszt/default.png`, `characters/liszt/happy.png`

### 배경 이미지 (선택)
- `places` 시트에서 정의한 이미지가 없으면 색상 배경으로 표시됩니다.
- 이미지 경로: `public/assets/places/{image_file_name}`

### 음악 파일 (선택)
- 배경음악(BGM)이 없으면 게임이 음악 없이 진행됩니다.
- 이미지 경로: `public/assets/musics/{bgm_file_name}`

## 브라우저 콘솔에서 확인하기

개발자 도구(F12) → Console 탭에서 다음과 같은 메시지를 확인할 수 있습니다:

```
[BGM] 파일을 찾을 수 없음: bgm.mp3 (404) - 스킵합니다.
[CharacterSprite] 감정 파일 없음: liszt/crying - 스탠딩이 표시되지 않습니다.
[backgroundHelper] 배경 이미지 없음: room01 - 색상으로 표시됩니다.
[imageCollector] 캐릭터 정보 없음: unknown_char - 이미지가 표시되지 않습니다.
[ImagePreloader] 이미지 로드 실패: /assets/characters/liszt/unknown.png - 파일이 존재하지 않을 수 있습니다.
```

## 디버깅 팁

1. **누락된 감정 파일 찾기**
   - 콘솔에서 `[CharacterSprite] 감정 파일 없음` 메시지 찾기
   - 해당 감정을 스프레드시트에서 제거하거나 이미지 파일 추가

2. **누락된 배경 이미지 찾기**
   - 콘솔에서 `[backgroundHelper] 배경 이미지 없음` 메시지 찾기
   - `public/assets/places/` 폴더에 이미지 추가 또는 스프레드시트 수정

3. **누락된 음악 파일 찾기**
   - 콘솔에서 `[BGM] 파일을 찾을 수 없음` 메시지 찾기
   - `public/assets/musics/` 폴더에 파일 추가 또는 스프레드시트에서 제거

## 요약

| 항목 | 이전 동작 | 현재 동작 |
|------|---------|---------|
| BGM 파일 없음 | 에러 또는 로그 없음 | 경고 로그 후 스킵 |
| 캐릭터 감정 없음 | 로그 없음 | 상세 경고 로그 + 스탠딩 미표시 |
| 배경 이미지 없음 | 로그 없음 | 경고 로그 + 색상 배경 표시 |
| 이미지 로드 실패 | Generic 경고 | 파일 경로 포함 경고 |

모든 에러는 우아하게 처리되어 **게임 플레이가 중단되지 않습니다**.
