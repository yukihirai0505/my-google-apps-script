var bk = SpreadsheetApp.getActiveSpreadsheet();
// sheet name
var postCheckSheet = bk.getSheetByName("check post");

/***
 * Set Instagram data
 */
function checkPostData() {
  var postCheckRange = postCheckSheet.getRange(3, 1, postCheckSheet.getLastRow(), 5);
  var targetsData = postCheckRange.getValues();
  var data = [];
  for (var i = 0; i < targetsData.length; i++) {
    data[i] = checkData(targetsData[i]);
  }
  postCheckRange.setValues(data);
}

/***
 * Check post data
 * @param post
 * @returns {*}
 */
function checkData(target) {
  try {
    var bams = target[0];
    var accountName = target[1];
    var hashTag = target[2];
    var pTime = target[3];
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
      if (~node.caption.indexOf(hashTag)) {
        var postTime = new Date(node.date * 1000);
        var postUrl = 'https://www.instagram.com/p/' + node.code + '/';
        sendReportMail(bams, accountName, postTime);
        return [bams, accountName, hashTag, postTime, postUrl];
      }
    }
    return target;
  } catch (err) {
    Logger.log(err);
    return target;
  }
}

function sendReportMail(bams, accountName, postTime) {
  var recipient = "hoge@gmail";
  var subject = 'title';
  var body = "body";
  MailApp.sendEmail(recipient, subject, body);
}

function getJson(response) {
  var myRegexp = /<script type="text\/javascript">window\._sharedData =([\s\S]*?)<\/script>/i;
  var match = myRegexp.exec(response.getContentText());
  return JSON.parse(match[0].replace("<script type=\"text\/javascript\">window\._sharedData =", "").replace(";<\/script>", ""));
}