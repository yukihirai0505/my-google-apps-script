var bk = SpreadsheetApp.getActiveSpreadsheet();
var sheets = bk.getSheets();
var allSheet = sheets.shift();

/***
 * Hook google spread sheet edit
 */
function onEdit() {
  setValues();
}

/***
 * Set all sheet first column data to first sheet
 */
function setValues() {
  allSheet.insertColumnsAfter(1,1);
  allSheet.deleteColumn(1);
  var total = 1;
  for (var i = 0, len = sheets.length; i < len; i++) {
    var values = getValues(sheets[i]);
    values.push([""]);
    var totalRow = values.length;
    allSheet.getRange(total, 1, totalRow, 1).setValues(values);
    total+=totalRow;
  }
}

/***
 * get sheet first column data
 * @param sheet
 * @returns {Array.<T>|*}
 */
function getValues(sheet) {
  return sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().filter(function(e) {
    return e && e[0];
  });
}