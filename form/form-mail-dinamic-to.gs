function sendForm(e) {
  function getMessage(itemResponses) {
    var subject = '【Inquiry】 ',
      to = '',
      body = '';
    for (var i = 0; i < itemResponses.length; i++) {
      var itemResponse = itemResponses[i];
      var question = itemResponse.getItem().getTitle();
      var answer = itemResponse.getResponse();
      if (question === 'choose to') {
        to = answer.map(function (v) {
          switch (v) {
            case 'hoge1':
              return "hoge+1@gmail.com";
              break;
            case 'hoge2':
              return 'hoge+2@gmail.com';
              break;
            case 'hoge3':
              return 'hoge+3@gmail.com';
              break;
          }
        }).toString();
      }
      body += (i + 1).toString() + '. ' + question + ': ' + answer + '\n';
    }
    return [subject, body, to];
  }
  
  try {
    var respondentEmail = e.response.getRespondentEmail(),
      itemResponses = e.response.getItemResponses(),
      message = getMessage(itemResponses),
      subject = message[0],
      body = message[1],
      to = message[2];
    if (to) {
      var options = {
        replyTo: to,
        cc: respondentEmail,
        noReply: true
      };
      MailApp.sendEmail(to, subject, body, options);
    }
  } catch (err) {
    MailApp.sendEmail("error@gmail.com", "Error", err);
  }
}