/**
 * listGoogleSheets.js
 * 스프레드시트의 모든 시트 이름을 확인
 */

import fetch from 'node-fetch';

async function listSheets(spreadsheetId, apiKey) {
  console.log('📋 스프레드시트 시트 목록 확인\n');

  if (!spreadsheetId || !apiKey) {
    console.error('❌ 필수 인자 누락');
    console.log('사용법: node scripts/listGoogleSheets.js SPREADSHEET_ID API_KEY\n');
    process.exit(1);
  }

  try {
    // 스프레드시트 메타데이터 조회
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`;
    const metaResponse = await fetch(metaUrl);

    if (!metaResponse.ok) {
      const errorData = await metaResponse.json().catch(() => ({}));
      throw new Error(`메타데이터 조회 실패 (${metaResponse.status}): ${errorData.error?.message || metaResponse.statusText}`);
    }

    const metaData = await metaResponse.json();
    const sheets = metaData.sheets || [];

    console.log(`✅ 스프레드시트: "${metaData.properties.title}"\n`);
    console.log(`📊 총 시트 개수: ${sheets.length}\n`);

    if (sheets.length === 0) {
      console.error('❌ 시트가 없습니다!');
      process.exit(1);
    }

    console.log('📋 시트 목록:');
    console.log('─'.repeat(50));

    sheets.forEach((sheet, index) => {
      const title = sheet.properties.title;
      const sheetId = sheet.properties.sheetId;
      const index_val = sheet.properties.index;
      const gridData = sheet.data ? sheet.data[0] : null;
      const rows = gridData?.rowData?.length || 0;
      const cols = gridData?.columnMetadata?.length || 0;

      console.log(`\n${index + 1}. "${title}"`);
      console.log(`   ID: ${sheetId}`);
      if (rows > 0 || cols > 0) {
        console.log(`   크기: ${rows} 행 × ${cols} 열`);
      }
    });

    console.log('\n' + '─'.repeat(50));
    console.log('\n💡 사용 가능한 범위 형식:');
    sheets.forEach((sheet) => {
      const title = sheet.properties.title;
      console.log(`   "${title}!A1:Z1000"`);
    });

    console.log('\n✅ 이 시트 이름들을 사용해서 fetchFromGoogleSheets.js를 업데이트하세요!\n');

  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

const spreadsheetId = process.argv[2] || process.env.GOOGLE_SHEETS_ID;
const apiKey = process.argv[3] || process.env.GOOGLE_API_KEY;

listSheets(spreadsheetId, apiKey).catch(console.error);
