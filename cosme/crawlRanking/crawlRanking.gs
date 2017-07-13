var bk = SpreadsheetApp.getActiveSpreadsheet(),
  rankingSheet = bk.getSheetByName("ranking"),
  urlRow = 7,
  rankStartRow = 12,
  msfPath = '/msf/1',
  rd3Path = '/rd/3',
  rd2Path = '/rd/2',
  rd1Path = '/rd/1',
  targetUrl = rankingSheet.getRange(urlRow, 3).getValue();

function onOpen() {
  showMenu();
}

function showMenu() {
  var menu = [
    {name: "1. setClientData", functionName: "setClientData"},
    {name: "2. setBaseData", functionName: "setBaseData"},
    {name: "3. setPoints", functionName: "setPoints"},
    {name: "4. setReviewCounts", functionName: "setReviewCounts"}
  ];
  bk.addMenu("Custom Menu", menu);
}

function setClientData() {
  var startRow = 3;
  var link = rankingSheet.getRange(startRow, 3).getValue();
  var response = UrlFetchApp.fetch(link).getContentText('Shift_JIS');
  var brandName = getBrandName(response);
  var itemName = getItemName(response);
  var ratingValue = getRatingValue(response);
  var point = getPoint(response);
  rankingSheet.getRange(startRow, 4, 1, 4).setValues([[brandName, itemName, ratingValue, point]]);
  setReviewCount(link, startRow);

  function getBrandName(response) {
    var regex = /<span class="brd-name".*><a href.*>(.*)<\/a><\/span>/;
    return regex.exec(response)[1];
  }

  function getItemName(response) {
    var regex = /<p class="pdct-name"><a href=".*">(.*)<\/a><\/p>/;
    return regex.exec(response)[1];
  }
}

function setBaseData() {
  var response = UrlFetchApp.fetch(targetUrl).getContentText('Shift_JIS');
  setTargetCategory(response);
  setRanking(response);

  function setTargetCategory(response) {

    var categoryName = getCategoryName(response);
    rankingSheet.getRange(urlRow, 4).setValue(categoryName);

    function getCategoryName(response) {
      var regex = /<div class="inner-sp-ttl">[\s\S]*?<h2><a href=".*>(.*)<\/a><\/h2>/;
      return regex.exec(response)[1];
    }

  }

  function setRanking(response) {

    var rankingData = getRanking(response);
    for (var i = 0; i < 10; i++) {
      var ranking = rankingData[i];
      var itemLink = getItemLink(ranking);
      var brandName = getBrandName(ranking);
      var itemName = getItemName(ranking);
      rankingSheet.getRange(rankStartRow + i, 3, 1, 3).setValues([[itemLink, brandName, itemName]]);
    }

    function getRanking(response) {
      var regex = /<dd class="summary">([\s\S]*?)<\/dd>/g;
      return response.match(regex);
    }

    function getItemLink(response) {
      var regex = /<p class="votes"><a href="(.*reviews)"/;
      return regex.exec(response)[1];
    }

    function getBrandName(response) {
      var regex = /<span class="brand"><a href=.*?>(.*?)<\/a>/;
      return regex.exec(response)[1];
    }

    function getItemName(response) {
      var regex = /<span class="item"><a href=.*>(.*)<\/a>/;
      return regex.exec(response)[1];
    }

  }
}

function setPoints() {

  var rankLinks = rankingSheet.getRange(rankStartRow, 3, 10, 1).getValues();
  for (var i = 0; i < rankLinks.length; i++) {
    var rankLink = rankLinks[i][0];
    try {
      var response = UrlFetchApp.fetch(rankLink).getContentText('Shift_JIS');
      var ratingValue = getRatingValue(response);
      var point = getPoint(response);
      rankingSheet.getRange(rankStartRow + i, 6, 1, 2).setValues([[ratingValue, point]]);
    } catch (err) {
      var message = 'couldn\'t get';
      rankingSheet.getRange(rankStartRow + i, 6, 1, 2).setValues([[message, message]]);
    }
  }

}

function getRatingValue(response) {
  var regex = /<p.*itemprop="ratingValue">(.*)<\/p>/;
  return regex.exec(response)[1];
}

function getPoint(response) {
  var regex = /<span class="point">(.*)pt<\/span>/;
  return regex.exec(response)[1];
}


function setReviewCounts() {
  var rankLinks = rankingSheet.getRange(rankStartRow, 3, 10, 1).getValues();
  for (var i = 0; i < rankLinks.length; i++) {
    var rankLink = rankLinks[i][0];
    setReviewCount(rankLink, rankStartRow + i);
  }
}

function setReviewCount(rankLink, rowIndex) {
  var links = [
    rankLink + rd3Path,
    rankLink + rd3Path + msfPath,
    rankLink + rd2Path,
    rankLink + rd2Path + msfPath,
    rankLink + rd1Path,
    rankLink + rd1Path + msfPath
  ];
  var reviewCounts = [];
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    try {
      var response = UrlFetchApp.fetch(link).getContentText('Shift_JIS');
      reviewCounts[i] = getReviewCount(response);
    } catch (err) {
      reviewCounts[i] = 'couldn\'t get';
    }
  }
  rankingSheet.getRange(rowIndex, 8, 1, 6).setValues([reviewCounts]);

  function getReviewCount(response) {
    var regex = /<span class="count cnt" itemprop="reviewCount">(.*)<\/span>/;
    return regex.exec(response)[1];
  }
}
