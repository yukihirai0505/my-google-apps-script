var bk = SpreadsheetApp.getActiveSpreadsheet();
var accountSheet = bk.getSheetByName("cosme");


function onOpen() {
  showMenu();
}

function showMenu() {
  var menu = [
    {name: "Set Cosme Data", functionName: "setData"}
  ];
  bk.addMenu("Custom Menu", menu);
}

function setData() {
  var dataRange = accountSheet.getRange(3, 2, accountSheet.getLastRow(), 4);
  var cosmeData = dataRange.getValues();
  var data = [];
  for (var i = 0; i < cosmeData.length; i++) {
    data[i] = getCosmeData(cosmeData[i]);
  }
  dataRange.setValues(data);
}

function getCosmeData(data) {
  try {
    var link = data[0],
      orgScore = data[3];
    if (!link) {
      return data;
    }
    if (orgScore) {
      return data;
    }
    Utilities.sleep(1000);
    var isSp = link.indexOf('s.cosme.net') > 0;
    var response = UrlFetchApp.fetch(link).getContentText();
    var scoreElem = getScore(response);
    var isBuy = isSp ? getItemStatus(response).indexOf('購入品') > 0 : scoreElem.indexOf('buy') > 0;
    var isRepeat = scoreElem ? scoreElem.indexOf('repeat') > 0 : false;
    var score = scoreElem ? removeTags(scoreElem).replace(/[^0-9]/g, '') : '';
    return [
      link, isBuy ? '購入': 'モニター', isRepeat, score
    ];
  } catch (err) {
    Logger.log(err);
    return data;
  }
}

function removeTags(textWithTag) {
  return textWithTag.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
}

function getScore(response) {
  var regex = /<p class="reviewer-rating(.|\s)*?\/p>/gi;
  return regex.exec(response)[0];
}

function getItemStatus(response) {
  var regex = /<div class="item-status"(.|\s)*?\/div>/gi;
  return regex.exec(response)[0];
}

