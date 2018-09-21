var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEET = BK.getSheetByName('words');

//  Spreadsheet API
function doGet(e) {
  var data = SHEET.getRange(1, 1, SHEET.getLastRow(), 5).getValues();
  var keys = data[0];

  data.shift();

  var content = data.map(function (values) {
    var obj = {};
    values.forEach(function (value, index) {
      obj[keys[index]] = value;
    });
    return obj;
  });

  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify(content));
  return output;
}