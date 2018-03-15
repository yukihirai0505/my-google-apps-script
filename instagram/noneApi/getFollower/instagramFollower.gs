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
  function getData(e, retryFlg) {
    var accountName = e[0],
      accountUrl = "https://www.instagram.com/" + accountName + "/";
    
    function getInstagramUserInfo() {
      var response = UrlFetchApp.fetch(encodeURI(accountUrl), {muteHttpExceptions: true});
      var rs = response.getContentText('UTF-8').match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
      var json = JSON.parse(rs[1]);
      return json.entry_data.ProfilePage[0].graphql.user;
    }
    
    try {
      var info = getInstagramUserInfo(),
        followerCount = info.followed_by.count,
        monthlyMediaNodes = info.media.nodes.filter(function (e) {
          if (new Date(e.node.taken_at_timestamp * 1000).getTime() >= ONE_MONTH_AGO.getTime()) {
            return e;
          }
        }),
        totalLikes = monthlyMediaNodes.reduce(function (sum, value) {
          return sum + value.node.edge_liked_by.count;
        }, 0),
        totalComments = monthlyMediaNodes.reduce(function (sum, value) {
          return sum + value.node.edge_media_to_comment.count;
        }, 0),
        privateMessage = info.is_private ? "private" : "open",
        engWithComments = (totalLikes + totalComments) / (followerCount * monthlyMediaNodes.length),
        eng = totalLikes / (followerCount * monthlyMediaNodes.length);
      return [accountName, followerCount, privateMessage, monthlyMediaNodes.length, totalLikes, totalComments, engWithComments, eng];
    } catch (e) {
      if (retryFlg === true) {
        Utilities.sleep(1000);
        return getData(e, false)
      } else {
        e[1] = e.message;
        return e;
      }
    }
  }
  
  var startRow = 2;
  var range = IG_SHEET.getRange(startRow, 1, IG_SHEET.getLastRow(), 8);
  var data = range.getValues().map(function (e) {
    return (e[0] && !e[2]) ? getData(e, true) : e;
  });
  range.setValues(data);
}