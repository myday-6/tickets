/**
 * ============================================================
 *  Code.gs - Google Apps Script 백엔드
 *  티켓 관리 시스템용 CRUD API
 * ============================================================
 *
 * [배포 방법]
 * 1. Google Sheets 메뉴 → 확장 프로그램 → Apps Script
 * 2. 이 코드 전체 붙여넣기
 * 3. 배포 → 새 배포 → 웹 앱
 *    - 실행 계정: 본인(나)
 *    - 액세스 권한: 모든 사용자(익명 포함)
 * 4. 배포 URL을 config.js의 GAS_URL에 입력
 * 5. 최초 1회 initAllSheets() 함수를 직접 실행하여 시트 초기화
 */

// ─── 시트별 헤더 정의 ──────────────────────────────────────
var SHEET_HEADERS = {
  Accounts: ['id', 'accountName', 'idType', 'createdAt', 'updatedAt'],
  Concerts: ['id', 'concertName', 'createdAt', 'updatedAt'],
  ConcertDates: ['id', 'concertId', 'concertDate', 'createdAt', 'updatedAt'],
  Tickets: [
    'id', 'accountId', 'concertId', 'concertDateId',
    'section', 'row', 'seatNumber',
    'attendanceType', 'saleChannel', 'salePrice', 'saleResult', 'saleCompletedDetail',
    'memo', 'createdAt', 'updatedAt'
  ]
};

// ─── GET 핸들러 ────────────────────────────────────────────
function doGet(e) {
  try {
    var action = e.parameter.action;
    var sheet  = e.parameter.sheet;
    var result;

    if (action === 'getAll') {
      result = { success: true, data: getAllRows(sheet) };
    } else if (action === 'init') {
      initAllSheets();
      result = { success: true, message: '모든 시트가 초기화되었습니다.' };
    } else {
      result = { success: false, error: '알 수 없는 액션: ' + action };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ─── POST 핸들러 ───────────────────────────────────────────
function doPost(e) {
  try {
    var payload   = JSON.parse(e.postData.contents);
    var action    = payload.action;
    var sheetName = payload.sheet;
    var result;

    if (action === 'create') {
      result = createRow(sheetName, payload.data);
    } else if (action === 'update') {
      result = updateRow(sheetName, payload.data);
    } else if (action === 'delete') {
      result = deleteRow(sheetName, payload.id);
    } else if (action === 'batchDelete') {
      result = batchDeleteRows(sheetName, payload.ids);
    } else {
      result = { success: false, error: '알 수 없는 액션: ' + action };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ─── 응답 생성 ────────────────────────────────────────────
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── 시트 초기화 ─────────────────────────────────────────
function initAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEET_HEADERS).forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    // 헤더 행이 없으면 추가
    var firstRow = sheet.getRange(1, 1).getValue();
    if (!firstRow) {
      var headers = SHEET_HEADERS[name];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      // 헤더 스타일
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#FFB6C1');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });
}

// ─── 시트 가져오기 ───────────────────────────────────────
function getSheetByName(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('시트를 찾을 수 없습니다: ' + sheetName);
  }
  return sheet;
}

// ─── 전체 행 조회 ────────────────────────────────────────
function getAllRows(sheetName) {
  var sheet   = getSheetByName(sheetName);
  var allData = sheet.getDataRange().getValues();
  if (allData.length <= 1) return [];

  var headers = allData[0];
  var rows    = allData.slice(1);

  return rows
    .filter(function(row) {
      // 빈 행 제외 (id가 비어있으면 스킵)
      return row[0] !== '' && row[0] !== null && row[0] !== undefined;
    })
    .map(function(row) {
      var obj = {};
      headers.forEach(function(header, i) {
        var val = row[i];
        obj[header] = (val !== null && val !== undefined) ? String(val) : '';
      });
      return obj;
    });
}

// ─── 행 생성 ─────────────────────────────────────────────
function createRow(sheetName, rowData) {
  var sheet   = getSheetByName(sheetName);
  var headers = SHEET_HEADERS[sheetName];
  if (!headers) throw new Error('알 수 없는 시트: ' + sheetName);

  var row = headers.map(function(header) {
    return rowData[header] !== undefined ? rowData[header] : '';
  });

  sheet.appendRow(row);
  return { success: true, data: rowData };
}

// ─── 행 수정 ─────────────────────────────────────────────
function updateRow(sheetName, rowData) {
  var sheet   = getSheetByName(sheetName);
  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var idIndex = headers.indexOf('id');

  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][idIndex]) === String(rowData.id)) {
      var row = headers.map(function(header) {
        return rowData[header] !== undefined ? rowData[header] : allData[i][headers.indexOf(header)];
      });
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { success: true, data: rowData };
    }
  }

  return { success: false, error: '해당 ID의 행을 찾을 수 없습니다: ' + rowData.id };
}

// ─── 행 삭제 ─────────────────────────────────────────────
function deleteRow(sheetName, id) {
  var sheet   = getSheetByName(sheetName);
  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var idIndex = headers.indexOf('id');

  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  return { success: false, error: '해당 ID의 행을 찾을 수 없습니다: ' + id };
}

// ─── 다중 행 삭제 ────────────────────────────────────────
function batchDeleteRows(sheetName, ids) {
  var sheet   = getSheetByName(sheetName);
  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var idIndex = headers.indexOf('id');
  var idSet   = {};
  ids.forEach(function(id) { idSet[String(id)] = true; });

  var rowsToDelete = [];
  for (var i = 1; i < allData.length; i++) {
    if (idSet[String(allData[i][idIndex])]) {
      rowsToDelete.push(i + 1);
    }
  }

  // 아래쪽 행부터 삭제 (인덱스 유지)
  for (var j = rowsToDelete.length - 1; j >= 0; j--) {
    sheet.deleteRow(rowsToDelete[j]);
  }

  return { success: true, deleted: rowsToDelete.length };
}
