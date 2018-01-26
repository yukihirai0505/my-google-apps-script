var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEET = BK.getSheetByName('portfolio'),
  QUERY_STRING = Math.random();

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

function setData() {
  var btcJpyPrice = fetchJson('https://api.zaif.jp/api/1/last_price/btc_jpy').last_price,
    kuCoinPrices = fetchJson('https://api.kucoin.com/v1/open/tick').data,
    cryptopiaPrices = fetchJson('https://www.cryptopia.co.nz/api/GetMarkets').Data,
    range = SHEET.getRange(2, 1, SHEET.getLastRow(), 8),
    data = range.getValues().map(function (e) {
      var symbol = e[0],
        place = e[1],
        quality = e[2],
        getBtcPrice = e[3];
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
          e[4] = price;
          e[5] = (price / getBtcPrice) - 1;
          e[6] = jpy;
          e[7] = jpy * quality;
        }
      }
      return e;
    });
  range.setValues(data);
  setResultColor();
  getMarketCap();
}

function getMarketCap() {
  var range = SHEET.getRange(2, 1, SHEET.getLastRow(), 9),
    marketCap = fetchJson('https://api.coinmarketcap.com/v1/ticker/?' + QUERY_STRING + '&limit=0'),
    data = range.getValues().map(function (e) {
      var symbol = e[0];
      Logger.log(symbol);
      if (symbol) {
        e[8] = marketCap.filter(function (e) {
          if (e.symbol === symbol) {
            return e;
          }
        })[0].rank;
      }
      return e;
    });
  range.setValues(data);
}

function setResultColor() {
  for (var i = 2; i <= SHEET.getLastRow(); i++) {
    var range = SHEET.getRange(i, 6);
    if (SHEET.getRange(i, 6).getValue() > 0) {
      range.setBackground('#DFF2BF');
    } else {
      range.setBackground('#FFBABA');
    }
  }
}