var bk = SpreadsheetApp.getActiveSpreadsheet();
var igFollowerSheet = bk.getSheetByName("Instagram Follwer Count");
var ngMessage = "cannot get";

function onOpen() {
  showMenu();
}

function showMenu() {
  var menu = [
    {name: "Get Instagram Follower Count", functionName: "setIgFollowerData"},
   ];
  bk.addMenu("Custom Management", menu);
}

function setIgFollowerData() {
  var lastRow = igFollowerSheet.getLastRow();
  for(var i = lastRow; i >= 3; i--){
    var accountName = igFollowerSheet.getRange(i, 1);
    if (accountName.getValue() !== "") {
      var accountUrl = "https://www.instagram.com/" + accountName.getValue();
      Logger.log(accountUrl)
      var followerNumer = getFollwerNumber(accountUrl);
      igFollowerSheet.getRange(i, 2).setValue(followerNumer);
    }
  }
}
    
function getFollwerNumber(accountUrl) {
  var encodedURL = encodeURI(accountUrl);
  try {
    var response = UrlFetchApp.fetch(encodedURL); 
    var json = getJson(response);
    if (json != ngMessage) {
      return json.entry_data.ProfilePage[0].user.followed_by.count;
    } else {
      return ngMessage;
    }
  } catch(err) {
    Logger.log(err);
    return ngMessage
  }
}

function getJson(response) {
  var myRegexp = /<script type="text\/javascript">window\._sharedData =([\s\S]*?)<\/script>/i;
  var match    = myRegexp.exec(response.getContentText());
  if (match) {
    try {
      return JSON.parse(match[0].replace("<script type=\"text\/javascript\">window\._sharedData =", "").replace(";<\/script>" , ""));
    } catch(err) {
      Logger.log(err);
      return ngMessage;
    }
  }
}

