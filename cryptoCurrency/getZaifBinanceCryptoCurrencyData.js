var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEET = BK.getSheetByName('portfolio'),
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


function setData() {
  function fetchJson(url) {
    return JSON.parse(UrlFetchApp.fetch(url));
  }
  function getBinancePrice(symbol) {
    return fetchJson('https://api.binance.com/api/v3/ticker/price?symbol=' + symbol + BTC_SYMBOL).price;
  }

  var btcJpyPrice = fetchJson('https://api.zaif.jp/api/1/last_price/btc_jpy').last_price,
    range = SHEET.getRange(2, 1, SHEET.getLastRow(), 7),
    data = range.getValues().map(function (e) {
      var symbol = e[0],
        quality = e[1],
        getBtcPrice = e[2];
      if (symbol === BTC_SYMBOL) {
        e[5] = btcJpyPrice;
        e[6] = btcJpyPrice * quality;
        return e;
      }
      Logger.log(symbol);
      if (symbol) {
        var btcPrice = getBinancePrice(symbol);
        Logger.log(btcPrice);
        if (btcPrice) {
          var jpy = btcPrice * btcJpyPrice;
          e[3] = btcPrice;
          e[4] = (btcPrice / getBtcPrice) - 1;
          e[5] = jpy;
          e[6] = jpy * quality;
          e
        }
      }
      return e;
    });
  range.setValues(data);
}