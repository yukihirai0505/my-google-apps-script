/***
 * Send Capture mail
 */
function sendMail() {
  var webSiteUrl = "https://yukihirai0505.github.io/about/";
  var recipient = "hogehoge@gmail.com";
  var subject = 'test subject';
  var body = "~~~~~~~~~~~\n\
test body.\n\
~~~~~~~~~~~\n\
Please check an attachment.\n\n";
  var options = {
    attachments: [makeImage(webSiteUrl)],
    name: 'sender name'
  };
  MailApp.sendEmail(recipient, subject, body, options);
}

/***
 * Make web site screen capture image
 * @param webSiteUrl
 */
function makeImage(webSiteUrl) {
  var data = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, 'dummy')
    .addRow(['<meta http-equiv="refresh" content="0; URL=' + webSiteUrl + '">'])
    .build();
  
  var chart = Charts.newTableChart()
    .setDataTable(data)
    .setOption('allowHtml', true)
    .setDimensions(720, 1000)
    .build();
  
  return chart.getAs('image/png').setName('capture.png');
}