var BK = SpreadsheetApp.getActiveSpreadsheet(),
  HASHTAG_SHEET = BK.getSheetByName("hashtag");

function onOpen() {
  showMenu();
}

function showMenu() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(),
    menu = [
      {name: "Get Tag Info", functionName: "setTagData"}
    ];
  ss.addMenu("Custom menu", menu);
}

function setTagData() {
  var range = HASHTAG_SHEET.getRange(2, 1, HASHTAG_SHEET.getLastRow(), 3),
    data = range.getValues().map(function (e) {
      return getTagData(e);
    });
  range.setValues(data);
}

function getTagData(hashTag) {
  var tag = hashTag[0];
  if (!tag) {
    return hashTag;
  }
  var tagUrl = encodeURI("https://www.instagram.com/explore/tags/" + tag.replace("#", ""));
  return [
    tag, "=setTagCount(\"" + tagUrl + "\")", tagUrl
  ];
}

function setTagCount(url) {
  var tagJson = getJson(UrlFetchApp.fetch(url, {muteHttpExceptions: true})),
    tagData = tagJson.entry_data.TagPage[0].tag;
  return tagCount = tagData.media.count;
}

function getJson(response) {
  var rs = response.getContentText().match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
  return JSON.parse(rs[1]);
}
