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
    binancePrices = fetchJson('https://api.binance.com/api/v1/ticker/allPrices').filter(function (e) {
      if (e.symbol.match(/BTC$/gi)) {
        return e;
      }
    }),
    marketCap = fetchJson('https://api.coinmarketcap.com/v1/ticker/?limit=0'),
    data = binancePrices.map(function (e) {
      var symbol = e.symbol.slice(0, -3),
        price = e.price * btcJpyPrice,
        cap = marketCap.filter(function (cap) {
          if (symbol === cap.symbol) {
            return cap;
          }
        });
      if (cap.length > 0) {
        var capData = cap[0];
        return [symbol, price, capData.total_supply, capData.max_supply, capData.rank];
      } else {
        return [symbol, price, "", "", ""];
      }
    });
  SHEET.getRange(2, 1, data.length, 5).setValues(data);
}