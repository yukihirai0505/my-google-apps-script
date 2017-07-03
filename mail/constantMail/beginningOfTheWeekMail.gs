var BK = SpreadsheetApp.getActiveSpreadsheet();
var SHEET = BK.getSheetByName("sheet name");

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Custom')
    .addItem('send alert manually', 'alertEmail')
    .addToUi();
}

function alertEmail() {
  var mail = SHEET.getRange(1, 2, 5, 1).getValues();
  var today = new Date();
  // get this week monday
  var monday = new Date(today.setDate(today.getDate() - (today.getDay() - 1)));
  // get alert date this week
  var alertDate = getBusinessDate(monday.getDate(), 1);
  if (alertDate === today.getDate()) {
    var to = mail[0][0];
    var cc = mail[1][0];
    var bcc = mail[2][0];
    var subject = mail[3][0];
    var body = mail[4][0];
    var options = {
      cc: cc,
      bcc: bcc
    };
    MailApp.sendEmail(to, subject, body, options);
  }
}

// get business date after N days
function getBusinessDate(from, afterNDays) {
  if (!afterNDays) {
    throw new Error("you should set afterNDays");
  }
  var calendar = CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com');
  var fromDate = new Date();
  fromDate.setDate(from)
  var i = 0;
  var date = new Date();
  for (var dateCount = 0; dateCount !== afterNDays; i++) {
    date.setDate(fromDate.getDate() + i);
    var weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6 && calendar.getEventsForDay(date, {max: 1}).length === 0) {
      dateCount++;
    }
  }
  return fromDate.getDate() + i - 1;
}
