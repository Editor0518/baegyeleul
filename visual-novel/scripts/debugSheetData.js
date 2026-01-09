/**
 * debugSheetData.js
 * Google Sheets에서 받아온 원본 데이터 확인
 */

import fetch from 'node-fetch';

async function debugSheetData(spreadsheetId, apiKey) {
  console.log('🔍 Google Sheets 원본 데이터 확인\n');

  try {
    // game_info 시트 데이터 확인
    console.log('1️⃣ game_info 시트:');
    console.log('─'.repeat(60));
    
    const gameInfoUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/game_info!A1:B100?key=${apiKey}`;
    const gameInfoResponse = await fetch(gameInfoUrl);
    
    if (gameInfoResponse.ok) {
      const gameInfoData = await gameInfoResponse.json();
      console.log('원본 데이터:');
      console.log(JSON.stringify(gameInfoData.values || [], null, 2));
    } else {
      console.log(`❌ 오류: ${gameInfoResponse.status}`);
    }
    
    console.log('\n2️⃣ characters 시트:');
    console.log('─'.repeat(60));
    
    const charsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/characters!A1:H20?key=${apiKey}`;
    const charsResponse = await fetch(charsUrl);
    
    if (charsResponse.ok) {
      const charsData = await charsResponse.json();
      console.log('원본 데이터 (처음 3행):');
      const rows = charsData.values || [];
      console.log(JSON.stringify(rows.slice(0, 3), null, 2));
    } else {
      console.log(`❌ 오류: ${charsResponse.status}`);
    }

    console.log('\n3️⃣ dialogues 시트:');
    console.log('─'.repeat(60));
    
    const dialoguesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/dialogues!A1:D10?key=${apiKey}`;
    const dialoguesResponse = await fetch(dialoguesUrl);
    
    if (dialoguesResponse.ok) {
      const dialoguesData = await dialoguesResponse.json();
      console.log('원본 데이터 (처음 5행):');
      const rows = dialoguesData.values || [];
      console.log(JSON.stringify(rows.slice(0, 5), null, 2));
    } else {
      console.log(`❌ 오류: ${dialoguesResponse.status}`);
    }

    console.log('\n✅ 데이터 확인 완료');
    console.log('\n💡 팁:');
    console.log('   - 빈 셀은 undefined로 표시됩니다');
    console.log('   - 한글이 제대로 보이면 데이터는 정상입니다');
    console.log('   - 파싱 함수를 확인하세요');

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

const spreadsheetId = process.argv[2] || process.env.GOOGLE_SHEETS_ID;
const apiKey = process.argv[3] || process.env.GOOGLE_API_KEY;

if (!spreadsheetId || !apiKey) {
  console.error('❌ 필수 인자 누락\n');
  console.log('사용법: npm run debug:data -- SPREADSHEET_ID API_KEY\n');
  process.exit(1);
}

debugSheetData(spreadsheetId, apiKey).catch(console.error);
