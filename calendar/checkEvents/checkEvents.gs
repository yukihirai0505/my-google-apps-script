var bk = SpreadsheetApp.getActiveSpreadsheet();
var sheet = bk.getSheetByName("シューイチ確認");


function onOpen() {
  function showMenu() {
    var menu = [
      {name: "シューイチ確認", functionName: "setShuichiData"}
    ];
    bk.addMenu("カスタムメニュー", menu);
  }

  showMenu();
}

function setShuichiData() {
  var calendars = CalendarApp.getAllCalendars().filter(function (e) {
    return e.getName().match(/@/);
  });
  var data = [];
  for (var i = 0; i < calendars.length; i++) {
    var calendar = calendars[i];
    data[i] = getShuichiData(calendar);
  }
  sheet.getRange(2, 1, data.length, 2).setValues(data);
}

function getShuichiData(calendar) {
  function dateFormat(date) {
    var formatType = 'yyyy/MM/dd';
    return Utilities.formatDate(date, 'JST', formatType);
  }

  // 月初
  var startDate = new Date();
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  var endDate = new Date();
  // 月末
  endDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);
  endDate.setHours(23, 59, 59, 999);
  var events = calendar.getEvents(startDate, endDate);
  var shuichiStr = '';
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    if (event.getTitle().match(/シューイチ|ｼｭｰｲﾁ|シュウイチ/) && !event.getTitle().match(/申請/) && event.getOriginalCalendarId() === calendar.getId()) {
      shuichiStr += dateFormat(event.getStartTime()) + ',';
    }
  }
  return [calendar.getName(), shuichiStr.slice(0, -1)];
}