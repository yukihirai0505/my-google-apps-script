var BK = SpreadsheetApp.getActiveSpreadsheet(),
  IG_SHEET = BK.getSheetByName("Instagram Follwer Count");

/***
 * when open google spread SHEET
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
  BK.addMenu("Custom Management", menu);
}

function setIgFollowerData() {
  function getData(accountName, accountUrl, retryFlg) {
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function getInstagramUserInfo() {
      var response = UrlFetchApp.fetch(encodeURI(accountUrl), {muteHttpExceptions: true});
      Utilities.sleep(getRandomInt(1000, 3000));
      var rs = response.getContentText('UTF-8').match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
      var json = JSON.parse(rs[1]);
      return json.entry_data.ProfilePage[0].user;
    }
    
    try {
      var info = getInstagramUserInfo(),
        followerCount = info.followed_by.count,
        privateMessage = info.is_private ? "close" : "open";
      return [accountName, followerCount, privateMessage];
    } catch (e) {
      if (retryFlg === true) {
        return getData(accountName, accountUrl, false)
      } else {
        return [accountName, e.message, ""];
      }
    }
  }
  
  var startRow = 2,
    range = IG_SHEET.getRange(startRow, 1, IG_SHEET.getLastRow(), 3),
    data = range.getValues().map(function (e) {
      var accountName = e[0];
      var accountUrl = "https://www.instagram.com/" + accountName + "/";
      return (accountName && !e[2]) ? getData(accountName, accountUrl, true) : e;
    });
  range.setValues(data);
}