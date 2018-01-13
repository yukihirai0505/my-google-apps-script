var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEET = BK.getSheetByName('portfolio');

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

  var btcJpyPrice = fetchJson('https://api.zaif.jp/api/1/last_price/btc_jpy').last_price,
    binancePrices = fetchJson('https://api.binance.com/api/v1/ticker/allPrices'),
    range = SHEET.getRange(2, 1, SHEET.getLastRow(), 4),
    data = range.getValues().map(function (e) {
      var symbol = e[0],
        quality = e[1];
      Logger.log(symbol);
      if (symbol) {
        var currencyData = binancePrices.filter(function (e) {
          if (e.symbol === symbol + 'BTC') {
            return e;
          }
        });
        if (currencyData) {
          Logger.log(currencyData);
          var jpy = currencyData[0].price * btcJpyPrice;
          e[2] = jpy;
          e[3] = jpy * quality;
        }
      }
      return e;
    });
  range.setValues(data);
}