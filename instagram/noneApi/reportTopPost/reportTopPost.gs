var BK = SpreadsheetApp.getActiveSpreadsheet();

// ハッシュタグシート
var HASH_TAG_SHEET = BK.getSheetByName("該当ハッシュタグ群");
var HASH_TAG_START_ROW = 3;
var HASH_TAG_COLUMN = 2;

// 投稿シート
var POST_SHEET = BK.getSheetByName("該当投稿群");
var POST_START_ROW = 3;
var POST_COLUMN = 2;
var POST_ID_COLUMN = 3;

// 掲載一覧シート
var TOP_SHEET = BK.getSheetByName("掲載一覧");
var TOP_START_ROW = 2;
var TOP_COLUMN = 2;
var TOP_POST_URL_COLUMN = 3;
var TOP_POST_ID_COLUMN = 4;
var TOP_START_DATE_COLUMN = 5;
var TOP_END_DATE_COLUMN = 6;

/***
 * GoogleSpreadSheetを開いた時にフックする
 */
function onOpen() {
  showMenu();
}

/***
 * 独自のメニューを表示する
 */
function showMenu() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menu = [
    {name: "投稿データ取得", functionName: "setPostData"}
  ];
  ss.addMenu("Instagram管理用メニュー", menu);
}

/***
 * GoogleSpreadSheetから指定範囲のデータを取得する
 */
function getValues(sheet, startRow, column) {
  return sheet.getRange(startRow, column, sheet.getLastRow(), column).getValues();
}

/***
 * ハッシュタグ一覧を取得する
 */
function getHashTags() {
  return getValues(HASH_TAG_SHEET, HASH_TAG_START_ROW, HASH_TAG_COLUMN);
}

/***
 * 投稿一覧を取得する
 */
function getPosts() {
  return getValues(POST_SHEET, POST_START_ROW, POST_COLUMN);
}

/***
 * 掲載一覧を取得する
 */
function getTop() {
  return TOP_SHEET.getRange(TOP_START_ROW, 2, TOP_SHEET.getLastRow(), 5).getValues();
}

/***
 * InstagramからJsonを取得する
 */
function getJson(url) {
  var response = UrlFetchApp.fetch(url);
  var rs = response.getContentText().match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
  return JSON.parse(rs[1]);
}

/***
 * 日時フォーマット
 */
function dateTimeFormat(date) {
  var formatType = 'yyyy/MM/dd HH:mm:ss';
  return Utilities.formatDate(date, 'JST', formatType);
}

/***
 * GoogleSpreadSheetに投稿データをセットする
 */
function setPostData() {
  function setTagData(hashTags) {
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    hashTags = hashTags.filter(onlyUnique).map(function (v) {
      return [v];
    });
    HASH_TAG_SHEET.getRange(HASH_TAG_START_ROW, HASH_TAG_COLUMN, HASH_TAG_SHEET.getLastRow(), 1).clear();
    HASH_TAG_SHEET.getRange(HASH_TAG_START_ROW, 2, hashTags.length, 1).setValues(hashTags);
  }

  var posts = getPosts();
  var hashTags = [];
  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    var postUrl = post[0];
    var postId = post[1];
    if (postUrl) {
      var postData = getPostData(postUrl);
      if (postData) {
        postId = postData.id;
        var postDate = new Date(postData.taken_at_timestamp * 1000);
        var imageUrl = postData.display_url;
        var rowValue = i + POST_START_ROW;
        var hashTag = postData.edge_media_to_caption.edges[0].node.text.match(/#[a-zA-Z0-9_\u3041-\u3094\u3099-\u309C\u30A1-\u30FA\u3400-\uD7FF\uFF10-\uFF19\uFF20-\uFF3A\uFF41-\uFF5A\uFF66-\uFF9E][\w-]*/ig)
        POST_SHEET.getRange(rowValue, POST_ID_COLUMN, 1, 5).setValues([
          [postId, hashTag ? hashTag.join("\n") : hashTag, postDate, "=IMAGE(\"" + imageUrl + "\")", imageUrl]
        ]);
        if (hashTag) {
          hashTags = hashTags.concat(hashTag);
        }
      }
    }
  }
  setTagData(hashTags);
}

/***
 * Instagramから投稿データを取得する
 */
function getPostData(postUrl) {
  var json = getJson(postUrl);
  return json.entry_data.PostPage[0].graphql.shortcode_media;
}

var totalNewPosts = [];

/***
 * 投稿シートにあるデータが人気投稿に含まれているかチェックする
 */
function checkTopPost() {
  var hashTags = getHashTags(); // ハッシュタグリスト
  var posts = getPosts(); // 投稿リスト
  var topPosts = getTop().filter(function (e) { // 掲載一覧
    return (e && e[0]);
  });
  // タグリストを回して人気投稿に含まれているかチェック
  for (var i = 0; i < hashTags.length; i++) {
    try {
      var hashTag = hashTags[i];
      var tag = hashTag[0];
      if (tag) {
        var tagUrl = encodeURI("https://www.instagram.com/explore/tags/" + tag.replace("#", ""));
        var topPostData = getTopPostData(tagUrl);
        var filteredPosts = findTopPosts(topPostData.topPostIds, posts);
        var datetime = dateTimeFormat(new Date());
        // 1. メール送信
        sendMail(filteredPosts, tag, tagUrl, datetime, topPosts, topPostData);
        // 2. タグに一致する掲載終了日がない投稿は掲載終了時間をシートに記載
        writeNoMoreTopPostData(topPostData.topPostIds, topPosts, tag, datetime)
      }
    } catch (err) {
      Logger.log(err);
    }
  }
  // 3. 掲載開始時刻をシートに自動追記する
  writeNewTopPostsData(topPosts);
}

/***
 * Instagramから人気投稿データを取得する
 * @param tagUrl
 * @returns {{mediaCount: *, topPostIds: Array}}
 */
function getTopPostData(tagUrl) {
  var json = getJson(tagUrl);
  var tagData = json.entry_data.TagPage[0].tag;
  return {
    "mediaCount": tagData.media.count,
    "topPostIds": tagData.top_posts.nodes.map(function (e) {
      return e.id;
    })
  };
}

/***
 * 人気投稿に含まれている投稿データのキャプチャを送信する。
 */
function sendMail(filteredPosts, tag, tagUrl, datetime, topPosts, topPostData) {
  var filteredTopPostIds = topPosts.filter(function (v) {
    return v[0] === tag;
  }).map(function (v) {
    return v[2];
  });
  for (var i = 0; i < filteredPosts.length; i++) {
    var post = filteredPosts[i];
    if (filteredTopPostIds.indexOf(post[1]) === -1) {
      sendTopPostMail(tag, tagUrl, post, topPostData.mediaCount, datetime);
      totalNewPosts.push({
        "tag": tag,
        "post": post,
        "datetime": datetime
      });
    }
  }
}

/***
 * GoogleSpreadSheetに人気投稿から外れた投稿データの終了日時を入力する
 */
function writeNoMoreTopPostData(topPostIds, topPosts, tag, datetime) {
  for (var i = 0; i < topPosts.length; i++) {
    var topPost = topPosts[i];
    if (!topPost[4] && topPost[0] === tag && topPostIds.indexOf(topPost[2]) === -1) {
      var rowValue = i + TOP_START_ROW;
      TOP_SHEET.getRange(rowValue, TOP_END_DATE_COLUMN).setValue(datetime);
    }
  }
}

/***
 * GoogleSpreadSheetに人気投稿に含まれた投稿データの開始日時記載する
 */
function writeNewTopPostsData(topPosts) {
  for (var i = 0; i < totalNewPosts.length; i++) {
    var totalNewPost = totalNewPosts[i];
    var rowValue = topPosts.length + i + TOP_START_ROW;
    TOP_SHEET.getRange(rowValue, TOP_COLUMN).setValue(totalNewPost.tag);
    TOP_SHEET.getRange(rowValue, TOP_POST_URL_COLUMN).setValue(totalNewPost.post[0]);
    TOP_SHEET.getRange(rowValue, TOP_POST_ID_COLUMN).setValue(totalNewPost.post[1]);
    TOP_SHEET.getRange(rowValue, TOP_START_DATE_COLUMN).setValue(totalNewPost.datetime);
  }
}

/***
 * トップ投稿に含まれている投稿を返す
 */
var findTopPosts = function (topPostIds, posts) {
  return posts.filter(function (v) {
    return topPostIds.indexOf(v[1]) >= 0;
  });
};

/***
 * 人気投稿に含まれた投稿データのキャプチャを送信する
 */
function sendTopPostMail(tag, tagUrl, post, mediaCount, datetime) {

  function makeImage(tagUrl) {
    var data = Charts.newDataTable()
      .addColumn(Charts.ColumnType.STRING, 'dummy')
      .addRow(['<meta http-equiv="refresh" content="0; URL=' + tagUrl + '">'])
      .build();

    var chart = Charts.newTableChart()
      .setDataTable(data)
      .setOption('allowHtml', true)
      .setDimensions(720, 1000)
      .build();

    return chart.getAs('image/png').setName('capture.png');
  }

  var recipient = "hoge";
  var subject = '「' + tag + '」の人気投稿に掲載されました';
  var body = "hoge";
  var options = {
    attachments: [makeImage(tagUrl)],
    name: '人気投稿掲載確認',
    noReply: true
  };
  MailApp.sendEmail(recipient, subject, body, options);
}
