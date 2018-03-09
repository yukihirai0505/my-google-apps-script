var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEET = BK.getSheetByName('insight'),
  FACEBOOK_PARAMS = SHEET.getRange(2, 2, 2, 1).getValues(),
  FACEBOOK_PAGE_ACCESS_TOKEN = FACEBOOK_PARAMS[0],
  INSTAGRAM_BUSINESS_ACCOUNT_ID = FACEBOOK_PARAMS[1],
  INSTAGRAM_USER_INSIGHT_PARAMS = 'fields=values,id,description,name,title&period=lifetime&metric=audience_country&pretty=0',
  INSTAGRAM_USER_INSIGHT_URL = 'https://graph.facebook.com/' + INSTAGRAM_BUSINESS_ACCOUNT_ID + '/insights?' + INSTAGRAM_USER_INSIGHT_PARAMS + '&access_token=' + FACEBOOK_PAGE_ACCESS_TOKEN;

function onOpen() {
  function showMenu() {
    var menu = [
      {name: 'Get Daily Insight Data', functionName: 'setInsightData'}
    ];
    bk.addMenu('Custom Management', menu);
  }

  showMenu();
}

function setInsightData() {

  function getYesterdayColumn() {
    function dateFormat(date) {
      var formatType = 'yyyy/MM/dd';
      return Utilities.formatDate(date, 'JST', formatType);
    }

    var today = new Date();
    today.setDate(today.getDate() - 1);
    var yesterday = dateFormat(today);
    var row = 6;
    var startColumn = 3;
    var lastColumn = SHEET.getLastColumn();
    var values = SHEET.getRange(row, startColumn, row, lastColumn);
    var dateIndex = "";
    values.getValues()[0].filter(function (e, i) {
      if (e && dateFormat(e) === yesterday) {
        dateIndex = i
      }
    });
    if (dateIndex !== "") {
      return SHEET.getRange(row, startColumn + dateIndex);
    } else {
      return SHEET.getRange(row, lastColumn + 1).setValue(yesterday)
    }
  }

  var INSTAGRAM_INSIGHT_DATA = JSON.parse(UrlFetchApp.fetch(INSTAGRAM_USER_INSIGHT_URL, {muteHttpExceptions: true})).data[0].values[0].value,
    INSTAGRAM_INSIGHT_COUNTRY_CODES = Object.keys(INSTAGRAM_INSIGHT_DATA),
    DATA_COLUMN = getYesterdayColumn().getColumn() - 1,
    data = SHEET.getRange(7, 2, SHEET.getLastRow(), DATA_COLUMN).getValues().filter(function (e) {
      if (e[0]) {
        return e;
      }
    }).map(function (e) {
      var lastIndex = e.length - 1,
        countryCode = e[0],
        countryCodeKey = INSTAGRAM_INSIGHT_COUNTRY_CODES.filter(function (key) {
          if (key === countryCode) {
            return key;
          }
        })[0],
        countryFollowerNumber = INSTAGRAM_INSIGHT_DATA[countryCodeKey];
      e[lastIndex] = countryFollowerNumber ? countryFollowerNumber : 0;
      return e;
    });
  SHEET.getRange(7, 2, data.length, DATA_COLUMN).setValues(data);
}