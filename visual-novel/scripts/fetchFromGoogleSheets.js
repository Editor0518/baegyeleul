/**
 * fetchFromGoogleSheets.js
 * Google Sheets에서 스토리 데이터를 받아와 storyData.json으로 변환
 *
 * 사용법:
 * node scripts/fetchFromGoogleSheets.js --spreadsheet-id YOUR_SHEET_ID --api-key YOUR_API_KEY
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 명령어 인자 파싱
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--spreadsheet-id' && args[i + 1]) {
      config.spreadsheetId = args[i + 1];
      i++;
    }
    if (args[i] === '--api-key' && args[i + 1]) {
      config.apiKey = args[i + 1];
      i++;
    }
  }
  
  return config;
}

/**
 * Google Sheets API에서 데이터 받아오기
 * @param {string} spreadsheetId - 스프레드시트 ID
 * @param {string} apiKey - Google API 키
 * @param {string} range - 받아올 범위 (예: "시트이름!A1:Z1000")
 */
async function fetchSheetData(spreadsheetId, apiKey, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  
  try {
    const response = await fetch(`${url}?key=${apiKey}`);
    if (!response.ok) {
      let errorMsg = `${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error?.message || errorMsg;
      } catch (e) {}
      throw new Error(`API 오류: ${errorMsg}\n범위: ${range}`);
    }
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('❌ 시트 데이터 받아오기 실패:', error.message);
    throw error;
  }
}

/**
 * 시트 데이터를 storyData JSON 형식으로 변환
 */
async function convertSheetToStoryData(spreadsheetId, apiKey) {
  try {
    console.log('📥 Google Sheets에서 데이터를 받아오는 중...\n');

    // 각 시트별로 데이터 받아오기
    const gameInfoData = await fetchSheetData(spreadsheetId, apiKey, 'game_info!A1:B100');
    const charactersData = await fetchSheetData(spreadsheetId, apiKey, 'characters!A1:H100');
    const placesData = await fetchSheetData(spreadsheetId, apiKey, 'places!A1:D100');
    const scenesData = await fetchSheetData(spreadsheetId, apiKey, 'scenes!A1:Z1000');
    const dialoguesData = await fetchSheetData(spreadsheetId, apiKey, 'dialogues!A1:Z1000');
    const choicesData = await fetchSheetData(spreadsheetId, apiKey, 'choices!A1:Z1000');
    const sceneCharactersData = await fetchSheetData(spreadsheetId, apiKey, 'scene_characters!A1:Z1000');
    const endingData = await fetchSheetData(spreadsheetId, apiKey, 'ending!A1:Z1000');
    const endingSystemData = await fetchSheetData(spreadsheetId, apiKey, 'ending_system!A1:D100');

    // 데이터 변환
    const gameInfo = parseGameInfo(gameInfoData);
    const characters = parseCharacters(charactersData);
    const places = parsePlaces(placesData);
    const storyScenes = parseScenes(scenesData, dialoguesData, choicesData);
    const endingConfig = parseEndingConfig(endingSystemData);

    const storyData = {
      gameInfo,
      characters,
      places,
      storyScenes,
      endingConfig,
    };

    return storyData;
  } catch (error) {
    console.error('❌ 데이터 변환 실패:', error);
    process.exit(1);
  }
}

/**
 * GameInfo 시트 파싱
 * 두 가지 형식 모두 지원:
 * 형식 1 (키-값):
 * | 항목 | 값 |
 * | title | 게임 제목 |
 * 
 * 형식 2 (헤더-데이터):
 * | 제목(title) | 부제(subtitle) | 주인공(me) | 배경음악(backgroundMusic) |
 * | 어느 여자... | 글: 계를... | 에투아르 | SymphonieFantastique.mp3 |
 */
function parseGameInfo(data) {
  const gameInfo = {
    title: '',
    subtitle: '',
    me: '',
    backgroundMusic: '',
  };

  if (!data || data.length === 0) return gameInfo;

  // 형식 2: 헤더-데이터 형식 감지
  // 첫 번째 행에 "title", "subtitle" 등의 키워드가 포함되어 있으면 헤더
  if (data[0] && data[0].length >= 2) {
    const headerText = data[0].map(h => String(h || '').toLowerCase()).join('|');
    
    // title, subtitle, me, backgroundmusic 등의 키워드 확인
    if (headerText.includes('title') || headerText.includes('제목')) {
      // 형식 2: 첫 행이 헤더, 두 번째 행이 데이터
      if (data.length >= 2 && data[1]) {
        const dataRow = data[1];
        
        // 열의 위치에 따라 고정 매핑
        // 첫 번째 열: 제목(title)
        if (dataRow[0]) gameInfo.title = String(dataRow[0]).trim();
        
        // 두 번째 열: 부제(subtitle)
        if (dataRow[1]) gameInfo.subtitle = String(dataRow[1]).trim();
        
        // 세 번째 열: 주인공(me)
        if (dataRow[2]) gameInfo.me = String(dataRow[2]).trim();
        
        // 네 번째 열: 배경음악(backgroundMusic)
        if (dataRow[3]) gameInfo.backgroundMusic = String(dataRow[3]).trim();
        
        // 디버그 정보 (개발 모드에서만)
        if (process.env.DEBUG_GAMEINFO) {
          console.log('[GameInfo 파싱 결과]');
          console.log('데이터:', dataRow);
          console.log('결과:', gameInfo);
        }
        
        return gameInfo;
      }
    }
  }

  // 형식 1: 키-값 형식 (이전 호환성)
  let startRow = 0;
  
  // 헤더 감지
  if (data[0] && data[0][0]) {
    const firstCell = String(data[0][0]).toLowerCase();
    if (firstCell === '항목' || firstCell === 'key' || firstCell === 'name') {
      startRow = 1; // 헤더 행 스킵
    }
  }

  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 2) continue;

    const key = String(row[0] || '').toLowerCase().trim();
    const value = String(row[1] || '').trim();

    // 주의: includes 사용 시 부분 문자열도 매칭되므로 순서가 중요!
    // "subtitle"은 "title"을 포함하므로 subtitle을 먼저 확인해야 함
    if (key.includes('subtitle') || key === '부제') gameInfo.subtitle = value;
    else if (key.includes('title') || key === '제목') gameInfo.title = value;
    else if (key.includes('me') || key === '주인공' || key === 'player') gameInfo.me = value;
    else if (key.includes('backgroundmusic') || key.includes('background') || key === '배경음악' || key === 'bgm' || key === '음악') gameInfo.backgroundMusic = value;
  }

  return gameInfo;
}

/**
 * Characters 시트 파싱
 * 형식:
 * | id | name | color | initialAffection | minAffection | maxAffection | imageFolder | emotions |
 * | aa | 에이 | #ffffff | 0 | 0 | 10 | aa | default:aa_01_default.png,sad:aa_02_sad.png |
 */
function parseCharacters(data) {
  const characters = {};
  
  if (!data || data.length === 0) return characters;

  // 헤더 행 찾기
  let headerRow = 0;
  const headers = [];
  
  if (data[0]) {
    const firstRowLower = data[0].map(h => String(h || '').toLowerCase());
    if (firstRowLower.includes('id') || firstRowLower.includes('name')) {
      headerRow = 1;
      headers.push(...firstRowLower);
    } else if (data[1]) {
      // 두 번째 행이 헤더일 수도 있음
      const secondRowLower = data[1].map(h => String(h || '').toLowerCase());
      if (secondRowLower.includes('id') || secondRowLower.includes('name')) {
        headerRow = 2;
        headers.push(...secondRowLower);
      }
    }
  }

  // 헤더를 찾지 못한 경우 기본 구조 가정
  if (headers.length === 0) {
    headers.push('id', 'name', 'color', 'initialaffection', 'minaffection', 'maxaffection', 'imagefolder', 'emotions');
    headerRow = 0;
  }

  for (let i = headerRow; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;

    const id = String(row[0] || '').trim();
    if (!id) continue;

    const getField = (fieldName) => {
      const idx = headers.indexOf(fieldName);
      return idx >= 0 ? String(row[idx] || '').trim() : '';
    };

    const character = {
      id,
      name: getField('name'),
      color: getField('color') || '#ffffff',
      initialAffection: parseInt(getField('initialaffection') || 0) || 0,
      minAffection: parseInt(getField('minaffection') || 0) || 0,
      maxAffection: parseInt(getField('maxaffection') || 10) || 10,
      imageFolder: getField('imagefolder') || getField('imagefolder') || id,
      emotions: parseEmotions(getField('emotions')),
    };

    characters[id] = character;
  }

  return characters;
}

/**
 * 감정 표현 문자열 파싱
 * 형식: "default:aa_01_default.png,sad:aa_02_sad.png"
 */
function parseEmotions(emotionStr) {
  const emotions = { default: 'default.png' };

  if (!emotionStr) return emotions;

  const pairs = emotionStr.split(',').map(s => s.trim());
  pairs.forEach(pair => {
    const [emotion, file] = pair.split(':').map(s => s.trim());
    if (emotion && file) {
      emotions[emotion] = file;
    }
  });

  return emotions;
}

/**
 * Places 시트 파싱
 * 형식:
 * | id | name | image | color |
 * | forest | 숲속 | forest.png | #2d5016 |
 */
function parsePlaces(data) {
  const places = {};

  if (!data || data.length === 0) return places;

  // 헤더 행 찾기
  let headerRow = 0;
  const headers = [];
  
  if (data[0]) {
    const firstRowLower = data[0].map(h => String(h || '').toLowerCase());
    if (firstRowLower.includes('id') || firstRowLower.includes('name')) {
      headerRow = 1;
      headers.push(...firstRowLower);
    }
  }

  // 헤더를 찾지 못한 경우 기본 구조 가정
  if (headers.length === 0) {
    headers.push('id', 'name', 'image', 'color');
    headerRow = 0;
  }

  const getField = (fieldName, row) => {
    const idx = headers.indexOf(fieldName);
    return idx >= 0 ? String(row[idx] || '').trim() : '';
  };

  for (let i = headerRow; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;

    const id = String(row[0] || '').trim();
    if (!id) continue;

    const place = {
      id,
      name: getField('name', row),
      image: getField('image', row),
      color: getField('color', row),
    };

    places[id] = place;
  }

  return places;
}

/**
 * Scenes, Dialogues, Choices 시트 파싱하여 storyScenes 생성
 */
function parseScenes(scenesData, dialoguesData, choicesData) {
  const scenes = [];

  if (!scenesData || scenesData.length === 0) return scenes;

  // 헤더 인식
  let sceneHeaderRow = 0;
  const sceneHeaders = [];
  
  if (scenesData[0]) {
    const firstRowLower = scenesData[0].map(h => String(h || '').toLowerCase());
    if (firstRowLower.includes('id') || firstRowLower.includes('type')) {
      sceneHeaderRow = 1;
      sceneHeaders.push(...firstRowLower);
    }
  }
  
  if (sceneHeaders.length === 0) {
    sceneHeaders.push('id', 'type', 'place', 'next');
    sceneHeaderRow = 0;
  }

  const getSceneField = (fieldName, row) => {
    const idx = sceneHeaders.indexOf(fieldName);
    return idx >= 0 ? String(row[idx] || '').trim() : '';
  };

  // 씬별로 대사와 선택지를 연결
  for (let i = sceneHeaderRow; i < scenesData.length; i++) {
    const sceneRow = scenesData[i];
    if (!sceneRow || !sceneRow[0]) continue;

    const sceneId = String(sceneRow[0] || '').trim();
    if (!sceneId) continue;

    const scene = {
      id: sceneId,
      type: getSceneField('type', sceneRow) || 'normal',
      place: getSceneField('place', sceneRow),
      dialogues: [],
      next: getSceneField('next', sceneRow) || null,
    };

    // 이 씬의 대사 찾기 - 헤더 건너뛰고 시작
    let dialogueStartRow = 0;
    if (dialoguesData && dialoguesData[0]) {
      const firstDialogueLower = dialoguesData[0].map(h => String(h || '').toLowerCase());
      if (firstDialogueLower.includes('sceneid') || firstDialogueLower.includes('scene_id')) {
        dialogueStartRow = 1;
      }
    }

    const sceneDialogues = dialoguesData 
      ? dialoguesData.filter((row, idx) => {
          if (idx < dialogueStartRow) return false;
          return String(row[0] || '').trim() === sceneId;
        })
      : [];

    scene.dialogues = sceneDialogues.map(row => ({
      speaker: String(row[1] || '').trim(),
      text: String(row[2] || '').trim(),
      characters: parseCharacterList(String(row[3] || '').trim()),
    }));

    // 선택지 씬이면 선택지 추가
    if (scene.type === 'choice' && choicesData) {
      let choiceStartRow = 0;
      if (choicesData[0]) {
        const firstChoiceLower = choicesData[0].map(h => String(h || '').toLowerCase());
        if (firstChoiceLower.includes('sceneid') || firstChoiceLower.includes('scene_id')) {
          choiceStartRow = 1;
        }
      }

      const sceneChoices = choicesData.filter((row, idx) => {
        if (idx < choiceStartRow) return false;
        return String(row[0] || '').trim() === sceneId;
      });

      scene.choices = sceneChoices.map(row => ({
        text: String(row[2] || '').trim(),
        next: String(row[3] || '').trim() || null,
        index: parseInt(String(row[1] || '1')) || 1,
        affectionChanges: parseAffectionChanges(String(row[4] || '').trim()),
        reaction: {
          speaker: String(row[5] || '').trim(),
          text: String(row[6] || '').trim(),
          characters: parseCharacterList(String(row[7] || '').trim()),
        },
      }));
    }

    if (scene.dialogues.length > 0 || scene.type !== 'normal') {
      scenes.push(scene);
    }
  }

  return scenes;
}

/**
 * 캐릭터 리스트 문자열 파싱
 * 형식: "aa:default:left:true,bb:default:center:false"
 */
function parseCharacterList(charStr) {
  const characters = [];

  if (!charStr) return characters;

  const items = charStr.split(',').map(s => s.trim());
  items.forEach((item, index) => {
    const [id, emotion, position, activeStr] = item.split(':').map(s => s.trim());
    if (id) {
      characters.push({
        id,
        emotion: emotion || 'default',
        position: position || 'center',
        active: activeStr ? activeStr.toLowerCase() === 'true' : index === 0,
      });
    }
  });

  return characters;
}

/**
 * 호감도 변화 문자열 파싱
 * 형식: "aa:2,bb:-1"
 */
function parseAffectionChanges(affectionStr) {
  const changes = {};

  if (!affectionStr) return changes;

  const pairs = affectionStr.split(',').map(s => s.trim());
  pairs.forEach(pair => {
    const [charId, value] = pair.split(':').map(s => s.trim());
    if (charId && value) {
      changes[charId] = parseInt(value);
    }
  });

  return changes;
}

/**
 * EndingConfig 시트 파싱
 */
function parseEndingConfig(data) {
  const endingConfig = {
    thresholds: {
      bad: 0,
      normal: 1,
      good: 2,
      best: 4,
    },
    common: {
      normal: {
        title: '엔딩 제목',
        message: '엔딩 설명',
      },
    },
    duo: [],
    characterEndings: {},
  };

  // 데이터가 있으면 파싱 (예시 구조)
  if (data.length > 1) {
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;

      // EndingConfig 파싱 로직 추가
    }
  }

  return endingConfig;
}

/**
 * 메인 함수
 */
async function main() {
  const config = parseArgs();

  if (!config.spreadsheetId || !config.apiKey) {
    console.error('❌ 필수 인자 누락');
    console.log('\n사용법:');
    console.log('node scripts/fetchFromGoogleSheets.js --spreadsheet-id YOUR_SHEET_ID --api-key YOUR_API_KEY');
    console.log('\n필수 인자:');
    console.log('  --spreadsheet-id: Google Sheets ID (URL에서 추출)');
    console.log('  --api-key: Google API 키');
    process.exit(1);
  }

  try {
    console.log('🚀 Google Sheets 데이터 변환 시작\n');
    const storyData = await convertSheetToStoryData(config.spreadsheetId, config.apiKey);

    const outputPath = join(__dirname, '../public/storyData.json');
    writeFileSync(outputPath, JSON.stringify(storyData, null, 2), 'utf-8');

    console.log('\n✅ storyData.json 파일이 생성되었습니다.');
    console.log(`📁 경로: ${outputPath}`);
    console.log(`📊 씬 개수: ${storyData.storyScenes.length}`);
    console.log(`👥 캐릭터 개수: ${Object.keys(storyData.characters).length}`);
    console.log(`🏞️ 장소 개수: ${Object.keys(storyData.places).length}`);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main();
