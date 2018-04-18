var BK = SpreadsheetApp.getActiveSpreadsheet(),
  REVIEW_SHEET = BK.getSheetByName('review'),
  RANGE_VALUES = REVIEW_SHEET.getRange(2, 2, 2, 1).getValues(),
  PRODUCT_REVIEW_URL = RANGE_VALUES[0][0],
  PAGE_INDEX = RANGE_VALUES[1][0],
  MAX_PAGE_INDEX = PAGE_INDEX + 68;

function onOpen() {
  showMenu();
}

function showMenu() {
  var menu = [
    {name: 'setReviewData', functionName: 'setReviewData'}
  ];
  BK.addMenu('Custom Menu', menu);
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
    if (!reviews || pageIndex > MAX_PAGE_INDEX) {
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

  if (PRODUCT_REVIEW_URL && PAGE_INDEX) {
    reviewData = getReviewData(PRODUCT_REVIEW_URL, [], PAGE_INDEX - 1);
    REVIEW_SHEET.getRange(5, 1, REVIEW_SHEET.getLastRow(), 5).clear();
    REVIEW_SHEET.getRange(5, 1, reviewData.length, 5).clear().setValues(reviewData);
  } else {
    Browser.msgBox('please input target product link and page number');
  }
}