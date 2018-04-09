var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEETS = BK.getSheets(),
  LOW_SHEET = SHEETS[0],
  HIGH_SHEET = SHEETS[1],
  VOL_SHEET = SHEETS[2],
  BINANCE_API_URL = 'https://api.binance.com',
  BTC_SYMBOL = 'BTC',
  SYMBOLS = SHEETS[0].getRange(2, 1, SHEETS[0].getLastRow(), 1).getValues().filter(function (e) {
    if (e[0]) {
      return e;
    }
  });

function fetchJson(url) {
  return JSON.parse(UrlFetchApp.fetch(url));
}

function setSymbols() {
  var data = fetchJson(BINANCE_API_URL + '/api/v1/exchangeInfo').symbols.filter(function (e) {
    if (e.symbol.indexOf(BTC_SYMBOL) !== -1) {
      return e.symbol;
    }
  }).map(function (e) {
    return [e.symbol.replace(BTC_SYMBOL, '')];
  });
  SHEETS.forEach(function (sheet) {
    var range = sheet.getRange(2, 1, data.length, 1);
    range.setValues(data);
  });
}

function getKLines(symbol, times) {
  Utilities.sleep(500);
  var url = BINANCE_API_URL + '/api/v1/klines?symbol=' + symbol + BTC_SYMBOL + '&interval=1d';
  url = times ? url + times : url;
  return fetchJson(url).map(function (e) {
    var openTime = e[0],
      openPrice = e[1],
      highPrice = e[2],
      lowPrice = e[3],
      closePrice = e[4],
      volume = e[5],
      closeTime = e[6],
      quoteAssetVolume = e[7],
      numberOfTrades = e[8],
      takerBuyBaseAssetVol = e[9],
      takerBuyQuoteAssetVol = e[10],
      ignore = e[11];
    return {
      openTime: new Date(openTime),
      highPrice: highPrice,
      lowPrice: lowPrice,
      volume: volume
    };
  });
}

function setTwoDaysData() {
  var today = new Date(),
    yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  // 2日分を取得
  var times = '&startTime=' + yesterday.getTime() + '&endTime=' + today.getTime(),
    dateRangeVal = LOW_SHEET.getRange(1, 2, 1, LOW_SHEET.getLastColumn()).getValues().filter(function (e) {
      if (e[0]) {
        return e;
      }
    })[0];
  SYMBOLS.map(function (symbol, symbolIndex) {
    var twoDaysData = getKLines(symbol[0], times);
    // それぞれ日付を検索して対象セルを更新
    twoDaysData.forEach(function (data) {
      var dateColumnNum;
      dateRangeVal.filter(function (dateVal, dateIndex) {
        if (new Date(dateVal).getTime() === data.openTime.getTime()) {
          dateColumnNum = dateIndex + 2;
          return dateVal;
        }
      });
      if (!dateColumnNum) {
        // 日付がなければ新しく日付を追加(最初のみ)
        Logger.log(data.openTime);
        dateColumnNum = dateRangeVal.length + 1;
        if (symbolIndex === 0) {
          SHEETS.forEach(function (sheet) {
            sheet.getRange(1, dateColumnNum).setValue(data.openTime);
          });
        }
      }
      LOW_SHEET.getRange(symbolIndex + 2, dateColumnNum).setValue(data.lowPrice);
      HIGH_SHEET.getRange(symbolIndex + 2, dateColumnNum).setValue(data.highPrice);
      VOL_SHEET.getRange(symbolIndex + 2, dateColumnNum).setValue(data.volume);
    });
  });
}

function setPastData() {
  var filterDateTime = new Date(2018, 0, 1).getTime();

  var dateColumns;
  SYMBOLS.forEach(function (e, i) {
    var data = getKLines(e[0]).filter(function (e) {
      if (e.openTime.getTime() > filterDateTime) {
        return e;
      }
    });
    var dates = data.map(function (e) {
      return e.openTime;
    });
    var lowData = data.map(function (e) {
      return e.lowPrice;
    });
    var highData = data.map(function (e) {
      return e.highPrice;
    });
    var volData = data.map(function (e) {
      return e.volume;
    });
    // 1列目だけ日付も一緒にいれる
    if (i === 0) {
      SHEETS.forEach(function (sheet) {
        dateColumns = dates;
        sheet.getRange(1, 2, 1, dates.length).setValues([dates]);
      });
    }
    var fromDateIndex;
    dateColumns.forEach(function (e, i) {
      if (e.getTime() === dates[0].getTime()) {
        fromDateIndex = i + 2;
      }
    });
    LOW_SHEET.getRange(i + 2, fromDateIndex, 1, lowData.length).setValues([lowData]);
    HIGH_SHEET.getRange(i + 2, fromDateIndex, 1, highData.length).setValues([highData]);
    VOL_SHEET.getRange(i + 2, fromDateIndex, 1, volData.length).setValues([volData]);
  });
}
