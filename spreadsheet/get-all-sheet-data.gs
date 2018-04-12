var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEETS = BK.getSheets(),
  ALL_SHEET = SHEETS.shift();

/***
 * Hook google spread SHEET edit
 */
function onEdit() {
  setValues();
}

/***
 * Set all SHEET first column data to first SHEET
 */
function setValues() {
  ALL_SHEET.insertColumnsAfter(1, 1);
  ALL_SHEET.deleteColumn(1);
  var total = 1;
  for (var i = 0, len = SHEETS.length; i < len; i++) {
    var values = getValues(SHEETS[i]);
    values.push([""]);
    var totalRow = values.length;
    ALL_SHEET.getRange(total, 1, totalRow, 1).setValues(values);
    total += totalRow;
  }
}

/***
 * get SHEET first column data
 * @param sheet
 * @returns {Array.<T>|*}
 */
function getValues(sheet) {
  return sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().filter(function (e) {
    return e && e[0];
  });
}