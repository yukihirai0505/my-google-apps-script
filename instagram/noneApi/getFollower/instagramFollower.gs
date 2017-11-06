var BK = SpreadsheetApp.getActiveSpreadsheet(),
  IG_SHEET = BK.getSheetByName("Instagram Follwer Count"),
  TODAY = new Date(),
  ONE_MONTH_AGO = new Date(TODAY.setMonth(TODAY.getMonth() - 1));

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
    function getInstagramUserInfo() {
      var response = UrlFetchApp.fetch(encodeURI(accountUrl), {muteHttpExceptions: true});
      var rs = response.getContentText('UTF-8').match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
      var json = JSON.parse(rs[1]);
      return json.entry_data.ProfilePage[0].user;
    }
    
    try {
      var info = getInstagramUserInfo(),
        followerCount = info.followed_by.count,
        monthlyMediaNodes = info.media.nodes.filter(function (e) {
          if (new Date(e.date * 1000).getTime() >= ONE_MONTH_AGO.getTime()) {
            return e;
          }
        }),
        totalLikes = monthlyMediaNodes.reduce(function (sum, value) {
          return sum + value.likes.count;
        }, 0),
        privateMessage = info.is_private ? "非公開" : "公開",
        eng = totalLikes / (followerCount * monthlyMediaNodes.length);
      return [accountName, followerCount, privateMessage, monthlyMediaNodes.length, totalLikes, eng];
    } catch (e) {
      if (retryFlg === true) {
        Utilities.sleep(1000);
        return getData(accountName, accountUrl, false)
      } else {
        return [accountName, e.message, "", "", "", ""];
      }
    }
  }
  
  var startRow = 2;
  var range = IG_SHEET.getRange(startRow, 1, IG_SHEET.getLastRow(), 6);
  var data = range.getValues().map(function (e) {
    var accountName = e[0];
    var accountUrl = "https://www.instagram.com/" + accountName + "/";
    return (accountName && !e[2]) ? getData(accountName, accountUrl, true) : e;
  });
  range.setValues(data);
}