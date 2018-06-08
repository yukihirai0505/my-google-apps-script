var BK = SpreadsheetApp.getActiveSpreadsheet(),
  TWITTER_SHEET_NAME = 'Twitter',
  YOUTUBE_SHEET_NAME = 'YouTube',
  TWITTER_SHEET = BK.getSheetByName(TWITTER_SHEET_NAME),
  TWITTER_DATE_COLUMN_START_COLUMN = 6,
  TWITTER_ACCOUNT_NAME_START_ROW = 2,
  TWITTER_API = 'https://script.google.com/macros/s/AKfycbwiFrBiaQcCbk2FqV8S2yuteQTml3GZgsXNLW237_YE7B3NV4Q/exec',
  YOUTUBE_ACCOUNT_NAME_START_ROW = 2,
  YOUTUBE_DATE_COLUMN_START_COLUMN = 6,
  YOUTUBE_SHEET = BK.getSheetByName(YOUTUBE_SHEET_NAME),
  SNS_SHEET_INFO = {
    twitter: getSnsSheetInfo(TWITTER_SHEET_NAME, TWITTER_SHEET, TWITTER_DATE_COLUMN_START_COLUMN, TWITTER_ACCOUNT_NAME_START_ROW),
    youtube: getSnsSheetInfo(YOUTUBE_SHEET_NAME, YOUTUBE_SHEET, YOUTUBE_DATE_COLUMN_START_COLUMN, YOUTUBE_ACCOUNT_NAME_START_ROW)
  };

// Twitter

function getTwitterAccountInfoJson(accountName) {
  var twitterAPIUrl = TWITTER_API + '?q=' + accountName;
  return fetchJson(twitterAPIUrl).filter(function (res) {
    if (res.screen_name === accountName) {
      return res;
    }
  })[0];
}

function postMessageForTweet(message) {
  var options = {
    method: 'post',
    payload: {
      message: message
    }
  };
  UrlFetchApp.fetch(TWITTER_API, options);
}

function setTwitterAccountInfo() {
  var data = getKeyValues(SNS_SHEET_INFO.twitter).map(function (accountInfo) {
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

function tweetWeeklyRanking() {
  function compare(a, b) {
    if (a.diff < b.diff)
      return -1;
    if (a.diff > b.diff)
      return 1;
    return 0;
  }

  var sheetInfo = SNS_SHEET_INFO.twitter,
    startKeyRow = sheetInfo.startKeyRow,
    startDateColumn = sheetInfo.startDateColumn,
    today = new Date(),
    todayIndex,
    oneWeekAgo = new Date(),
    oneWeekAgoIndex;
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  getDateValues(sheetInfo).forEach(function (dateVal, dateIndex) {
    switch (dateFormat(new Date(dateVal))) {
      case dateFormat(today):
        todayIndex = dateIndex + startDateColumn;
        break;
      case dateFormat(oneWeekAgo):
        oneWeekAgoIndex = dateIndex + startDateColumn;
        break;
    }
  });
  var keys = getKeyValues(sheetInfo),
    todayFollowerCounts = sheetInfo.sheet.getRange(startKeyRow, todayIndex, keys.length, 1).getValues(),
    oneWeekAgoFollowerCounts = sheetInfo.sheet.getRange(startKeyRow, oneWeekAgoIndex, keys.length, 1).getValues(),
    data = keys.map(function (key, keyIndex) {
      var todayFollowerCount = todayFollowerCounts[keyIndex][0],
        oneWeekAgoFollowerCount = oneWeekAgoFollowerCounts[keyIndex][0];
      return {
        screen_name: key[0],
        name: key[2],
        today_follower_count: todayFollowerCount,
        one_week_ago_follower_count: oneWeekAgoFollowerCount,
        diff: oneWeekAgoFollowerCount ? todayFollowerCount - oneWeekAgoFollowerCount : 0
      }
    });
  var top3 = data.sort(compare).reverse().slice(0, 3),
    no1 = top3[0],
    no2 = top3[1],
    no3 = top3[2];
  var message = '【週間フォロワー増ランキング】\n\n1位 @' + no1.screen_name + ' ↑' + no1.diff +
    '\n2位 @' + no2.screen_name + ' ↑' + no2.diff +
    '\n3位 @' + no3.screen_name + ' ↑' + no3.diff +
    '\n\nシートに追加して欲しい方はリプかDMください\n↓フォロワー推移管理シート\nhttps://docs.google.com/spreadsheets/d/1KAMC3juzmc2zAJPlCNMdS5hiLUfRc7bUDgcechYvf-k/edit?usp=sharing';
  postMessageForTweet(message);
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
  var data = getKeyValues(SNS_SHEET_INFO.youtube).map(function (channelInfo) {
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

function getKeyValues(sheetInfo) {
  return sheetInfo.sheet.getRange(sheetInfo.startKeyRow, 1, sheetInfo.sheet.getLastRow(), 5).getValues().filter(function (e) {
    if (e[0]) {
      return e;
    }
  });
}

function getDateValues(sheetInfo) {
  return sheetInfo.sheet.getRange(1, sheetInfo.startDateColumn, 1, sheetInfo.sheet.getLastColumn()).getValues().filter(function (e) {
    if (e[0]) {
      return e;
    }
  })[0];
}

function fetchJson(url) {
  return JSON.parse(UrlFetchApp.fetch(url));
}

function setDailyData(sheetInfo) {
  var today = new Date(),
    sheet = sheetInfo.sheet,
    startDateColumn = sheetInfo.startDateColumn,
    startKeyRow = sheetInfo.startKeyRow,
    dateValues = getDateValues(sheetInfo),
    keyValues = getKeyValues(sheetInfo);
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