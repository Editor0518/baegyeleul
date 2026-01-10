import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import { convertXlsxToStoryData } from '../utils/convertXlsxToStoryData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const xlsxPath = join(__dirname, '../../작연시 (2).xlsx');

try {
  console.log('Reading XLSX file...');
  const buffer = readFileSync(xlsxPath);
  
  // XLSX 파일의 characters 시트 원본 컬럼명 확인
  const wb = XLSX.read(buffer);
  const charSheet = wb.Sheets['characters'];
  if (charSheet) {
    console.log('\n=== Characters Sheet Raw Data ===');
    const rawData = XLSX.utils.sheet_to_json(charSheet, { defval: '', header: 1 });
    if (rawData.length > 0) {
      console.log('Headers:', rawData[0]);
      console.log('\nFirst row:', rawData[1]);
      console.log('\nSecond row:', rawData[2]);
    }
  }
  
  // 변환 실행
  console.log('\n\n=== Converting to Story Data ===');
  const storyData = convertXlsxToStoryData(buffer, XLSX);
  
  console.log('\n=== Characters emotions ===');
  for (const [charId, charData] of Object.entries(storyData.characters)) {
    console.log(`\n${charId}:`, charData.emotions);
  }
  
  // storyData.json 생성
  const outputPath = join(__dirname, '../public/storyData.json');
  writeFileSync(outputPath, JSON.stringify(storyData, null, 2), 'utf-8');
  console.log(`\n✅ Successfully written to ${outputPath}`);
  
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
}
