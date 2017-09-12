var BK = SpreadsheetApp.getActiveSpreadsheet(),
  RANKING_SHEET = BK.getSheetByName('ranking'),
  URL_ROW = 7,
  RANKING_START_ROW = 12,
  MSF_PATH = '/msf/1',
  RD3_PATH = '/rd/3',
  RD2_PATH = '/rd/2',
  RD1_PATH = '/rd/1';

function onOpen() {
  showMenu();
}

function showMenu() {
  var menu = [
    {name: '1.setClientData', functionName: 'setClientData'},
    {name: '2.setCategoryData', functionName: 'setCategoryData'}
  ];
  BK.addMenu("Custom Menu", menu);
}

function setClientData() {
  var startRow = 3;
  var link = RANKING_SHEET.getRange(startRow, 3).getValue();
  if (link) {
    RANKING_SHEET.getRange(startRow, 4, 1, 10).clear().setValues([getReviewData(link)]);
  }
}

function setCategoryData() {

  function setTargetCategory(response) {
    function getCategoryName(response) {
      var regex = /<div class="inner-sp-ttl">[\s\S]*?<h2><a href=".*>(.*)<\/a><\/h2>/;
      return regex.exec(response)[1];
    }

    var categoryName = getCategoryName(response);
    RANKING_SHEET.getRange(URL_ROW, 4).clear().setValue(categoryName);
  }

  function setRanking(response) {
    function getRanking(response) {
      var regex = /<dd class="summary">([\s\S]*?)<\/dd>/g;
      return response.match(regex);
    }

    function getItemLink(response) {
      var regex = /<p class="votes"><a href="(.*reviews)"/;
      return regex.exec(response)[1];
    }

    var rankingData = getRanking(response),
      rankNum = 10,
      data = [];
    for (var i = 0; i < rankNum; i++) {
      var ranking = rankingData[i];
      var itemLink = getItemLink(ranking);
      var reviewData = getReviewData(itemLink);
      reviewData.unshift(itemLink);
      data[i] = reviewData;
    }
    RANKING_SHEET.getRange(RANKING_START_ROW, 3, rankNum, 11).setValues(data);
  }

  var response = UrlFetchApp.fetch(RANKING_SHEET.getRange(URL_ROW, 3).getValue()).getContentText('Shift_JIS');
  setTargetCategory(response);
  setRanking(response);
}

function getReviewData(link) {
  function getBrandName(response) {
    var regex = /<span class="brd-name".*><a href.*>(.*)<\/a><\/span>/
    return regex.exec(response)[1];
  }

  function getItemName(response) {
    var regex = /<p class="pdct-name"><a href=".*">(.*)<\/a><\/p>/
    return regex.exec(response)[1];
  }

  function getRatingValue(response) {
    var regex = /<p.*itemprop="ratingValue">(.*)<\/p>/;
    return regex.exec(response)[1];
  }

  function getPoint(response) {
    var regex = /<span class="point">(.*)pt<\/span>/;
    return regex.exec(response)[1];
  }

  function getReviewCounts(rankLink) {
    function getReviewCount(response) {
      var regex = /<span class="count cnt" itemprop="reviewCount">(.*)<\/span>/;
      return regex.exec(response)[1];
    }

    var links = [
      rankLink + RD3_PATH,
      rankLink + RD3_PATH + MSF_PATH,
      rankLink + RD2_PATH,
      rankLink + RD2_PATH + MSF_PATH,
      rankLink + RD1_PATH,
      rankLink + RD1_PATH + MSF_PATH
    ];
    var reviewCounts = [];
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      try {
        var response = UrlFetchApp.fetch(link).getContentText('Shift_JIS');
        reviewCounts[i] = getReviewCount(response);
      } catch (err) {
        reviewCounts[i] = 'error'
      }
    }
    return reviewCounts;
  }

  var result,
    reviewCounts = getReviewCounts(link);
  try {
    var response = UrlFetchApp.fetch(link).getContentText('Shift_JIS');
    var brandName = getBrandName(response);
    var itemName = getItemName(response);
    var ratingValue = getRatingValue(response);
    var point = getPoint(response);
    result = [brandName, itemName, ratingValue, point];
  } catch (err) {
    result = Array.apply(null, new Array(4)).map(function () {
      return "error";
    });
  }
  return result.concat(reviewCounts);
}