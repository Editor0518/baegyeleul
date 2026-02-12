/**
 * Google Apps Script - 스프레드시트 데이터를 JSON으로 내보내는 웹앱
 *
 * 사용법:
 * 1. Google 스프레드시트에서 [확장 프로그램] → [Apps Script] 열기
 * 2. 이 코드를 편집기에 붙여넣기
 * 3. [배포] → [새 배포] → 유형: 웹 앱
 *    - 다음 사용자 인증정보로 실행: 본인
 *    - 액세스 권한: 모든 사용자
 * 4. 배포 후 받은 URL을 GameContext.jsx의 APPS_SCRIPT_URL에 설정
 *    (또는 .env 파일의 NEXT_PUBLIC_APPS_SCRIPT_URL에 설정)
 *
 * 주의: 코드를 수정한 후에는 [배포] → [배포 관리] → [새 버전]으로
 *       재배포해야 변경사항이 반영됩니다.
 */

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {};
  const sheets = ss.getSheets();

  sheets.forEach(function (sheet) {
    const name = sheet.getName();
    const data = sheet.getDataRange().getValues();

    // 헤더만 있거나 빈 시트는 빈 배열로 처리
    if (data.length < 2) {
      result[name] = [];
      return;
    }

    // 첫 행을 헤더로 사용
    const headers = data[0].map(function (h) {
      return String(h).trim();
    });

    const rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = {};
      var hasValue = false;

      headers.forEach(function (h, j) {
        if (!h) return; // 빈 헤더 무시
        var val = data[i][j];
        row[h] = val === null || val === undefined ? "" : val;
        if (val !== null && val !== undefined && val !== "") {
          hasValue = true;
        }
      });

      // 모든 셀이 비어있는 행은 건너뛰기
      if (hasValue) {
        rows.push(row);
      }
    }

    result[name] = rows;
  });

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}
