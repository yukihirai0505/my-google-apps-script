var BK = SpreadsheetApp.getActiveSpreadsheet(),
  TEST_SHEET = BK.getSheetByName('test'),
  FACEBOOK_PARAMS = TEST_SHEET.getRange(2, 2, 2, 1).getValues(),
  FACEBOOK_PAGE_ACCESS_TOKEN = FACEBOOK_PARAMS[0],
  INSTAGRAM_BUSINESS_ACCOUNT_ID = FACEBOOK_PARAMS[1],
  FACEBOOK_GRAPH_API = 'https://graph.facebook.com/',
  ACCESS_TOKEN_PARAM = '&access_token=' + FACEBOOK_PAGE_ACCESS_TOKEN,
  USER_INSIGHT_METRICS = ['impressions'];

function setUserInsightData() {
  var threeWeekDaysAgo = new Date();
  threeWeekDaysAgo.setDate(threeWeekDaysAgo.getDate() - 3);
  var oneWeekAgoTimeStamp = Date.parse(threeWeekDaysAgo) / 1000;

  var userInsightUrl = FACEBOOK_GRAPH_API + INSTAGRAM_BUSINESS_ACCOUNT_ID +
    '/insights?metric=' + USER_INSIGHT_METRICS.join(',') + '&period=day' + ACCESS_TOKEN_PARAM + '&since=' + oneWeekAgoTimeStamp;
  var userInsightData = JSON.parse(UrlFetchApp.fetch(userInsightUrl, {muteHttpExceptions: true})).data;

  function getInsightValue(key) {
    var target = userInsightData.filter(function (e) {
      if (e.name === key) {
        return e;
      }
    })[0];
    return target.values.map(function (e) {
      return e.end_time + '_' + e.value;
    });
  }

  var range = TEST_SHEET.getRange(6, 1, TEST_SHEET.getLastRow(), 1).getValues().filter(function (e) {
    if (e[0]) {
      return e;
    }
  });
  var data = USER_INSIGHT_METRICS.map(function (e) {
    return getInsightValue(e)
  });
  data = data.join(',').split(',');
  data.unshift(new Date());

  TEST_SHEET.getRange(6 + range.length, 1, 1, data.length).setValues([data]);
}