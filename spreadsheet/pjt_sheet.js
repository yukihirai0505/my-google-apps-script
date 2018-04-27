var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEETS = BK.getSheets(),
  FIRST_SHEET = SHEETS[0];

function onOpen() {
  function showMenu() {
    var menu = [
      {name: '進捗状況色付け', functionName: 'setResultColor'}
    ];
    BK.addMenu('独自メニュー', menu);
  }

  showMenu();
}

function setResultColor() {
  var startRow = 3,
    columnNum = 3,
    projectData = FIRST_SHEET.getRange(startRow, columnNum, FIRST_SHEET.getLastRow(), 2).getValues();
  projectData.forEach(function (e, i) {
    var goal = e[0],
      progress = e[1],
      rowNum = i + 1 + startRow,
      range = FIRST_SHEET.getRange(rowNum, columnNum);
    if (goal) {
      if (progress >= 0.8) {
        range.setBackground('#DFF2BF');
      } else {
        range.setBackground('#FFBABA');
      }
    }
  });
}