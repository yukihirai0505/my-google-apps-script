function requestFollowers(apiUrl, followers) {
  var response = UrlFetchApp.fetch(apiUrl);
  var json = JSON.parse(response.getContentText());
  followers = followers.concat(json.data);
  if (json.pagination && json.pagination.next_url) {
    return requestFollowers(json.pagination.next_url, followers);
  }
  return followers;
}

function getFollowers() {
  var token = "";
  var followers = requestFollowers("https://api.instagram.com/v1/users/self/followed-by?access_token=" + token, []);
  var to = "";
  var body = followers.map(function (e) {
    return e.username;
  });
  MailApp.sendEmail(to, "followers", body.join('\n'));
}