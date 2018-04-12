function requestFollowers(apiUrl, followers) {
  var response = UrlFetchApp.fetch(apiUrl),
    json = JSON.parse(response.getContentText());
  followers = followers.concat(json.data);
  if (json.pagination && json.pagination.next_url) {
    return requestFollowers(json.pagination.next_url, followers);
  }
  return followers;
}

function getFollowers() {
  var token = "",
    followers = requestFollowers("https://api.instagram.com/v1/users/self/followed-by?access_token=" + token, []),
    to = "",
    body = followers.map(function (e) {
      return e.username;
    });
  MailApp.sendEmail(to, "followers", body.join('\n'));
}