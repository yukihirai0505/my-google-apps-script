var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEET = BK.getSheetByName("SHEET name");

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Custom')
    .addItem('send alert manually', 'alertEmail')
    .addToUi();
}

function alertEmail() {
  var mail = SHEET.getRange(1, 2, 5, 1).getValues(),
    today = new Date(),
    // get this week monday
    monday = new Date(new Date().setDate(today.getDate() - (today.getDay() - 1))),
    // get alert date this week
    alertDate = getBusinessDate(monday.getDate(), 1);
  if (alertDate === today.getDate()) {
    var to = mail[0][0],
      cc = mail[1][0],
      bcc = mail[2][0],
      subject = mail[3][0],
      body = mail[4][0],
      options = {
        cc: cc,
        bcc: bcc,
        noReply: true
      };
    MailApp.sendEmail(to, subject, body, options);
  }
}

// get business date after N days
function getBusinessDate(from, afterNDays) {
  if (!afterNDays) {
    throw new Error("you should set afterNDays");
  }
  var calendar = CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com'),
    fromDate = new Date();
  fromDate.setDate(from)
  var i = 0,
    date = new Date();
  for (var dateCount = 0; dateCount !== afterNDays; i++) {
    date.setDate(fromDate.getDate() + i);
    var weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6 && calendar.getEventsForDay(date, {max: 1}).length === 0) {
      dateCount++;
    }
  }
  return fromDate.getDate() + i - 1;
}
