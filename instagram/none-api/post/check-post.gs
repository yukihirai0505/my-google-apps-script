var BK = SpreadsheetApp.getActiveSpreadsheet(),
  POST_CHECK_SHEET = BK.getSheetByName("check post"),
  CAMPAIGN_SHEET = BK.getSheetByName("campaign data"),
  CAMPAIGN_RANGE = CAMPAIGN_SHEET.getRange(3, 1, CAMPAIGN_SHEET.getLastRow(), 4),
  CAMPAIGN_DATA = CAMPAIGN_RANGE.getValues();

/***
 * Set Instagram data
 */
function checkPostData() {
  var postCheckRange = POST_CHECK_SHEET.getRange(3, 1, POST_CHECK_SHEET.getLastRow(), 4),
    data = postCheckRange.getValues().map(function (e) {
      return checkData(e);
    });
  postCheckRange.setValues(data);
}

/***
 * Check post data
 * @param target
 * @returns {*}
 */
function checkData(target) {
  try {
    var accountName = target[0],
      campaignId = target[1],
      pTime = target[2];
    if (!accountName || pTime) {
      return target;
    }
    // Set 1 seconds interval
    Utilities.sleep(1000);
    var userJson = getJson(UrlFetchApp.fetch("https://www.instagram.com/" + accountName + "/")),
      userData = userJson.entry_data.ProfilePage[0].user,
      mediaNodes = userData.media.nodes;
    for (var i = 0; i < mediaNodes.length; i++) {
      var node = mediaNodes[i];
      var campaign = CAMPAIGN_DATA.filter(function (element, index, array) {
        if (element[0] === campaignId) {
          return element;
        }
      })[0];
      var hashTag = campaign[1];
      var campaignStartDate = campaign[2];
      var reportMailAddress = campaign[3];
      var postTime = new Date(node.date * 1000);
      if (~node.caption.indexOf(hashTag) && postTime > campaignStartDate) {
        var postUrl = 'https://www.instagram.com/p/' + node.code + '/';
        sendReportMail(accountName, postTime, reportMailAddress);
        return [accountName, campaignId, postTime, postUrl];
      }
    }
    return target;
  } catch (err) {
    Logger.log(err);
    return target;
  }
}

function sendReportMail(accountName, postTime, reportMailAddress) {
  var subject = '';
  var body = '';
  MailApp.sendEmail(reportMailAddress, subject, body);
}

function getJson(response) {
  var rs = response.getContentText().match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
  return JSON.parse(rs[1]);
}