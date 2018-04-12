var BK = SpreadsheetApp.getActiveSpreadsheet();
var SHEET = BK.getSheetByName('shuichi');

function onOpen() {
  function showMenu() {
    var menu = [
      {name: 'シューイチ確認', functionName: 'setShuichiData'}
    ];
    BK.addMenu('カスタムメニュー', menu);
  }
  
  showMenu();
}

function setShuichiData() {
  var calendars = CalendarApp.getAllCalendars().filter(function (e) {
    return e.getName().match(/@/);
  });
  var data = calendars.map(function (calendar) {
    return getShuichiData(calendar);
  });
  SHEET.getRange(2, 1, SHEET.getLastRow(), 2).clear();
  SHEET.getRange(2, 1, data.length, 2).setValues(data);
}

function getShuichiData(calendar) {
  function dateFormat(date) {
    var formatType = 'yyyy/MM/dd';
    return Utilities.formatDate(date, 'JST', formatType);
  }
  
  // beginning of the month
  var startDate = new Date();
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  var endDate = new Date();
  // end of the month
  endDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);
  endDate.setHours(23, 59, 59, 999);
  var events = calendar.getEvents(startDate, endDate);
  var shuichiStr = '';
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var title = event.getTitle();
    if (title.match(/シューイチ|ｼｭｰｲﾁ|シュウイチ|しゅーいち|週一/i) && !title.match(/申請/) && event.getOriginalCalendarId() === calendar.getId()) {
      var dateStr = dateFormat(event.getStartTime());
      var reg = new RegExp(dateStr);
      // if shuichiStr does not contain same dateStr
      if (!shuichiStr.match(reg)) {
        shuichiStr += dateStr + ',';
      }
    }
  }
  return [calendar.getName(), shuichiStr.slice(0, -1)];
}