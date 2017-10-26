var BK = SpreadsheetApp.getActiveSpreadsheet();
var MAIL_LIST = BK.getSheetByName("MailList");

/***
 * Hook google spread SHEET open action
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CustomMenu')
    .addItem('Create a new mail', 'openMailForm')
    .addToUi();
}

/***
 * Display mail form html
 */
function openMailForm() {
  var html = HtmlService.createHtmlOutputFromFile('index.html');
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'New Mail');
}

/***
 * Get mail parameters
 * @param form
 */
function newEmail(form) {
  var subject = form.subject;
  var body = form.body;
  sendMail(subject, body);
}

/***
 * Send mails
 * @param subject
 * @param body
 */
function sendMail(subject, body) {
  var lastRow = MAIL_LIST.getLastRow();
  var userList = MAIL_LIST.getRange(2, 1, lastRow, 2).getValues().filter(function (e) {
    return e && e[0];
  });
  var to = MAIL_LIST.getRange(2, 4).getValue();
  var replyTo = MAIL_LIST.getRange(2, 5).getValue();
  var signature = MAIL_LIST.getRange(2, 3).getValue();
  for (var i = 0, len = userList.length; i < len; i++) {
    var user = userList[i];
    var userMail = user[0];
    var userName = user[1];
    var options = {
      replyTo: replyTo,
      bcc: userMail
    };
    MailApp.sendEmail(to, subject.replace("%%name%%", userName), body.replace("%%name%%", userName) + '\n\n\n' + signature, options);
  }
}