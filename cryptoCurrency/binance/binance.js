var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEETS = BK.getSheets(),
  BINANCE_API_URL = 'https://api.binance.com',
  BTC_SYMBOL = 'BTC';

function onOpen() {
  function showMenu() {
    var menu = [
      {name: "Get Crypto Currency Data", functionName: "setData"}
    ];
    BK.addMenu("Custom Management", menu);
  }

  showMenu();
}

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

// TODO: 一気にデータセットするやつと1日ずつ取得するやつ
function setData() {
  var filterDate = new Date(2018, 1, 1).getTime();
  function getKLines(symbol) {
    Utilities.sleep(500);
    var kLines = fetchJson(BINANCE_API_URL + '/api/v1/klines?symbol=' + symbol + '&interval=1d').map(function (e) {
      var openTime = kLines[0],
        openPrice = kLines[1],
        highPrice = kLines[2],
        lowPrice = kLines[3],
        closePrice = kLines[4],
        volume = kLines[5],
        closeTime = kLines[6],
        quoteAssetVolume = kLines[7],
        numberOfTrades = kLines[8],
        takerBuyBaseAssetVol = kLines[9],
        takerBuyQuoteAssetVol = kLines[10],
        ignore = kLines[11];
      return {
        openTime: openTime,
        highPrice: highPrice,
        lowPrice: lowPrice,
        volume: volume
      };
    });
    // TODO filter 2018/01/01以降

    return kLines;
  }

  /*
  var range = SHEET.getRange(2, 1, SHEET.getLastRow(), 1).filter(function (e) {
      if (e[0]) {
        return e;
      }
    }),
    data = range.getValues().map(function (e, i) {
      return getKLines(e[0]);
    });
  Logger.log(data);
  */
}
