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

function newEmail(form){
  var subject = form.subject;
  var body = form.body;
  Logger.log(subject + ' ' + body);
}