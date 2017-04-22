var TARGET_MAIL_ADDRESS = "yukihirai0505@gmail.com";

/***
 * TODO
 * 1. 返信したことがないトピメにランダムに賛辞を送る
 * 2. トピメをシートに保存する
 * [懸念点]
 * 1. 会社を休んだ時にもメールに返事する可能性がある(休まないように頑張る)
 * 2. MTG中などにも勝手に送られてしまうのでMTGに集中してないと思われる(でも、同じMTGに出ている人が気づくとしたらその人も集中していない証)
 */
function replyToicMail() {
  // 純粋な最初の1件を取得 => toに来ている + ccに含まれない + 未読 + 誰も返信していない + 再送じゃない
  var query = 'to:(' + TARGET_MAIL_ADDRESS + ') -{cc:' + TARGET_MAIL_ADDRESS + '}  is:unread -subject:Re -再送';
  var threads = GmailApp.search(query);
  for (var i = 0, t = threads.length; i < t; i++) {
    var thread = threads[i];
    var messages = thread.getMessages();
    for (var j = 0, m = messages.length; j < m; j++) {
      var message = messages[j];
      // TODO: 返事する [ランダムで送る言葉は用意しておく50個くらいをシートに記載して使ったことがあるかもシートに残しておく]
      var body = "thx!!\n\n\n\n" + message.getDate() + ' ' + message.getFrom() + '\n> ' + message.getPlainBody().replace(/\n/g, '\n> ');
      message.replyAll(body);
      message.markRead();
      // TODO: 結果をSlackへ投稿

    }
  }
}

/***
 * TODO: 過去のトピメを月次でシートにまとめてみる
 */
function crawlTopicMail() {
}
