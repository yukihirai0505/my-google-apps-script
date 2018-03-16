function setUserInsightData() {

  function getYesterdayColumn() {
    function dateFormat(date) {
      var formatType = 'yyyy/MM/dd';
      return Utilities.formatDate(date, 'JST', formatType);
    }

    var today = new Date();
    today.setDate(today.getDate() - 1);
    var yesterday = dateFormat(today),
      row = 1,
      startColumn = 2,
      lastColumn = USER_SHEET.getLastColumn(),
      values = USER_SHEET.getRange(row, startColumn, row, lastColumn),
      dateIndex = "";
    values.getValues()[0].filter(function (e, i) {
      if (e && dateFormat(e) === yesterday) {
        dateIndex = i
      }
    });
    if (dateIndex !== "") {
      return USER_SHEET.getRange(row, startColumn + dateIndex);
    } else {
      return USER_SHEET.getRange(row, lastColumn + 1).setValue(yesterday)
    }
  }

  var impressions,
    profileViews,
    websiteClicks;
  var userInsightUrl = FACEBOOK_GRAPH_API + INSTAGRAM_BUSINESS_ACCOUNT_ID + USER_INSIGHT_PARAMS + ACCESS_TOKEN_PARAM;
  JSON.parse(UrlFetchApp.fetch(userInsightUrl, {muteHttpExceptions: true})).data.forEach(function (e) {
    Logger.log(e);
    var value = e.values[e.values.length - 1].value;
    if (e.name === 'impressions') {
      impressions = value;
    }
    if (e.name === 'profile_views') {
      profileViews = value;
    }
    if (e.name === 'website_clicks') {
      websiteClicks = value;
    }
  });
  var startRow = 2,
    startColumn = 2,
    dateColumn = getYesterdayColumn().getColumn() - 1;
  var data = [
    [impressions],
    [profileViews],
    [websiteClicks]
  ];
  USER_SHEET.getRange(startRow, startColumn, data.length, dateColumn).setValues(data);
}