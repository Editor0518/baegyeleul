#!/usr/bin/env node

/**
 * test-sheets.js
 * Google Sheets 연결 테스트 및 데이터 미리보기
 */

import fetch from 'node-fetch';

async function testSheetsConnection(spreadsheetId, apiKey) {
  console.log('🧪 Google Sheets 연결 테스트\n');

  const sheetNames = [
    'game_info',
    'characters',
    'places',
    'scenes',
    'dialogues',
    'choices',
    'scene_characters',
    'ending',
    'ending_system',
  ];

  console.log(`📊 테스트할 시트 (총 ${sheetNames.length}개):\n`);

  let successCount = 0;
  let failCount = 0;

  for (const sheetName of sheetNames) {
    try {
      const range = `${sheetName}!A1:Z100`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const rowCount = data.values ? data.values.length : 0;
      const colCount = data.values && data.values[0] ? data.values[0].length : 0;

      console.log(`✅ ${sheetName}`);
      console.log(`   행: ${rowCount}, 열: ${colCount}`);
      
      if (rowCount > 1) {
        console.log(`   헤더: ${data.values[0].join(', ')}`);
      }
      console.log('');

      successCount++;
    } catch (error) {
      console.log(`❌ ${sheetName}`);
      console.log(`   오류: ${error.message}\n`);
      failCount++;
    }
  }

  console.log(`\n📈 결과: ${successCount}/${sheetNames.length} 시트 연결 성공`);
  
  if (failCount === 0) {
    console.log('\n✅ 모든 시트가 정상입니다! npm run fetch:sheets를 실행하세요.\n');
    return true;
  } else {
    console.log(`\n⚠️ ${failCount}개 시트에 문제가 있습니다.\n`);
    return false;
  }
}

const spreadsheetId = process.argv[2] || process.env.GOOGLE_SHEETS_ID;
const apiKey = process.argv[3] || process.env.GOOGLE_API_KEY;

if (!spreadsheetId || !apiKey) {
  console.error('❌ 필수 인자 누락\n');
  console.log('사용법: npm run test:sheets -- SPREADSHEET_ID API_KEY\n');
  process.exit(1);
}

testSheetsConnection(spreadsheetId, apiKey)
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  });
