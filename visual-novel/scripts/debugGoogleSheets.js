/**
 * debugGoogleSheets.js
 * Google Sheets API 연결 문제 진단
 */

import fetch from 'node-fetch';

async function debugGoogleSheets() {
  const spreadsheetId = process.argv[2] || process.env.GOOGLE_SHEETS_ID;
  const apiKey = process.argv[3] || process.env.GOOGLE_API_KEY;

  console.log('🔍 Google Sheets API 진단 시작\n');

  if (!spreadsheetId || !apiKey) {
    console.error('❌ 필수 인자 누락');
    console.log('사용법: node scripts/debugGoogleSheets.js SPREADSHEET_ID API_KEY\n');
    console.log('또는 환경 변수 설정:');
    console.log('  GOOGLE_SHEETS_ID=your_id');
    console.log('  GOOGLE_API_KEY=your_key');
    process.exit(1);
  }

  console.log('📋 설정 정보:');
  console.log(`  Spreadsheet ID: ${spreadsheetId}`);
  console.log(`  API Key: ${apiKey.substring(0, 20)}...`);
  console.log('');

  // 1. API 키 기본 검증
  console.log('1️⃣ API 키 검증 중...');
  if (apiKey.length < 20) {
    console.error('  ❌ API 키가 너무 짧습니다 (최소 20자)');
  } else {
    console.log('  ✅ API 키 길이: 정상');
  }
  console.log('');

  // 2. Spreadsheet 메타데이터 조회
  console.log('2️⃣ 스프레드시트 접근 권한 확인 중...');
  try {
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}&fields=spreadsheetId,properties.title`;
    const response = await fetch(metadataUrl);

    console.log(`  HTTP Status: ${response.status} ${response.statusText}`);

    if (response.status === 403) {
      console.error('  ❌ 403 Forbidden - 접근 권한 없음');
      console.log('');
      console.log('  원인 가능성:');
      console.log('  1. Google Sheets API가 활성화되지 않음');
      console.log('  2. API 키가 잘못됨');
      console.log('  3. 스프레드시트가 삭제되었거나 접근 불가능함');
      console.log('  4. API 키에 IP 제한이 설정되어 있음');
      console.log('');
      console.log('  해결 방법:');
      console.log('  1. Google Cloud Console 확인:');
      console.log('     https://console.cloud.google.com/apis/library/sheets.googleapis.com');
      console.log('  2. "Google Sheets API" 활성화 여부 확인');
      console.log('  3. API 키 설정 확인:');
      console.log('     https://console.cloud.google.com/apis/credentials');
      console.log('  4. API 키 제한 확인 (IP 제한 제거)');
      console.log('');
      return;
    }

    if (response.status === 404) {
      console.error('  ❌ 404 Not Found');
      console.error('  스프레드시트 ID가 잘못되었거나 삭제되었습니다');
      console.log('');
      return;
    }

    if (response.status === 400) {
      console.error('  ❌ 400 Bad Request');
      const errorData = await response.json();
      console.error('  오류:', errorData.error?.message);
      console.log('');
      return;
    }

    if (response.ok) {
      const data = await response.json();
      console.log(`  ✅ 스프레드시트 접근 성공!`);
      console.log(`  제목: ${data.properties.title}`);
      console.log('');
    }
  } catch (error) {
    console.error(`  ❌ 네트워크 오류: ${error.message}`);
    console.log('');
    return;
  }

  // 3. Values API 테스트
  console.log('3️⃣ Values API 테스트 중...');
  try {
    const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/GameInfo?key=${apiKey}`;
    const response = await fetch(valuesUrl);

    console.log(`  HTTP Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`  ✅ Values API 접근 성공!`);
      if (data.values) {
        console.log(`  읽은 행 수: ${data.values.length}`);
      }
    } else if (response.status === 403) {
      console.error('  ❌ 403 Forbidden');
      console.log('  Google Sheets API가 활성화되지 않았을 수 있습니다');
    } else {
      const errorData = await response.json();
      console.error(`  ❌ 오류: ${errorData.error?.message}`);
    }
    console.log('');
  } catch (error) {
    console.error(`  ❌ 네트워크 오류: ${error.message}`);
    console.log('');
  }

  // 4. 진단 결과 및 권장 사항
  console.log('📋 진단 완료');
  console.log('');
  console.log('✅ 확인 체크리스트:');
  console.log('  [ ] Google Sheets API가 활성화되었는가?');
  console.log('  [ ] API 키가 정확한가?');
  console.log('  [ ] 스프레드시트 ID가 정확한가?');
  console.log('  [ ] API 키에 IP 제한이 없는가? (또는 현재 IP가 포함되어 있는가?)');
  console.log('  [ ] 스프레드시트가 공개/공유 설정되어 있는가?');
  console.log('');
}

debugGoogleSheets().catch(console.error);
