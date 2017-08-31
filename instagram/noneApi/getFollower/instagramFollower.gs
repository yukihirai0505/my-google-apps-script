var bk = SpreadsheetApp.getActiveSpreadsheet();
// sheet name
var igFollowerSheet = bk.getSheetByName("Instagram Follwer Count");
var ngMessage = "cannot get";

/***
 * when open google spread sheet
 */
function onOpen() {
  showMenu();
}

/***
 * show custom menu
 */
function showMenu() {
  var menu = [
    {name: "Get Instagram Follower Count", functionName: "setIgFollowerData"}
  ];
  bk.addMenu("Custom Management", menu);
}

function setIgFollowerData() {
  var startRow = 2;
  var range = igFollowerSheet.getRange(startRow, 1, igFollowerSheet.getLastRow(), 3);
  var accounts = range.getValues();
  var datas = [];
  for(var i = 0; i < accounts.length; i++){
    var account = accounts[i];
    var accountName = account[0];
    var accountUrl = "https://www.instagram.com/" + accountName;
    try {
      if (accountName && !account[2]) {
        datas[i] = getData(accountUrl);
      } else {
        datas[i] = account;
      }
    } catch(e) {
      Logger.log(e);
      Utilities.sleep(1000);
      try {
        datas[i] = getData(accountUrl);
      } catch (e2) {
        Logger.log(e2);
        datas[i] = [accountName, ngMessage, ""];
      }
    }
  }
  range.setValues(datas);
  function getData(accountUrl) {
    var info = getInstagramUserInfo(accountUrl);
    var followerCount = info.followed_by.count;
    var privateMessage = info.is_private ? "close": "open";
    return [accountName, followerCount, privateMessage];
  }
}

function getInstagramUserInfo(accountUrl) {
  Utilities.sleep(1000);
  var response = UrlFetchApp.fetch(encodeURI(accountUrl));
  var rs = response.getContentText().match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
  return JSON.parse(rs[1]).entry_data.ProfilePage[0].user;
}