var COUNT_KEY = 'count';

function doPost(e) {
  return createResponse(countUp());
}

function doGet(e) {
  return createResponse(getCount());
}

function createResponse(count) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(
    JSON.stringify({
      count: count
    })
  );
  return output;
}

function getCount() {
  return Number(PropertiesService.getScriptProperties().getProperty(COUNT_KEY));
}

function countUp() {
  var count = getCount() + 1;
  PropertiesService.getScriptProperties().setProperty(COUNT_KEY, count);
  return count;
}
