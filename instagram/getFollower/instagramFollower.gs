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

/***
 * set instagarm follower data
 */
function setIgFollowerData() {
  var startRow = 3;
  var accounts = igFollowerSheet.getRange(startRow, 1, igFollowerSheet.getLastRow(), 1).getValues().filter(function(e) {
    return e && e[0];
  });
  for(var i = 0; i < accounts.length; i++){
    var account = accounts[i];
    var accountUrl = "https://www.instagram.com/" + account[0];
    var followerNumber = getFollowerNumber(accountUrl);
    igFollowerSheet.getRange(i+startRow, 2).setValue(followerNumber);
  }
}

/***
 * get instagram account follower number
 * @param accountUrl
 * @returns {string}
 */
function getFollowerNumber(accountUrl) {
  var json = getJson(accountUrl);
  return json !== ngMessage? json.entry_data.ProfilePage[0].user.followed_by.count: ngMessage;
}

/***
 * get json from instagram
 * @param url
 * @returns {string}
 */
function getJson(url) {
  try {
    var encodedURL = encodeURI(url);
    var response = UrlFetchApp.fetch(encodedURL);
    var myRegexp = /<script type="text\/javascript">window\._sharedData =([\s\S]*?)<\/script>/i;
    var match    = myRegexp.exec(response.getContentText());
    return JSON.parse(match[0].replace("<script type=\"text\/javascript\">window\._sharedData =", "").replace(";<\/script>" , ""));
  } catch(err) {
    Logger.log(err);
    return ngMessage;
  }
}

