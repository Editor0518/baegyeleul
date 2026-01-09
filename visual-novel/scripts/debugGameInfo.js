/**
 * debugGameInfo.js
 * GameInfo 파싱 디버그
 */

import fetch from 'node-fetch';

async function debugGameInfo(spreadsheetId, apiKey) {
  console.log('🔍 GameInfo 시트 데이터 상세 분석\n');

  try {
    // game_info 시트 데이터 받아오기
    const range = 'game_info!A1:Z10';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    console.log('📋 원본 데이터:');
    console.log('─'.repeat(80));
    rows.forEach((row, idx) => {
      console.log(`행 ${idx}:`, JSON.stringify(row));
    });
    console.log('');

    // 헤더 분석
    console.log('🔎 헤더 분석:');
    console.log('─'.repeat(80));
    
    if (rows[0]) {
      console.log(`헤더 행 (${rows[0].length}개 셀):`);
      rows[0].forEach((header, idx) => {
        console.log(`  [${idx}] "${header}"`);
        
        // 괄호 추출
        const match = String(header).match(/\(([^)]+)\)/);
        if (match) {
          console.log(`       → 추출된 키: "${match[1]}"`);
        }
      });
    }
    console.log('');

    // 데이터 행 분석
    console.log('📊 데이터 행 분석:');
    console.log('─'.repeat(80));
    
    if (rows[1]) {
      console.log(`데이터 행 (${rows[1].length}개 셀):`);
      rows[1].forEach((value, idx) => {
        console.log(`  [${idx}] "${value}"`);
      });
    }
    console.log('');

    // 파싱 시뮬레이션
    console.log('🔄 파싱 시뮬레이션:');
    console.log('─'.repeat(80));

    if (rows[0] && rows[1]) {
      const headers = rows[0].map((h, idx) => {
        const headerStr = String(h || '').trim();
        const match = headerStr.match(/\(([^)]+)\)/);
        const key = match ? match[1].toLowerCase() : headerStr.toLowerCase();
        return { original: headerStr, extracted: key, index: idx };
      });

      const gameInfo = {
        title: '',
        subtitle: '',
        me: '',
        backgroundMusic: '',
      };

      headers.forEach(({ original, extracted, index }) => {
        const value = String(rows[1][index] || '').trim();
        
        console.log(`\n열 ${index}: "${original}"`);
        console.log(`  추출된 키: "${extracted}"`);
        console.log(`  값: "${value}"`);

        if (extracted.includes('title')) {
          console.log(`  ✅ title에 매칭! → gameInfo.title = "${value}"`);
          gameInfo.title = value;
        } else if (extracted.includes('subtitle')) {
          console.log(`  ✅ subtitle에 매칭! → gameInfo.subtitle = "${value}"`);
          gameInfo.subtitle = value;
        } else if (extracted.includes('me')) {
          console.log(`  ✅ me에 매칭! → gameInfo.me = "${value}"`);
          gameInfo.me = value;
        } else if (extracted.includes('backgroundmusic') || extracted.includes('background')) {
          console.log(`  ✅ backgroundMusic에 매칭! → gameInfo.backgroundMusic = "${value}"`);
          gameInfo.backgroundMusic = value;
        } else {
          console.log(`  ❌ 매칭 안 됨`);
        }
      });

      console.log('\n');
      console.log('📝 최종 결과:');
      console.log(JSON.stringify(gameInfo, null, 2));
    }

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

const spreadsheetId = process.argv[2] || process.env.GOOGLE_SHEETS_ID;
const apiKey = process.argv[3] || process.env.GOOGLE_API_KEY;

if (!spreadsheetId || !apiKey) {
  console.error('❌ 필수 인자 누락\n');
  console.log('사용법: npm run debug:gameinfo -- SPREADSHEET_ID API_KEY\n');
  process.exit(1);
}

debugGameInfo(spreadsheetId, apiKey).catch(console.error);
