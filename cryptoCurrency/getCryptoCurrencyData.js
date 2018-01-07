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
  var response = UrlFetchApp.fetch('https://api.coinmarketcap.com/v1/ticker/?convert=jpy&limit=0'),
    json = JSON.parse(response.getContentText()),
    range = SHEET.getRange(2, 1, SHEET.getLastRow(), 4),
    data = range.getValues().map(function (e) {
      var symbol = e[0],
        quality = e[1];
      Logger.log(symbol)
      if (symbol) {
        var currencyData = json.filter(function (e) {
          if (e.symbol === symbol) {
            return e;
          }
        });
        if (currencyData) {
          Logger.log(currencyData);
          var jpy = currencyData[0].price_jpy;
          e[2] = jpy;
          e[3] = jpy * quality;
        }
      }
      return e;
    });
  range.setValues(data);
}