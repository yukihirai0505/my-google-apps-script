var BK = SpreadsheetApp.getActiveSpreadsheet(),
  ACCOUNT_SHEET = BK.getSheetByName("account data"),
  TODAY = new Date();

/***
 * Set Instagram data
 */
function setInstagramAccountData() {
  var accountRange = ACCOUNT_SHEET.getRange(3, 2, ACCOUNT_SHEET.getLastRow(), 9);
  var data = accountRange.getValues().map(function (e) {
    return getAccountData(accounts);
  });
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
    if (updateTime && dateFormat(updateTime) === dateFormat(TODAY)) {
      return account;
    }
    // Set 3 seconds interval
    Utilities.sleep(3000);
    var userJson = getJson(UrlFetchApp.fetch("https://www.instagram.com/" + accountName + "/")),
      userData = userJson.entry_data.ProfilePage[0].user,
      userName = userData.full_name,
      imageUrl = userData.profile_pic_url,
      bio = userData.biography,
      followsNum = userData.follows.count,
      followerNum = userData.followed_by.count,
      mediaCount = userData.media.count;
    return [
      accountName, userName, imageUrl, bio, "=IMAGE(\"" + imageUrl + "\")", followsNum, followerNum, mediaCount, TODAY
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
  var rs = response.getContentText().match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
  return JSON.parse(rs[1]);
}