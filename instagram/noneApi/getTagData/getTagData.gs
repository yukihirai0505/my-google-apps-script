var bk = SpreadsheetApp.getActiveSpreadsheet();
var hashTagSheet = bk.getSheetByName("hashtag");

function onOpen() {
  showMenu();
}

function showMenu() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menu = [
    {name: "Get Tag Info", functionName: "setTagData"}
  ];
  ss.addMenu("Custom menu", menu);
}

function setTagData() {
  var range = hashTagSheet.getRange(2, 1, hashTagSheet.getLastRow(), 3);
  var hashTags = range.getValues();
  var datas = [];
  for (var i = 0; i < hashTags.length; i++) {
    datas[i] = getTagData(hashTags[i]);
  }
  range.setValues(datas);
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
  var tagJson = getJson(UrlFetchApp.fetch(url));
  var tagData = tagJson.entry_data.TagPage[0].tag;
  return tagCount = tagData.media.count;
}

function getJson(response) {
  var rs = response.getContentText().match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
  return JSON.parse(rs[1]);
}
