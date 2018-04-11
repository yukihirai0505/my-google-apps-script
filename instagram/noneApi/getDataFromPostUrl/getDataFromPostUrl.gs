var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEETS = BK.getSheets(),
  SHEET = SHEETS[0];

/***
 * Hook open spreadsheet
 */
function onOpen() {
  showMenu();
}

/***
 * show custom menu
 */
function showMenu() {
  var menu = [
    {name: "Set Account Name", functionName: "setAccountNames"},
    {name: "Set Follower Count", functionName: "setFollowerCounts"}
  ];
  BK.addMenu("Custom Menu", menu);
}

function setAccountNames() {
  var range = SHEET.getRange(2, 1, SHEET.getLastRow(), 3);
  var data = range.getValues().map(function (e) {
    var postUrl = e[0];
    if (postUrl) {
      e[1] = '=setAccountName("' + postUrl + '")';
      e[2] = '';
    }
    return e;
  });
  range.setValues(data);
}

function setAccountName(postUrl) {
  try {
    var postObj = requestJson(postUrl),
      ownerData = postObj.entry_data.PostPage[0].graphql.shortcode_media.owner;
    return ownerData.username;
  } catch (err) {
    return err.message;
  }
}

function setFollowerCounts() {
  var range = SHEET.getRange(2, 2, SHEET.getLastRow(), 2);
  var data = range.getValues().map(function (e) {
    var accountName = e[0];
    if (accountName && accountName !== '#ERROR!') {
      e[1] = '=setFollowerCount("' + accountName + '")';
    }
    return e;
  });
  range.setValues(data);
}

function setFollowerCount(accountName) {
  try {
    var userObj = requestJson('https://www.instagram.com/' + accountName + '/').entry_data.ProfilePage[0].graphql.user;
    return userObj.edge_followed_by.count;
  } catch (err) {
    return err.message;
  }
}

function requestJson(url) {
  var rs = UrlFetchApp.fetch(url, {muteHttpExceptions: true}).getContentText().match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
  return JSON.parse(rs[1]);
}