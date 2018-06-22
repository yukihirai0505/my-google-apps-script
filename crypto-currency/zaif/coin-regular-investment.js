/**
 * API Document => http://techbureau-api-document.readthedocs.io/ja/latest/index.html
 */
var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEET = BK.getSheetByName('zaif'),
  DATA = SHEET.getRange(1, 2, 3, 1).getValues(),
  API_KEY = DATA[0][0],
  API_SECRET = DATA[1][0],
  AMOUNT = DATA[2][0],
  ZAIF = {
    URL: {
      PUBLIC: 'https://api.zaif.jp/api/1',
      PRIVATE: 'https://api.zaif.jp/tapi'
    },
    PAIR: {
      XEM_JPY: 'xem_jpy'
    }
  };

function getLastPrice(pair) {
  return fetchJson(ZAIF.URL.PUBLIC + '/last_price/' + pair, 'GET', true).last_price;
}

function order() {
  var pair = ZAIF.PAIR.XEM_JPY,
    lastPrice = getLastPrice(pair),
    limitPrice = lastPrice - 0.0001,
    nonce = (new Date().getTime() / 1000).toFixed(0),
    params = 'method=trade';
  params += '&nonce=' + nonce;
  params += '&currency_pair=' + pair;
  params += '&action=bid&price=' + limitPrice;
  params += '&amount=' + Math.ceil(AMOUNT / limitPrice);
  params += '&comment=bot';
  var result = fetchJson(ZAIF.URL.PRIVATE, 'POST', false, params);
  if (result.error === 'trade temporarily unavailable.') {
    Logger.log(result.error);
    Utilities.sleep(3000);
    return order();
  }
  Logger.log(result);
}

function fetchJson(url, method, isPublic, body) {
  var option = isPublic ? {
    method: method,
    contentType: 'application/json'
  } : {
    method: method,
    payload: body,
    headers: {
      'key': API_KEY,
      'sign': createSignature(body)
    }
  };
  return JSON.parse(UrlFetchApp.fetch(url, option));
}

function createSignature(body) {
  var hmac = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_512, body, API_SECRET);
  return hmac.map(function (e) {
    return ('0' + (e & 0xFF).toString(16)).slice(-2)
  }).join('');
}
