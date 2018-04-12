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
  } else {
    Browser.msgBox('please input client review link');
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

  var link = RANKING_SHEET.getRange(URL_ROW, 3).getValue();
  if (link) {
    var response = UrlFetchApp.fetch(link).getContentText('Shift_JIS');
    setTargetCategory(response);
    setRanking(response);
  } else {
    Browser.msgBox('please input category link');
  }
}

function getReviewData(baseLink) {
  function getProductData(response) {
    var regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    return JSON.parse(regex.exec(response)[1]);
  }

  function getPoint(response) {
    var regex = /<span class="point">(.*)pt<\/span>/;
    return regex.exec(response)[1];
  }

  function getReviewCounts() {
    function getReviewCount(response) {
      var regex = /<span class="count cnt">(.*)<\/span>/;
      return regex.exec(response)[1];
    }

    var links = [
      baseLink + RD3_PATH,
      baseLink + RD3_PATH + MSF_PATH,
      baseLink + RD2_PATH,
      baseLink + RD2_PATH + MSF_PATH,
      baseLink + RD1_PATH,
      baseLink + RD1_PATH + MSF_PATH
    ];
    var reviewCounts = [];
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      Logger.log(link);
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
    reviewCounts = getReviewCounts();
  try {
    var response = UrlFetchApp.fetch(baseLink).getContentText('Shift_JIS'),
      productData = getProductData(response),
      point = getPoint(response);
    Logger.log(productData);
    result = [productData.brand.name, productData.name, productData.aggregateRating.ratingValue, point];
  } catch (err) {
    result = Array.apply(null, new Array(4)).map(function () {
      return err.message;
    });
  }
  return result.concat(reviewCounts);
}