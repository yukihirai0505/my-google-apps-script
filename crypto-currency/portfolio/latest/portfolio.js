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
  var marketCap = fetchJson('https://api.coinmarketcap.com/v1/ticker/?' + QUERY_STRING + '&limit=0');

  function getMarketcap(symbol) {
    var _symbol;
    _symbol = symbol === 'YOYO' ? 'YOYOW' : symbol;
    _symbol = symbol === 'IOTA' ? 'MIOTA' : _symbol;
    _symbol = symbol === 'XRB' ? 'NANO' : _symbol;
    _symbol = symbol === 'BTC/JPY_PAIR' ? 'BTC' : _symbol;
    _symbol = symbol === 'XRP/JPY_PAIR' ? 'XRP' : _symbol;
    _symbol = symbol === 'LTC/BTC' ? 'LTC' : _symbol;
    _symbol = symbol === 'ETH/BTC' ? 'ETH' : _symbol;
    _symbol = symbol === 'MONA/JPY_PAIR' ? 'MONA' : _symbol;
    _symbol = symbol === 'MONA/BTC' ? 'MONA' : _symbol;
    _symbol = symbol === 'BCC/JPY_PAIR' ? 'BCH' : _symbol;
    _symbol = symbol === 'BCC/BTC' ? 'BCH' : _symbol;
    var cap = marketCap.filter(function (e) {
      if (e.symbol === _symbol) {
        return e;
      }
    })[0];
    return cap ? cap.rank : 'no rank';
  }

  function getZaifLastPrice(symbol) {
    var _symbol;
    _symbol = symbol === 'XEM' ? 'xem' : symbol;
    _symbol = symbol === 'MONA' ? 'mona' : _symbol;
    _symbol = symbol === 'ETH' ? 'eth' : _symbol;
    _symbol = symbol === 'XCP' ? 'xcp' : _symbol;
    _symbol = symbol === 'PEPECASH' ? 'pepecash' : _symbol;
    _symbol = symbol === 'ZAIF' ? 'zaif' : _symbol;
    _symbol = symbol === 'SJCX' ? 'sjcx' : _symbol;
    _symbol = symbol === 'FSCC' ? 'fscc' : _symbol;
    _symbol = symbol === 'CICC' ? 'cicc' : _symbol;
    _symbol = symbol === 'NCXC' ? 'ncxc' : _symbol;
    return fetchJson('https://api.zaif.jp/api/1/last_price/' + _symbol + '_btc').last_price;
  }

  function getZaifJpyLastPrice(symbol) {
    var _symbol;
    _symbol = symbol === 'CMS' ? 'erc20.cms' : symbol;
    _symbol = symbol === 'JPYZ' ? 'jpyz' : _symbol;
    return fetchJson('https://api.zaif.jp/api/1/last_price/' + _symbol + '_jpy').last_price;
  }

  function getBitbankLastPrice(symbol) {
    var _symbol;
    _symbol = symbol === 'BTC/JPY_PAIR' ? 'btc_jpy' : symbol;
    _symbol = symbol === 'XRP/JPY_PAIR' ? 'xrp_jpy' : _symbol;
    _symbol = symbol === 'LTC/BTC' ? 'ltc_btc' : _symbol;
    _symbol = symbol === 'ETH/BTC' ? 'eth_btc' : _symbol;
    _symbol = symbol === 'MONA/JPY_PAIR' ? 'mona_jpy' : _symbol;
    _symbol = symbol === 'MONA/BTC' ? 'mona_btc' : _symbol;
    _symbol = symbol === 'BCC/JPY_PAIR' ? 'bcc_jpy' : _symbol;
    _symbol = symbol === 'BCC/BTC' ? 'bcc_btc' : _symbol;
    return fetchJson('https://public.bitbank.cc/' + _symbol + '/ticker').data.last;
  }

  var btcJpyPrice = fetchJson('https://api.zaif.jp/api/1/last_price/btc_jpy').last_price,
    kuCoinPrices = fetchJson('https://api.kucoin.com/v1/open/tick').data,
    cryptopiaPrices = fetchJson('https://www.cryptopia.co.nz/api/GetMarkets').Data,
    binancePrices = fetchJson('https://api.binance.com/api/v1/ticker/allPrices'),
    coinexchangeMarkets = fetchJson('https://www.coinexchange.io/api/v1/getmarkets').result,
    coinexcgabgeMarketSummaries = fetchJson('https://www.coinexchange.io/api/v1/getmarketsummaries').result,
    hitbtcPrices = fetchJson('https://api.hitbtc.com/api/2/public/ticker'),
    range = SHEET.getRange(2, 1, SHEET.getLastRow(), 11),
    data = range.getValues().map(function (e, i) {
      var symbol = e[0],
        place = e[1],
        quality = e[2],
        lineNum = i + 2;

      function makeResult(e, btcPrice, jpy) {
        e[4] = btcPrice;
        e[5] = jpy;
        e[6] = '=C' + lineNum + '*F' + lineNum;
        e[7] = '=C' + lineNum + '*E' + lineNum;
        e[8] = '=E' + lineNum + '/D' + lineNum + '-1';
        e[9] = '=G' + lineNum + '/L2';
        e[10] = getMarketcap(symbol);
        return e;
      }

      Logger.log(symbol);
      if (symbol) {
        var btcPrice;
        // BTCの場合のみ特殊
        if (symbol === BTC_SYMBOL) {
          e[5] = btcJpyPrice;
          e[6] = quality ? btcJpyPrice * quality : quality;
          return e;
        }
        if (place === 'kucoin') {
          btcPrice = kuCoinPrices.filter(function (kucoin) {
            if (kucoin.symbol === symbol + '-' + BTC_SYMBOL) {
              return kucoin;
            }
          })[0];
          btcPrice = btcPrice ? btcPrice.lastDealPrice : 'no price';
        } else if (place === 'cryptopia') {
          btcPrice = cryptopiaPrices.filter(function (cryptopia) {
            if (cryptopia.Label === symbol + '/' + BTC_SYMBOL) {
              return cryptopia;
            }
          })[0];
          btcPrice = btcPrice ? btcPrice.LastPrice : 'no price';
        } else if (place === 'binance') {
          btcPrice = binancePrices.filter(function (binance) {
            if (binance.symbol === symbol + BTC_SYMBOL) {
              return e;
            }
          })[0];
          btcPrice = btcPrice ? btcPrice.price : 'no price';
        } else if (place === 'coinexchange') {
          var market = coinexchangeMarkets.filter(function (coinexchange) {
            if (coinexchange.BaseCurrencyCode === BTC_SYMBOL && coinexchange.MarketAssetCode === symbol) {
              return coinexchange;
            }
          })[0];
          if (market) {
            btcPrice = coinexcgabgeMarketSummaries.filter(function (coinexchange) {
              if (coinexchange.MarketID === market.MarketID) {
                return coinexchange;
              }
            })[0];
            btcPrice = btcPrice ? btcPrice.LastPrice : 'no price';
          }
        } else if (place === 'hitbtc') {
          btcPrice = hitbtcPrices.filter(function (hitbtc) {
            if (hitbtc.symbol === symbol + BTC_SYMBOL) {
              return e;
            }
          })[0];
          btcPrice = btcPrice ? btcPrice.last : 'no price';
        } else if (place === 'zaif') {
          if (symbol.indexOf('CMS') > -1 || symbol.indexOf('JPYZ') > -1) {
            return makeResult(e, '-', getZaifJpyLastPrice(symbol));
          } else {
            btcPrice = getZaifLastPrice(symbol);
          }
        } else if (place === 'bitbank') {
          var jpy;
          btcPrice = getBitbankLastPrice(symbol);
          if (symbol.indexOf('JPY_PAIR') > -1) {
            jpy = btcPrice;
            btcPrice = '-';
          } else {
            jpy = btcPrice * btcJpyPrice;
          }
          return makeResult(e, btcPrice, jpy);
        }

        if (btcPrice) {
          return makeResult(e, btcPrice, btcPrice * btcJpyPrice);
        }
      }
      return e;
    });
  range.setValues(data);
  setResultColor();
}

function setResultColor() {
  for (var i = 3; i <= SHEET.getLastRow(); i++) {
    var range = SHEET.getRange(i, 9),
      value = range.getValue();
    if (value > 0) {
      range.setBackground('#DFF2BF');
    } else if (value === 0) {
      range.setBackground('#FFF');
    } else {
      range.setBackground('#FFBABA');
    }
  }
}