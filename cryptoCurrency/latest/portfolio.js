var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEET = BK.getSheetByName('portfolio'),
  QUERY_STRING = Math.random(),
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

function setData() {
  var btcJpyPrice = fetchJson('https://api.zaif.jp/api/1/last_price/btc_jpy').last_price,
    kuCoinPrices = fetchJson('https://api.kucoin.com/v1/open/tick').data,
    cryptopiaPrices = fetchJson('https://www.cryptopia.co.nz/api/GetMarkets').Data,
    binancePrices = fetchJson('https://api.binance.com/api/v1/ticker/allPrices'),
    coinexchangeMarkets = fetchJson('https://www.coinexchange.io/api/v1/getmarkets').result,
    coinexcgabgeMarketSummaries = fetchJson('https://www.coinexchange.io/api/v1/getmarketsummaries').result,
    range = SHEET.getRange(2, 1, SHEET.getLastRow(), 8),
    data = range.getValues().map(function (e) {
      var symbol = e[0],
        place = e[1],
        quality = e[2],
        getBtcPrice = e[3];
      Logger.log(symbol);
      if (symbol) {
        var price;
        // BTCの場合のみ特殊
        if (symbol === BTC_SYMBOL) {
          e[6] = quality ? btcJpyPrice * quality : quality;
          return e;
        }
        if (place === 'kucoin') {
          price = kuCoinPrices.filter(function (kucoin) {
            if (kucoin.symbol === symbol + '-' + BTC_SYMBOL) {
              return kucoin;
            }
          })[0];
          price = price ? price.lastDealPrice : 'no price';
        } else if (place === 'cryptopia') {
          price = cryptopiaPrices.filter(function (cryptopia) {
            if (cryptopia.Label === symbol + '/' + BTC_SYMBOL) {
              return cryptopia;
            }
          })[0];
          price = price ? price.LastPrice : 'no price';
        } else if (place === 'binance') {
          price = binancePrices.filter(function (binance) {
            if (binance.symbol === symbol + BTC_SYMBOL) {
              return e;
            }
          })[0];
          price = price ? price.price : 'no price';
        } else if (place === 'coinexchange') {
          var market = coinexchangeMarkets.filter(function (coinexchange) {
            if (coinexchange.BaseCurrencyCode === BTC_SYMBOL && coinexchange.MarketAssetCode === symbol) {
              return coinexchange;
            }
          })[0];
          if (market) {
            price = coinexcgabgeMarketSummaries.filter(function (coinexchange) {
              if (coinexchange.MarketID === market.MarketID) {
                return coinexchange;
              }
            })[0];
            price = price ? price.LastPrice : 'no price';
          }
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
        symbol = symbol === 'YOYO' ? 'YOYOW' : symbol;
        symbol = symbol === 'IOTA' ? 'MIOTA' : symbol;
        var cap = marketCap.filter(function (e) {
          if (e.symbol === symbol) {
            return e;
          }
        })[0];
        e[8] = cap ? cap.rank : 'no rank';
      }
      return e;
    });
  range.setValues(data);
}

function setResultColor() {
  for (var i = 3; i <= SHEET.getLastRow(); i++) {
    var range = SHEET.getRange(i, 6);
    if (SHEET.getRange(i, 6).getValue() > 0) {
      range.setBackground('#DFF2BF');
    } else {
      range.setBackground('#FFBABA');
    }
  }
}