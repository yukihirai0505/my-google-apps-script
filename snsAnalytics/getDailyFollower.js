var BK = SpreadsheetApp.getActiveSpreadsheet(),
  TWITTER_SHEET = BK.getSheetByName('Twitter'),
  YOUTUBE_SHEET = BK.getSheetByName('Youtube');

function fetchJson(url) {
  return JSON.parse(UrlFetchApp.fetch(url));
}

function setTwitterAccountInfo() {

}

function setDailyTwitterFollowerData() {
  var today = new Date(),
    dateStartColumnNum = 5,
    accountStartRow = 2,
    dateValues = TWITTER_SHEET.getRange(1, dateStartColumnNum, 1, TWITTER_SHEET.getLastColumn()).getValues().filter(function (e) {
      if (e[0]) {
        return e;
      }
    })[0],
    accountNames = TWITTER_SHEET.getRange(accountStartRow, 1, TWITTER_SHEET.getLastRow(), 1).getValues().filter(function (e) {
      if (e[0]) {
        return e;
      }
    });
  accountNames.map(function (accountNameData, accountNameIndex) {
    var dateColumnNum,
      accountName = accountNameData[0];
    if (dateValues) {
      dateValues.forEach(function (dateVal, dateIndex) {
        if (dateFormat(new Date(dateVal)) === dateFormat(today)) {
          dateColumnNum = dateIndex + dateStartColumnNum;
        }
      });
    }
    if (!dateColumnNum) {
      // If there is no specified date column, set new date column
      dateColumnNum = dateValues ? dateValues.length + 1 : dateStartColumnNum;
      if (accountNameIndex === 0) {
        TWITTER_SHEET.getRange(1, dateColumnNum).setValue(today);
      }
    }
    var twitterAPIUrl = 'https://script.google.com/macros/s/AKfycbwiFrBiaQcCbk2FqV8S2yuteQTml3GZgsXNLW237_YE7B3NV4Q/exec?q=' + accountName;
    var accountData = fetchJson(twitterAPIUrl).filter(function (accountInfo) {
      if (accountInfo.screen_name === accountName) {
        return accountInfo;
      }
    })[0];
    var followerCount = accountData ? accountData.followers_count : 'not found';
    TWITTER_SHEET.getRange(accountNameIndex + accountStartRow, dateColumnNum).setValue(followerCount);
  });
}

function dateFormat(date) {
  var formatType = 'yyyy/MM/dd';
  return Utilities.formatDate(date, 'JST', formatType);
}