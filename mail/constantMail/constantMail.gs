var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEETS = BK.getSheets(),
  TODAY = new Date();

/***
 * Hook google spread SHEET open action
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
  for (var i = 0, sheetLen = SHEETS.length; i < sheetLen; i++) {
    var mail = SHEETS[i].getRange(1, 2, 9, 1).getValues(),
      alertBusinessDays = String(mail[6][0]).split(','),
      deadlineBusinessDays = String(mail[7][0]).split(',');
    for (var j = 0, daysLen = alertBusinessDays.length; j < daysLen; j++) {
      var alertDate = getBusinessDate(1, Number(alertBusinessDays[j])),
        deadline = getBusinessDate(1, Number(deadlineBusinessDays[j]));
      if (alertDate === TODAY.getDate()) {
        var to = mail[0][0],
          cc = mail[1][0],
          bcc = mail[2][0],
          subject = mail[3][0],
          body = mail[4][0],
          htmlBody = mail[5][0],
          options = {
            cc: cc,
            bcc: bcc,
            htmlBody: replacePlaceholder(htmlBody, deadline),
            name: 'hogehoge',
          };
        MailApp.sendEmail(to, replacePlaceholder(subject, deadline), replacePlaceholder(body, deadline), options);
      }
    }
  }
}

/***
 * Send remind mail
 */
function remindEmail() {
  for (var i = 0, sheetLen = SHEETS.length; i < sheetLen; i++) {
    var mail = SHEETS[i].getRange(9, 2, 4, 1).getValues(),
      remindBusinessDays = mail[0][0],
      remindMailTo = mail[1][0];
    if (remindBusinessDays && remindMailTo) {
      var remindDate = getBusinessDate(1, remindBusinessDays);
      if (remindDate === TODAY.getDate()) {
        var subject = mail[2][0],
          body = mail[3][0];
        MailApp.sendEmail(remindMailTo, subject, body);
      }
    }
  }
}

/***
 * Send spreadsheet attachment
 */
function sendResult() {
  var nowDate = Utilities.formatDate(new Date(), 'JST', 'yyyyMMdd');
  var xlsxName = BK.getName() + "_" + nowDate + ".xlsx";
  var fetchOpt = {
    "headers": {Authorization: "Bearer " + ScriptApp.getOAuthToken()},
    "muteHttpExceptions": true
  };
  var key = BK.getId();
  var fetchUrl = "https://docs.google.com/feeds/download/spreadsheets/Export?key=" + key + "&amp;exportFormat=xlsx";
  var attachmentFile = UrlFetchApp.fetch(fetchUrl, fetchOpt).getBlob().setName(xlsxName);
  var recipient = "example@gmail.com";
  var subject = 'subject';
  var body = "body";
  var options = {
    attachments: [attachmentFile]
  };
  MailApp.sendEmail(recipient, subject, body, options);
}

/***
 * Replace placeholder like %%{string}%%
 * @param value
 * @param deadline
 * @returns {XML|string}
 */
function replacePlaceholder(value, deadline) {
  return value.replace(/%%month%%/g, TODAY.getMonth() + 1).replace(/%%date%%/g, deadline);
}

/***
 * Get Japanese business date that after n days
 * @param from
 * @param afterNDays
 * @returns {number}
 */
function getBusinessDate(from, afterNDays) {
  if (!afterNDays) {
    throw new Error("Please set afterNDays properly");
  }
  var calendar = CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com');
  var fromDate = new Date();
  fromDate.setDate(from);
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
