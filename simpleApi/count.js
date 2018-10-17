var COUNT_KEY = 'count';

function doGet(e) {
  function getCount() {
    return Number(PropertiesService.getScriptProperties().getProperty(COUNT_KEY));
  }

  function countUp() {
    var count = getCount() + 1;
    PropertiesService.getScriptProperties().setProperty(COUNT_KEY, count);
    return count;
  }

  var isCountUp = e.parameter.is_count_up,
    output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(
    JSON.stringify({
      count: isCountUp ? countUp() : getCount()
    })
  );
  return output;
}
