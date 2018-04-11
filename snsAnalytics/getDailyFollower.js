// https://www.youtube.com/channel/UClcWgUnEr79fJBcpqnm4M1w?view_as=subscriber

// 各SNSのフォロワー数を定期的に更新していく
// アカウント名/チャンネルID, SNS, 日付....

var BK = SpreadsheetApp.getActiveSpreadsheet(),
  TWITTER_SHEET = BK.getSheetByName('Twitter'),
  YOUTUBE_SHEET = BK.getSheetByName('Youtube'),
  VOL_SHEET = BK.getSheetByName('出来高_日別'),
  SHEETS = [LOW_SHEET, HIGH_SHEET, VOL_SHEET],
  BINANCE_API_URL = 'https://api.binance.com',
  BTC_SYMBOL = 'BTC',
  SYMBOLS = LOW_SHEET.getRange(2, 1, LOW_SHEET.getLastRow(), 1).getValues().filter(function (e) {
    if (e[0]) {
      return e;
    }
  });

// Twitter API(Get users so check screen name equals the query)
// https://script.google.com/macros/s/AKfycbwiFrBiaQcCbk2FqV8S2yuteQTml3GZgsXNLW237_YE7B3NV4Q/exec?q=yabaiwebyasan