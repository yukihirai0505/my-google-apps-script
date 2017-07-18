function sendForm(e){
  var respondentEmail = e.response.getRespondentEmail();
  var itemResponses = e.response.getItemResponses();
  var body = getBody(itemResponses);
  var to = "hoge@gmail.com";
  var subject = "[Inquiry from Google Form]";
  var options = {
    replyTo: to,
    cc: respondentEmail
  };
  MailApp.sendEmail(to, subject, body, options);
}

function getBody(itemResponses) {
  var message = '';
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    var question = itemResponse.getItem().getTitle();
    var answer = itemResponse.getResponse();
    message += (i + 1).toString() + '. ' + question + ': ' + answer + '\n';
  }
  return message;
}