var BK = SpreadsheetApp.getActiveSpreadsheet(),
  TWITTER_SHEET = BK.getSheetByName('Twitter'),
  TWITTER_DATE_COLUMN_START_COLUMN = 6,
  TWITTER_ACCOUNT_NAME_START_ROW = 2,
  YOUTUBE_SHEET = BK.getSheetByName('Youtube');

function fetchJson(url) {
  return JSON.parse(UrlFetchApp.fetch(url));
}

function getTwitterAccountInfoJson(accountName) {
  var twitterAPIUrl = 'https://script.google.com/macros/s/AKfycbwiFrBiaQcCbk2FqV8S2yuteQTml3GZgsXNLW237_YE7B3NV4Q/exec?q=' + accountName;
  return fetchJson(twitterAPIUrl).filter(function (res) {
    if (res.screen_name === accountName) {
      return res;
    }
  })[0];
}

function setTwitterAccountInfo() {
  var accountInfoRange = TWITTER_SHEET.getRange(TWITTER_ACCOUNT_NAME_START_ROW, 1, TWITTER_SHEET.getLastRow(), 5).getValues().filter(function (e) {
    if (e[0]) {
      return e;
    }
  });
  var data = accountInfoRange.map(function (accountInfo) {
    var accountName = accountInfo[0];
    var response = getTwitterAccountInfoJson(accountName);
    if (response) {
      accountInfo[1] = response.profile_image_url_https ? '=IMAGE("' + response.profile_image_url_https + '", 3)' : '';
      accountInfo[2] = response.name ? response.name : '';
      accountInfo[3] = response.description ? response.description : '';
      accountInfo[4] = response.url ? response.url : '';
    }
    return accountInfo;
  });
  TWITTER_SHEET.getRange(TWITTER_ACCOUNT_NAME_START_ROW, 1, data.length, 5).setValues(data);
}

function setDailyTwitterFollowerData() {
  var today = new Date(),
    dateValues = TWITTER_SHEET.getRange(1, TWITTER_DATE_COLUMN_START_COLUMN, 1, TWITTER_SHEET.getLastColumn()).getValues().filter(function (e) {
      if (e[0]) {
        return e;
      }
    })[0],
    accountNames = TWITTER_SHEET.getRange(TWITTER_ACCOUNT_NAME_START_ROW, 1, TWITTER_SHEET.getLastRow(), 1).getValues().filter(function (e) {
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
          dateColumnNum = dateIndex + TWITTER_DATE_COLUMN_START_COLUMN;
        }
      });
    }
    if (!dateColumnNum) {
      // If there is no specified date column, set new date column (only first account name index)
      dateColumnNum = dateValues ? dateValues.length + 1 : TWITTER_DATE_COLUMN_START_COLUMN;
      if (accountNameIndex === 0) {
        TWITTER_SHEET.getRange(1, dateColumnNum).setValue(today);
      }
    }
    var response = getTwitterAccountInfoJson(accountName);
    var followerCount = response ? response.followers_count : 'not found';
    TWITTER_SHEET.getRange(accountNameIndex + TWITTER_ACCOUNT_NAME_START_ROW, dateColumnNum).setValue(followerCount);
  });
}

function dateFormat(date) {
  var formatType = 'yyyy/MM/dd';
  return Utilities.formatDate(date, 'JST', formatType);
}