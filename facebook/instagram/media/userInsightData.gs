function setUserInsightData() {
  var userInsightUrl = FACEBOOK_GRAPH_API + INSTAGRAM_BUSINESS_ACCOUNT_ID + USER_INSIGHT_PARAMS + ACCESS_TOKEN_PARAM;
  var userInsightData = JSON.parse(UrlFetchApp.fetch(userInsightUrl, {muteHttpExceptions: true})).data;

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

  function getInsightValue(key) {
    var target = userInsightData.filter(function (e) {
      if (e.name === key) {
        return e;
      }
    })[0];
    return target.values[target.values.length - 1].value;
  }

  var dateColumn = getYesterdayColumn().getColumn();
  var data = USER_INSIGHT_METRICS.map(function (e) {
    return [getInsightValue(e)]
  });
  USER_SHEET.getRange(2, dateColumn, data.length, 1).setValues(data);
}