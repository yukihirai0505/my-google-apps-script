var BK = SpreadsheetApp.getActiveSpreadsheet();
var ACCOUNT_SHEET = BK.getSheetByName("cosme");


function onOpen() {
  showMenu();
}

function showMenu() {
  var menu = [
    {name: "Set Cosme Data", functionName: "setData"}
  ];
  BK.addMenu("Custom Menu", menu);
}

function setData() {
  var dataRange = ACCOUNT_SHEET.getRange(3, 2, ACCOUNT_SHEET.getLastRow(), 5);
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
    //Utilities.sleep(1000);
    var response = UrlFetchApp.fetch(link.replace('s.cosme.net', 'my.cosme.net')).getContentText();
    var scoreElem = getScore(response);
    var isBuy = scoreElem.indexOf('buy') > 0;
    var isRepeat = scoreElem ? scoreElem.indexOf('repeat') > 0 : false;
    var score = scoreElem ? removeTags(scoreElem).replace(/[^0-9]/g, '') : '';
    var postDate = getPostDate(response);
    return [
      link, isBuy ? '購入' : 'モニター', isRepeat, score, postDate
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

function getPostDate(response) {
  var regex = /<div class="(rate\-sec|rating) clearfix">[\s\S]*?<p class="(mobile\-date|date)">(.*)?<\/p>[\s\S]*?<\/div>/gi;
  return regex.exec(response)[3];
}

