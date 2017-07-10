// SlackApp Library Key => M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO
var SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');

var HOLIDAY_CALENDAR = CalendarApp.getCalendarById("ja.japanese#holiday@group.v.calendar.google.com");
var SHUICHI_TEXT = "平井シューイチ";
var GUEST_MAIL_ADDRESS = "hoge@gmail.com";

function shuichi() {
  // Execute at 9 o'clock on Monday
  var calendar = CalendarApp.getDefaultCalendar();
  var tuesday = new Date(),
    friday = new Date();
  tuesday.addDays(1);
  tuesday.setHours(18,0,0);
  friday.addDays(4);
  friday.setHours(23,59,59);
  var weekEvents = calendar.getEvents(tuesday, friday);
  var shuichiEvent = weekEvents.filter(function(e) {
    if(e.getTitle().indexOf(SHUICHI_TEXT) !== -1) {
      return e;
    }
  });
  if (shuichiEvent.length === 0) {
    for (var i = 4; i > 0; i--) {
      var from = new Date(),
        to = new Date();
      from.addDays(i);
      from.setHours(18,0,0);
      to.addDays(i);
      to.setHours(23,59,59);
      var events = calendar.getEvents(from, to);
      if (events.length === 0 && !isJapaneseHoliday(from)) {
        var endTime = new Date();
        endTime.addDays(i);
        endTime.setHours(19,0,0);
        var option = {
          guests: GUEST_MAIL_ADDRESS,
          sendInvites: true
        };
        calendar.createEvent(SHUICHI_TEXT, from, endTime, option);
        var slackApp = SlackApp.create(SLACK_ACCESS_TOKEN);
        var channelId = "[channel Id]";
        var options = {
          as_user: true,
          link_names: 1
        };
        var message = "@here " + from.getDate() + "日にシューイチ取得します。";
        slackApp.postMessage(channelId, message, options);
        break;
      }
    }
  }
}

function isJapaneseHoliday(date) {
  var year = date.getYear(),
    month = date.getMonth(),
    day = date.getDay;
  var startDate = new Date();
  startDate.setFullYear(year, month-1, day);
  startDate.setHours(0, 0, 0, 0);
  var endDate = new Date();
  endDate.setFullYear(year, month-1, day);
  endDate.setHours(23, 59, 59, 999);
  var holidays =  HOLIDAY_CALENDAR.getEvents(startDate, endDate);
  return holidays.length !== 0;
}

Date.prototype.addDays = function(days) {
  this.setDate(this.getDate() + parseInt(days));
  return this;
};