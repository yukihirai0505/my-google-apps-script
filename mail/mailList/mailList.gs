var BK = SpreadsheetApp.getActiveSpreadsheet();
var MAIL_LIST = BK.getSheetByName("MailList");
var TO_ADDRESS = "example@gmail.com";
var REPLY_TO_ADDRESS = "example@gmail.com";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CustomMenu')
    .addItem('Create a new mail', 'openMailForm')
    .addToUi();
}

function openMailForm() {
  var html = HtmlService.createHtmlOutputFromFile('index.html');
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'New Mail');
}

function newEmail(form) {
  var subject = form.subject;
  var body = form.body;
  sendMail(subject, body);
}

function sendMail(subject, body) {
  var lastRow = MAIL_LIST.getLastRow();
  var userList = MAIL_LIST.getRange(2, 1, lastRow, 2).getValues().filter(function(e) {
    return e && e[0];
  });
  var signature = MAIL_LIST.getRange(2, 3).getValue();
  for (var i = 0, len = userList.length; i < len; i++) {
    var user = userList[i];
    var userMail = user[0];
    var userName = user[1];
    var options = {
      replyTo: REPLY_TO_ADDRESS,
      bcc: userMail
    };
    MailApp.sendEmail(TO_ADDRESS, subject.replace("%%name%%", userName), body.replace("%%name%%", userName) + '\n\n\n' + signature, options);
  }
}