var BK = SpreadsheetApp.getActiveSpreadsheet();
var SHEETS = BK.getSheets();
var ALERT_MAIL = SHEETS[0];
var TODAY = new Date();

/***
 * Hook google spread sheet open action
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Custom Menu')
    .addItem('Alert Mail', 'alertEmail')
    .addItem('Remind mail', 'remindEmail')
    .addToUi();
}

/***
 * Send alert mail
 */
function alertEmail() {
  var mail = ALERT_MAIL.getRange(1, 2, 9, 1).getValues();
  var alertBusinessDays = mail[6][0];
  var deadlineBusinessDays = mail[7][0];
  var alertDate = getBusinessDate(1, alertBusinessDays);
  var deadline = getBusinessDate(1, deadlineBusinessDays);
  if (alertDate === TODAY.getDate()) {
    var to = mail[0][0];
    var cc = mail[1][0];
    var bcc = mail[2][0];
    var subject = mail[3][0];
    var body = mail[4][0];
    var htmlBody = mail[5][0];
    var options = {
      cc: cc,
      bcc: bcc,
      htmlBody: replacePlaceholder(htmlBody, deadline)
    };
    MailApp.sendEmail(to, replacePlaceholder(subject, deadline), replacePlaceholder(body, deadline), options);
  }
}

/***
 * Send remind mail
 */
function remindEmail() {
  var mail = ALERT_MAIL.getRange(9, 2, 4, 1).getValues();
  Logger.log(mail);
  var remindBusinessDays = mail[0][0];
  var remindMailTo = mail[1][0];
  var remindDate = getBusinessDate(1, remindBusinessDays);
  if (remindDate === TODAY.getDate()) {
    var subject = mail[2][0];
    var body = mail[3][0];
    MailApp.sendEmail(remindMailTo, subject, body);
  }
}

/***
 * Replace placeholder like %%{string}%%
 * @param value
 * @param deadline
 * @returns {XML|string}
 */
function replacePlaceholder(value, deadline) {
  return value.replace('%%month%%', TODAY.getMonth() + 1).replace('%%date%%', deadline);
}

/***
 * Get Japanese business date that after n days
 * @param from
 * @param afterNDays
 * @returns {number}
 */
function getBusinessDate(from, afterNDays) {
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
