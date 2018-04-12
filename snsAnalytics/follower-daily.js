var BK = SpreadsheetApp.getActiveSpreadsheet(),
  TWITTER_SHEET_NAME = 'Twitter',
  YOUTUBE_SHEET_NAME = 'YouTube',
  TWITTER_SHEET = BK.getSheetByName(TWITTER_SHEET_NAME),
  TWITTER_DATE_COLUMN_START_COLUMN = 6,
  TWITTER_ACCOUNT_NAME_START_ROW = 2,
  YOUTUBE_ACCOUNT_NAME_START_ROW = 2,
  YOUTUBE_DATE_COLUMN_START_COLUMN = 6,
  YOUTUBE_SHEET = BK.getSheetByName(YOUTUBE_SHEET_NAME),
  SNS_SHEET_INFO = {
    twitter: getSnsSheetInfo(TWITTER_SHEET_NAME, TWITTER_SHEET, TWITTER_DATE_COLUMN_START_COLUMN, TWITTER_ACCOUNT_NAME_START_ROW),
    youtube: getSnsSheetInfo(YOUTUBE_SHEET_NAME, YOUTUBE_SHEET, YOUTUBE_DATE_COLUMN_START_COLUMN, YOUTUBE_ACCOUNT_NAME_START_ROW)
  };

// Twitter

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
      accountInfo[1] = getImageFormula(response.profile_image_url_https, 3);
      accountInfo[2] = response.name ? response.name : '';
      accountInfo[3] = response.description ? response.description : '';
      accountInfo[4] = response.url ? response.url : '';
    }
    return accountInfo;
  });
  TWITTER_SHEET.getRange(TWITTER_ACCOUNT_NAME_START_ROW, 1, data.length, 5).setValues(data);
}

function setTwitterFollowerDataDaily() {
  setDailyData(SNS_SHEET_INFO.twitter);
}

// YouTube

function getYouTubeAPIJson(part, id) {
  var baseUrl = 'https://script.google.com/macros/s/AKfycbwqwOpjhRD9PUha58V1NrPhScFBfNCk6lZid4SHMyipnWxDdy8/exec';
  var effectiveUrl = baseUrl + '?part=' + part + '&id=' + id;
  Logger.log(effectiveUrl);
  return fetchJson(effectiveUrl);
}

function setYouTubeAccountInfo() {
  var channelInfoRange = YOUTUBE_SHEET.getRange(YOUTUBE_ACCOUNT_NAME_START_ROW, 1, YOUTUBE_SHEET.getLastRow(), 5).getValues().filter(function (e) {
    if (e[0]) {
      return e;
    }
  });
  var data = channelInfoRange.map(function (channelInfo) {
    var channelId = channelInfo[0];
    var response = getYouTubeAPIJson('snippet', channelId);
    if (response && response.items && response.items[0]) {
      var item = response.items[0];
      var snippet = item.snippet;
      channelInfo[1] = getImageFormula(snippet.thumbnails.medium.url);
      channelInfo[2] = snippet.title;
      channelInfo[3] = snippet.description ? snippet.description : '';
      channelInfo[4] = 'https://www.youtube.com/channel/' + channelId;
    }
    return channelInfo;
  });
  YOUTUBE_SHEET.getRange(YOUTUBE_ACCOUNT_NAME_START_ROW, 1, data.length, 5).setValues(data);
}

function setYouTubeChannelSubscriberCountDaily() {
  setDailyData(SNS_SHEET_INFO.youtube);
}

// Common
function getSnsSheetInfo(name, sheet, startDateColumn, startKeyRow) {
  return {
    name: name,
    sheet: sheet,
    startDateColumn: startDateColumn,
    startKeyRow: startKeyRow
  }
}

function fetchJson(url) {
  return JSON.parse(UrlFetchApp.fetch(url));
}

function setDailyData(sheetInfo) {
  var today = new Date(),
    sheet = sheetInfo.sheet,
    startDateColumn = sheetInfo.startDateColumn,
    startKeyRow = sheetInfo.startKeyRow,
    dateValues = sheet.getRange(1, startDateColumn, 1, sheet.getLastColumn()).getValues().filter(function (e) {
      if (e[0]) {
        return e;
      }
    })[0],
    keyValues = sheet.getRange(startKeyRow, 1, sheet.getLastRow(), 1).getValues().filter(function (e) {
      if (e[0]) {
        return e;
      }
    });
  keyValues.forEach(function (data, keyIndex) {
    var dateColumnNum,
      keyName = data[0];
    if (dateValues) {
      dateValues.forEach(function (dateVal, dateIndex) {
        if (dateFormat(new Date(dateVal)) === dateFormat(today)) {
          dateColumnNum = dateIndex + startDateColumn;
        }
      });
    }
    if (!dateColumnNum) {
      // If there is no specified date column, set new date column (only first account name index)
      dateColumnNum = dateValues ? dateValues.length + 1 : startDateColumn;
      if (keyIndex === 0) {
        sheet.getRange(1, dateColumnNum).setValue(today);
      }
    }
    if (sheetInfo.name === SNS_SHEET_INFO.twitter.name) {
      var twResponse = getTwitterAccountInfoJson(keyName);
      var followerCount = twResponse ? twResponse.followers_count : 'not found';
      sheet.getRange(keyIndex + startKeyRow, dateColumnNum).setValue(followerCount);
    } else if (sheetInfo.name === SNS_SHEET_INFO.youtube.name) {
      var ytResponse = getYouTubeAPIJson('statistics', keyName);
      var item = ytResponse.items[0];
      if (item && item.statistics) {
        var statistics = item.statistics;
        var subscriberCount = statistics.subscriberCount ? statistics.subscriberCount : 'not found';
        sheet.getRange(keyIndex + startKeyRow, dateColumnNum).setValue(subscriberCount);
      }
    }
  });
}


function getImageFormula(imageUrl, mode) {
  if (imageUrl) {
    return mode ? '=IMAGE("' + imageUrl + '", ' + mode + ')' : '=IMAGE("' + imageUrl + '")';
  }
  return '';
}

function dateFormat(date) {
  var formatType = 'yyyy/MM/dd';
  return Utilities.formatDate(date, 'JST', formatType);
}