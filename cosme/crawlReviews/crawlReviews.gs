var BK = SpreadsheetApp.getActiveSpreadsheet();
var REVIEW_SHEET = BK.getSheetByName("review");

function onOpen() {
  showMenu();
}

function showMenu() {
  var menu = [
    {name: "setReviewData", functionName: "setReviewData"}
  ];
  BK.addMenu("Custom Menu", menu);
}

function setReviewData() {
  function getReviews(response) {
    var regex = /<div class="review-sec">([\s\S]*?)<!-- \/review-sec --><\/div>/g;
    return response.match(regex);
  }

  function getPostDate(response) {
    var regex = /<p class="(mobile\-date|date)">(.*)<\/p>/;
    return regex.exec(response)[2];
  }

  function getReviewUrl(response) {
    var regex = /<span class="read\-more"><a href="(.*)" class="cmn\-viewmore"/;
    return regex.exec(response)[1];
  }

  function getPoint(response) {
    var regex = /<p class="reviewer\-rating rtg\-(\d*)">/;
    return regex.exec(response)[1];
  }

  function getReviewData(url, data, pageIndex) {
    var pageUrl = pageIndex ? url + '/p/' + pageIndex : url;
    var response = UrlFetchApp.fetch(pageUrl).getContentText('Shift_JIS'),
      reviews = getReviews(response),
      newData = [];
    if (!reviews) {
      return data;
    }
    for (var i = 0; i < reviews.length; i++) {
      var review = reviews[i],
        postDate = getPostDate(review),
        reviewUrl = getReviewUrl(review),
        isBuy = review.indexOf('<span class="buy">') > 0,
        isRepeat = review.indexOf('<span class="repeat">') > 0,
        point = getPoint(review);
      newData[i] = [postDate, reviewUrl, isBuy ? '購入' : 'モニター', isRepeat, point];
    }
    return getReviewData(url, data.concat(newData), pageIndex + 1);
  }

  var productReviewUrl = REVIEW_SHEET.getRange(2, 2).getValue();
  if (productReviewUrl) {
    var threeMonthReviewUrl = productReviewUrl + '/rd/3',
      reviewData = getReviewData(threeMonthReviewUrl, [], 0);
    REVIEW_SHEET.getRange(5, 1, REVIEW_SHEET.getLastRow(), 5).clear();
    REVIEW_SHEET.getRange(5, 1, reviewData.length, 5).clear().setValues(reviewData);
  } else {
    Browser.msgBox('please input target product link');
  }
}