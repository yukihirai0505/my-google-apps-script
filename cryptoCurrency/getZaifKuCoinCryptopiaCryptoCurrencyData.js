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
    kuCoinPrices = fetchJson('https://api.kucoin.com/v1/open/tick').data,
    cryptopiaPrices = fetchJson('https://www.cryptopia.co.nz/api/GetMarkets').Data,
    range = SHEET.getRange(2, 1, SHEET.getLastRow(), 5),
    data = range.getValues().map(function (e) {
      var symbol = e[0],
        place = e[1],
        quality = e[2];
      Logger.log(symbol);
      if (symbol) {
        var price;
        if (place === 'kucoin') {
          price = kuCoinPrices.filter(function (e) {
            if (e.symbol === symbol + '-BTC') {
              return e;
            }
          })[0].lastDealPrice;
        }
        if (place === 'cryptopia') {
          price = cryptopiaPrices.filter(function (e) {
            if (e.Label === symbol + '/BTC') {
              return e;
            }
          })[0].LastPrice;
        }
        if (price) {
          var jpy = price * btcJpyPrice;
          Logger.log(jpy);
          e[3] = jpy;
          e[4] = jpy * quality;
        }
      }
      return e;
    });
  range.setValues(data);
}