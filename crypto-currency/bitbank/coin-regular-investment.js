/**
 * API Document => https://docs.bitbank.cc/#/
 */
var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEET = BK.getSheetByName('bitbank'),
  DATA = SHEET.getRange(1, 2, 3, 1).getValues(),
  API_KEY = DATA[0][0],
  API_SECRET = DATA[1][0],
  AMOUNT = DATA[2][0],
  BITBANK = {
    URL: {
      PUBLIC: 'https://public.bitbank.cc',
      PRIVATE: 'https://api.bitbank.cc/v1'
    },
    PAIR: {
      BTC_JPY: 'btc_jpy',
      XRP_JPY: 'xrp_jpy',
      LTC_BTC: 'ltc_btc',
      ETH_BTC: 'eth_btc',
      MONA_JPY: 'mona_jpy',
      MONA_BTC: 'mona_btc',
      BCC_JPY: 'bcc_jpy',
      BCC_BTC: 'bcc_btc'
    }
  };

function getLastPrice(pair) {
  var data = fetchJson(BITBANK.URL.PUBLIC + '/' + pair + '/ticker', 'GET', true).data;
  // var high = data.high,
  //   vol = data.vol,
  //   last = data.last,
  //   low = data.low,
  //   sell = data.sell,
  //   buy = data.buy,
  //   timestamp = data.timestamp;
  return data.last;
}

function order() {
  [BITBANK.CURRENCY.XRP_JPY, BITBANK.CURRENCY.MONA_JPY].forEach(function (pair) {
    var lastPrice = getLastPrice(pair),
      body = {
        pair: pair,
        amount: AMOUNT / lastPrice,
        //price: lastPrice,
        side: 'buy',
        type: 'market'
      },
      result = fetchJson(BITBANK.URL.PRIVATE + '/user/spot/order', 'POST', false, body);
    Logger.log(result);
  });
}

function fetchJson(url, method, isPublic, _body) {
  var nonce = Date.now().toString(),
    body = JSON.stringify(_body),
    option = isPublic ? {
      method: method,
      contentType: 'application/json'
    } : {
      method: method,
      payload: body,
      headers: {
        'ACCESS-KEY': API_KEY,
        'ACCESS-NONCE': nonce,
        'ACCESS-SIGNATURE': createSignature(url, nonce, body)
      },
      contentType: 'application/json'
    };
  return JSON.parse(UrlFetchApp.fetch(url, option));
}

function createSignature(url, nonce, body) {
  // ref: https://stackoverflow.com/questions/41232615/how-to-get-hex-value-from-computehmacsha256signature-method-of-google-apps-scrip
  function toHex(signature) {
    return signature.reduce(function (str, chr) {
      chr = (chr < 0 ? chr + 256 : chr).toString(16);
      return str + (chr.length === 1 ? '0' : '') + chr;
    }, '');
  }

  var text = (typeof body === 'undefined') ?
    nonce + url : nonce + body;
  Logger.log(text);
  var signature = Utilities.computeHmacSha256Signature(text, API_SECRET);
  return toHex(signature);
}