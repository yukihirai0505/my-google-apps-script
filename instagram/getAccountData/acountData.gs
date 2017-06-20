var bk = SpreadsheetApp.getActiveSpreadsheet();
var accountSheet = bk.getSheetByName("account data");
var today = new Date();

/***
 * Set Instagram data
 */
function setInstagramAccountData() {
  var accountRange = accountSheet.getRange(3, 2, accountSheet.getLastRow(), 9);
  var accounts = accountRange.getValues();
  var data = [];
  for (var i = 0; i < accounts.length; i++) {
    data[i] = getAccountData(accounts[i]);
  }
  accountRange.setValues(data);
}

/***
 * Get Instagram data
 * @param post
 * @returns {*}
 */
function getAccountData(account) {
  try {
    var accountName = account[0],
      orgImageUrl = account[2],
      updateTime = account[8];
    account[4] = "=IMAGE(\"" + orgImageUrl + "\")";
    if (!accountName) {
      return account;
    }
    if (updateTime && dateFormat(updateTime) === dateFormat(today)) {
      return account;
    }
    // Set 3 seconds interval
    Utilities.sleep(3000);
    var userJson = getJson(UrlFetchApp.fetch("https://www.instagram.com/" + accountName + "/")),
      userData = userJson.entry_data.ProfilePage[0].user,
      userAccountName = account,
      userName = userData.full_name,
      imageUrl = userData.profile_pic_url,
      bio = userData.biography,
      followsNum = userData.follows.count,
      followerNum = userData.followed_by.count,
      mediaCount = userData.media.count;
    return [
      userAccountName, userName, imageUrl, bio, "=IMAGE(\"" + imageUrl + "\")", followsNum, followerNum, mediaCount, today
    ];
  } catch (err) {
    return account;
  }
}

function dateFormat(date) {
  var formatType = 'yyyy/MM/dd';
  return Utilities.formatDate(date, 'JST', formatType);
}

function getJson(response) {
  var myRegexp = /<script type="text\/javascript">window\._sharedData =([\s\S]*?)<\/script>/i;
  var match = myRegexp.exec(response.getContentText());
  return JSON.parse(match[0].replace("<script type=\"text\/javascript\">window\._sharedData =", "").replace(";<\/script>", ""));
}