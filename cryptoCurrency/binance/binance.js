var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEETS = BK.getSheets(),
  BINANCE_API_URL = 'https://api.binance.com',
  BTC_SYMBOL = 'BTC';

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

function setPastData() {
  var filterDateTime = new Date(2018, 0, 1).getTime();

  function getKLines(symbol) {
    Utilities.sleep(500);
    var kLines = fetchJson(BINANCE_API_URL + '/api/v1/klines?symbol=' + symbol + BTC_SYMBOL + '&interval=1d').map(function (e) {
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
    }).filter(function (e) {
      if (e.openTime.getTime() > filterDateTime) {
        return e;
      }
    });
    return kLines;
  }

  var symbols = SHEETS[0].getRange(2, 1, SHEETS[0].getLastRow(), 1).getValues().filter(function (e) {
      if (e[0]) {
        return e;
      }
    }),
    dateColumns;
  Logger.log(symbols);
  symbols.forEach(function (e, i) {
    var data = getKLines(e[0]);
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
    SHEETS[0].getRange(i + 2, fromDateIndex, 1, lowData.length).setValues([lowData]);
    SHEETS[1].getRange(i + 2, fromDateIndex, 1, highData.length).setValues([highData]);
    SHEETS[2].getRange(i + 2, fromDateIndex, 1, volData.length).setValues([volData]);
  });
}
