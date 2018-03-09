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

/***
 * ユーザーの国別フォロワー数に関してはInstagramInsightで取れる情報は lifetime (前日のデータ) なので
 * 前日分の日付カラムに対してデータを更新していく
 */
function setInsightData() {

  function getYesterdayColumn() {
    function dateFormat(date) {
      var formatType = 'yyyy/MM/dd';
      return Utilities.formatDate(date, 'JST', formatType);
    }

    var today = new Date();
    today.setDate(today.getDate() - 1);
    var yesterday = dateFormat(today),
      row = 6,
      startColumn = 3,
      lastColumn = SHEET.getLastColumn(),
      values = SHEET.getRange(row, startColumn, row, lastColumn),
      dateIndex = "";
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

  Logger.log(INSTAGRAM_USER_INSIGHT_URL);
  var insightData = JSON.parse(UrlFetchApp.fetch(INSTAGRAM_USER_INSIGHT_URL, {muteHttpExceptions: true})).data[0].values[0].value,
    insightCountryCodes = Object.keys(insightData),
    startRow = 7,
    startColumn = 2,
    dateColumn = getYesterdayColumn().getColumn() - 1,
    data = SHEET.getRange(startRow, startColumn, SHEET.getLastRow(), dateColumn).getValues().filter(function (e) {
      if (e[0]) {
        return e;
      }
    }).map(function (e) {
      var lastIndex = e.length - 1,
        countryCode = e[0],
        countryCodeKey = insightCountryCodes.filter(function (key) {
          if (key === countryCode) {
            return key;
          }
        })[0],
        countryFollowerNumber = insightData[countryCodeKey];
      e[lastIndex] = countryFollowerNumber ? countryFollowerNumber : 0;
      return e;
    });
  SHEET.getRange(startRow, startColumn, data.length, dateColumn).setValues(data);
}