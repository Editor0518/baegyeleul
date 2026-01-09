/**
 * googleSheetsConfig.js
 * Google Sheets API 설정
 * 
 * 환경 변수 또는 직접 설정으로 사용:
 * process.env.GOOGLE_SHEETS_ID
 * process.env.GOOGLE_API_KEY
 */

export const GOOGLE_SHEETS_CONFIG = {
  // Google Sheets API 키 (환경 변수에서 읽거나 직접 입력)
  apiKey: process.env.GOOGLE_API_KEY || '',

  // 스프레드시트 ID (환경 변수에서 읽거나 직접 입력)
  spreadsheetId: process.env.GOOGLE_SHEETS_ID || '',

  // 시트 범위 설정
  sheets: {
    gameInfo: 'GameInfo!A1:B100',
    characters: 'Characters!A1:H100',
    places: 'Places!A1:D100',
    scenes: 'Scenes!A1:Z1000',
    dialogues: 'Dialogues!A1:Z1000',
    choices: 'Choices!A1:Z1000',
    endingConfig: 'EndingConfig!A1:D100',
  },

  // API 엔드포인트
  apiEndpoint: 'https://sheets.googleapis.com/v4/spreadsheets',
};

export default GOOGLE_SHEETS_CONFIG;
