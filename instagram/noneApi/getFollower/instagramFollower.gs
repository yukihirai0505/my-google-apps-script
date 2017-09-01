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
  for (var i = 0; i < accounts.length; i++) {
    var account = accounts[i];
    var accountName = account[0];
    var accountUrl = "https://www.instagram.com/" + accountName;
    datas[i] = (accountName && !account[2]) ? getData(accountName, accountUrl, true) : account;
  }
  range.setValues(datas);

  function getData(accountName, accountUrl, retryFlg) {
    try {
      var info = getInstagramUserInfo(accountUrl);
      var followerCount = info.followed_by.count;
      var privateMessage = info.is_private ? "close" : "open";
      return [accountName, followerCount, privateMessage];
    } catch (e) {
      if (retryFlg === true) {
        Utilities.sleep(1000);
        return getData(accountName, accountUrl, false)
      } else {
        return [accountName, ngMessage, ""];
      }
    }
  }
}

function getInstagramUserInfo(accountUrl) {
  var response = UrlFetchApp.fetch(encodeURI(accountUrl));
  var rs = response.getContentText('UTF-8').match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
  return JSON.parse(rs[1]).entry_data.ProfilePage[0].user;
}