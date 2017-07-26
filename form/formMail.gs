function sendForm(e) {
  var to = "hoge@gmail.com";
  try {
    var respondentEmail = e.response.getRespondentEmail();
    var itemResponses = e.response.getItemResponses();
    var message = getMessage(itemResponses);
    var subject = message[0];
    var body = message[1];
    var options = {
      replyTo: to,
      cc: respondentEmail
    };
    MailApp.sendEmail(to, subject, body, options);
  } catch (err) {
    MailApp.sendEmail(to, "Error", err);
  }
}

function getMessage(itemResponses) {
  var subject = '【Inquiry】 ';
  var body = '';
  var clientName = '';
  var itemName = '';
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    var question = itemResponse.getItem().getTitle();
    var answer = itemResponse.getResponse();
    if (question === 'Client Name') {
      clientName = answer;
    }
    if (question === 'Item Name') {
      itemName = answer;
    }
    body += (i + 1).toString() + '. ' + question + ': ' + answer + '\n';
  }
  subject += clientName + '/' + itemName;
  return [subject, body];
}