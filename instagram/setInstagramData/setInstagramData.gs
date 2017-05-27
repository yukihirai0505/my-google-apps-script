var bk = SpreadsheetApp.getActiveSpreadsheet();
var sheets = bk.getSheets();
var sheet = sheets[0];
var today = new Date();

/***
 * Hook open spreadsheet
 */
function onOpen() {
  showMenu();
}

/***
 * show custom menu
 */
function showMenu() {
  var menu = [
    {name: "Set Instagram Data", functionName: "setInstagramData"}
  ];
  bk.addMenu("Custom Menu", menu);
}

/***
 * Set Instagram data
 */
function setInstagramData() {
  var postRange = sheet.getRange(3, 2, sheet.getLastRow(), 12);
  var posts = postRange.getValues();
  var datas = [];
  for (var i = 0; i < posts.length; i++) {
    datas[i] = getPostData(posts[i]);
  }
  postRange.setValues(datas);
}

/***
 * Get Instagram data
 * @param post
 * @returns {*}
 */
function getPostData(post) {
  var postUrl = post[0];
  var orgImageUrl = post[1];
  post[2] = "=IMAGE(\"" + orgImageUrl + "\")";
  var orgPostDate = post[6];
  if (!postUrl) {
    return post;
  }
  if (orgPostDate) {
    var diff = (today.getTime() - orgPostDate.getTime())/(1000*60*60*24);
    if (diff > 7) {
      return post;
    }
  }
  // Set 3 seconds interval
  Utilities.sleep(3000);
  var postJson = getJson(UrlFetchApp.fetch(postUrl));
  var postData = postJson.entry_data.PostPage[0].graphql.shortcode_media,
    ownerData = postJson.entry_data.PostPage[0].graphql.shortcode_media.owner,
    imageUrl = postData.display_url,
    userName = ownerData.full_name,
    userAccountName = ownerData.username,
    userJson = getJson(UrlFetchApp.fetch("https://www.instagram.com/" + userAccountName + "/")),
    followerNum = userJson.entry_data.ProfilePage[0].user.followed_by.count,
    postDate = new Date(postData.taken_at_timestamp * 1000),
    likeNum = postData.edge_media_preview_like.count,
    commentNum = postData.edge_media_to_comment.count,
    text = postData.edge_media_to_caption.edges[0].node.text,
    hashTag = text.match(/#[a-zA-Z0-9_\u3041-\u3094\u3099-\u309C\u30A1-\u30FA\u3400-\uD7FF\uFF10-\uFF19\uFF20-\uFF3A\uFF41-\uFF5A\uFF66-\uFF9E][\w-]*/ig),
    comments = postData.edge_media_to_comment.edges.map(function (e, i, arr) {
      return e.node.owner.username + ": " + e.node.text;
    }).join("\n");
  return [
    postUrl, imageUrl, "=IMAGE(\"" + imageUrl + "\")", userName, userAccountName, followerNum, postDate, likeNum, commentNum, text, hashTag ? hashTag.join("\n") : hashTag, comments
  ];
}

function getJson(response) {
  var myRegexp = /<script type="text\/javascript">window\._sharedData =([\s\S]*?)<\/script>/i;
  var match = myRegexp.exec(response.getContentText());
  return JSON.parse(match[0].replace("<script type=\"text\/javascript\">window\._sharedData =", "").replace(";<\/script>", ""));
}