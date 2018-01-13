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
    binancePrices = fetchJson('https://api.kucoin.com/v1/open/tick').data.filter(function (e) {
      if (e.symbol.match(/BTC$/gi)) {
        return e;
      }
    }),
    marketCap = fetchJson('https://api.coinmarketcap.com/v1/ticker/?convert=jpy&limit=0'),
    data = binancePrices.map(function (e) {
      var symbol = e.symbol.slice(0, -4),
        price = e.lastDealPrice * btcJpyPrice,
        rank = marketCap.filter(function (cap) {
          if (symbol === cap.symbol) {
            return cap;
          }
        });
      if (rank.length > 0) {
        return [symbol, price, rank[0].rank];
      } else {
        return [symbol, price, ""];
      }
    });
  Logger.log("===data===")
  Logger.log(data)
  SHEET.getRange(1, 1, data.length, 3).setValues(data);
}