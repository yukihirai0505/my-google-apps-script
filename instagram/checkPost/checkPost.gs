var bk = SpreadsheetApp.getActiveSpreadsheet();
// sheet name
var postCheckSheet = bk.getSheetByName("check post");
var campaignDataSheet = bk.getSheetByName("campaign data");

var campaignDataRange = campaignDataSheet.getRange(3, 1, campaignDataSheet.getLastRow(), 4);
var campaignData = campaignDataRange.getValues();

/***
 * Set Instagram data
 */
function checkPostData() {
  var postCheckRange = postCheckSheet.getRange(3, 1, postCheckSheet.getLastRow(), 4);
  var targetsData = postCheckRange.getValues();
  var data = [];
  for (var i = 0; i < targetsData.length; i++) {
    data[i] = checkData(targetsData[i]);
  }
  postCheckRange.setValues(data);
}

/***
 * Check post data
 * @param target
 * @returns {*}
 */
function checkData(target) {
  try {
    var accountName = target[0];
    var campaignId = target[1];
    var pTime = target[2];
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
      var campaign = campaignData.filter(function(element, index, array) {
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